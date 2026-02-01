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
const char* ssid = "NUM2 STUDENT";           // Your WiFi Name
const char* password = "student@2024";       // Your WiFi Password

// Change these to match your Railway Proxy exactly:
const char* mqtt_server = "ballast.proxy.rlwy.net"; 
const int   mqtt_port   = 28240; 
const char* device_id   = "SMARTAG-001"; // Must match your dashboard ID

// ============================================
// 2. PIN DEFINITIONS
// ============================================
// RS485 Module Pins (for 7-in-1 Sensor)
#define MAX485_DE      4    // Driver Enable (Connect to DE & RE)
#define MAX485_RX_PIN  16   // RX2 (Connect to RO)
#define MAX485_TX_PIN  17   // TX2 (Connect to DI)

// Analog Sensors
#define MOISTURE_PIN   34   // Analog Soil Moisture
#define RAIN_PIN       35   // Analog Rain Sensor
#define BATTERY_PIN    32   // Battery Voltage Monitor (New!)

// Actuators
#define RELAY_1_PIN    15   // Water Pump (Purple Wire)
#define RELAY_2_PIN    13   // Fertilizer / Second Pump (Blue Wire)

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

// RS485 Flow Control Callbacks
void preTransmission() {
  digitalWrite(MAX485_DE, HIGH);
}

void postTransmission() {
  digitalWrite(MAX485_DE, LOW);
}

// ============================================
// 4. SETUP
// ============================================
void setup() {
  Serial.begin(115200);
  
  // Initialize RS485 Pins
  pinMode(MAX485_DE, OUTPUT);
  digitalWrite(MAX485_DE, LOW);
  
  // Initialize Serial2 for RS485 Communication
  Serial2.begin(9600, SERIAL_8N1, MAX485_RX_PIN, MAX485_TX_PIN);
  
  // Initialize Modbus
  node.begin(1, Serial2); // Address 1 is default
  node.preTransmission(preTransmission);
  node.postTransmission(postTransmission);

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
void loop() {
  if (!mqtt.connected()) connectMQTT();
  mqtt.loop();

  // --- HARDWARE TEST: Toggle Relays every 5 seconds ---
  static unsigned long lastRelayTest = 0;
  if (millis() - lastRelayTest > 5000) {
    Serial.println("🛠️ Hardware Test: Pulsing Relays...");
    digitalWrite(RELAY_1_PIN, LOW); // ON
    digitalWrite(RELAY_2_PIN, LOW); // ON
    delay(1000);
    digitalWrite(RELAY_1_PIN, HIGH); // OFF
    digitalWrite(RELAY_2_PIN, HIGH); // OFF
    lastRelayTest = millis();
  }

  // Send data every 5 seconds
  if (millis() - lastPublish > 5000) {
    readSevenInOneSensor();
    sendSensorData();
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
void sendSensorData() {
  // 1. Read Analog Soil Moisture
  int mRaw = analogRead(MOISTURE_PIN);
  float mPercentAnalog = map(mRaw, MOISTURE_DRY, MOISTURE_WET, 0, 100);
  mPercentAnalog = constrain(mPercentAnalog, 0, 100);

  // 2. Read Rain (Analog)
  int rRaw = analogRead(RAIN_PIN);
  float rPercent = map(rRaw, RAIN_DRY, RAIN_WET, 0, 100);
  rPercent = constrain(rPercent, 0, 100);

  // 3. Read Battery Voltage (Updated for User Converter)
  // Your converter maps ~12.9V down to ~3.3V (Ratio 3.91)
  int bRaw = analogRead(BATTERY_PIN);
  float voltage = bRaw * (3.3 / 4095.0) * 3.91; 
  
  // Simple Percentage calculation for 12V Lead Acid or 3S Lithium
  // Range ~10.5V (0%) to ~12.6V (100%)
  float batteryPercent = map(voltage * 10, 105, 126, 0, 100);
  batteryPercent = constrain(batteryPercent, 0, 100);

  // Prepare JSON
  StaticJsonDocument<512> doc;
  doc["deviceId"] = device_id;
  
  // Power Stats
  doc["voltage"]     = voltage;
  doc["battery"]     = batteryPercent;
  
  // MAIN DASHBOARD GAUGES
  doc["moisture"]    = mPercentAnalog; 
  doc["temp"]        = val_temp;
  doc["pH"]          = val_ph;
  doc["ec"]          = val_ec;
  doc["rain"]        = rPercent;
  
  // NUTRIENTS (NPK)
  doc["nitrogen"]    = val_n;
  doc["phosphorus"]  = val_p;
  doc["potassium"]   = val_k;
  
  doc["status"]      = "Online";

  char buffer[512];
  serializeJson(doc, buffer);
  String topic = "smartag/" + String(device_id) + "/sensors";
  mqtt.publish(topic.c_str(), buffer);
  
  Serial.println("📤 MQTT Sent: " + String(buffer));
  Serial.printf("🔋 Battery: %.2fV (%d%%)\n", voltage, (int)batteryPercent);
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
    Serial.printf("  💧 Water Pump -> %s\n", turnOn ? "ON (LOW)" : "OFF (HIGH)");
  } 
  else if (type == "FERTILIZER") {
    digitalWrite(RELAY_2_PIN, turnOn ? LOW : HIGH); // Active Low Logic
    Serial.printf("  🧪 Fertilizer Pump -> %s\n", turnOn ? "ON (LOW)" : "OFF (HIGH)");
  }
}

// ============================================
// 9. HELPER FUNCTIONS
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
      String subTopic = "smartag/" + String(device_id) + "/pump/command";
      mqtt.subscribe(subTopic.c_str());
    } else {
      Serial.print("failed, rc="); Serial.print(mqtt.state());
      Serial.println(" retrying in 5 seconds...");
      delay(5000);
    }
  }
}