"""
AI Features Router
Handles property descriptions, valuations, matching, and inquiry responses
"""
from fastapi import APIRouter, HTTPException
from typing import List

from models.schemas import (
    PropertyDescriptionRequest,
    InquiryResponseRequest,
    PropertyValuationRequest,
    PropertyMatchingRequest
)
from services.ai_service import ai_service

router = APIRouter()

@router.post("/generate-description")
async def generate_property_description(request: PropertyDescriptionRequest):
    """
    Generate AI-powered property description
    
    Tones: professional, casual, luxury
    """
    try:
        result = await ai_service.generate_property_description(
            property_data=request.property_data,
            tone=request.tone
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/suggest-inquiry-response")
async def suggest_inquiry_response(request: InquiryResponseRequest):
    """
    Generate AI-powered inquiry response suggestions
    
    Returns 3 different response styles
    """
    try:
        result = await ai_service.generate_inquiry_responses(
            inquiry=request.inquiry,
            property_data=request.property_data
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/value-property")
async def value_property(request: PropertyValuationRequest):
    """
    AI-powered property valuation based on comparables
    """
    try:
        result = await ai_service.value_property(
            property_data=request.property_data,
            comparable_properties=request.comparable_properties
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/match-properties")
async def match_properties(request: PropertyMatchingRequest):
    """
    AI-powered property matching based on user preferences
    """
    try:
        result = await ai_service.match_properties_to_user(
            user_preferences=request.user_preferences,
            properties=request.properties,
            top_n=request.top_n
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/pricing")
async def get_ai_pricing():
    """
    Get current AI pricing information
    """
    return {
        "model": ai_service.model,
        "pricing": {
            "input_per_1k_tokens": f"${ai_service.input_cost}",
            "output_per_1k_tokens": f"${ai_service.output_cost}",
        },
        "estimated_costs": {
            "property_description": "$0.001 - $0.003",
            "inquiry_response": "$0.002 - $0.005",
            "property_valuation": "$0.003 - $0.008",
            "property_matching": "$0.005 - $0.015"
        },
        "monthly_estimate_1000_users": "$5 - $20"
    }
