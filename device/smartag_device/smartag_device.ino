/*
 * 🚀 SMART AGRICULTURE 4.0 - PREMIUM VERSION
 * Supports: ESP32 + 7-in-1 Sensor (RS485) + Analog Moisture + Rain + 2-Channel Relay
 */

#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <ModbusMaster.h> // Ensure this is installed via Library Manager

// ============================================
// 1. WIFI & CLOUD CONFIGURATION
// ============================================
const char* ssid = "Wise";           // Your WiFi Name
const char* password = "12345678";       // Your WiFi Password

// Change these to match your Railway Proxy exactly:
const char* mqtt_server = "ballast.proxy.rlwy.net"; 
const int   mqtt_port   = 28240; 
const char* device_id   = "SMARTAG-001"; // Must match your dashboard ID

// ============================================
// 2. PIN DEFINITIONS
// ============================================
#define MAX485_RX_PIN  16   // RX2 (Connect to TXD on module)
#define MAX485_TX_PIN  17   // TX2 (Connect to RXD on module)

// Analog Sensors
#define MOISTURE_PIN   34   // Analog Soil Moisture
#define RAIN_PIN       32   // Analog Rain Sensor (Updated to 32)
#define BATTERY_PIN    33   // Battery Voltage Monitor (Moved to 33)

// Actuators
#define RELAY_1_PIN    25   // Water Pump (Yellow Wire)
#define RELAY_2_PIN    26   // Fertilizer / Second Pump (Green Wire)

// Calibration Constants
#define MOISTURE_DRY   3500 // Dry Value
#define MOISTURE_WET   1500 // Wet Value
#define RAIN_DRY       4095 
#define RAIN_WET       1000

// ============================================
// 3. OBJECTS & VARIABLES
// ============================================
WiFiClient espClient;
PubSubClient mqtt(espClient);
ModbusMaster node; // Modbus Object

unsigned long lastPublish = 0;

// Sensor Data Containers
float val_moisture = 0;
float val_temp = 0;
float val_ec = 0;
float val_ph = 0;
float val_n = 0;
float val_p = 0;
float val_k = 0;

// Global Analog Data (Shared for Offline Logic)
float currentMoisture = 0;
float currentRain = 0;
float currentBattery = 0;

// Reconnection Timer
unsigned long lastReconnectAttempt = 0;

// No flow control needed for Auto-Direction MAX485 modules

// ============================================
// 4. SETUP
// ============================================
void setup() {
  Serial.begin(115200);
  
  // Initialize Serial2 for RS485 Communication
  Serial2.begin(9600, SERIAL_8N1, MAX485_RX_PIN, MAX485_TX_PIN);
  
  // Initialize Modbus
  node.begin(1, Serial2); // Address 1 is default

  // Initialize Relay Pins (Default to OFF/HIGH for Active Low)
  pinMode(RELAY_1_PIN, OUTPUT);
  pinMode(RELAY_2_PIN, OUTPUT);
  digitalWrite(RELAY_1_PIN, HIGH);
  digitalWrite(RELAY_2_PIN, HIGH);
  
  connectWiFi();
  mqtt.setServer(mqtt_server, mqtt_port);
  mqtt.setCallback(mqttCallback);
}

// ============================================
// 5. MAIN LOOP
// ============================================
// ============================================
// 5. MAIN LOOP (NON-BLOCKING)
// ============================================
void loop() {
  // 1. Connectivity Management (Non-Blocking)
  if (!mqtt.connected()) {
    unsigned long now = millis();
    if (now - lastReconnectAttempt > 30000) {
      lastReconnectAttempt = now;
      if (reconnect()) {
        lastReconnectAttempt = 0;
      }
    }
  } else {
    mqtt.loop();
  }

  // 2. Sensor Reading & Logic (Runs regardless of WiFi)
  if (millis() - lastPublish > 30000) {
    // A. Read All Sensors
    readSevenInOneSensor(); // Reads RS485
    updateLocalSensors();   // Reads Analog (Moisture, Rain, Bat)

    // B. Handle Data
    if (mqtt.connected()) {
      sendSensorData(); // Send to Cloud if connected
      
      // 🌧️ EMERGENCY RAIN KILL-SWITCH (Safety Override)
      // If sensor detects rain (>20%), force BOTH pumps OFF even if cloud said ON
      if (currentRain > 20) {
        digitalWrite(RELAY_1_PIN, HIGH); // Force Water OFF
        digitalWrite(RELAY_2_PIN, HIGH); // Force Fertilizer OFF
        Serial.println("🌧️ [SAFETY] Rain detected! Emergency shutdown for ALL pumps (Water + Fert).");
      }
    } else {
      checkOfflineRules(); // ⚠️ SAFE MODE: Use local rules if disconnected
    }
    
    lastPublish = millis();
  }
}

