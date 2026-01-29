/*
 * 🚀 SMART AGRICULTURE 4.0 - LIGHT VERSION
 * Simplified for: ESP32 + Moisture + Rain + 2-Channel Relay
 */

#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

// ============================================
// 1. WIFI & CLOUD CONFIGURATION
// ============================================
const char* ssid = "Wise";           // Your WiFi Name
const char* password = "12345678";    // Your WiFi Password

// Change these to match your Railway Proxy exactly:
const char* mqtt_server = "ballast.proxy.rlwy.net"; 
const int   mqtt_port   = 28240; 
const char* device_id   = "SMARTAG-001"; // Must match your dashboard ID

// ============================================
// 2. PIN DEFINITIONS
// ============================================
#define MOISTURE_PIN 34   // Analog Pin for Soil Moisture
#define RAIN_PIN     35   // Analog Pin for Rain Sensor
#define RELAY_1_PIN  5    // Water Pump
#define RELAY_2_PIN  18   // Fertilizer / Second Pump

// Calibration (Adjust these if readings feel wrong)
#define MOISTURE_DRY 3500 // Value when sensor is in air
#define MOISTURE_WET 1500 // Value when sensor is in water
#define RAIN_DRY     4095 // No rain
#define RAIN_WET     1000 // Heavy rain

// Constants
WiFiClient espClient;
PubSubClient mqtt(espClient);
unsigned long lastPublish = 0;

void setup() {
  Serial.begin(115200);
  
  // Initialize Pins
  pinMode(RELAY_1_PIN, OUTPUT);
  pinMode(RELAY_2_PIN, OUTPUT);
  digitalWrite(RELAY_1_PIN, LOW); // Start with pumps OFF
  digitalWrite(RELAY_2_PIN, LOW);
  
  connectWiFi();
  mqtt.setServer(mqtt_server, mqtt_port);
  mqtt.setCallback(mqttCallback);
}

void loop() {
  if (!mqtt.connected()) connectMQTT();
  mqtt.loop();

  // Send data every 10 seconds
  if (millis() - lastPublish > 10000) {
    sendSensorData();
    lastPublish = millis();
  }
}

// ============================================
// 3. READ & SEND SENSOR DATA
// ============================================
void sendSensorData() {
  // Read Moisture
  int mRaw = analogRead(MOISTURE_PIN);
  float mPercent = map(mRaw, MOISTURE_DRY, MOISTURE_WET, 0, 100);
  mPercent = constrain(mPercent, 0, 100);

  // Read Rain
  int rRaw = analogRead(RAIN_PIN);
  float rPercent = map(rRaw, RAIN_DRY, RAIN_WET, 0, 100);
  rPercent = constrain(rPercent, 0, 100);

  // Prepare JSON
  StaticJsonDocument<256> doc;
  doc["deviceId"] = device_id;
  doc["moisture"] = mPercent;
  doc["rain"]     = rPercent;
  doc["status"]   = "Online";

  char buffer[256];
  serializeJson(doc, buffer);
  
  String topic = "smartag/" + String(device_id) + "/sensors";
  mqtt.publish(topic.c_str(), buffer);
  
  Serial.print("📡 Sent: Moisture: "); Serial.print(mPercent);
  Serial.print("% | Rain: "); Serial.print(rPercent); Serial.println("%");
}

// ============================================
// 4. RECEIVE PUMP COMMANDS FROM DASHBOARD
// ============================================
void mqttCallback(char* topic, byte* payload, unsigned int length) {
  Serial.print("📨 Command received on ["); Serial.print(topic); Serial.println("]");
  
  StaticJsonDocument<200> doc;
  deserializeJson(doc, payload, length);
  
  String type   = doc["type"] | "WATER"; 
  String status = doc["status"]; // "ON" or "OFF"
  
  if (type == "WATER") {
    digitalWrite(RELAY_1_PIN, (status == "ON" ? HIGH : LOW));
    Serial.println(status == "ON" ? "💧 Pump 1 ON" : "💧 Pump 1 OFF");
  } else if (type == "FERTILIZER") {
    digitalWrite(RELAY_2_PIN, (status == "ON" ? HIGH : LOW));
    Serial.println(status == "ON" ? "🧪 Pump 2 ON" : "🧪 Pump 2 OFF");
  }
}

// ============================================
// 5. HELPER FUNCTIONS
// ============================================
void connectWiFi() {
  Serial.print("Connecting to WiFi: "); Serial.println(ssid);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500); Serial.print(".");
  }
  Serial.println("\n✅ WiFi Connected!");
}

void connectMQTT() {
  while (!mqtt.connected()) {
    Serial.print("Attempting MQTT connection...");
    if (mqtt.connect(device_id)) {
      Serial.println("✅ Connected");
      // Subscribe to pump commands
      String subTopic = "smartag/" + String(device_id) + "/pump/command";
      mqtt.subscribe(subTopic.c_str());
    } else {
      Serial.print("failed, rc="); Serial.print(mqtt.state());
      Serial.println(" retrying in 5 seconds...");
      delay(5000);
    }
  }
}