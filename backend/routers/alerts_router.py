"""
Property Alerts Router
Handles user alerts for properties matching commute and other criteria
"""
from fastapi import APIRouter, HTTPException, Depends
from typing import List
from datetime import datetime

from models.schemas import AlertPreference, AlertResponse
from services.supabase_service import supabase_service
from services.commute_service import commute_service

router = APIRouter()

@router.post("/create", response_model=AlertResponse)
async def create_alert(alert: AlertPreference):
    """
    Create a new property alert for user
    
    User will be notified when properties matching criteria are listed
    """
    try:
        alert_data = {
            "user_id": alert.user_id,
            "preferences": {
                "office_location": {
                    "latitude": alert.office_location.latitude,
                    "longitude": alert.office_location.longitude
                },
                "max_commute_minutes": alert.max_commute_minutes,
                "min_price": alert.min_price,
                "max_price": alert.max_price,
                "bedrooms": alert.bedrooms,
                "property_type": alert.property_type,
                "locations": alert.locations,
                "amenities": alert.amenities
            },
            "enabled": alert.enabled,
            "created_at": datetime.utcnow().isoformat()
        }
        
        result = await supabase_service.create_alert(alert_data)
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/user/{user_id}", response_model=List[AlertResponse])
async def get_user_alerts(user_id: str):
    """
    Get all alerts for a user
    """
    try:
        alerts = await supabase_service.get_user_alerts(user_id)
        return alerts
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{alert_id}")
async def update_alert(alert_id: str, alert: AlertPreference):
    """
    Update an existing alert
    """
    try:
        alert_data = {
            "preferences": {
                "office_location": {
                    "latitude": alert.office_location.latitude,
                    "longitude": alert.office_location.longitude
                },
                "max_commute_minutes": alert.max_commute_minutes,
                "min_price": alert.min_price,
                "max_price": alert.max_price,
                "bedrooms": alert.bedrooms,
                "property_type": alert.property_type,
                "locations": alert.locations,
                "amenities": alert.amenities
            },
            "enabled": alert.enabled
        }
        
        result = await supabase_service.update_alert(alert_id, alert_data)
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{alert_id}")
async def delete_alert(alert_id: str):
    """
    Delete an alert
    """
    try:
        await supabase_service.delete_alert(alert_id)
        return {"message": "Alert deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/check-new-properties/{alert_id}")
async def check_new_properties_for_alert(alert_id: str):
    """
    Check if there are new properties matching alert criteria
    """
    try:
        # Get alert
        alert = await supabase_service.get_alert(alert_id)
        if not alert:
            raise HTTPException(status_code=404, detail="Alert not found")
        
        prefs = alert['preferences']
        
        # Build property filters
        filters = {}
        if prefs.get('min_price'):
            filters['min_price'] = prefs['min_price']
        if prefs.get('max_price'):
            filters['max_price'] = prefs['max_price']
        if prefs.get('bedrooms'):
            filters['bedrooms'] = prefs['bedrooms']
        if prefs.get('property_type'):
            filters['type'] = prefs['property_type']
        if prefs.get('locations'):
            filters['locations'] = prefs['locations']
        
        # Get properties
        properties = await supabase_service.get_properties(filters)
        
        # Filter by commute if office location specified
        if prefs.get('office_location'):
            office_coords = (
                prefs['office_location']['latitude'],
                prefs['office_location']['longitude']
            )
            
            properties = await commute_service.find_properties_within_commute(
                office_location=office_coords,
                max_commute_minutes=prefs.get('max_commute_minutes', 20),
                properties=properties,
                mode="driving"
            )
        
        return {
            "alert_id": alert_id,
            "matching_properties": len(properties),
            "properties": properties[:10]  # Return first 10
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