// ============================================
// CAMBODIA BASED STATUS FUNCTIONS
// ============================================

// ---- pH Status (General for Cambodia farming) ----
String getPHStatus(float ph) {
  if (ph < 5.5) return "ACIDIC (LOW)";
  if (ph <= 7.0) return "OPTIMAL";
  if (ph <= 8.0) return "ALKALINE (HIGH)";
  return "VERY HIGH";
}

// ---- Nitrogen Status (Cambodia guideline) ----
String getNStatus(float n) {
  if (n < 40) return "VERY LOW";
  if (n < 90) return "LOW";
  if (n < 150) return "OPTIMAL";
  if (n < 220) return "HIGH";
  return "EXCESS";
}

// ---- Phosphorus Status (Cambodia guideline) ----
String getPStatus(float p) {
  if (p < 15) return "VERY LOW";
  if (p < 35) return "LOW";
  if (p < 70) return "OPTIMAL";
  if (p < 120) return "HIGH";
  return "EXCESS";
}

// ---- Potassium Status (Cambodia guideline) ----
String getKStatus(float k) {
  if (k < 80) return "VERY LOW";
  if (k < 150) return "LOW";
  if (k < 280) return "OPTIMAL";
  if (k < 400) return "HIGH";
  return "EXCESS";
}

// ---- EC Status (Prototype guideline) ----
String getECStatus(float ec) {
  if (ec < 400) return "LOW (Need Fertilizer)";
  if (ec < 1200) return "OPTIMAL";
  if (ec < 2000) return "HIGH";
  return "EXCESS (Too Salty)";
}

// ============================================
// FIXED READ FUNCTION FOR JXBS-3001
// ============================================

void readSevenInOneSensor() {
  Serial.println("\n=======================================");
  Serial.println("📡 Reading JXBS-3001 7-in-1 Soil Sensor");
  Serial.println("=======================================");

  // ------------------------------
  // BLOCK 1: Moisture, Temp, EC, pH
  // Register start: 0x0000
  // ------------------------------
  uint8_t result1 = node.readHoldingRegisters(0x0000, 5);

  if (result1 == node.ku8MBSuccess) {

    float raw_moist = node.getResponseBuffer(0);
    float raw_temp  = node.getResponseBuffer(3); // Log confirmed: 268 = 26.8°C
    float raw_ec    = node.getResponseBuffer(2); // Log confirmed: 655
    float raw_ph    = node.getResponseBuffer(4); // pH usually at Reg 4

    // Convert values
    val_temp = raw_temp * 0.1;            
    val_ec   = raw_ec;                    
    val_ph   = raw_ph * 0.1;              

    Serial.printf("💧 Soil Moisture: %.1f %% (Analog)\n", currentMoisture);
    Serial.printf("🌡 Temperature  : %.1f °C\n", val_temp);
    Serial.printf("⚡️ EC           : %.0f us/cm  [%s]\n", val_ec, getECStatus(val_ec).c_str());
    Serial.printf("🧪 pH           : %.1f       [%s]\n", val_ph, getPHStatus(val_ph).c_str());

  } else {
    Serial.print("⚠️ ERROR reading block 0x0000. Code: ");
    Serial.println(result1, HEX);
    return;
  }

  delay(250); // IMPORTANT delay for stable sensor response

  // ------------------------------
  // BLOCK 2: NPK
  // Register start: 30 (0x001E)
  // ------------------------------
  uint8_t result2 = node.readHoldingRegisters(30, 3);

  if (result2 == node.ku8MBSuccess) {

    val_n = node.getResponseBuffer(0); // ppm
    val_p = node.getResponseBuffer(1); // ppm
    val_k = node.getResponseBuffer(2); // ppm

    Serial.println("---------------------------------------");
    Serial.printf("🌱 Nitrogen (N) : %.0f ppm  [%s]\n", val_n, getNStatus(val_n).c_str());
    Serial.printf("🌱 Phosphorus(P): %.0f ppm  [%s]\n", val_p, getPStatus(val_p).c_str());
    Serial.printf("🌱 Potassium (K): %.0f ppm  [%s]\n", val_k, getKStatus(val_k).c_str());
    Serial.println("=======================================\n");

  } else {
    Serial.print("⚠️ ERROR reading NPK block (0x001E). Code: ");
    Serial.println(result2, HEX);
  }
}


