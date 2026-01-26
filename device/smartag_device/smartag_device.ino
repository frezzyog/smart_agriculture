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

// ============================================
// CONFIGURATION - Update these values
// ============================================

// WiFi credentials
const char* ssid = "NUM2 STUDENT";
const char* password = "student@2024";

// MQTT Broker (your backend server)
const char* mqtt_server = "10.10.12.218";  // Your PC's IP on NUM2 STUDENT
const int mqtt_port = 1883;

// Device Configuration
const char* device_id = "DEVICE_001";  // Unique identifier for this device

// MQTT Topics
String topic_sensors = "smartag/" + String(device_id) + "/sensors";
String topic_pump_command = "smartag/" + String(device_id) + "/pump/command";
String topic_pump_status = "smartag/" + String(device_id) + "/pump/status";

// ============================================
// SENSOR PIN CONFIGURATION
// ============================================

// Soil Moisture Sensor (Capacitive)
#define MOISTURE_PIN 34  // Analog pin

// Rain Drop Sensor
#define RAIN_PIN 35  // Analog pin

// Pump/Relay Control
#define PUMP_PIN 5

// ============================================
// SENSOR CALIBRATION VALUES
// ============================================

// Soil Moisture Sensor Calibration
// Adjust these based on your sensor's actual readings:
// - WET_VALUE: Raw reading when sensor is in water
// - DRY_VALUE: Raw reading when sensor is in air
#define MOISTURE_WET 1800   // Sensor in water (lower value = more moisture)
#define MOISTURE_DRY 3500   // Sensor in air (higher value = dry)

// Rain Sensor Calibration
#define RAIN_WET 3500       // Sensor wet (rain detected) 
#define RAIN_DRY 500        // Sensor dry (no rain)

// ============================================
// LIBRARIES & OBJECTS
// ============================================

WiFiClient espClient;
PubSubClient mqtt(espClient);

// ============================================
// GLOBAL VARIABLES
// ============================================

unsigned long lastSensorRead = 0;
const unsigned long sensorInterval = 10000;  // Send data every 10 seconds

bool pumpStatus = false;

// ============================================
// SETUP
// ============================================

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("\n\n=================================");
  Serial.println("Smart Agriculture IoT Device");
  Serial.println("=================================\n");

  // Initialize pins
  pinMode(PUMP_PIN, OUTPUT);
  digitalWrite(PUMP_PIN, LOW);
  
  // Sensors are analog - no initialization needed
  
  // Connect to WiFi
  connectWiFi();
  
  // Connect to MQTT
  mqtt.setServer(mqtt_server, mqtt_port);
  mqtt.setCallback(mqttCallback);
  connectMQTT();
  
  Serial.println("\n✅ Device ready!");
  Serial.println("Device ID: " + String(device_id));
}

// ============================================
// MAIN LOOP
// ============================================

void loop() {
  // Maintain MQTT connection
  if (!mqtt.connected()) {
    connectMQTT();
  }
  mqtt.loop();
  
  // Read and send sensor data periodically
  unsigned long currentMillis = millis();
  if (currentMillis - lastSensorRead >= sensorInterval) {
    lastSensorRead = currentMillis;
    readAndSendSensorData();
  }
}

// ============================================
// WiFi CONNECTION
// ============================================

void connectWiFi() {
  Serial.print("Connecting to WiFi: ");
  Serial.println(ssid);
  
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ WiFi connected!");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n❌ WiFi connection failed!");
  }
}

// ============================================
// MQTT CONNECTION
// ============================================

void connectMQTT() {
  while (!mqtt.connected()) {
    Serial.print("Connecting to MQTT broker...");
    
    // Attempt to connect
    if (mqtt.connect(device_id)) {
      Serial.println("✅ Connected!");
      
      // Subscribe to pump command topic
      mqtt.subscribe(topic_pump_command.c_str());
      Serial.println("📡 Subscribed to: " + topic_pump_command);
      
    } else {
      Serial.print("❌ Failed, rc=");
      Serial.print(mqtt.state());
      Serial.println(" Retrying in 5 seconds...");
      delay(5000);
    }
  }
}

