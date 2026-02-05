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
    if (now - lastReconnectAttempt > 5000) {
      lastReconnectAttempt = now;
      if (reconnect()) {
        lastReconnectAttempt = 0;
      }
    }
  } else {
    mqtt.loop();
  }

  // 2. Sensor Reading & Logic (Runs regardless of WiFi)
  if (millis() - lastPublish > 5000) {
    // A. Read All Sensors
    readSevenInOneSensor(); // Reads RS485
    updateLocalSensors();   // Reads Analog (Moisture, Rain, Bat)

    // B. Handle Data
    if (mqtt.connected()) {
      sendSensorData(); // Send to Cloud if connected
    } else {
      checkOfflineRules(); // ⚠️ SAFE MODE: Use local rules if disconnected
    }
    
    lastPublish = millis();
  }
}

// ============================================
// 6. SENSOR READING (RS485 MODBUS)
// ============================================
void readSevenInOneSensor() {
  Serial.println("\n📡 Reading 7-in-1 Sensor (10 Registers)...");
  
  uint8_t result = node.readHoldingRegisters(0x0000, 10);
  
  if (result == node.ku8MBSuccess) {
    // Print Raw Values to Serial for final verification
    for (int i = 0; i < 10; i++) {
        Serial.printf("  Reg[%d]: %d\n", i, node.getResponseBuffer(i));
    }

    // FINAL MAPPING BASED ON LIVE DASHBOARD FEEDBACK:
    val_moisture = node.getResponseBuffer(0) * 0.1; // Pro Moisture (usually Reg 0)
    val_temp     = node.getResponseBuffer(3) * 0.1; // Temp is confirmed at Reg 3
    val_ec       = node.getResponseBuffer(2);       // EC is confirmed at Reg 2
    val_ph       = node.getResponseBuffer(4) * 0.1; // pH is confirmed at Reg 4
    
    val_n        = node.getResponseBuffer(5); // Nitrogen
    val_p        = node.getResponseBuffer(6); // Phosphorus
    val_k        = node.getResponseBuffer(7); // Potassium (This was the 1160/2698 value)
  } else {
    Serial.print("⚠️ RS485 Read Failed! Error: ");
    Serial.println(result, HEX);
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

  // RULE A: EMERGENCY WATERING
  // If moisture < 40%, Turn ON. If > 55%, Turn OFF (Hysteresis)
  if (currentMoisture < 40) {
     digitalWrite(RELAY_1_PIN, LOW); // ON
     Serial.printf("  💦 Emergency Water ON (Moisture: %.1f%%)\n", currentMoisture);
  } 
  else if (currentMoisture > 55) {
     digitalWrite(RELAY_1_PIN, HIGH); // OFF
     Serial.printf("  ✅ Emergency Water OFF (Moisture: %.1f%%)\n", currentMoisture);
  }

  // RULE B: FERTILIZER CHECK
  // If EC < 800 and Moisture is DECENT (>40, to avoid burn), add nutrients
  if (val_ec > 0 && val_ec < 800 && currentMoisture > 40) {
     digitalWrite(RELAY_2_PIN, LOW); // ON
     Serial.printf("  🧪 Emergency Fertilizer ON (EC: %.1f)\n", val_ec);
  }
  else if (val_ec > 1200) {
     digitalWrite(RELAY_2_PIN, HIGH); // OFF
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