"""
Supabase Service
Handles database operations using postgrest directly
"""
from postgrest import SyncPostgrestClient
import os
from typing import List, Dict, Optional

class SupabaseService:
    def __init__(self):
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_SERVICE_KEY")
        
        # Create postgrest client
        self.client = SyncPostgrestClient(
            f"{supabase_url}/rest/v1",
            headers={
                "apikey": supabase_key,
                "Authorization": f"Bearer {supabase_key}"
            }
        )
    
    async def get_properties(self, filters: Dict = None) -> List[Dict]:
        """Get properties with optional filters"""
        query = self.client.from_("properties").select("*")
        
        # Apply filters
        if filters:
            if filters.get('min_price'):
                query = query.gte('price', filters['min_price'])
            if filters.get('max_price'):
                query = query.lte('price', filters['max_price'])
            if filters.get('bedrooms'):
                query = query.eq('bedrooms', filters['bedrooms'])
            # Only filter by type if it's not "all" or empty
            if filters.get('type') and filters.get('type') not in ['all', '']:
                query = query.eq('type', filters['type'])
            if filters.get('locations'):
                query = query.in_('location', filters['locations'])
            if filters.get('status'):
                query = query.eq('status', filters['status'])
            else:
                query = query.eq('status', 'active')  # Default to active
        else:
            query = query.eq('status', 'active')
        
        # Only get properties with coordinates
        query = query.not_.is_('latitude', 'null').not_.is_('longitude', 'null')
        
        result = query.execute()
        return result.data
    
    async def get_properties_by_ids(self, property_ids: List[int]) -> List[Dict]:
        """Get specific properties by IDs"""
        result = self.client.from_("properties")\
            .select("*")\
            .in_('id', property_ids)\
            .execute()
        return result.data
    
    async def get_property(self, property_id: int) -> Optional[Dict]:
        """Get single property"""
        result = self.client.from_("properties")\
            .select("*")\
            .eq('id', property_id)\
            .single()\
            .execute()
        return result.data
    
    async def create_alert(self, alert_data: Dict) -> Dict:
        """Create property alert"""
        result = self.client.from_("property_alerts")\
            .insert(alert_data)\
            .execute()
        return result.data[0]
    
    async def get_user_alerts(self, user_id: str) -> List[Dict]:
        """Get all alerts for user"""
        result = self.client.from_("property_alerts")\
            .select("*")\
            .eq('user_id', user_id)\
            .order('created_at', desc=True)\
            .execute()
        return result.data
    
    async def get_alert(self, alert_id: str) -> Optional[Dict]:
        """Get single alert"""
        result = self.client.from_("property_alerts")\
            .select("*")\
            .eq('id', alert_id)\
            .single()\
            .execute()
        return result.data
    
    async def update_alert(self, alert_id: str, alert_data: Dict) -> Dict:
        """Update alert"""
        result = self.client.from_("property_alerts")\
            .update(alert_data)\
            .eq('id', alert_id)\
            .execute()
        return result.data[0]
    
    async def delete_alert(self, alert_id: str):
        """Delete alert"""
        self.client.from_("property_alerts")\
            .delete()\
            .eq('id', alert_id)\
            .execute()
    
    async def get_comparable_properties(
        self,
        property_data: Dict,
        limit: int = 10
    ) -> List[Dict]:
        """Get comparable properties for valuation"""
        query = self.client.from_("properties")\
            .select("*")\
            .eq('status', 'active')\
            .eq('type', property_data.get('type'))
        
        # Price range (70% - 130%)
        if property_data.get('price'):
            query = query.gte('price', property_data['price'] * 0.7)\
                        .lte('price', property_data['price'] * 1.3)
        
        # Same location or nearby
        if property_data.get('location'):
            query = query.eq('location', property_data['location'])
        
        result = query.limit(limit).execute()
        return result.data

supabase_service = SupabaseService()
