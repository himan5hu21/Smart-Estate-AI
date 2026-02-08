"""
Pydantic models for request/response validation
"""
from pydantic import BaseModel, Field
from typing import List, Optional, Tuple
from datetime import datetime

class PropertyLocation(BaseModel):
    latitude: float
    longitude: float

class CommuteRequest(BaseModel):
    office_location: PropertyLocation
    max_commute_minutes: int = Field(default=20, ge=5, le=120)
    mode: str = Field(default="driving", pattern="^(driving|transit|walking|bicycling)$")
    property_filters: Optional[dict] = None

class CommuteResult(BaseModel):
    property_id: int
    duration_minutes: float
    distance_km: float
    duration_text: str
    distance_text: str
    mode: str

class PropertyDescriptionRequest(BaseModel):
    property_data: dict
    tone: str = Field(default="professional", pattern="^(professional|casual|luxury)$")

class InquiryResponseRequest(BaseModel):
    inquiry: dict
    property_data: dict

class PropertyValuationRequest(BaseModel):
    property_data: dict
    comparable_properties: List[dict]

class PropertyMatchingRequest(BaseModel):
    user_preferences: dict
    properties: List[dict]
    top_n: int = Field(default=5, ge=1, le=20)

class AlertPreference(BaseModel):
    user_id: str
    office_location: PropertyLocation
    max_commute_minutes: int = Field(default=20, ge=5, le=120)
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    bedrooms: Optional[int] = None
    property_type: Optional[str] = None
    locations: Optional[List[str]] = None
    amenities: Optional[List[str]] = None
    enabled: bool = True

class AlertResponse(BaseModel):
    id: str
    user_id: str
    created_at: datetime
    preferences: dict
    enabled: bool
