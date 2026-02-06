"""
Smart Agriculture AI Service - Version 1.0.1 (Stable)
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

# CORRECT MODEL NAMES - Based on actual API testing
GEMINI_MODELS = [
    "gemini-2.5-flash",      # Working on v1beta (verified)
    "gemini-2.0-flash",  
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-pro",
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
        # Try v1beta first (works for gemini-2.5-flash), then v1 as fallback
        api_versions = ["v1beta", "v1"]
        
        for api_version in api_versions:
            url = f"https://generativelanguage.googleapis.com/{api_version}/models/{model}:generateContent"
            
            try:
                async with httpx.AsyncClient() as client:
                    response = await client.post(
                        f"{url}?key={GEMINI_API_KEY}",
                        json={
                            "contents": [{"parts": [{"text": prompt}]}],
                            "generationConfig": {
                                "temperature": 0.5,
                                "maxOutputTokens": 4096,
                                "topP": 0.95
                            },
                            "safetySettings": [
                                {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
                                {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
                                {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
                                {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"}
                            ]
                        },
                        timeout=30.0,
                        headers={"Content-Type": "application/json"}
                    )
                    
                    if response.status_code == 200:
                        data = response.json()
                        candidates = data.get("candidates", [])
                        if candidates:
                            candidate = candidates[0]
                            parts = candidate.get("content", {}).get("parts", [])
                            finish_reason = candidate.get("finishReason")
                            
                            if parts:
                                full_text = "".join([p.get("text", "") for p in parts if "text" in p])
                                working_model = model
                                print(f"✅ Success with {model} ({api_version}) (Length: {len(full_text)}, FinishReason: {finish_reason})")
                                return full_text
                    
                    elif response.status_code == 429:
                        # Rate limited
                        print(f"⚠️ {model} ({api_version}): Rate limited")
                        break # Try NEXT model if one version is rate limited
                    
                    elif response.status_code == 404:
                        # Model not found on this version
                        print(f"⚠️ {model} ({api_version}): Not found")
                        continue # Try NEXT api_version for same model
                    
                    else:
                        error_data = response.json()
                        error_msg = error_data.get("error", {}).get("message", f"HTTP {response.status_code}")
                        print(f"❌ {model} ({api_version}): {error_msg[:100]}")
                        break # Try NEXT model
                        
            except Exception as e:
                print(f"💥 {model} ({api_version}) Error: {str(e)[:50]}")
                break
                    
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

# Track active pump cycles to prevent alert spamming
# Structure: { device_id: { "fertilizer_end": datetime, "water_end": datetime } }
device_pump_states = {}

# ============================================
# PYDANTIC MODELS
# ============================================

class SensorData(BaseModel):
    deviceId: Optional[str] = None
    moisture: Optional[Any] = None
    temperature: Optional[Any] = None
    humidity: Optional[Any] = None
    rain: Optional[Any] = None
    nitrogen: Optional[Any] = None
    phosphorus: Optional[Any] = None
    potassium: Optional[Any] = None
    pH: Optional[Any] = None
    ec: Optional[Any] = None
    lightIntensity: Optional[Any] = None

    # Helper to clean N/A and map temp to temperature
    @classmethod
    def model_validate(cls, obj: Any, *args, **kwargs):
        if isinstance(obj, dict):
            # Map 'temp' to 'temperature' if needed
            if 'temp' in obj and 'temperature' not in obj:
                obj['temperature'] = obj['temp']
            
            # Convert "N/A" or strings to None/Float
            for key, value in obj.items():
                if value == "N/A" or value == "null" or value == "":
                    obj[key] = None
                elif isinstance(value, str):
                    try:
                        obj[key] = float(value)
                    except:
                        obj[key] = None
        return super().model_validate(obj, *args, **kwargs)

class InterpretRequest(BaseModel):
    deviceId: str
    sensorData: Dict[str, Any] # Use dict to allow the custom validation above

class InterpretResponse(BaseModel):
    soilHealth: str
    stressLevel: float
    moistureLossRate: float
    recommendation: str
    alerts: List[Dict[str, Any]]
    recommendAction: bool
    action: Optional[Dict[str, Any]] = None # Deprecated: use actions instead
    actions: List[Dict[str, Any]] = [] # Support for simultaneous actions

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
    """Real-time interpretation of sensor data with weather-aware irrigation"""
    try:
        # CLEAN AND VALIDATE DATA
        clean_data = SensorData.model_validate(request.sensorData)
        sensor_data = clean_data.model_dump()
        device_id = request.deviceId
        
        # ============================================
        # FETCH WEATHER FORECAST
        # ============================================
        weather_forecast = None
        tomorrow_rain_probability = 0
        
        try:
            backend_url = os.getenv("NODE_BACKEND_URL") or os.getenv("BACKEND_URL", "http://localhost:5000")
            # Ensure https:// prefix
            if backend_url and not backend_url.startswith("http"):
                backend_url = f"https://{backend_url}"
            async with httpx.AsyncClient() as client:
                weather_response = await client.get(f"{backend_url}/api/weather", timeout=5.0)
                if weather_response.status_code == 200:
                    weather_data = weather_response.json()
                    weather_forecast = weather_data.get('forecast', [])
                    
                    # Get tomorrow's rain probability
                    if weather_forecast and len(weather_forecast) > 0:
                        tomorrow = weather_forecast[0]
                        tomorrow_rain_probability = tomorrow.get('rainProbability', 0)
                        print(f"🌦️ Weather Check: Tomorrow's rain probability = {tomorrow_rain_probability}%")
        except Exception as e:
            print(f"⚠️ Weather API unavailable: {e}")
        
        # ============================================
        # SENSOR DATA ANALYSIS
        # ============================================
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
        actions = []
        
        # ============================================
        # MOISTURE THRESHOLDS WITH WEATHER INTELLIGENCE
        # ============================================
        moisture = sensor_data.get('moisture', 100)
        rain_detected = sensor_data.get('rain', 0) > 20  # Current rain from sensor
        
        # Check if we should skip irrigation due to rain forecast OR current rain
        skip_irrigation_due_to_rain = tomorrow_rain_probability > 50 or rain_detected
        
        # 🌧️ IMMEDIATE RAIN ALERT (New)
        if rain_detected:
            # Check intensity (simple logic: > 80% is heavy rain)
            is_heavy_rain = sensor_data.get('rain', 0) > 80
            
            alerts.append({
                "severity": "WARNING",
                "type": "WEATHER_ALERT",
                "title": "⛈ ភ្លៀងកម្រិតខ្លាំង" if is_heavy_rain else "🌧 មេឃកំពុងភ្លៀងហើយ ម៉ូទ័រត្រូវបានបិទ",
                "message": "ការស្រោចទឹក និងការផ្គត់ផ្គង់ជីត្រូវបានផ្អាកជាបណ្តោះអាសន្ន ដើម្បីការពារសុខភាពដំណាំ។" if is_heavy_rain else "ប្រព័ន្ធបានបញ្ឈប់ម៉ូទ័របូមទឹក និងម៉ូទ័របូមជី ដើម្បីជៀសវាងការស្រោចទឹកលើសកម្រិត។"
            })
        
        if moisture < 45 or stress_level > 80:
            # Critical situation - needs immediate action
            if skip_irrigation_due_to_rain:
                # Rain detected or expected - add info alert instead of triggering pump
                alerts.append({
                    "severity": "INFO",
                    "type": "WEATHER_ALERT",
                    "title": "⚠️ សំណើមដីខ្ពស់ (ដោយសារភ្លៀង)",
                    "message": "ប្រព័ន្ធបានបញ្ឈប់ម៉ូទ័របូមទឹក ដើម្បីជៀសវាងការស្រោចទឹកលើសកម្រិត។"
                })
                recommend_action = False
                # If it was already pumping, send STOP command
                action = {"type": "irrigation", "deviceId": device_id, "command": {"type": "WATER", "status": "OFF", "duration": 0, "reason": "RAIN_DETECTED"}}
            else:
                # No rain expected - trigger irrigation
                alerts.append({
                    "severity": "CRITICAL",
                    "type": "MOISTURE_CRITICAL",
                    "title": "💧 សំណើមដីទាប",
                    "message": "ប្រព័ន្ធបានបើកម៉ូទ័របូមទឹកដោយស្វ័យប្រវត្តិ ដើម្បីផ្គត់ផ្គង់ទឹកឲ្យដំណាំ។"
                })
                recommend_action = True
                actions.append({"type": "irrigation", "deviceId": device_id, "command": {"type": "WATER", "status": "ON", "duration": 420}})
                
        elif moisture < 50:
            if skip_irrigation_due_to_rain:
                alerts.append({
                    "severity": "INFO",
                    "type": "WEATHER_ALERT",
                    "title": "⚠️ សំណើមដីខ្ពស់ (ដោយសារភ្លៀង)",
                    "message": "ប្រព័ន្ធបានបញ្ឈប់ម៉ូទ័របូមទឹក ដើម្បីជៀសវាងការស្រោចទឹកលើសកម្រិត។"
                })
            else:
                alerts.append({
                    "severity": "WARNING",
                    "type": "MOISTURE_LOW",
                    "title": "💧 សំណើមដីទាប",
                    "message": "សំណើមដីបានធ្លាក់ចុះ។ ប្រព័ន្ធនឹងបូមទឹកឆាប់ៗនេះ។"
                })
        else:
             # Moisture OK or High
             if moisture > 80:
                 alerts.append({
                    "severity": "INFO",
                    "type": "SYSTEM_INFO",
                    "title": "⚠️ សំណើមដីខ្ពស់",
                    "message": "ប្រព័ន្ធបានបញ្ឈប់ម៉ូទ័របូមទឹក ដើម្បីជៀសវាងការស្រោចទឹកលើសកម្រិត។"
                })
        
        # Add weather info to alerts if rain is expected
        if tomorrow_rain_probability > 30 and not rain_detected:
            alerts.append({
                "severity": "INFO",
                "type": "WEATHER_ALERT",
                "title": f"🌧️ ការព្យាករណ៍ភ្លៀង៖ {tomorrow_rain_probability}%",
                "message": f"រំពឹងថានឹងមានការស្រោចស្រពតាមធម្មជាតិនៅថ្ងៃស្អែក។ AI នឹងបង្កើនប្រសិទ្ធភាពការប្រើប្រាស់ទឹក។"
            })
        
        # ============================================
        # NUTRIENT THRESHOLDS
        # ============================================
        # Prototype Mode: Allow fertilizer even if moisture is low -> Simultaneous Pumping
        can_fertilize = True # Enable "Combo Mode" for demo
        # Note: In real parallel mode, we can send multiple commands, but here we prioritize telling user about both.
        
        # STANDALONE NPK CHECKS REMOVED - Integrated into main logic below to prevent duplicate alerts
        
        # pH THRESHOLDS: 6.0 - 7.0
        if sensor_data.get('pH'):
            if sensor_data['pH'] < 5.8 or sensor_data['pH'] > 7.2:
                alerts.append({
                    "severity": "WARNING",
                    "type": "PH_WARNING",
                    "title": "⚠️ បញ្ហា pH ដី",
                    "message": f"pH ដីគឺ {sensor_data['pH']}។ ស្ពៃក្តោបត្រូវការ pH ៦.០-៧.០។"
                })
        
        # EC THRESHOLDS: 1.2 - 1.6 dS/m (1200-1600 µS/cm)
        if sensor_data.get('ec'):
            if sensor_data['ec'] < 1000:
                if can_fertilize:
                    # Check for current rain OR heavy rain forecast
                    if rain_detected:
                        alerts.append({
                             "severity": "INFO", # Reduced severity cause rain handled it
                             "type": "NPK_LOW",
                             "title": "🌱 រកឃើញកម្រិតជីទាប",
                             "message": "ប៉ុន្តែភ្លៀងកំពុងធ្លាក់។ ការដាក់ជីត្រូវបានផ្អាក។"
                        })
                        # Send STOP command if it was active
                        actions.append({"type": "fertilizer", "deviceId": device_id, "command": {"type": "FERTILIZER", "status": "OFF", "duration": 0}})
                        recommend_action = False
                    elif tomorrow_rain_probability >= 70:
                        alerts.append({
                             "severity": "INFO",
                             "type": "NPK_LOW",
                             "title": "🌱 រកឃើញកម្រិតជីទាប",
                             "message": f"ប៉ុន្តែមានភ្លៀងខ្លាំងនៅថ្ងៃស្អែក ({tomorrow_rain_probability}%)។ ការដាក់ជីត្រូវបានពន្យារពេល។"
                        })
                    else:
                        # Check if fertilizer pump is already running/in cooldown
                        current_time = datetime.now()
                        device_state = device_pump_states.get(device_id, {})
                        fert_end = device_state.get("fertilizer_end")
                        
                        is_pumping = fert_end and current_time < fert_end
                        
                        if is_pumping:
                            # Pump is already running, suppress duplicate alerts
                            # Optional: Add INFO alert just for dashboard feedback if needed, 
                            # but filtering it out ensures Telegram is silent as requested.
                            pass
                        else:
                            # Pump not running, generate NEW Alert + Action
                            
                            # IDENTIFY SPECIFIC DEFICIENCIES
                            deficiencies = []
                            if sensor_data.get('nitrogen', 0) < 130: deficiencies.append(f"Nitrogen ({sensor_data.get('nitrogen')} mg/kg)")
                            if sensor_data.get('phosphorus', 0) < 30: deficiencies.append(f"Phosphorus ({sensor_data.get('phosphorus')} mg/kg)")
                            if sensor_data.get('potassium', 0) < 150: deficiencies.append(f"Potassium ({sensor_data.get('potassium')} mg/kg)")
                            
                            deficiency_str = ", ".join(deficiencies) if deficiencies else "General Low EC"
                            current_time_str = current_time.strftime("%I:%M %p")
                            
                            alerts.append({
                                "severity": "WARNING",
                                "type": "NPK_LOW",
                                "title": f"🌱 កង្វះសារធាតុ ({deficiency_str}) ➔ ម៉ូទ័រកំពុងស្រោចជី...",
                                "message": f"[{current_time_str}] រកឃើញ៖ {deficiency_str}។ ប្រព័ន្ធបាន **បើកម៉ូទ័របូមជី (Fertilizer Pump ON)** ដើម្បីផ្គត់ផ្គង់សារធាតុចិញ្ចឹម។"
                            })
                            recommend_action = True
                            duration = 180 # 3 minutes
                            actions.append({"type": "fertilizer", "deviceId": device_id, "command": {"type": "FERTILIZER", "status": "ON", "duration": duration}})
                            
                            # Update Pump State
                            if device_id not in device_pump_states:
                                device_pump_states[device_id] = {}
                            device_pump_states[device_id]["fertilizer_end"] = current_time + timedelta(seconds=duration)

                else:
                    # If dry, add warning alert but don't trigger pump (water takes priority)
                    alerts.append({
                        "severity": "INFO",
                        "type": "NPK_LOW",
                        "title": "🌱 រកឃើញកម្រិតជីទាប",
                        "message": "ត្រូវការស្រោចទឹកជាមុនសិន។"
                    })
            elif sensor_data['ec'] > 2000:
                 alerts.append({
                    "severity": "CRITICAL",
                    "type": "PH_WARNING",
                    "title": "⚠️ កម្រិតជាតិប្រៃក្នុងដីខ្ពស់",
                    "message": f"EC គឺ {sensor_data['ec']} µS/cm។ ត្រូវលាងសម្អាតដោយទឹកស្អាត។"
                })
        
        recommendation = data_processor.generate_recommendation(
            soil_health=soil_health,
            stress_level=stress_level,
            alerts=alerts
        )
        
        # Add weather context to recommendation
        if skip_irrigation_due_to_rain:
            recommendation += f"\n\n🌧️ AI detected {tomorrow_rain_probability}% rain probability tomorrow and optimized water usage accordingly."
        
        return InterpretResponse(
            soilHealth=soil_health,
            stressLevel=stress_level,
            moistureLossRate=moisture_loss_rate,
            recommendation=recommendation,
            alerts=alerts,
            recommendAction=recommend_action,
            action=actions[0] if actions else None, # Backwards compatibility
            actions=actions
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
    """Build context-aware prompt with Cambodian/MAFF standards"""
    total_expenses = sum(float(e.get('amount', 0)) for e in expenses)
    
    return f"""You are AgriSmart AI, an agricultural expert specialized in Cambodian lettuce farming.
    
