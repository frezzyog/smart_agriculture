"""
Smart Agriculture AI Service - FIXED FOR QUOTA ISSUES
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, List, Any
import os
import asyncio
from datetime import datetime, timedelta
from dotenv import load_dotenv
import httpx

# Import AI models
from models.irrigation_predictor import IrrigationPredictor
from models.fertilizer_predictor import FertilizerPredictor
from models.zone_optimizer import ZoneOptimizer
from utils.data_processor import SensorDataProcessor

# Load environment variables
load_dotenv()

# ============================================
# GEMINI CONFIGURATION - FIXED
# ============================================

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()

# Validate API key
def validate_api_key(key: str) -> bool:
    if not key or len(key) < 30:
        return False
    if "your_" in key.lower():
        return False
    return True

has_gemini = validate_api_key(GEMINI_API_KEY)

# CORRECT MODEL NAMES
GEMINI_MODELS = [
    "gemini-2.0-flash",
    "gemini-flash-latest",
    "gemini-pro-latest",
    "gemini-1.5-flash",
    "gemini-1.5-pro",
]

# Track state
working_model: Optional[str] = None
last_gemini_error: Optional[str] = None
quota_reset_time: Optional[datetime] = None

print("\n" + "=" * 50)
print("SMART AGRICULTURE AI SERVICE")
print("=" * 50)
if has_gemini:
    print(f"✅ Gemini API Key: {GEMINI_API_KEY[:8]}...{GEMINI_API_KEY[-4:]}")
else:
    print("❌ No valid Gemini API Key")
print("=" * 50 + "\n")


async def call_gemini(prompt: str) -> Optional[str]:
    """Call Gemini API with correct models and error handling"""
    global last_gemini_error, working_model, quota_reset_time
    last_gemini_error = None
    
    if not has_gemini:
        last_gemini_error = "No API key configured"
        return None
    
    # Check if we're in quota cooldown
    if quota_reset_time and datetime.now() < quota_reset_time:
        wait_seconds = (quota_reset_time - datetime.now()).seconds
        last_gemini_error = f"Quota exceeded. Retry in {wait_seconds}s"
        return None
    
    # Try each model
    for model in GEMINI_MODELS:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{url}?key={GEMINI_API_KEY}",
                    json={
                        "contents": [{"parts": [{"text": prompt}]}],
                        "generationConfig": {
                            "temperature": 0.7,
                            "maxOutputTokens": 800,
                            "topP": 0.9
                        }
                    },
                    timeout=30.0,
                    headers={"Content-Type": "application/json"}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        parts = candidates[0].get("content", {}).get("parts", [])
                        if parts and "text" in parts[0]:
                            working_model = model
                            print(f"✅ Success with {model}")
                            return parts[0]["text"]
                
                elif response.status_code == 429:
                    # Rate limited - parse retry time
                    error_data = response.json()
                    error_msg = error_data.get("error", {}).get("message", "")
                    
                    # Extract retry time if available
                    import re
                    retry_match = re.search(r'retry in (\d+\.?\d*)s', error_msg.lower())
                    if retry_match:
                        retry_seconds = float(retry_match.group(1))
                        quota_reset_time = datetime.now() + timedelta(seconds=retry_seconds + 5)
                    else:
                        # Default: wait 60 seconds
                        quota_reset_time = datetime.now() + timedelta(seconds=60)
                    
                    last_gemini_error = f"Rate limited. Quota resets at {quota_reset_time.strftime('%H:%M:%S')}"
                    print(f"⚠️ {model}: Rate limited")
                    continue  # Try next model
                
                elif response.status_code == 404:
                    print(f"⚠️ {model}: Not found, trying next...")
                    continue  # Try next model
                
                else:
                    error_data = response.json()
                    error_msg = error_data.get("error", {}).get("message", f"HTTP {response.status_code}")
                    last_gemini_error = error_msg
                    print(f"❌ {model}: {error_msg[:50]}...")
                    
        except httpx.TimeoutException:
            last_gemini_error = "Request timed out"
            print(f"⏱️ {model}: Timeout")
        except Exception as e:
            last_gemini_error = str(e)
            print(f"💥 {model}: {str(e)[:50]}")
    
    return None


# ============================================
# FASTAPI APP SETUP
# ============================================

app = FastAPI(
    title="Smart Agriculture AI Service",
    description="AI/ML service for predictive agriculture",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize models
irrigation_model = IrrigationPredictor()
fertilizer_model = FertilizerPredictor()
zone_optimizer = ZoneOptimizer()
data_processor = SensorDataProcessor()

# ============================================
# PYDANTIC MODELS
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
    ec: Optional[float] = None  # New field for 7-in-1 sensor
    lightIntensity: Optional[float] = None

class InterpretRequest(BaseModel):
    deviceId: str
    sensorData: SensorData

class InterpretResponse(BaseModel):
    soilHealth: str
    stressLevel: float
    moistureLossRate: float
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

class ChatRequest(BaseModel):
    message: str
    context: Optional[Dict[str, Any]] = None


# ============================================
# BASIC ENDPOINTS
# ============================================

@app.get("/")
async def root():
    return {
        "service": "Smart Agriculture AI",
        "status": "online",
        "gemini_configured": has_gemini,
        "working_model": working_model,
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "gemini": {
            "configured": has_gemini,
            "working_model": working_model,
            "last_error": last_gemini_error,
            "quota_reset": quota_reset_time.isoformat() if quota_reset_time else None
        },
        "timestamp": datetime.now().isoformat()
    }


# ============================================
# SENSOR INTERPRETATION ENDPOINT
# ============================================

@app.post("/api/ai/interpret", response_model=InterpretResponse)
async def interpret_sensor_data(request: InterpretRequest):
    """Real-time interpretation of sensor data"""
    try:
        sensor_data = request.sensorData.model_dump()
        device_id = request.deviceId
        
        soil_health = data_processor.assess_soil_health(
            moisture=sensor_data.get('moisture'),
            pH=sensor_data.get('pH'),
            nitrogen=sensor_data.get('nitrogen'),
            phosphorus=sensor_data.get('phosphorus'),
            potassium=sensor_data.get('potassium')
        )
        
        stress_level = data_processor.calculate_stress_level(
            moisture=sensor_data.get('moisture'),
            temperature=sensor_data.get('temperature'),
            humidity=sensor_data.get('humidity')
        )
        
        moisture_loss_rate = data_processor.estimate_moisture_loss_rate(
            temperature=sensor_data.get('temperature'),
            humidity=sensor_data.get('humidity'),
            light_intensity=sensor_data.get('lightIntensity')
        )
        
        alerts = []
        recommend_action = False
        action = None
        
        if sensor_data.get('moisture', 100) < 20 or stress_level > 70:
            alerts.append({
                "severity": "CRITICAL",
                "type": "MOISTURE_CRITICAL" if sensor_data.get('moisture', 100) < 20 else "STRESS_CRITICAL",
                "title": "Critical Soil Stress" if stress_level > 70 else "Critical Soil Moisture",
                "message": f"High soil stress level at {stress_level}%" if stress_level > 70 else f"Soil moisture critically low at {sensor_data.get('moisture')}%"
            })
            recommend_action = True
            # Default to WATER pump for stress/moisture issues
            action = {"type": "irrigation", "deviceId": device_id, "command": {"type": "WATER", "status": "ON", "duration": 300}}
        elif sensor_data.get('moisture', 100) < 30:
            alerts.append({
                "severity": "WARNING",
                "type": "MOISTURE_LOW",
                "title": "Low Soil Moisture",
                "message": f"Soil moisture low at {sensor_data.get('moisture')}%"
            })
        
        if sensor_data.get('nitrogen', 100) < 30:
            alerts.append({
                "severity": "WARNING",
                "type": "NPK_LOW",
                "title": "Low Nitrogen Level",
                "message": f"Nitrogen level is {sensor_data.get('nitrogen')} mg/kg"
            })
        
        if sensor_data.get('pH'):
            if sensor_data['pH'] < 5.5 or sensor_data['pH'] > 7.5:
                alerts.append({
                    "severity": "WARNING",
                    "type": "PH_WARNING",
                    "title": "pH Out of Range",
                    "message": f"Soil pH is {sensor_data['pH']}"
                })
        
        if sensor_data.get('ec'):
            if sensor_data['ec'] < 500:
                alerts.append({
                    "severity": "WARNING",
                    "type": "NPK_LOW",
                    "title": "Low Soil Conductivity (EC)",
                    "message": f"EC is {sensor_data['ec']} µS/cm. Fertigation recommended."
                })
                recommend_action = True
                action = {"type": "fertilizer", "deviceId": device_id, "command": {"type": "FERTILIZER", "status": "ON", "duration": 120}}
        
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
        raise HTTPException(status_code=500, detail=str(e))


# ============================================
# PREDICTION ENDPOINTS
# ============================================

@app.post("/api/ai/predict/irrigation")
async def predict_irrigation(request: IrrigationPredictionRequest):
    try:
        predictions = await irrigation_model.predict(zone_id=request.zoneId, days_ahead=request.days)
        return {"zoneId": request.zoneId, "predictions": predictions, "confidence": 0.85, "generatedAt": datetime.now().isoformat()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ai/predict/fertilizer")
async def predict_fertilizer(request: FertilizerPredictionRequest):
    try:
        predictions = await fertilizer_model.predict(zone_id=request.zoneId, days_ahead=request.days)
        return {"zoneId": request.zoneId, "predictions": predictions, "confidence": 0.80, "generatedAt": datetime.now().isoformat()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ai/optimize/zones")
async def optimize_zones(zones: List[Dict[str, Any]]):
    try:
        result = zone_optimizer.optimize_allocation(zones)
        return {"allocation": result, "efficiency": 0.92, "timestamp": datetime.now().isoformat()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================
# CHATBOT ENDPOINT - FIXED
# ============================================

@app.post("/api/ai/chat")
async def ai_chatbot(request: ChatRequest):
    """AI Chatbot with Gemini + Smart Fallback"""
    message = (request.message or "").strip()
    if not message:
        return {"reply": "Please enter a message.", "timestamp": datetime.now().isoformat(), "intent": "empty"}
    
    ctx = request.context or {}
    sensor_data = ctx.get('sensorData', {})
    expenses = ctx.get('expenses', [])
    
    # Check if Gemini is available
    if has_gemini:
        # Check quota status first
        if quota_reset_time and datetime.now() < quota_reset_time:
            wait_seconds = (quota_reset_time - datetime.now()).seconds
            return {
                "reply": f"⏳ AI quota exceeded. Using smart mode.\n\n{rule_based_chat(message, sensor_data, expenses)['reply']}",
                "timestamp": datetime.now().isoformat(),
                "intent": "quota_exceeded",
                "retry_in": wait_seconds
            }
        
        # Build prompt
        prompt = build_prompt(message, sensor_data, expenses)
        
        # Call Gemini
        response = await call_gemini(prompt)
        
        if response:
            return {
                "reply": response,
                "timestamp": datetime.now().isoformat(),
                "intent": "gemini_ai",
                "model": working_model
            }
        else:
            # Gemini failed
            fallback = rule_based_chat(message, sensor_data, expenses)
            return {
                "reply": f"⚠️ AI temporarily unavailable.\n\n{fallback['reply']}",
                "timestamp": datetime.now().isoformat(),
                "intent": "fallback",
                "error": last_gemini_error
            }
    
    # No Gemini configured
    return rule_based_chat(message, sensor_data, expenses)


def build_prompt(message: str, sensor_data: dict, expenses: list) -> str:
    """Build context-aware prompt"""
    total_expenses = sum(float(e.get('amount', 0)) for e in expenses)
    
    return f"""You are AgriSmart AI, a helpful farming assistant.

