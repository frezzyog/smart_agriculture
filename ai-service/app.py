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
    "gemini-2.5-flash",
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
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{url}?key={GEMINI_API_KEY}",
                    json={
                        "contents": [{"parts": [{"text": prompt}]}],
                        "generationConfig": {
                            "temperature": 0.7,
                            "maxOutputTokens": 2048,
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
        action = None
        
        # ============================================
        # MOISTURE THRESHOLDS WITH WEATHER INTELLIGENCE
        # ============================================
        moisture = sensor_data.get('moisture', 100)
        rain_detected = sensor_data.get('rain', 0) > 20  # Current rain from sensor
        
        # Check if we should skip irrigation due to rain forecast OR current rain
        skip_irrigation_due_to_rain = tomorrow_rain_probability > 50 or rain_detected
        
        if moisture < 45 or stress_level > 80:
            # Critical situation - needs immediate action
            if skip_irrigation_due_to_rain:
                # Rain detected or expected - add info alert instead of triggering pump
                reason = "កំពុងមានភ្លៀងធ្លាក់" if rain_detected else f"មានលទ្ធភាពភ្លៀង {tomorrow_rain_probability}%"
                alerts.append({
                    "severity": "INFO",
                    "type": "WEATHER_ALERT",
                    "title": "🌧️ ការពន្យារពេលដោយសារអាកាសធាតុ",
                    "message": f"សំណើមដី {moisture}% ប៉ុន្តែ {reason}។ AI បានបិទ/ពន្យារពេលស្រោចស្រពដើម្បីការពារការលើសទឹក។"
                })
                recommend_action = False
                # If it was already pumping, send STOP command
                action = {"type": "irrigation", "deviceId": device_id, "command": {"type": "WATER", "status": "OFF", "duration": 0, "reason": "RAIN_DETECTED"}}
            else:
                # No rain expected - trigger irrigation
                alerts.append({
                    "severity": "CRITICAL",
                    "type": "MOISTURE_CRITICAL" if moisture < 45 else "STRESS_CRITICAL",
                    "title": "រុក្ខជាតិមានបញ្ហាខ្លាំង" if stress_level > 80 else "កម្រិតសំណើមដីទាបខ្លាំង",
                    "message": f"រកឃើញបញ្ហាខ្លាំងកម្រិត {stress_level}%" if stress_level > 80 else f"សំណើមដីធ្លាក់ចុះទាបខ្លាំងត្រឹម {moisture}%"
                })
                recommend_action = True
                action = {"type": "irrigation", "deviceId": device_id, "command": {"type": "WATER", "status": "ON", "duration": 420}}
                
        elif moisture < 50:
            if skip_irrigation_due_to_rain:
                alerts.append({
                    "severity": "INFO",
                    "type": "WEATHER_ALERT",
                    "title": "🌦️ ពន្យារពេលស្រោចស្រព - មានការព្យាករណ៍ភ្លៀង",
                    "message": f"សំណើមដីគឺ {moisture}%។ ការស្រោចស្រពត្រូវបានពន្យារពេលដោយសារមានលទ្ធភាពភ្លៀង {tomorrow_rain_probability}% នៅថ្ងៃស្អែក។"
                })
            else:
                alerts.append({
                    "severity": "WARNING",
                    "type": "MOISTURE_LOW",
                    "title": "គ្រោះថ្នាក់៖ សំណើមដីទាប",
                    "message": f"សំណើមដីបានធ្លាក់ចុះមកត្រឹម {moisture}%។ គួរស្រោចស្រពមុនពេលវាធ្លាក់ដល់ ៤៥%។"
                })
        
        # Add weather info to alerts if rain is expected
        if tomorrow_rain_probability > 30:
            alerts.append({
                "severity": "INFO",
                "type": "WEATHER_INFO",
                "title": f"🌧️ ការព្យាករណ៍ភ្លៀង៖ {tomorrow_rain_probability}%",
                "message": f"រំពឹងថានឹងមានការស្រោចស្រពតាមធម្មជាតិនៅថ្ងៃស្អែក។ AI នឹងបង្កើនប្រសិទ្ធភាពការប្រើប្រាស់ទឹក។"
            })
        
        # ============================================
        # NUTRIENT THRESHOLDS
        # ============================================
        # Only recommend fertilizer if moisture is sufficient (to avoid fertilizer burn)
        can_fertilize = moisture >= 50 and not recommend_action
        
        if sensor_data.get('nitrogen', 200) < 130:
            alerts.append({
                "severity": "WARNING",
                "type": "NPK_LOW",
                "title": "កម្រិតអាសូតទាប",
                "message": f"អាសូតគឺ {sensor_data.get('nitrogen', 0)} ppm។ កម្រិតស្តង់ដារគឺ ១៥០-២ ۲۰۰ ppm។"
            })
        
        # pH THRESHOLDS: 6.0 - 7.0
        if sensor_data.get('pH'):
            if sensor_data['pH'] < 5.8 or sensor_data['pH'] > 7.2:
                alerts.append({
                    "severity": "WARNING",
                    "type": "PH_WARNING",
                    "title": "ការព្រមានអំពី pH ដី",
                    "message": f"pH ដីគឺ {sensor_data['pH']}។ ស្ពៃក្តោបត្រូវការ pH ៦.០-៧.០ ដើម្បីជៀសវាងការស្ទះសារធាតុចិញ្ចឹម។"
                })
        
        # EC THRESHOLDS: 1.2 - 1.6 dS/m (1200-1600 µS/cm)
        if sensor_data.get('ec'):
            if sensor_data['ec'] < 1000:
                if can_fertilize:
                    # Check for current rain OR heavy rain forecast
                    if rain_detected:
                        alerts.append({
                            "severity": "INFO",
                            "type": "WEATHER_ALERT",
                            "title": "ពន្យារពេលដាក់ជី - កំពុងមានភ្លៀង",
                            "message": f"កម្រិត EC ទាប ({sensor_data['ec']}) ប៉ុន្តែ AI បានបិទការដាក់ជីដោយសាររកឃើញភ្លៀងធ្លាក់ ដើម្បីការពារការលាងជម្រះសារធាតុចិញ្ចឹម។"
                        })
                        # Send STOP command if it was active
                        action = {"type": "fertilizer", "deviceId": device_id, "command": {"type": "FERTILIZER", "status": "OFF", "duration": 0}}
                        recommend_action = False
                    elif tomorrow_rain_probability >= 70:
                        alerts.append({
                            "severity": "INFO",
                            "type": "WEATHER_ALERT",
                            "title": "ពន្យារពេលដាក់ជី - រំពឹងថាមានភ្លៀងខ្លាំង",
                            "message": f"EC ទាបត្រឹម {sensor_data['ec']} µS/cm ប៉ុន្តែភ្លៀងខ្លាំង ({tomorrow_rain_probability}%) នឹងលាងជម្រះសារធាតុចិញ្ចឹមអស់។"
                        })
                    else:
                        alerts.append({
                            "severity": "WARNING",
                            "type": "NPK_LOW",
                            "title": "កម្រិតសារធាតុចិញ្ចឹមទាប (EC)",
                            "message": f"EC គឺ {sensor_data['ec']} µS/cm។ គោលដៅគឺ ១២០០-១៦០០។ ណែនាំឱ្យដាក់ជី។"
                        })
                        recommend_action = True
                        action = {"type": "fertilizer", "deviceId": device_id, "command": {"type": "FERTILIZER", "status": "ON", "duration": 180}}
                else:
                    # If dry, add warning alert but don't trigger pump (water takes priority)
                    alerts.append({
                        "severity": "INFO",
                        "type": "NPK_LOW",
                        "title": "កម្រិតសារធាតុចិញ្ចឹមទាប (EC)",
                        "message": f"EC ទាបត្រឹម {sensor_data['ec']} µS/cm។ ប៉ុន្តែត្រូវស្រោចទឹកជាមុនសិនដើម្បីជៀសវាងការខូចឫស។"
                    })
            elif sensor_data['ec'] > 2000:
                 alerts.append({
                    "severity": "CRITICAL",
                    "type": "PH_WARNING",
                    "title": "កម្រិតជាតិប្រៃក្នុងដីខ្ពស់",
                    "message": f"EC គឺ {sensor_data['ec']} µS/cm។ កម្រិតជាតិអំបិលខ្ពស់! ត្រូវលាងសម្អាតដោយទឹកស្អាត។"
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
- Reference specific Cambodian standards if relevant (MAFF, Seed Co, CARDI)
- Suggest strategies like Rice Straw Mulch for heat or Husk Ash for pH
- Be professional and bulleted.
- RESPOND IN KHMER LANGUAGE IF THE QUESTION IS IN KHMER OR IF IT'S ABOUT CAMBODIAN FARMING.
- Use polite Khmer terms (e.g., លោកកសិករ).

FARMER'S QUESTION: {message}

YOUR RESPONSE:"""


def rule_based_chat(message: str, sensor_data: dict, expenses: list) -> dict:
    """Fallback rule-based responses using new standards"""
    msg = message.lower()
    reply = ""
    
    if any(w in msg for w in ["moisture", "water", "irrigation", "dry", "wet"]):
        m = sensor_data.get('moisture')
        if m is not None:
            if m < 50:
                reply = f"🔴 **Soil Moisture CRITICAL: {m}%**\n\nStandard is 65-75%. Irrigation triggered automatically to prevent wilt."
            elif m > 80:
                reply = f"🔵 **Soil Moisture HIGH: {m}%**\n\nReduce water. Excessive wetness leads to root rot in lettuce."
            else:
                reply = f"🟢 **Soil Moisture OK: {m}%**\n\nYour soil is within the optimal Seed Co/MAFF range (60-80%)."
        else:
            reply = "💧 No moisture data available. Please check sensor connection."
    
    elif any(w in msg for w in ["temperature", "temp", "hot", "cold"]):
        t = sensor_data.get('temperature')
        if t:
            if t > 27:
                reply = f"🔥 **Temperature Danger: {t}°C**\n\nHeat danger detected (>27°C). MAFF recommends using Rice Straw Mulch to cool the roots."
            elif 18 <= t <= 24:
                reply = f"🌡️ **Temperature Optimal: {t}°C**\n\nPerfect range for lettuce growth (18-24°C)."
            else:
                reply = f"🌡️ **Temperature: {t}°C**\n\nSlightly outside optimal (18-24°C)."
        else:
            reply = "🌡️ No temperature data available."
    
    elif any(w in msg for w in ["npk", "nitrogen", "phosphorus", "potassium", "fertilizer"]):
        n = sensor_data.get('nitrogen', 'N/A')
        p = sensor_data.get('phosphorus', 'N/A')
        k = sensor_data.get('potassium', 'N/A')
        ec = sensor_data.get('ec', 'N/A')
        reply = f"🌱 **Nutrient Status (ppm):**\n• N: {n} (Target: 150-200)\n• P: {p} (Target: 30-50)\n• K: {k} (Target: 150-250)\n• EC: {ec} µS/cm (Target: 1200-1600)"
    
    elif any(w in msg for w in ["ph", "acid", "alkaline"]):
        ph = sensor_data.get('pH')
        if ph:
            status = "optimal ✅" if 6.0 <= ph <= 7.0 else ("too acidic ⚠️" if ph < 6.0 else "too alkaline ⚠️")
            reply = f"⚗️ **Soil pH: {ph}** ({status})\n\nCARDI standard for lettuce: 6.0-7.0."
        else:
            reply = "⚗️ No pH data available."
    
    elif any(w in msg for w in ["expense", "cost", "spend", "money"]):
        total = sum(float(e.get('amount', 0)) for e in expenses)
        reply = f"💰 **Total Expenses: ${total:.2f}**"
    
    elif any(w in msg for w in ["status", "overview", "summary"]):
        reply = f"""📊 **Farm Status Overview:**
• Moisture: {sensor_data.get('moisture', 'N/A')}% (Ideal 65-75%)
• Soil Temp: {sensor_data.get('temperature', 'N/A')}°C (Ideal 18-24°C)
• Soil pH: {sensor_data.get('pH', 'N/A')} (Ideal 6.0-7.0)
• Health: {sensor_data.get('soilHealth', 'Unknown')}"""
    
    elif any(w in msg for w in ["hello", "hi", "hey", "help"]):
        reply = """👋 **Hello! I'm your Cambodian AgriSmart AI**
        
I monitor your crops using MAFF/CARDI standards. I can help with:
• Soil health & nutrition
• Irrigation automation
• Heat stress management
• Expense tracking
        
What would you like to check today?"""
    
    else:
        reply = "🤖 I can analyze your **moisture**, **temperature**, **NPK**, **pH**, or **expenses** based on Cambodian standards. What can I help with?"
    
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