FACTS & STANDARDS (MAFF/CARDI):
• Optimal Soil Temp: 18°C - 24°C (Danger > 27°C)
• Optimal Moisture: 65% - 75% (Critical < 50%)
• Optimal pH: 6.0 - 7.0 (CARDI standard)
• Optimal EC: 1200 - 1600 µS/cm (Low < 1000, Saline > 2000)
• Nutrient Targets (ppm): Nitrogen 150-200, Phosphorus 30-50, Potassium 150-250

CURRENT FARM DATA:
• Moisture: {sensor_data.get('moisture', 'N/A')}%
• Temperature: {sensor_data.get('temperature', 'N/A')}°C
• Humidity: {sensor_data.get('humidity', 'N/A')}%
• N/P/K: {sensor_data.get('nitrogen', 'N/A')}/{sensor_data.get('phosphorus', 'N/A')}/{sensor_data.get('potassium', 'N/A')} ppm
• pH: {sensor_data.get('pH', 'N/A')}
• EC: {sensor_data.get('ec', 'N/A')} µS/cm
• Expenses: ${total_expenses:.2f}


INSTRUCTIONS:
- If CURRENT FARM DATA is 'N/A', provide comprehensive general agricultural guidance based on Cambodian MAFF standards. 
- Reference specific Cambodian standards if relevant (MAFF, Seed Co, CARDI).
- Suggest strategies like Rice Straw Mulch for heat or Husk Ash for pH.
- Be professional, descriptive, and use bullet points for clarity.
- NEVER say you are waiting for data; instead, provide the best advice possible with what you have.
- RESPOND IN KHMER LANGUAGE.
- Use polite Khmer terms (e.g., លោកកសិករ).

