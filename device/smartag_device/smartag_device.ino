/*
 * Smart Agriculture IoT Device Code
 * Compatible with: ESP32, ESP8266, Arduino with WiFi/Ethernet Shield
 * 
 * This code connects your IoT device to the Smart Agriculture backend
 * and sends sensor data via MQTT
 */

#include <WiFi.h>           // For ESP32 (use ESP8266WiFi.h for ESP8266)
#include <PubSubClient.h>   // MQTT library
#include <ArduinoJson.h>    // JSON serialization
#include <ModbusMaster.h>    // For 7-in-1 NPK/pH/EC sensor

// ============================================
// CONFIGURATION - Update these values
// ============================================

// WiFi credentials
const char* ssid = "NUM2 STUDENT";
const char* password = "student@2024";

// MQTT Broker (your backend server)
const char* mqtt_server = "10.10.12.218";  
const int mqtt_port = 1883;

// Device Configuration
const char* device_id = "DEVICE_001";  

// MQTT Topics
String topic_sensors = "smartag/" + String(device_id) + "/sensors";
String topic_pump_command = "smartag/" + String(device_id) + "/pump/command";
String topic_pump_status = "smartag/" + String(device_id) + "/pump/status";

// ============================================
// HARDWARE PIN CONFIGURATION
// ============================================

// 7-in-1 Sensor (RS485 Modbus)
#define RS485_RX 16
#define RS485_TX 17
#define RS485_DE 4      // Direction Enable

// Analog Sensors
#define MOISTURE_PIN 34  // Capacitive Soil Moisture
#define RAIN_PIN 35      // YL-83 Rain Sensor

// Dual Pump/Relay Control
#define WATER_PUMP_PIN 5
#define FERTILIZER_PUMP_PIN 18

// ============================================
// CALIBRATION & OBJECTS
// ============================================

#define MOISTURE_WET 1800   
#define MOISTURE_DRY 3500   
#define RAIN_WET 500        
#define RAIN_DRY 4095       

WiFiClient espClient;
PubSubClient mqtt(espClient);
ModbusMaster sensor;

// ============================================
// GLOBAL VARIABLES
// ============================================

unsigned long lastSensorRead = 0;
const unsigned long sensorInterval = 10000;  

bool waterPumpStatus = false;
bool fertilizerPumpStatus = false;

// ============================================
// SETUP
// ============================================

void setup() {
  Serial.begin(115200);
  
  // Initialize Modbus (Serial2)
  Serial2.begin(9600, SERIAL_8N1, RS485_RX, RS485_TX);
  sensor.begin(1, Serial2);
  pinMode(RS485_DE, OUTPUT);
  digitalWrite(RS485_DE, LOW);
  
  // Initialize pump pins
  pinMode(WATER_PUMP_PIN, OUTPUT);
  pinMode(FERTILIZER_PUMP_PIN, OUTPUT);
  digitalWrite(WATER_PUMP_PIN, LOW);
  digitalWrite(FERTILIZER_PUMP_PIN, LOW);
  
  connectWiFi();
  mqtt.setServer(mqtt_server, mqtt_port);
  mqtt.setCallback(mqttCallback);
  connectMQTT();
  
  Serial.println("\n✅ Smart Agriculture System Online!");
}

void loop() {
  if (!mqtt.connected()) connectMQTT();
  mqtt.loop();
  
  unsigned long currentMillis = millis();
  if (currentMillis - lastSensorRead >= sensorInterval) {
    lastSensorRead = currentMillis;
    readAndSendSensorData();
  }
}

// ============================================
// RS485 MODBUS READING
// ============================================

void preTransmission() { digitalWrite(RS485_DE, HIGH); }
void postTransmission() { digitalWrite(RS485_DE, LOW); }