// ============================================
// READ AND SEND SENSOR DATA
// ============================================

void readAndSendSensorData() {
  Serial.println("\n--- Reading Sensors ---");
  
  // Read soil moisture with calibration
  // Using calibrated wet/dry values for better accuracy
  int moistureRaw = analogRead(MOISTURE_PIN);
  float moisture = map(moistureRaw, MOISTURE_WET, MOISTURE_DRY, 100, 0);
  moisture = constrain(moisture, 0, 100);  // Keep within 0-100%
  
  // Read rain sensor with calibration
  // Using calibrated wet/dry values
  int rainRaw = analogRead(RAIN_PIN);
  float rainLevel = map(rainRaw, RAIN_WET, RAIN_DRY, 100, 0);
  rainLevel = constrain(rainLevel, 0, 100);  // Keep within 0-100%
  
  // Read NPK Sensor (Simulated values for now - replace with actual sensor reading)
  // For real NPK sensor (RS485 Modbus), you'll need to use a Modbus library
  // and read registers from the sensor. This is a placeholder.
  float nitrogen = random(0, 100);    // mg/kg or ppm
  float phosphorus = random(0, 100);  // mg/kg or ppm
  float potassium = random(0, 100);   // mg/kg or ppm
  
  // Display readings
  Serial.println("Soil Moisture: " + String(moisture) + "%");
  Serial.println("Rain Level: " + String(rainLevel) + "%");
  Serial.println(">>> Moisture Raw: " + String(moistureRaw) + " (Calibration: " + String(MOISTURE_WET) + "-" + String(MOISTURE_DRY) + ")");
  Serial.println(">>> Rain Raw: " + String(rainRaw) + " (Calibration: " + String(RAIN_WET) + "-" + String(RAIN_DRY) + ")");
  Serial.println("Nitrogen (N): " + String(nitrogen) + " mg/kg");
  Serial.println("Phosphorus (P): " + String(phosphorus) + " mg/kg");
  Serial.println("Potassium (K): " + String(potassium) + " mg/kg");
  
  // Create JSON payload
  StaticJsonDocument<400> doc;
  doc["moisture"] = moisture;
  doc["rain"] = rainLevel;
  doc["nitrogen"] = nitrogen;
  doc["phosphorus"] = phosphorus;
  doc["potassium"] = potassium;
  doc["moistureRaw"] = moistureRaw;
  doc["rainRaw"] = rainRaw;
  doc["deviceId"] = device_id;
  
  char payload[400];
  serializeJson(doc, payload);
  
  // Publish to MQTT
  if (mqtt.publish(topic_sensors.c_str(), payload)) {
    Serial.println("✅ Data sent to server!");
  } else {
    Serial.println("❌ Failed to send data!");
  }
}

// ============================================
// MQTT CALLBACK (Receive Commands)
// ============================================

void mqttCallback(char* topic, byte* payload, unsigned int length) {
  Serial.print("\n📨 Message received on topic: ");
  Serial.println(topic);
  
  // Parse JSON payload
  StaticJsonDocument<200> doc;
  deserializeJson(doc, payload, length);
  
  // Check if this is a pump command
  if (String(topic) == topic_pump_command) {
    String status = doc["status"];
    int duration = doc["duration"] | 0;
    
    Serial.println("Pump Command: " + status);
    
    if (status == "ON") {
      controlPump(true, duration);
    } else if (status == "OFF") {
      controlPump(false, 0);
    }
  }
}

// ============================================
// PUMP CONTROL
// ============================================

void controlPump(bool turnOn, int duration) {
  if (turnOn) {
    digitalWrite(PUMP_PIN, HIGH);
    pumpStatus = true;
    Serial.println("💧 Pump turned ON");
    
    // Send status update
    publishPumpStatus("ON");
    
    // If duration is specified, turn off after duration (in seconds)
    if (duration > 0) {
      delay(duration * 1000);
      controlPump(false, 0);
    }
  } else {
    digitalWrite(PUMP_PIN, LOW);
    pumpStatus = false;
    Serial.println("💧 Pump turned OFF");
    
    // Send status update
    publishPumpStatus("OFF");
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