FARMER'S QUESTION: {message}

YOUR RESPONSE:"""


def rule_based_chat(message: str, sensor_data: dict, expenses: list) -> dict:
    """Fallback rule-based responses in polite Khmer using MAFF standards"""
    msg = message.lower()
    reply = ""
    
    # Common Khmer keywords too
    if any(w in msg for w in ["moisture", "water", "irrigation", "dry", "wet", "ទឹក", "សំណើម", "ស្រោច"]):
        m = sensor_data.get('moisture')
        if m is not None:
            if m < 50:
                reply = f"🔴 **ស្ថានភាពសំណើមដី៖ ស្ងួតខ្លាំង ({m}%)**\n\nលោកកសិករ! កម្រិតសំណើមនេះទាបជាងស្តង់ដារ (៦៥-៧៥%)។ ប្រព័ន្ធបានបើកម៉ូទ័របូមទឹកជូនដោយស្វ័យប្រវត្តិដើម្បីការពារដំណាំក្រិន។"
            elif m > 80:
                reply = f"🔵 **ស្ថានភាពសំណើមដី៖ ជោកខ្លាំង ({m}%)**\n\nលោកកសិករគួរកាត់បន្ថយការស្រោចទឹក ព្រោះសំណើមខ្ពស់ពេកអាចធ្វើឱ្យសាឡាត់រលួយឫសបាន។"
            else:
                reply = f"🟢 **ស្ថានភាពសំណើមដី៖ ល្អប្រសើរ ({m}%)**\n\nសំណើមដីស្ថិតក្នុងកម្រិតត្រឹមត្រូវតាមបច្ចេកទេសរបស់ CARDI និង MAFF (៦០-៨០%)។"
        else:
            reply = "💧 មិនទាន់មានទិន្នន័យសំណើមដីនៅឡើយទេ។ សូមលោកកសិករពិនិត្យការភ្ជាប់សិនស័រ។"
    
    elif any(w in msg for w in ["temperature", "temp", "hot", "cold", "កម្ដៅ", "ក្តៅ", "សីតុណ្ហភាព"]):
        t = sensor_data.get('temperature')
        if t:
            if t > 27:
                reply = f"🔥 **កម្រិតកម្ដៅ៖ ខ្ពស់ពេក ({t}°C)**\n\nសីតុណ្ហភាពលើសពី ២៧°C អាចធ្វើឱ្យសាឡាត់ខូច។ MAFF ណែនាំឱ្យលោកកសិករប្រើចំបើងគ្របគល់ ឬបន្ថែមសំណាញ់បាំងថ្ងៃ។"
            elif 18 <= t <= 24:
                reply = f"🌡️ **កម្រិតកម្ដៅ៖ ល្អណាស់ ({t}°C)**\n\nសីតុណ្ហភាពនេះគឺល្អបំផុតសម្រាប់សាឡាត់លូតលាស់យ៉ាងឆាប់រហ័ស។"
            else:
                reply = f"🌡️ **សីតុណ្ហភាពបច្ចុប្បន្ន៖ {t}°C**\n\nស្ថិតក្នុងកម្រិតមធ្យម មិនមានបញ្ហាចោទឡើយ។"
        else:
            reply = "🌡️ មិនទាន់មានទិន្នន័យសីតុណ្ហភាពនៅឡើយទេ។"
    
    elif any(w in msg for w in ["npk", "nitrogen", "phosphorus", "potassium", "fertilizer", "ជី", "អាសូត", "ប៉ូតាស្យូម"]):
        n = sensor_data.get('nitrogen', 'N/A')
        p = sensor_data.get('phosphorus', 'N/A')
        k = sensor_data.get('potassium', 'N/A')
        ec = sensor_data.get('ec', 'N/A')
        reply = f"🌱 **ស្ថានភាពជីក្នុងដី (ppm):**\n• Nitrogen (N): {n} (ស្តង់ដារ: ១៥០-២០០)\n• Phosphorus (P): {p} (ស្តង់ដារ: ៣០-៥០)\n• Potassium (K): {k} (ស្តង់ដារ: ១៥០-២៥០)\n• កម្រិតចម្លង EC: {ec} µS/cm"
    
    elif any(w in msg for w in ["ph", "acid", "alkaline", "ដី"]):
        ph = sensor_data.get('pH')
        if ph:
            status = "ល្អ (Neutral) ✅" if 6.0 <= ph <= 7.0 else ("ដីអាស៊ីត ⚠️" if ph < 6.0 else "ដីបាស ⚠️")
            reply = f"⚗️ **កម្រិត pH ដី៖ {ph}** ({status})\n\nតាមស្តង់ដារ CARDI កម្រិត pH ពី ៦.០ ដល់ ៧.០ គឺល្អបំផុតសម្រាប់សាឡាត់។"
        else:
            reply = "⚗️ មិនមានទិន្នន័យកម្រិត pH ដីនៅឡើយទេ។"
    
    elif any(w in msg for w in ["expense", "cost", "spend", "money", "ចំណាយ", "លុយ"]):
        total = sum(float(e.get('amount', 0)) for e in expenses)
        reply = f"💰 **ចំណាយសរុប៖ ${total:.2f}**\n\nសរុបលើការចំណាយទឹក ជី និងប្រតិបត្តិការផ្សេងៗ។"
    
    elif any(w in msg for w in ["status", "overview", "summary", "ស្ថានភាព", "សរុប"]):
        reply = f"""📊 **សេចក្ដីសរុបស្ថានភាពកសិដ្ឋាន៖**