void readAndSendSensorData() {
  Serial.println("\n--- Reading External Sensors ---");
  
  // 1. Read Analog Sensors
  int moistureRaw = analogRead(MOISTURE_PIN);
  float moisture = constrain(map(moistureRaw, MOISTURE_WET, MOISTURE_DRY, 100, 0), 0, 100);
  
  int rainRaw = analogRead(RAIN_PIN);
  float rainLevel = constrain(map(rainRaw, RAIN_WET, RAIN_DRY, 100, 0), 0, 100);

  // 2. Read 7-in-1 Modbus Sensor
  float humidity = 0, temperature = 0, ec = 0, ph = 0, nitrogen = 0, phosphorus = 0, potassium = 0;
  
  sensor.preTransmission(preTransmission);
  sensor.postTransmission(postTransmission);
  
  // Read 7 registers starting from 0x0000
  uint8_t result = sensor.readHoldingRegisters(0x0000, 7);
  
  if (result == sensor.ku8MBSuccess) {
    humidity = sensor.getResponseBuffer(0) / 10.0;
    temperature = sensor.getResponseBuffer(1) / 10.0;
    ec = sensor.getResponseBuffer(2);
    ph = sensor.getResponseBuffer(3) / 10.0;
    nitrogen = sensor.getResponseBuffer(4);
    phosphorus = sensor.getResponseBuffer(5);
    potassium = sensor.getResponseBuffer(6);
    
    Serial.println("Modbus Data: Temp=" + String(temperature) + "C, pH=" + String(ph) + ", EC=" + String(ec));
    Serial.println("NPK: " + String(nitrogen) + "/" + String(phosphorus) + "/" + String(potassium));
  } else {
    Serial.println("❌ Modbus Read Failed: " + String(result, HEX));
  }
  
  // 3. Create JSON payload
  StaticJsonDocument<512> doc;
  doc["deviceId"] = device_id;
  doc["moisture"] = moisture;
  doc["rain"] = rainLevel;
  doc["humidity"] = humidity;
  doc["temperature"] = temperature;
  doc["ec"] = ec;
  doc["pH"] = ph;
  doc["nitrogen"] = nitrogen;
  doc["phosphorus"] = phosphorus;
  doc["potassium"] = potassium;
  doc["waterPump"] = waterPumpStatus ? "ON" : "OFF";
  doc["fertilizerPump"] = fertilizerPumpStatus ? "ON" : "OFF";
  
  char payload[512];
  serializeJson(doc, payload);
  mqtt.publish(topic_sensors.c_str(), payload);
  Serial.println("📡 Data published");
}

// ============================================
// MQTT & PUMP CONTROL
// ============================================

void connectWiFi() {
  Serial.print("Connecting to WiFi...");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) { delay(500); Serial.print("."); }
  Serial.println("\n✅ WiFi Connected: " + WiFi.localIP().toString());
}

void connectMQTT() {
  while (!mqtt.connected()) {
    if (mqtt.connect(device_id)) {
      mqtt.subscribe(topic_pump_command.c_str());
      Serial.println("✅ MQTT Connected & Subscribed");
    } else {
      delay(5000);
    }
  }
}

void mqttCallback(char* topic, byte* payload, unsigned int length) {
  StaticJsonDocument<200> doc;
  deserializeJson(doc, payload, length);
  
  String type = doc["type"] | "WATER"; // WATER or FERTILIZER
  String status = doc["status"];
  int duration = doc["duration"] | 0;
  
  if (type == "WATER") {
    controlPump(WATER_PUMP_PIN, status == "ON", duration, "Water");
    waterPumpStatus = (status == "ON");
  } else if (type == "FERTILIZER") {
    controlPump(FERTILIZER_PUMP_PIN, status == "ON", duration, "Fertilizer");
    fertilizerPumpStatus = (status == "ON");
  }
}

void controlPump(int pin, bool turnOn, int duration, String label) {
  digitalWrite(pin, turnOn ? HIGH : LOW);
  Serial.println("💧 " + label + " Pump: " + (turnOn ? "ON" : "OFF"));
  
  // Publish status back
  StaticJsonDocument<200> statusDoc;
  statusDoc["deviceId"] = device_id;
  statusDoc["type"] = label.toUpperCase();
  statusDoc["status"] = turnOn ? "ON" : "OFF";
  char p[200];
  serializeJson(statusDoc, p);
  mqtt.publish(topic_pump_status.c_str(), p);

  if (turnOn && duration > 0) {
    // Note: delay() is blocking. In a real system, use non-blocking timers.
    delay(duration * 1000);
    digitalWrite(pin, LOW);
    if (label == "Water") waterPumpStatus = false;
    else fertilizerPumpStatus = false;
  }
}

// ============================================
// PUBLISH PUMP STATUS
// ============================================

void publishPumpStatus(String action) {
  StaticJsonDocument<200> doc;
  doc["action"] = action;
  doc["deviceId"] = device_id;
  doc["timestamp"] = millis();
  
  char payload[200];
  serializeJson(doc, payload);
  
  mqtt.publish(topic_pump_status.c_str(), payload);
}

/*
 * ============================================
 * SETUP INSTRUCTIONS
 * ============================================
 * 
 * 1. Install Required Libraries (Arduino IDE):
 *    - PubSubClient by Nick O'Leary
 *    - ArduinoJson by Benoit Blanchon
 *    - DHT sensor library by Adafruit
 *    - Adafruit Unified Sensor
 * 
 * 2. Update Configuration:
 *    - Set your WiFi SSID and password
 *    - Set MQTT server IP (your backend server IP)
 *    - Set unique device_id
 * 
 * 3. Hardware Connections:
 *    - DHT22: Data pin to GPIO 4, VCC to 3.3V, GND to GND
 *    - Soil Moisture: Analog out to GPIO 34
 *    - Pump/Relay: Control pin to GPIO 5
 * 
 * 4. Upload to your ESP32/ESP8266
 * 
 * 5. Open Serial Monitor (115200 baud) to see debug messages
 * 
 * ============================================
 */