// ============================================
// 7. PUBLISH TO MQTT
// ============================================
// ============================================
// 7. READ & PUBLISH
// ============================================
void updateLocalSensors() {
  // 1. Read Analog Soil Moisture
  int mRaw = analogRead(MOISTURE_PIN);
  float mPercentAnalog = map(mRaw, MOISTURE_DRY, MOISTURE_WET, 0, 100);
  currentMoisture = constrain(mPercentAnalog, 0, 100);

  // 2. Read Rain (Analog)
  int rRaw = analogRead(RAIN_PIN);
  float rPercent = map(rRaw, RAIN_DRY, RAIN_WET, 0, 100);
  currentRain = constrain(rPercent, 0, 100);

  // 3. Read Battery
  int bRaw = analogRead(BATTERY_PIN);
  float voltage = bRaw * (3.3 / 4095.0) * 3.91; 
  // Simple map for percent
  currentBattery = 67.0; // Force 67% for testing
  // currentBattery = map(voltage * 10, 105, 126, 0, 100);
  // currentBattery = constrain(currentBattery, 0, 100);
}

void sendSensorData() {
  // Prepare JSON
  StaticJsonDocument<512> doc;
  doc["deviceId"] = device_id;
  
  // Use Global Values
  doc["voltage"]     = 12.8; // Approx
  doc["battery"]     = currentBattery;
  doc["moisture"]    = currentMoisture; 
  doc["temp"]        = val_temp;
  doc["pH"]          = val_ph;
  doc["ec"]          = val_ec;
  doc["rain"]        = currentRain;
  doc["nitrogen"]    = val_n;
  doc["phosphorus"]  = val_p;
  doc["potassium"]   = val_k;
  doc["status"]      = "Online";

  char buffer[512];
  serializeJson(doc, buffer);
  String topic = "smartag/" + String(device_id) + "/sensors";
  mqtt.publish(topic.c_str(), buffer);
  
  Serial.println("📤 MQTT Sent: " + String(buffer));
}

// ⚠️ OFFLINE PREVENTION LOGIC
void checkOfflineRules() {
  Serial.println("🌐 [OFFLINE MODE] Checking Local Rules...");

  // 1. WATER PUMP (Demonstration Mode: Can run with Fert)
  if (currentMoisture < 40) {
     digitalWrite(RELAY_1_PIN, LOW); // ON
     Serial.printf("  💦 Water Pump ON (Moisture: %.1f%%)\n", currentMoisture);
  } 
  else if (currentMoisture > 55) {
     digitalWrite(RELAY_1_PIN, HIGH); // OFF
     Serial.printf("  ✅ Soil wet (%.1f%%). Water OFF.\n", currentMoisture);
  }

  // 2. FERTILIZER PUMP (Demonstration Mode: Can run with Water)
  if (val_ec > 0 && val_ec < 800 && currentMoisture > 40) {
     digitalWrite(RELAY_2_PIN, LOW); // ON
     Serial.printf("  🧪 Fertilizer Pump ON (EC: %.1f)\n", val_ec);
  }
  else if (val_ec > 1200) {
     digitalWrite(RELAY_2_PIN, HIGH); // OFF
     Serial.println("  ✅ Nutrients balanced. Fertilizer OFF.");
  }
}

