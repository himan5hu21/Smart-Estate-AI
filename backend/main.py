"""
SmartEstate AI Backend - Main Application
Handles AI features including commute time analysis, property matching, and more
"""
# IMPORTANT: Load environment variables FIRST before any other imports
import os
import logging
from dotenv import load_dotenv
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Now import everything else
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from routers import ai_router, commute_router, alerts_router
from services.cache_service import cache_service

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting SmartEstate AI Backend...")
    logger.info(f"OpenAI API Key present: {bool(os.getenv('OPENAI_API_KEY'))}")
    logger.info(f"Google Maps API Key present: {bool(os.getenv('GOOGLE_MAPS_API_KEY'))}")
    await cache_service.connect()
    logger.info("Application startup complete")
    yield
    # Shutdown
    logger.info("Shutting down...")
    await cache_service.disconnect()
    logger.info("Application shutdown complete")

app = FastAPI(
    title="SmartEstate AI API",
    description="AI-powered features for real estate platform",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        os.getenv("FRONTEND_URL", "http://localhost:3000")
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(ai_router.router, prefix="/api/ai", tags=["AI Features"])
app.include_router(commute_router.router, prefix="/api/commute", tags=["Commute Analysis"])
app.include_router(alerts_router.router, prefix="/api/alerts", tags=["Property Alerts"])

@app.get("/")
async def root():
    return {
        "message": "SmartEstate AI Backend",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=os.getenv("HOST", "0.0.0.0"),
        port=int(os.getenv("PORT", 8000)),
        reload=os.getenv("ENVIRONMENT") == "development"
    )
