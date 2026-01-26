"""
Smart Agriculture AI Service
Main FastAPI application for AI/ML predictions and insights
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, List, Any
from datetime import datetime
import os
from dotenv import load_dotenv

# Import AI models
from models.irrigation_predictor import IrrigationPredictor
from models.fertilizer_predictor import FertilizerPredictor
from models.zone_optimizer import ZoneOptimizer
from utils.data_processor import SensorDataProcessor

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="Smart Agriculture AI Service",
    description="AI/ML service for predictive agriculture",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize AI models
irrigation_model = IrrigationPredictor()
fertilizer_model = FertilizerPredictor()
zone_optimizer = ZoneOptimizer()
data_processor = SensorDataProcessor()

# ============================================
# Request/Response Models
# ============================================

class SensorData(BaseModel):
    deviceId: str
    moisture: Optional[float] = None
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    rain: Optional[float] = None
    nitrogen: Optional[float] = None
    phosphorus: Optional[float] = None
    potassium: Optional[float] = None
    pH: Optional[float] = None
    lightIntensity: Optional[float] = None

class InterpretRequest(BaseModel):
    deviceId: str
    sensorData: SensorData

class InterpretResponse(BaseModel):
    soilHealth: str  # 'excellent', 'good', 'fair', 'poor'
    stressLevel: float  # 0-100
    moistureLossRate: float  # %/hour
    recommendation: str
    alerts: List[Dict[str, Any]]
    recommendAction: bool
    action: Optional[Dict[str, Any]] = None

class IrrigationPredictionRequest(BaseModel):
    zoneId: str
    days: int = 7

class FertilizerPredictionRequest(BaseModel):
    zoneId: str
    days: int = 14

# ============================================
# API Endpoints
# ============================================

@app.get("/")
async def root():
    return {
        "service": "Smart Agriculture AI",
        "status": "online",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "models": {
            "irrigation": "loaded",
            "fertilizer": "loaded",
            "zone_optimizer": "loaded"
        },
        "timestamp": datetime.now().isoformat()
    }

@app.post("/api/ai/interpret", response_model=InterpretResponse)
async def interpret_sensor_data(request: InterpretRequest):
    """
    Real-time interpretation of sensor data
    Returns soil health, stress level, and actionable recommendations
    """
    try:
        sensor_data = request.sensorData.model_dump()
        device_id = request.deviceId
        
        # Analyze soil health
        soil_health = data_processor.assess_soil_health(
            moisture=sensor_data.get('moisture'),
            pH=sensor_data.get('pH'),
            nitrogen=sensor_data.get('nitrogen'),
            phosphorus=sensor_data.get('phosphorus'),
            potassium=sensor_data.get('potassium')
        )
        
        # Calculate stress level
        stress_level = data_processor.calculate_stress_level(
            moisture=sensor_data.get('moisture'),
            temperature=sensor_data.get('temperature'),
            humidity=sensor_data.get('humidity')
        )
        
       # Calculate moisture loss rate (simplified - in production, use historical data)
        moisture_loss_rate = data_processor.estimate_moisture_loss_rate(
            temperature=sensor_data.get('temperature'),
            humidity=sensor_data.get('humidity'),
            light_intensity=sensor_data.get('lightIntensity')
        )
        
        # Generate alerts
        alerts = []
        recommend_action = False
        action = None
        
        # Check moisture levels
        if sensor_data.get('moisture', 100) < 20:
            alerts.append({
                "severity": "CRITICAL",
                "type": "MOISTURE_CRITICAL",
                "title": "Critical Soil Moisture",
                "message": f"Soil moisture critically low at {sensor_data.get('moisture')}%"
            })
            recommend_action = True
            action = {
                "type": "irrigation",
                "deviceId": device_id,
                "command": {"status": "ON", "duration": 300}  # 5 minutes
            }
        elif sensor_data.get('moisture', 100) < 30:
            alerts.append({
                "severity": "WARNING",
                "type": "MOISTURE_LOW",
                "title": "Low Soil Moisture",
                "message": f"Soil moisture low at {sensor_data.get('moisture')}%"
            })
        
        # Check NPK levels
        if sensor_data.get('nitrogen', 100) < 30:
            alerts.append({
                "severity": "WARNING",
                "type": "NPK_LOW",
                "title": "Low Nitrogen Level",
                "message": f"Nitrogen level is {sensor_data.get('nitrogen')} mg/kg - consider fertilizing"
            })
        
        # Check pH
        if sensor_data.get('pH'):
            if sensor_data['pH'] < 5.5 or sensor_data['pH'] > 7.5:
                alerts.append({
                    "severity": "WARNING",
                    "type": "PH_WARNING",
                    "title": "pH Out of Range",
                    "message": f"Soil pH is {sensor_data['pH']} - optimal range is 6.0-7.0"
                })
        
        # Generate recommendation
        recommendation = data_processor.generate_recommendation(
            soil_health=soil_health,
            stress_level=stress_level,
            alerts=alerts
        )
        
        return InterpretResponse(
            soilHealth=soil_health,
            stressLevel=stress_level,
            moistureLossRate=moisture_loss_rate,
            recommendation=recommendation,
            alerts=alerts,
            recommendAction=recommend_action,
            action=action
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI interpretation failed: {str(e)}")

@app.post("/api/ai/predict/irrigation")
async def predict_irrigation(request: IrrigationPredictionRequest):
    """
    Predict irrigation needs for the next N days
    """
    try:
        predictions = await irrigation_model.predict(
            zone_id=request.zoneId,
            days_ahead=request.days
        )
        
        return {
            "zoneId": request.zoneId,
            "predictions": predictions,
            "confidence": 0.85,  # Will be calculated by the model
            "generatedAt": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Irrigation prediction failed: {str(e)}")

@app.post("/api/ai/predict/fertilizer")
async def predict_fertilizer(request: FertilizerPredictionRequest):
    """
    Predict fertilizer needs based on NPK depletion patterns
    """
    try:
        predictions = await fertilizer_model.predict(
            zone_id=request.zoneId,
            days_ahead=request.days
        )
        
        return {
            "zoneId": request.zoneId,
            "predictions": predictions,
            "confidence": 0.80,
            "generatedAt": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fertilizer prediction failed: {str(e)}")

@app.post("/api/ai/optimize/zones")
async def optimize_zones(zones: List[Dict[str, Any]]):
    """
    Optimize water/fertilizer distribution across multiple zones
    """
    try:
        optimization_result = zone_optimizer.optimize_allocation(zones)
        
        return {
            "allocation": optimization_result,
            "efficiency": 0.92,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Zone optimization failed: {str(e)}")

# ============================================
# Server Startup
# ============================================

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("AI_SERVICE_PORT", 8000))
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=port,
        reload=True  # Enable auto-reload during development
    )
