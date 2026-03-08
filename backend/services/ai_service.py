"""
AI Service using OpenAI or Google Gemini
Handles property descriptions, valuations, matching, and more
"""
import os
import json
import asyncio
from typing import List, Dict, Optional
from datetime import datetime
import logging

from services.cache_service import cache_service

logger = logging.getLogger(__name__)

class AIService:
    def __init__(self):
        # Check which AI provider to use
        self.use_gemini = os.getenv("USE_GEMINI", "false").lower() == "true"
        
        if self.use_gemini:
            # Use Google Gemini (FREE)
            try:
                from google import genai
                from google.genai import types
                api_key = os.getenv("GEMINI_API_KEY")
                if not api_key:
                    logger.error("GEMINI_API_KEY not found in environment variables")
                    raise ValueError("GEMINI_API_KEY is required when USE_GEMINI=true")
                
                self.client = genai.Client(api_key=api_key)
                self.model = "gemini-2.5-flash"
                self.input_cost = 0.0  # FREE!
                self.output_cost = 0.0  # FREE!
                logger.info(f"✅ AI Service initialized with FREE Google Gemini")
            except ImportError:
                logger.error("google-genai not installed. Run: pip install google-genai")
                raise ValueError("Please install: pip install google-genai")
        else:
            # Use OpenAI (PAID)
            try:
                from openai import AsyncOpenAI
                api_key = os.getenv("OPENAI_API_KEY")
                if not api_key:
                    logger.error("OPENAI_API_KEY not found in environment variables")
                    raise ValueError("OPENAI_API_KEY is required")
                
                logger.info(f"Initializing OpenAI client with key: {api_key[:20]}...")
                self.client = AsyncOpenAI(api_key=api_key)
                self.model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
                self.input_cost = float(os.getenv("AI_INPUT_COST", 0.00015))
                self.output_cost = float(os.getenv("AI_OUTPUT_COST", 0.0006))
                logger.info(f"AI Service initialized with model: {self.model}")
            except ImportError:
                logger.error("openai not installed. Run: pip install openai")
                raise ValueError("Please install: pip install openai")
    
    async def generate_property_description(
        self,
        property_data: Dict,
        tone: str = "professional"
    ) -> Dict:
        """Generate compelling property description"""
        
        logger.info(f"Generating description for property: {property_data.get('title', 'Unknown')}, tone: {tone}")
        
        cache_key = f"desc:{property_data.get('id', 'new')}:{tone}"
        cached = await cache_service.get(cache_key)
        if cached:
            logger.info("Returning cached description")
            return cached
        
        # Safely format numeric values
        price = property_data.get('price')
        price_str = f"₹{price:,.0f}" if price is not None else "N/A"
        
        area = property_data.get('area_sqft')
        area_str = f"{area} sq ft" if area is not None else "N/A"
        
        prompt = f"""You are a professional real estate copywriter. Generate a compelling property description.

Property Details:
- Title: {property_data.get('title', 'N/A')}
- Location: {property_data.get('location', 'N/A')}
- Price: {price_str}
- Bedrooms: {property_data.get('bedrooms', 'N/A')}
- Bathrooms: {property_data.get('bathrooms', 'N/A')}
- Area: {area_str}
- Type: {property_data.get('type', 'N/A')}
- Furnishing: {property_data.get('furnishing_status', 'N/A')}
- Amenities: {', '.join(property_data.get('amenities', []))}

Tone: {tone}

Generate a {tone} description (150-200 words) that:
1. Highlights key features and unique selling points
2. Emphasizes location benefits
3. Creates emotional appeal
4. Includes a compelling call-to-action
5. Uses vivid, descriptive language

Description:"""

        try:
            logger.info(f"Calling AI API with model: {self.model}")
            
            if self.use_gemini:
                # Use Google Gemini (FREE) - run in thread pool since it's synchronous
                def _generate_gemini():
                    response = self.client.models.generate_content(
                        model=self.model,
                        contents=prompt
                    )
                    return response.text.strip()
                
                description = await asyncio.to_thread(_generate_gemini)
                tokens_used = 0  # Gemini doesn't expose token count easily
                cost = 0.0  # FREE!
            else:
                # Use OpenAI (PAID)
                response = await self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": "You are a professional real estate copywriter."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.7,
                    max_tokens=500
                )
                description = response.choices[0].message.content.strip()
                tokens_used = response.usage.total_tokens
                cost = self._calculate_cost(response.usage)
            
            logger.info(f"AI API call successful. Tokens used: {tokens_used}, Cost: ${cost}")
            
            result = {
                "description": description,
                "tokens_used": tokens_used,
                "cost": cost
            }
            
            # Cache for 24 hours
            await cache_service.set(cache_key, result, expire=86400)
            
            return result
            
        except Exception as e:
            logger.error(f"AI description generation failed: {str(e)}", exc_info=True)
            raise Exception(f"AI description generation failed: {str(e)}")
    
    async def generate_inquiry_responses(
        self,
        inquiry: Dict,
        property_data: Dict
    ) -> Dict:
        """Generate 3 response suggestions for an inquiry"""
        
        # Safely format price
        price = property_data.get('price')
        price_str = f"₹{price:,.0f}" if price is not None else "N/A"
        
        prompt = f"""You are a helpful real estate agent responding to a property inquiry.

Property Details:
- Title: {property_data.get('title')}
- Location: {property_data.get('location')}
- Price: {price_str}
- Bedrooms: {property_data.get('bedrooms')}
- Bathrooms: {property_data.get('bathrooms')}

Inquiry from {inquiry.get('name')}:
"{inquiry.get('message')}"

Generate 3 professional response suggestions:
1. Detailed and informative (3-4 sentences)
2. Brief and friendly (2 sentences)
3. Enthusiastic and sales-focused (3 sentences)

Each response should:
- Address the inquiry directly
- Provide relevant property information
- Invite further questions
- Suggest next steps (viewing, call, etc.)

Format as JSON:
{{
  "detailed": "response text",
  "brief": "response text",
  "enthusiastic": "response text"
}}"""

        try:
            if self.use_gemini:
                # Use Google Gemini (FREE) - run in thread pool since it's synchronous
                def _generate_gemini():
                    response = self.client.models.generate_content(
                        model=self.model,
                        contents=prompt
                    )
                    # Extract JSON from response
                    text = response.text.strip()
                    # Remove markdown code blocks if present
                    if text.startswith('```json'):
                        text = text[7:]
                    if text.startswith('```'):
                        text = text[3:]
                    if text.endswith('```'):
                        text = text[:-3]
                    return json.loads(text.strip())
                
                suggestions = await asyncio.to_thread(_generate_gemini)
                tokens_used = 0
                cost = 0.0
            else:
                # Use OpenAI (PAID)
                response = await self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": "You are a professional real estate agent. Respond only with valid JSON."},
                        {"role": "user", "content": prompt}
                    ],
                    response_format={"type": "json_object"},
                    temperature=0.8,
                    max_tokens=800
                )
                suggestions = json.loads(response.choices[0].message.content)
                tokens_used = response.usage.total_tokens
                cost = self._calculate_cost(response.usage)
            
            return {
                "suggestions": suggestions,
                "tokens_used": tokens_used,
                "cost": cost
            }
            
        except Exception as e:
            raise Exception(f"AI response generation failed: {str(e)}")
    
    async def value_property(
        self,
        property_data: Dict,
        comparable_properties: List[Dict]
    ) -> Dict:
        """Estimate property value based on comparables"""
        
        # Safely format comparable properties
        comparables_list = []
        for i, p in enumerate(comparable_properties[:10]):
            price = p.get('price')
            price_str = f"₹{price:,.0f}" if price is not None else "N/A"
            area = p.get('area_sqft')
            area_str = f"{area} sq ft" if area is not None else "N/A"
            comparables_list.append(
                f"{i+1}. {p.get('location')} - {price_str} - {p.get('bedrooms')}BR/{p.get('bathrooms')}BA - {area_str}"
            )
        comparables_text = "\n".join(comparables_list)
        
        # Safely format target property area
        area = property_data.get('area_sqft')
        area_str = f"{area} sq ft" if area is not None else "N/A"
        
        prompt = f"""You are a real estate valuation expert. Estimate the fair market value.

Target Property:
- Location: {property_data.get('location')}
- Bedrooms: {property_data.get('bedrooms')}
- Bathrooms: {property_data.get('bathrooms')}
- Area: {area_str}
- Year Built: {property_data.get('year_built', 'N/A')}
- Furnishing: {property_data.get('furnishing_status')}
- Amenities: {', '.join(property_data.get('amenities', []))}

Comparable Properties:
{comparables_text}

Provide a detailed valuation analysis.

Format as JSON:
{{
  "minValue": number,
  "maxValue": number,
  "estimatedValue": number,
  "confidence": number (0-100),
  "factors": ["factor1", "factor2", ...],
  "trend": "up" | "down" | "stable",
  "reasoning": "brief explanation"
}}"""
        try:
            if self.use_gemini:
                # Use Google Gemini (FREE)
                def _generate_gemini():
                    response = self.client.models.generate_content(
                        model=self.model,
                        contents=prompt
                    )
                    text = response.text.strip()
                    if text.startswith('```json'):
                        text = text[7:]
                    if text.startswith('```'):
                        text = text[3:]
                    if text.endswith('```'):
                        text = text[:-3]
                    return json.loads(text.strip())

                valuation = await asyncio.to_thread(_generate_gemini)
                valuation["tokens_used"] = 0
                valuation["cost"] = 0.0
            else:
                response = await self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": "You are a real estate valuation expert. Respond only with valid JSON."},
                        {"role": "user", "content": prompt}
                    ],
                    response_format={"type": "json_object"},
                    temperature=0.3,
                    max_tokens=1000
                )

                valuation = json.loads(response.choices[0].message.content)
                valuation["tokens_used"] = response.usage.total_tokens
                valuation["cost"] = self._calculate_cost(response.usage)

            return valuation

        except Exception as e:
            raise Exception(f"AI valuation failed: {str(e)}")
    
    async def match_properties_to_user(
        self,
        user_preferences: Dict,
        properties: List[Dict],
        top_n: int = 5
    ) -> Dict:
        """Match properties to user preferences using AI"""
        
        # Safely format properties list
        properties_list = []
        for i, p in enumerate(properties[:20]):
            price = p.get('price')
            price_str = f"₹{price:,.0f}" if price is not None else "N/A"
            properties_list.append(
                f"{i+1}. ID:{p.get('id')} - {p.get('title')} - {p.get('location')} - {price_str} - {p.get('bedrooms')}BR"
            )
        properties_text = "\n".join(properties_list)
        
        # Safely format budget
        min_price = user_preferences.get('min_price')
        max_price = user_preferences.get('max_price')
        min_price_str = f"₹{min_price:,.0f}" if min_price is not None else "N/A"
        max_price_str = f"₹{max_price:,.0f}" if max_price is not None else "N/A"
        
        prompt = f"""You are a real estate matching expert. Find the best properties for this user.

User Preferences:
- Budget: {min_price_str} - {max_price_str}
- Preferred locations: {', '.join(user_preferences.get('locations', []))}
- Bedrooms: {user_preferences.get('bedrooms')}
- Property type: {user_preferences.get('type')}
- Must-have amenities: {', '.join(user_preferences.get('amenities', []))}
- Commute requirement: {user_preferences.get('max_commute_minutes', 'N/A')} minutes

Available Properties:
{properties_text}

Rank the top {top_n} properties and explain why each matches.

Format as JSON:
{{
  "matches": [
    {{
      "propertyId": number,
      "score": number (0-100),
      "reasons": ["reason1", "reason2", ...]
    }}
  ]
}}"""
        try:
            if self.use_gemini:
                # Use Google Gemini (FREE)
                def _generate_gemini():
                    response = self.client.models.generate_content(
                        model=self.model,
                        contents=prompt
                    )
                    text = response.text.strip()
                    if text.startswith('```json'):
                        text = text[7:]
                    if text.startswith('```'):
                        text = text[3:]
                    if text.endswith('```'):
                        text = text[:-3]
                    return json.loads(text.strip())

                matches = await asyncio.to_thread(_generate_gemini)
                matches["tokens_used"] = 0
                matches["cost"] = 0.0
            else:
                response = await self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": "You are a real estate matching expert. Respond only with valid JSON."},
                        {"role": "user", "content": prompt}
                    ],
                    response_format={"type": "json_object"},
                    temperature=0.5,
                    max_tokens=1500
                )

                matches = json.loads(response.choices[0].message.content)
                matches["tokens_used"] = response.usage.total_tokens
                matches["cost"] = self._calculate_cost(response.usage)

            return matches

        except Exception as e:
            raise Exception(f"AI matching failed: {str(e)}")
    
    def _calculate_cost(self, usage) -> float:
        """Calculate API call cost"""
        input_cost = (usage.prompt_tokens / 1000) * self.input_cost
        output_cost = (usage.completion_tokens / 1000) * self.output_cost
        return round(input_cost + output_cost, 6)

ai_service = AIService()
