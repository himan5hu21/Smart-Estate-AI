"""
Property Alerts Router
Handles user alerts for properties matching commute and other criteria
"""
from fastapi import APIRouter, HTTPException, Header
from typing import List
from datetime import datetime
import os

import httpx
from models.schemas import AlertPreference, AlertResponse
from services.supabase_service import supabase_service
from services.commute_service import commute_service

router = APIRouter()


async def _get_authenticated_user_id(authorization: str) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")

    access_token = authorization.split(" ", 1)[1].strip()
    supabase_url = os.getenv("SUPABASE_URL")
    anon_key = os.getenv("SUPABASE_ANON_KEY") or os.getenv("SUPABASE_SERVICE_KEY")

    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(
            f"{supabase_url}/auth/v1/user",
            headers={
                "apikey": anon_key,
                "Authorization": f"Bearer {access_token}",
            },
        )

    if response.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid or expired access token")

    return response.json().get("id")


@router.post("/create", response_model=AlertResponse)
async def create_alert(alert: AlertPreference, authorization: str = Header(default="")):
    try:
        auth_user_id = await _get_authenticated_user_id(authorization)
        access_token = authorization.split(" ", 1)[1].strip()

        alert_data = {
            "user_id": auth_user_id,
            "preferences": {
                "office_location": {
                    "latitude": alert.office_location.latitude,
                    "longitude": alert.office_location.longitude,
                },
                "max_commute_minutes": alert.max_commute_minutes,
                "min_price": alert.min_price,
                "max_price": alert.max_price,
                "bedrooms": alert.bedrooms,
                "property_type": alert.property_type,
                "locations": alert.locations,
                "amenities": alert.amenities,
            },
            "enabled": alert.enabled,
            "created_at": datetime.utcnow().isoformat(),
        }

        return await supabase_service.create_alert(alert_data, access_token)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/user/{user_id}", response_model=List[AlertResponse])
async def get_user_alerts(user_id: str, authorization: str = Header(default="")):
    try:
        auth_user_id = await _get_authenticated_user_id(authorization)
        if user_id != auth_user_id:
            raise HTTPException(status_code=403, detail="You can only access your own alerts")

        access_token = authorization.split(" ", 1)[1].strip()
        return await supabase_service.get_user_alerts(user_id, access_token)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{alert_id}")
async def update_alert(alert_id: str, alert: AlertPreference, authorization: str = Header(default="")):
    try:
        auth_user_id = await _get_authenticated_user_id(authorization)
        if alert.user_id != auth_user_id:
            raise HTTPException(status_code=403, detail="You can only update your own alerts")

        access_token = authorization.split(" ", 1)[1].strip()
        alert_data = {
            "preferences": {
                "office_location": {
                    "latitude": alert.office_location.latitude,
                    "longitude": alert.office_location.longitude,
                },
                "max_commute_minutes": alert.max_commute_minutes,
                "min_price": alert.min_price,
                "max_price": alert.max_price,
                "bedrooms": alert.bedrooms,
                "property_type": alert.property_type,
                "locations": alert.locations,
                "amenities": alert.amenities,
            },
            "enabled": alert.enabled,
        }

        return await supabase_service.update_alert(alert_id, alert_data, access_token)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{alert_id}")
async def delete_alert(alert_id: str, authorization: str = Header(default="")):
    try:
        access_token = authorization.split(" ", 1)[1].strip() if authorization.startswith("Bearer ") else ""
        _ = await _get_authenticated_user_id(authorization)
        await supabase_service.delete_alert(alert_id, access_token)
        return {"message": "Alert deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/check-new-properties/{alert_id}")
async def check_new_properties_for_alert(alert_id: str, authorization: str = Header(default="")):
    try:
        _ = await _get_authenticated_user_id(authorization)
        access_token = authorization.split(" ", 1)[1].strip()

        alert = await supabase_service.get_alert(alert_id, access_token)
        if not alert:
            raise HTTPException(status_code=404, detail="Alert not found")

        prefs = alert["preferences"]

        filters = {}
        if prefs.get("min_price"):
            filters["min_price"] = prefs["min_price"]
        if prefs.get("max_price"):
            filters["max_price"] = prefs["max_price"]
        if prefs.get("bedrooms"):
            filters["bedrooms"] = prefs["bedrooms"]
        if prefs.get("property_type"):
            filters["type"] = prefs["property_type"]
        if prefs.get("locations"):
            filters["locations"] = prefs["locations"]

        properties = await supabase_service.get_properties(filters)

        if prefs.get("office_location"):
            office_coords = (
                prefs["office_location"]["latitude"],
                prefs["office_location"]["longitude"],
            )
            properties = await commute_service.find_properties_within_commute(
                office_location=office_coords,
                max_commute_minutes=prefs.get("max_commute_minutes", 20),
                properties=properties,
                mode="driving",
            )

        return {
            "alert_id": alert_id,
            "matching_properties": len(properties),
            "properties": properties[:10],
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