• សំណើមដី៖ {sensor_data.get('moisture', 'N/A')}% (ល្អ ៦៥-៧៥%)
• សីតុណ្ហភាព៖ {sensor_data.get('temperature', 'N/A')}°C (ល្អ ១៨-២៤°C)
• កម្រិត pH ដី៖ {sensor_data.get('pH', 'N/A')} (ល្អ ៦.០-៧.០)
• សុខភាពដី៖ {sensor_data.get('soilHealth', 'មិនច្បាស់លាស់')}"""
    
    elif any(w in msg for w in ["hello", "hi", "hey", "help", "ជំរាបសួរ", "សួរ"]):
        reply = """👋 **ជំរាបសួរ លោកកសិករ! ខ្ញុំគឺ AgriSmart AI**
        
ខ្ញុំជាជំនួយការឌីជីថលដែលតាមដានដំណាំរបស់លោកអ្នកតាមស្តង់ដារ MAFF/CARDI។ ខ្ញុំអាចជួយលោកអ្នកបានដូចជា៖
• ពិនិត្យសុខភាពដី និងជី
• គ្រប់គ្រងការស្រោចទឹកសន្សំសំចៃ
• ផ្ដល់ដំបូន្មានពេលអាកាសធាតុក្តៅ
• តាមដានការចំណាយប្រចាំថ្ងៃ
        
តើលោកកសិករចង់ពិនិត្យមើលអ្វីដែរនៅថ្ងៃនេះ?"""
    
    else:
        reply = "🤖 ជំរាបសួរ! លោកកសិករអាចសួរខ្ញុំអំពី **សំណើម**, **សីតុណ្ហភាព**, **កម្រិតជី**, **កម្រិត pH** ឬ **ចំណាយ** ផ្សេងៗបាន។ តើខ្ញុំអាចជួយអ្វីបានដែរ?"
    
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