CURRENT FARM DATA:
• Moisture: {sensor_data.get('moisture', 'N/A')}% (optimal: 40-70%)
• Temperature: {sensor_data.get('temperature', 'N/A')}°C
• Humidity: {sensor_data.get('humidity', 'N/A')}%
• N/P/K: {sensor_data.get('nitrogen', 'N/A')}/{sensor_data.get('phosphorus', 'N/A')}/{sensor_data.get('potassium', 'N/A')} mg/kg
• pH: {sensor_data.get('pH', 'N/A')}
• EC: {sensor_data.get('ec', 'N/A')} µS/cm (optimal: 800-2000)
• Expenses: ${total_expenses:.2f}

INSTRUCTIONS:
- Be helpful and concise (2-3 paragraphs max)
- Use the sensor data to give specific advice
- Use bullet points for recommendations

FARMER'S QUESTION: {message}

YOUR RESPONSE:"""


def rule_based_chat(message: str, sensor_data: dict, expenses: list) -> dict:
    """Fallback rule-based responses"""
    msg = message.lower()
    reply = ""
    
    if any(w in msg for w in ["moisture", "water", "irrigation", "dry", "wet"]):
        m = sensor_data.get('moisture')
        if m is not None:
            if m < 30:
                reply = f"🔴 **Moisture LOW: {m}%**\n\nStart irrigation immediately! Target: 50-60%"
            elif m > 70:
                reply = f"🔵 **Moisture HIGH: {m}%**\n\nReduce watering to prevent root issues."
            else:
                reply = f"🟢 **Moisture OK: {m}%**\n\nYour soil moisture is optimal (40-70%)."
        else:
            reply = "💧 No moisture data available. Check your sensors."
    
    elif any(w in msg for w in ["temperature", "temp", "hot", "cold"]):
        t = sensor_data.get('temperature')
        if t:
            status = "optimal ✅" if 18 <= t <= 28 else ("too hot 🔥" if t > 28 else "too cold ❄️")
            reply = f"🌡️ **Temperature: {t}°C** ({status})\n\nOptimal range: 18-28°C"
        else:
            reply = "🌡️ No temperature data available."
    
    elif any(w in msg for w in ["npk", "nitrogen", "phosphorus", "potassium", "fertilizer"]):
        n = sensor_data.get('nitrogen', 'N/A')
        p = sensor_data.get('phosphorus', 'N/A')
        k = sensor_data.get('potassium', 'N/A')
        ec = sensor_data.get('ec', 'N/A')
        reply = f"🌱 **Nutrient Status:**\n• Nitrogen: {n} mg/kg\n• Phosphorus: {p} mg/kg\n• Potassium: {k} mg/kg\n• EC: {ec} µS/cm"
    
    elif any(w in msg for w in ["ph", "acid", "alkaline"]):
        ph = sensor_data.get('pH')
        if ph:
            reply = f"⚗️ **Soil pH: {ph}**\n\nOptimal: 6.0-7.0"
        else:
            reply = "⚗️ No pH data available."
    
    elif any(w in msg for w in ["expense", "cost", "spend", "money"]):
        total = sum(float(e.get('amount', 0)) for e in expenses)
        reply = f"💰 **Total Expenses: ${total:.2f}**"
    
    elif any(w in msg for w in ["status", "overview", "summary"]):
        reply = f"""📊 **Farm Status:**
• Moisture: {sensor_data.get('moisture', 'N/A')}%
• Temperature: {sensor_data.get('temperature', 'N/A')}°C
• pH: {sensor_data.get('pH', 'N/A')}
• Health: {sensor_data.get('soilHealth', 'Unknown')}"""
    
    elif any(w in msg for w in ["hello", "hi", "hey", "help"]):
        reply = """👋 **Hello! I'm AgriSmart AI**

I can help with:
• Soil moisture & irrigation
• Temperature monitoring  
• NPK & fertilizer levels
• pH management
• Farm expenses

What would you like to know?"""
    
    else:
        reply = "🤖 Try asking about: **moisture**, **temperature**, **NPK**, **pH**, or **expenses**"
    
    return {
        "reply": reply,
        "timestamp": datetime.now().isoformat(),
        "intent": "rule_based"
    }


# ============================================
# SERVER STARTUP
# ============================================

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("AI_SERVICE_PORT", 8000))
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=True)