// ============================================
// 8. RECEIVE PUMP COMMANDS
// ============================================
// ============================================
// 8. RECEIVE PUMP COMMANDS
// ============================================
void mqttCallback(char* topic, byte* payload, unsigned int length) {
  Serial.printf("\n📨 MQTT Message Received [%s]\n", topic);
  
  char message[length + 1];
  for (int i = 0; i < length; i++) message[i] = (char)payload[i];
  message[length] = '\0';
  Serial.println("  Payload: " + String(message));

  StaticJsonDocument<256> doc;
  DeserializationError error = deserializeJson(doc, payload, length);
  
  if (error) {
    Serial.print("  JSON Parse Error: "); Serial.println(error.c_str());
    return;
  }

  String type   = doc["type"] | "WATER"; 
  String status = doc["status"] | "OFF"; 
  
  // NOTE: Most blue relay modules are "Active Low" 
  // (LOW = Relay ON, HIGH = Relay OFF)
  bool turnOn = (status == "ON");
  
  if (type == "WATER") {
    digitalWrite(RELAY_1_PIN, turnOn ? LOW : HIGH); // Active Low Logic
    Serial.printf("  💦 [ACTION] Water Pump PIN %d -> %s (Logic: %s)\n", RELAY_1_PIN, turnOn ? "ON" : "OFF", turnOn ? "LOW" : "HIGH");
    
    // Publish feedback to server
    String feedbackTopic = "smartag/" + String(device_id) + "/pump/status";
    String feedbackPayload = "{\"type\":\"WATER\",\"status\":\"" + status + "\",\"triggeredBy\":\"AI_SYSTEM\"}";
    mqtt.publish(feedbackTopic.c_str(), feedbackPayload.c_str());
  } 
  else if (type == "FERTILIZER") {
    digitalWrite(RELAY_2_PIN, turnOn ? LOW : HIGH); // Active Low Logic
    Serial.printf("  🧪 [ACTION] Fertilizer Pump PIN %d -> %s (Logic: %s)\n", RELAY_2_PIN, turnOn ? "ON" : "OFF", turnOn ? "LOW" : "HIGH");

    // Publish feedback to server
    String feedbackTopic = "smartag/" + String(device_id) + "/pump/status";
    String feedbackPayload = "{\"type\":\"FERTILIZER\",\"status\":\"" + status + "\",\"triggeredBy\":\"AI_SYSTEM\"}";
    mqtt.publish(feedbackTopic.c_str(), feedbackPayload.c_str());
  }
}

// ============================================
// 9. HELPER FUNCTIONS
// ============================================
// ============================================
// 9. HELPER FUNCTIONS
// ============================================
void connectWiFi() {
  Serial.print("Connecting to WiFi: "); Serial.println(ssid);
  WiFi.begin(ssid, password);
  // Changed to non-blocking or just simple attempt in setup
  int retries = 0;
  while (WiFi.status() != WL_CONNECTED && retries < 10) {
    delay(500); Serial.print(".");
    retries++;
  }
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ WiFi Connected!");
  } else {
    Serial.println("\n❌ WiFi Failed (Continuing in Offline Mode)");
  }
}

boolean reconnect() {
  if (WiFi.status() != WL_CONNECTED) {
    WiFi.begin(ssid, password);
    // Don't wait too long here to avoid blocking sensor loop
    return false;
  }

  Serial.print("Attempting MQTT connection...");
  if (mqtt.connect(device_id)) {
    Serial.println("✅ Connected");
    String subTopic = "smartag/" + String(device_id) + "/pump/command";
    mqtt.subscribe(subTopic.c_str());
    return true;
  } else {
    Serial.print("failed, rc="); Serial.print(mqtt.state());
    Serial.println(" try again later");
    return false;
  }
}