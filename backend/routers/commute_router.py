"""
Commute Analysis Router
Handles 20-minute commute feature and related endpoints
"""
from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import datetime

from models.schemas import CommuteRequest, CommuteResult, PropertyLocation
from services.commute_service import commute_service
from services.supabase_service import supabase_service

router = APIRouter()

@router.post("/find-properties", response_model=List[dict])
async def find_properties_within_commute(request: CommuteRequest):
    """
    Find properties within specified commute time from office
    
    This is the main 20-minute commute feature
    """
    try:
        print(f"\n🔍 DEBUG: Commute Search Request")
        print(f"   Office: ({request.office_location.latitude}, {request.office_location.longitude})")
        print(f"   Max Commute: {request.max_commute_minutes} minutes")
        print(f"   Mode: {request.mode}")
        print(f"   Filters: {request.property_filters}")
        
        # Get properties from database
        properties = await supabase_service.get_properties(
            filters=request.property_filters or {}
        )
        
        print(f"   Found {len(properties)} properties in database")
        
        if not properties:
            print("   ❌ No properties found in database!")
            return []
        
        # Show sample property
        if properties:
            sample = properties[0]
            print(f"   Sample: {sample.get('title')} at ({sample.get('latitude')}, {sample.get('longitude')})")
        
        # Filter by commute time
        office_coords = (
            request.office_location.latitude,
            request.office_location.longitude
        )
        
        results = await commute_service.find_properties_within_commute(
            office_location=office_coords,
            max_commute_minutes=request.max_commute_minutes,
            properties=properties,
            mode=request.mode
        )
        
        print(f"   ✅ {len(results)} properties within {request.max_commute_minutes} minutes\n")
        
        return results
        
    except Exception as e:
        print(f"   ❌ Error: {str(e)}\n")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/calculate-single")
async def calculate_single_commute(
    property_location: PropertyLocation,
    office_location: PropertyLocation,
    mode: str = Query(default="driving", regex="^(driving|transit|walking|bicycling)$")
):
    """
    Calculate commute time for a single property
    """
    try:
        property_coords = (property_location.latitude, property_location.longitude)
        office_coords = (office_location.latitude, office_location.longitude)
        
        result = await commute_service.calculate_commute_time(
            origin=property_coords,
            destination=office_coords,
            mode=mode
        )
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/batch-calculate")
async def batch_calculate_commutes(
    property_ids: List[int],
    office_location: PropertyLocation,
    mode: str = Query(default="driving")
):
    """
    Calculate commute times for multiple properties at once
    """
    try:
        # Get properties
        properties = await supabase_service.get_properties_by_ids(property_ids)
        
        if not properties:
            return []
        
        # Extract coordinates
        origins = [
            (p['latitude'], p['longitude'])
            for p in properties
            if p.get('latitude') and p.get('longitude')
        ]
        
        office_coords = (office_location.latitude, office_location.longitude)
        
        # Calculate commutes
        commutes = await commute_service.calculate_multiple_commutes(
            origins=origins,
            destination=office_coords,
            mode=mode
        )
        
        # Combine with property data
        results = []
        for i, property_data in enumerate(properties):
            if i < len(commutes):
                property_data['commute_info'] = commutes[i]
                results.append(property_data)
        
        return results
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/isochrone")
async def get_commute_isochrone(
    latitude: float = Query(..., ge=-90, le=90),
    longitude: float = Query(..., ge=-180, le=180),
    max_minutes: int = Query(default=20, ge=5, le=120),
    mode: str = Query(default="driving")
):
    """
    Get isochrone data for visualization
    Returns points that are approximately X minutes away
    """
    try:
        center = (latitude, longitude)
        
        # Estimate max distance based on mode
        speeds = {"driving": 40, "transit": 30, "walking": 5, "bicycling": 15}
        max_distance_km = (speeds.get(mode, 40) / 60) * max_minutes
        
        # Generate points around center
        points = commute_service.get_isochrone_points(
            center=center,
            max_distance_km=max_distance_km,
            num_points=16
        )
        
        # Calculate actual commute times for these points
        commutes = await commute_service.calculate_multiple_commutes(
            origins=points,
            destination=center,
            mode=mode
        )
        
        # Format for frontend
        isochrone_data = [
            {
                "latitude": point[0],
                "longitude": point[1],
                "duration_minutes": commute['duration_minutes']
            }
            for point, commute in zip(points, commutes)
        ]
        
        return {
            "center": {"latitude": latitude, "longitude": longitude},
            "max_minutes": max_minutes,
            "mode": mode,
            "points": isochrone_data
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
