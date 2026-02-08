"""
Commute Time Calculation Service
Uses Google Maps Distance Matrix API for accurate travel time calculations
"""
import googlemaps
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Tuple
import os
from geopy.distance import geodesic
import math

from services.cache_service import cache_service
from models.schemas import CommuteRequest, CommuteResult, PropertyLocation

class CommuteService:
    def __init__(self):
        self.gmaps = googlemaps.Client(key=os.getenv("GOOGLE_MAPS_API_KEY"))
        self.max_commute_minutes = 120  # Maximum commute time to consider
        
    async def calculate_commute_time(
        self,
        origin: Tuple[float, float],
        destination: Tuple[float, float],
        mode: str = "driving",
        departure_time: Optional[datetime] = None
    ) -> Dict:
        """
        Calculate commute time between two locations
        
        Args:
            origin: (latitude, longitude) of starting point
            destination: (latitude, longitude) of destination
            mode: travel mode (driving, transit, walking, bicycling)
            departure_time: when to depart (for traffic predictions)
        
        Returns:
            Dict with duration, distance, and traffic info
        """
        # Check cache first
        cache_key = f"commute:{origin}:{destination}:{mode}"
        cached = await cache_service.get(cache_key)
        if cached:
            return cached
        
        try:
            # Use departure time for traffic predictions
            if departure_time is None:
                # Default to tomorrow morning 8 AM
                departure_time = datetime.now().replace(
                    hour=8, minute=0, second=0, microsecond=0
                ) + timedelta(days=1)
            
            # Call Google Maps API
            result = self.gmaps.distance_matrix(
                origins=[origin],
                destinations=[destination],
                mode=mode,
                departure_time=departure_time,
                traffic_model="best_guess"
            )
            
            if result['rows'][0]['elements'][0]['status'] == 'OK':
                element = result['rows'][0]['elements'][0]
                
                commute_data = {
                    "duration_seconds": element['duration']['value'],
                    "duration_minutes": element['duration']['value'] / 60,
                    "duration_text": element['duration']['text'],
                    "distance_meters": element['distance']['value'],
                    "distance_km": element['distance']['value'] / 1000,
                    "distance_text": element['distance']['text'],
                    "mode": mode,
                }
                
                # Add traffic info if available
                if 'duration_in_traffic' in element:
                    commute_data.update({
                        "duration_in_traffic_seconds": element['duration_in_traffic']['value'],
                        "duration_in_traffic_minutes": element['duration_in_traffic']['value'] / 60,
                        "duration_in_traffic_text": element['duration_in_traffic']['text'],
                    })
                
                # Cache for 1 hour
                await cache_service.set(cache_key, commute_data, expire=3600)
                
                return commute_data
            else:
                raise Exception(f"Google Maps API error: {result['rows'][0]['elements'][0]['status']}")
                
        except Exception as e:
            # Fallback to straight-line distance estimation
            return self._estimate_commute_time(origin, destination, mode)
    
    def _estimate_commute_time(
        self,
        origin: Tuple[float, float],
        destination: Tuple[float, float],
        mode: str
    ) -> Dict:
        """
        Fallback method using straight-line distance
        """
        distance_km = geodesic(origin, destination).kilometers
        
        # Average speeds by mode (km/h)
        speeds = {
            "driving": 40,
            "transit": 30,
            "walking": 5,
            "bicycling": 15
        }
        
        speed = speeds.get(mode, 40)
        duration_minutes = (distance_km / speed) * 60
        
        return {
            "duration_minutes": duration_minutes,
            "duration_text": f"{int(duration_minutes)} mins",
            "distance_km": distance_km,
            "distance_text": f"{distance_km:.1f} km",
            "mode": mode,
            "estimated": True
        }
    
    async def find_properties_within_commute(
        self,
        office_location: Tuple[float, float],
        max_commute_minutes: int,
        properties: List[Dict],
        mode: str = "driving",
        departure_time: Optional[datetime] = None
    ) -> List[Dict]:
        """
        Filter properties that are within specified commute time
        
        Args:
            office_location: (lat, lng) of office
            max_commute_minutes: maximum acceptable commute time
            properties: list of property dicts with latitude/longitude
            mode: travel mode
            departure_time: when to depart
        
        Returns:
            List of properties with commute info added
        """
        results = []
        
        for property_data in properties:
            if not property_data.get('latitude') or not property_data.get('longitude'):
                continue
            
            property_location = (
                property_data['latitude'],
                property_data['longitude']
            )
            
            # Calculate commute
            commute_info = await self.calculate_commute_time(
                origin=property_location,
                destination=office_location,
                mode=mode,
                departure_time=departure_time
            )
            
            # Check if within acceptable commute time
            if commute_info['duration_minutes'] <= max_commute_minutes:
                property_data['commute_info'] = commute_info
                results.append(property_data)
        
        # Sort by commute time
        results.sort(key=lambda x: x['commute_info']['duration_minutes'])
        
        return results
    
    async def calculate_multiple_commutes(
        self,
        origins: List[Tuple[float, float]],
        destination: Tuple[float, float],
        mode: str = "driving"
    ) -> List[Dict]:
        """
        Calculate commute times from multiple origins to one destination
        Optimized for batch processing
        """
        results = []
        
        # Google Maps allows up to 25 origins per request
        batch_size = 25
        
        for i in range(0, len(origins), batch_size):
            batch = origins[i:i + batch_size]
            
            try:
                result = self.gmaps.distance_matrix(
                    origins=batch,
                    destinations=[destination],
                    mode=mode,
                    departure_time=datetime.now() + timedelta(days=1, hours=8)
                )
                
                for idx, row in enumerate(result['rows']):
                    if row['elements'][0]['status'] == 'OK':
                        element = row['elements'][0]
                        results.append({
                            "origin": batch[idx],
                            "duration_minutes": element['duration']['value'] / 60,
                            "distance_km": element['distance']['value'] / 1000,
                        })
            except Exception as e:
                print(f"Batch commute calculation error: {e}")
                # Fallback to individual calculations
                for origin in batch:
                    commute = await self.calculate_commute_time(origin, destination, mode)
                    results.append({
                        "origin": origin,
                        "duration_minutes": commute['duration_minutes'],
                        "distance_km": commute['distance_km'],
                    })
        
        return results
    
    def get_isochrone_points(
        self,
        center: Tuple[float, float],
        max_distance_km: float,
        num_points: int = 16
    ) -> List[Tuple[float, float]]:
        """
        Generate points around a center for isochrone mapping
        """
        points = []
        lat, lng = center
        
        # Approximate degrees per km
        lat_per_km = 1 / 111.0
        lng_per_km = 1 / (111.0 * math.cos(math.radians(lat)))
        
        for i in range(num_points):
            angle = 2 * math.pi * i / num_points
            dlat = max_distance_km * lat_per_km * math.cos(angle)
            dlng = max_distance_km * lng_per_km * math.sin(angle)
            points.append((lat + dlat, lng + dlng))
        
        return points

commute_service = CommuteService()
