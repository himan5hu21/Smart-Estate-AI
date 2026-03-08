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
        self.service_key = os.getenv("SUPABASE_SERVICE_KEY")
        self.anon_key = os.getenv("SUPABASE_ANON_KEY") or self.service_key
        self.rest_url = f"{supabase_url}/rest/v1"

        self.client = SyncPostgrestClient(
            self.rest_url,
            headers={
                "apikey": self.service_key,
                "Authorization": f"Bearer {self.service_key}",
            },
        )

    def _get_user_client(self, access_token: str) -> SyncPostgrestClient:
        return SyncPostgrestClient(
            self.rest_url,
            headers={
                "apikey": self.anon_key,
                "Authorization": f"Bearer {access_token}",
            },
        )

    async def get_properties(self, filters: Dict = None) -> List[Dict]:
        query = self.client.from_("properties").select("*")

        if filters:
            if filters.get("min_price"):
                query = query.gte("price", filters["min_price"])
            if filters.get("max_price"):
                query = query.lte("price", filters["max_price"])
            if filters.get("bedrooms"):
                query = query.eq("bedrooms", filters["bedrooms"])
            if filters.get("type") and filters.get("type") not in ["all", ""]:
                query = query.eq("type", filters["type"])
            if filters.get("locations"):
                query = query.in_("location", filters["locations"])
            if filters.get("status"):
                query = query.eq("status", filters["status"])
            else:
                query = query.eq("status", "active")
        else:
            query = query.eq("status", "active")

        query = query.not_.is_("latitude", "null").not_.is_("longitude", "null")

        result = query.execute()
        return result.data

    async def get_properties_by_ids(self, property_ids: List[int]) -> List[Dict]:
        result = (
            self.client.from_("properties")
            .select("*")
            .in_("id", property_ids)
            .execute()
        )
        return result.data

    async def get_property(self, property_id: int) -> Optional[Dict]:
        result = (
            self.client.from_("properties")
            .select("*")
            .eq("id", property_id)
            .single()
            .execute()
        )
        return result.data

    async def create_alert(self, alert_data: Dict, access_token: str) -> Dict:
        client = self._get_user_client(access_token)
        result = client.from_("property_alerts").insert(alert_data).execute()
        return result.data[0]

    async def get_user_alerts(self, user_id: str, access_token: str) -> List[Dict]:
        client = self._get_user_client(access_token)
        result = (
            client.from_("property_alerts")
            .select("*")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .execute()
        )
        return result.data

    async def get_alert(self, alert_id: str, access_token: Optional[str] = None) -> Optional[Dict]:
        client = self._get_user_client(access_token) if access_token else self.client
        result = (
            client.from_("property_alerts")
            .select("*")
            .eq("id", alert_id)
            .limit(1)
            .execute()
        )
        if not result.data:
            return None
        return result.data[0]

    async def update_alert(self, alert_id: str, alert_data: Dict, access_token: str) -> Dict:
        client = self._get_user_client(access_token)
        result = (
            client.from_("property_alerts")
            .update(alert_data)
            .eq("id", alert_id)
            .execute()
        )
        return result.data[0]

    async def delete_alert(self, alert_id: str, access_token: str):
        client = self._get_user_client(access_token)
        client.from_("property_alerts").delete().eq("id", alert_id).execute()

    async def get_comparable_properties(self, property_data: Dict, limit: int = 10) -> List[Dict]:
        query = (
            self.client.from_("properties")
            .select("*")
            .eq("status", "active")
            .eq("type", property_data.get("type"))
        )

        if property_data.get("price"):
            query = query.gte("price", property_data["price"] * 0.7).lte(
                "price", property_data["price"] * 1.3
            )

        if property_data.get("location"):
            query = query.eq("location", property_data["location"])

        result = query.limit(limit).execute()
        return result.data


supabase_service = SupabaseService()
