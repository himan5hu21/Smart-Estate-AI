"""
Cache Service using Redis
"""
import redis.asyncio as redis
import json
import os
from typing import Any, Optional

class CacheService:
    def __init__(self):
        self.redis_client: Optional[redis.Redis] = None
        self.enabled = True
    
    async def connect(self):
        """Connect to Redis"""
        try:
            self.redis_client = await redis.from_url(
                os.getenv("REDIS_URL", "redis://localhost:6379/0"),
                encoding="utf-8",
                decode_responses=True
            )
            await self.redis_client.ping()
            print("✅ Redis connected")
        except Exception as e:
            print(f"⚠️  Redis connection failed: {e}. Caching disabled.")
            self.enabled = False
    
    async def disconnect(self):
        """Disconnect from Redis"""
        if self.redis_client:
            await self.redis_client.close()
    
    async def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        if not self.enabled or not self.redis_client:
            return None
        
        try:
            value = await self.redis_client.get(key)
            if value:
                return json.loads(value)
            return None
        except Exception as e:
            print(f"Cache get error: {e}")
            return None
    
    async def set(self, key: str, value: Any, expire: int = 3600):
        """Set value in cache with expiration"""
        if not self.enabled or not self.redis_client:
            return
        
        try:
            await self.redis_client.setex(
                key,
                expire,
                json.dumps(value)
            )
        except Exception as e:
            print(f"Cache set error: {e}")
    
    async def delete(self, key: str):
        """Delete key from cache"""
        if not self.enabled or not self.redis_client:
            return
        
        try:
            await self.redis_client.delete(key)
        except Exception as e:
            print(f"Cache delete error: {e}")
    
    async def clear_pattern(self, pattern: str):
        """Clear all keys matching pattern"""
        if not self.enabled or not self.redis_client:
            return
        
        try:
            keys = await self.redis_client.keys(pattern)
            if keys:
                await self.redis_client.delete(*keys)
        except Exception as e:
            print(f"Cache clear error: {e}")

cache_service = CacheService()
