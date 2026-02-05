/*
 * 🚀 SMART AGRICULTURE 4.0 - FINAL AUTO pH VERSION
 * ESP32 + JXBS-3001 RS485 Soil Sensor + Rain + Battery + 2 Relay + MQTT
 *
 * CONFIRMED REGISTERS (from your output):
 * EC  = Reg[2]
 * Temp= Reg[3] * 0.1
 * Moisture = Reg[7] * 0.01
 * NPK = Holding Registers 30-32
 *
 * pH SUPPORT:
 * - Try Reg[4], Reg[5], Reg[6], Reg[8], Reg[9]
 * - If valid range (3.0 - 10.0) => use it
 * - Else => pH = N/A
 */

#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <ModbusMaster.h>
#include <esp_task_wdt.h> // Task Watchdog for reliability

// Watchdog timeout (seconds)
#define WDT_TIMEOUT 8

// ============================================
// 1. WIFI & CLOUD CONFIGURATION
// ============================================
const char* ssid = "Wise";
const char* password = "12345678";

const char* mqtt_server = "ballast.proxy.rlwy.net";
const int   mqtt_port   = 28240;
const char* device_id   = "SMARTAG-001";

// ============================================
// 2. PIN DEFINITIONS
// ============================================
#define MAX485_RX_PIN  16
#define MAX485_TX_PIN  17

// Analog Sensors
#define RAIN_PIN       32
#define BATTERY_PIN    33
#define MOISTURE_PIN   34    // Capacitive soil moisture sensor

// Actuators
#define RELAY_1_PIN    25
#define RELAY_2_PIN    26

// Rain calibration
#define RAIN_DRY       4095
#define RAIN_WET       1000

// Moisture calibration (Capacitive sensor)
// Adjust these values based on your sensor!
#define MOISTURE_DRY   4095   // ADC value when sensor is in air (dry)
#define MOISTURE_WET   1800   // ADC value when sensor is in water (wet)

// ============================================
// 3. OBJECTS & VARIABLES
// ============================================
WiFiClient espClient;
PubSubClient mqtt(espClient);
ModbusMaster node;

unsigned long lastPublish = 0;
unsigned long lastReconnectAttempt = 0;

// RS485 Sensor Values
float val_moisture = 0;
float val_temp = 0;
float val_ec   = 0;
float val_ph   = -1;   // -1 means N/A
float val_n    = 0;
float val_p    = 0;
float val_k    = 0;

// Analog Sensor Values
float currentRain = 0;
float currentBattery = 0;

// ============================================
// 4. CAMBODIA BASED STATUS FUNCTIONS
// ============================================

String getPHStatus(float ph) {
  if (ph < 5.5) return "ACIDIC (LOW)";
  if (ph <= 7.0) return "OPTIMAL";
  if (ph <= 8.0) return "ALKALINE (HIGH)";
  return "VERY HIGH";
}

String getNStatus(float n) {
  if (n < 40) return "VERY LOW";
  if (n < 90) return "LOW";
  if (n < 150) return "OPTIMAL";
  if (n < 220) return "HIGH";
  return "EXCESS";
}

String getPStatus(float p) {
  if (p < 15) return "VERY LOW";
  if (p < 35) return "LOW";
  if (p < 70) return "OPTIMAL";
  if (p < 120) return "HIGH";
  return "EXCESS";
}

String getKStatus(float k) {
  if (k < 80) return "VERY LOW";
  if (k < 150) return "LOW";
  if (k < 280) return "OPTIMAL";
  if (k < 400) return "HIGH";
  return "EXCESS";
}

String getECStatus(float ec) {
  if (ec < 400) return "LOW (Need Fertilizer)";
  if (ec < 1200) return "OPTIMAL";
  if (ec < 2000) return "HIGH";
  return "EXCESS (Too Salty)";
}

String getMoistureStatus(float m) {
  if (m < 20) return "VERY DRY";
  if (m < 40) return "DRY";
  if (m < 70) return "OPTIMAL";
  if (m < 85) return "WET";
  return "WATERLOGGED";
}

// ============================================
// 5. WIFI CONNECT
// ============================================
void connectWiFi() {
  Serial.print("Connecting to WiFi: ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  int retries = 0;
  while (WiFi.status() != WL_CONNECTED && retries < 10) {
    delay(500);
    Serial.print(".");
    retries++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ WiFi Connected!");
  } else {
    Serial.println("\n❌ WiFi Failed (Offline Mode)");
  }
}

// ============================================
// 6. MQTT RECONNECT
// ============================================
boolean reconnect() {
  if (WiFi.status() != WL_CONNECTED) {
    WiFi.begin(ssid, password);
    return false;
  }

  Serial.print("Attempting MQTT connection...");
  if (mqtt.connect(device_id)) {
    Serial.println("✅ Connected");

    String subTopic = "smartag/" + String(device_id) + "/pump/command";
    mqtt.subscribe(subTopic.c_str());

    return true;
  } else {
    Serial.print("failed, rc=");
    Serial.print(mqtt.state());
    Serial.println(" try again later");
    return false;
  }
}

// ============================================
// 7. MQTT CALLBACK (PUMP CONTROL)
// ============================================
void mqttCallback(char* topic, byte* payload, unsigned int length) {
  Serial.printf("\n📨 MQTT Message Received [%s]\n", topic);

  StaticJsonDocument<256> doc;
  DeserializationError error = deserializeJson(doc, payload, length);

  if (error) {
    Serial.print("  JSON Parse Error: ");
    Serial.println(error.c_str());
    return;
  }

  String type = doc["type"] | "WATER";
  String status = doc["status"] | "OFF";

  bool turnOn = (status == "ON");

  if (type == "WATER") {
    digitalWrite(RELAY_1_PIN, turnOn ? LOW : HIGH);
    Serial.printf("  💦 Water Pump -> %s\n", turnOn ? "ON" : "OFF");
  }
  else if (type == "FERTILIZER") {
    digitalWrite(RELAY_2_PIN, turnOn ? LOW : HIGH);
    Serial.printf("  🧪 Fertilizer Pump -> %s\n", turnOn ? "ON" : "OFF");
  }
}

// ============================================
// 8. RS485 SENSOR READING (AUTO pH DETECTION)
// ============================================
void readSevenInOneSensor() {

  Serial.println("\n=======================================");
  Serial.println("📡 Reading JXBS-3001 Soil Sensor");
  Serial.println("=======================================");

  uint8_t result1 = node.readHoldingRegisters(0x0000, 10);

  if (result1 != node.ku8MBSuccess) {
    Serial.print("⚠️ ERROR reading block 0x0000. Code: ");
    Serial.println(result1, HEX);
    return;
  }

  uint16_t reg[10];
  Serial.println("🧾 RAW REGISTER DATA (0x0000):");
  for (int i = 0; i < 10; i++) {
    reg[i] = node.getResponseBuffer(i);
    Serial.printf("  Reg[%d] = %d\n", i, reg[i]);
  }

  // Confirmed mapping (moisture is read from ANALOG sensor, not RS485)
  val_ec       = reg[2];
  val_temp     = reg[3] * 0.1;
  float rs485_moisture = reg[7] * 0.01;  // Store for reference only

  // -------------------------------
  // AUTO pH DETECTION
  // -------------------------------
  val_ph = -1;

  int phIndexes[] = {4, 5, 6, 8, 9};
  for (int i = 0; i < 5; i++) {
    float phCandidate = reg[phIndexes[i]] * 0.1;
    if (phCandidate >= 3.0 && phCandidate <= 10.0) {
      val_ph = phCandidate;
      break;
    }
  }

  // Print Results (Note: moisture shown here is RS485 reference, actual value from analog sensor)
  Serial.println("\n✅ RS485 SENSOR VALUES:");
  Serial.printf("💧 RS485 Moisture: %.2f %% (IGNORED - using analog sensor)\n", rs485_moisture);
  Serial.printf("🌡 Temperature  : %.1f °C\n", val_temp);
  Serial.printf("⚡ EC           : %.0f us/cm  [%s]\n", val_ec, getECStatus(val_ec).c_str());

  if (val_ph < 0) {
    Serial.println("🧪 pH           : N/A (Not supported / no response)");
  } else {
    Serial.printf("🧪 pH           : %.1f  [%s]\n", val_ph, getPHStatus(val_ph).c_str());
  }

  delay(250);

  // -------------------------------
  // NPK BLOCK (30-32)
  // -------------------------------
  uint8_t result2 = node.readHoldingRegisters(30, 3);

  if (result2 == node.ku8MBSuccess) {

    val_n = node.getResponseBuffer(0);
    val_p = node.getResponseBuffer(1);
    val_k = node.getResponseBuffer(2);

    Serial.println("---------------------------------------");
    Serial.printf("🌱 Nitrogen (N) : %.0f ppm  [%s]\n", val_n, getNStatus(val_n).c_str());
    Serial.printf("🌱 Phosphorus(P): %.0f ppm  [%s]\n", val_p, getPStatus(val_p).c_str());
    Serial.printf("🌱 Potassium (K): %.0f ppm  [%s]\n", val_k, getKStatus(val_k).c_str());
    Serial.println("=======================================\n");

  } else {
    Serial.print("⚠️ ERROR reading NPK block. Code: ");
    Serial.println(result2, HEX);
  }
}

// ============================================
// 9. ANALOG SENSOR READING (RAIN + MOISTURE + BATTERY)
// ============================================
void updateLocalSensors() {

  // Rain sensor
  int rRaw = analogRead(RAIN_PIN);
  float rPercent = map(rRaw, RAIN_DRY, RAIN_WET, 0, 100);
  currentRain = constrain(rPercent, 0, 100);

  // Capacitive moisture sensor (GPIO 34) - OVERRIDES RS485 moisture!
  int mRaw = analogRead(MOISTURE_PIN);
  float mPercent = map(mRaw, MOISTURE_DRY, MOISTURE_WET, 0, 100);
  val_moisture = constrain(mPercent, 0, 100);  // Override RS485 value

  currentBattery = 67.0;

  Serial.println("---------------------------------------");
  Serial.printf("🌧 Rain Level   : %.1f %% (raw: %d)\n", currentRain, rRaw);
  Serial.printf("💧 Moisture     : %.1f %% (raw: %d) [ANALOG SENSOR]\n", val_moisture, mRaw);
  Serial.printf("🔋 Battery      : %.1f %%\n", currentBattery);
  
  // Show current pump status
  bool waterPumpOn = (digitalRead(RELAY_1_PIN) == LOW);
  bool fertPumpOn = (digitalRead(RELAY_2_PIN) == LOW);
  Serial.printf("💧 Water Pump   : %s\n", waterPumpOn ? "🟢 ON" : "⚪ OFF");
  Serial.printf("🧪 Fert Pump    : %s\n", fertPumpOn ? "🟢 ON" : "⚪ OFF");
}

// ============================================
// 10. SEND SENSOR DATA TO MQTT
// ============================================
void sendSensorData() {

  StaticJsonDocument<512> doc;
  doc["deviceId"] = device_id;

  doc["moisture"] = val_moisture;
  doc["temp"]     = val_temp;
  doc["ec"]       = val_ec;

  // pH: send value if available, else send "N/A"
  if (val_ph < 0) doc["pH"] = "N/A";
  else doc["pH"] = val_ph;

  doc["nitrogen"]   = val_n;
  doc["phosphorus"] = val_p;
  doc["potassium"]  = val_k;

  doc["rain"]    = currentRain;
  doc["battery"] = currentBattery;

  doc["status"]  = "Online";

  char buffer[512];
  serializeJson(doc, buffer);

  String topic = "smartag/" + String(device_id) + "/sensors";
  mqtt.publish(topic.c_str(), buffer);

  Serial.println("📤 MQTT Sent: " + String(buffer));
}

// ============================================
// 11. OFFLINE MODE LOGIC
// ============================================
void checkOfflineRules() {
  Serial.println("🌐 [OFFLINE MODE] Checking Local Rules...");

  if (val_moisture < 40) {
    digitalWrite(RELAY_1_PIN, LOW);
    Serial.printf("  💦 Water Pump ON (Moisture: %.2f%%)\n", val_moisture);
  }
  else if (val_moisture > 55) {
    digitalWrite(RELAY_1_PIN, HIGH);
    Serial.printf("  ✅ Soil wet (%.2f%%). Water OFF.\n", val_moisture);
  }

  if (val_ec > 0 && val_ec < 800 && val_moisture > 40) {
    digitalWrite(RELAY_2_PIN, LOW);
    Serial.printf("  🧪 Fertilizer Pump ON (EC: %.0f)\n", val_ec);
  }
  else if (val_ec > 1200) {
    digitalWrite(RELAY_2_PIN, HIGH);
    Serial.println("  ✅ Nutrients balanced. Fertilizer OFF.");
  }
}

// ============================================
// 12. SETUP
// ============================================
void setup() {
  Serial.begin(115200);

  Serial2.begin(9600, SERIAL_8N1, MAX485_RX_PIN, MAX485_TX_PIN);
  node.begin(1, Serial2);

  pinMode(RELAY_1_PIN, OUTPUT);
  pinMode(RELAY_2_PIN, OUTPUT);

  digitalWrite(RELAY_1_PIN, HIGH);
  digitalWrite(RELAY_2_PIN, HIGH);

  connectWiFi();

  mqtt.setServer(mqtt_server, mqtt_port);
  mqtt.setCallback(mqttCallback);

  // 🚀 HARDWARE WATCHDOG INITIALIZATION
  Serial.println("🛡️ Initializing Hardware Watchdog (8s)...");
  esp_task_wdt_init(WDT_TIMEOUT, true); // Enable panic so ESP32 reboots on timeout
  esp_task_wdt_add(NULL);               // Add current thread (loop) to WDT
}

// ============================================
// 13. MAIN LOOP
// ============================================
void loop() {
  esp_task_wdt_reset(); // 🦴 Reset Watchdog - "Feed the Dog"

  if (!mqtt.connected()) {
    unsigned long now = millis();
    if (now - lastReconnectAttempt > 5000) {
      lastReconnectAttempt = now;
      if (reconnect()) lastReconnectAttempt = 0;
    }
  } else {
    mqtt.loop();
  }

  if (millis() - lastPublish > 5000) {
    readSevenInOneSensor();
    updateLocalSensors();

    // 🌧️ TIER 1: INSTANT LOCAL RAIN SAFETY (The "Emergency Brake")
    // This runs every 5s regardless of Online/Offline status
    bool isRainingNow = (currentRain > 20);
    
    if (isRainingNow) {
        digitalWrite(RELAY_1_PIN, HIGH); // Force OFF
        digitalWrite(RELAY_2_PIN, HIGH); // Force OFF
        Serial.println("🌧️ [TIER 1 SAFETY] Rain detected! Emergency shutdown ALL pumps.");
    }

    if (mqtt.connected()) {
      sendSensorData();

      // HYBRID MODE: Parallel control (if not raining)
      if (!isRainingNow) {
        // 1. Water Pump Control (Auto-fallback when Online)
        if (val_moisture < 40) {
          digitalWrite(RELAY_1_PIN, LOW); // ON
          Serial.printf("💦 [AUTO-ONLINE] Water Pump ON (%.1f%%)\n", val_moisture);
        } else if (val_moisture > 55) {
          digitalWrite(RELAY_1_PIN, HIGH); // OFF
          Serial.printf("✅ [AUTO-ONLINE] Water Pump OFF (%.1f%%)\n", val_moisture);
        }

        // 2. Fertilizer Pump Control (Independent - SIMULTANEOUS)
        if (val_ec > 0 && val_ec < 800) {
          digitalWrite(RELAY_2_PIN, LOW); // ON
          Serial.printf("🧪 [AUTO-ONLINE] Fertilizer Pump ON (EC: %.0f)\n", val_ec);
        } else if (val_ec > 1200) {
          digitalWrite(RELAY_2_PIN, HIGH); // OFF
          Serial.println("✅ [AUTO-ONLINE] Fertilizer Pump OFF (EC Balanced)");
        }
      }
    } else {
      // Offline Rules also respect Tier 1 Safety check above
      if (!isRainingNow) {
          checkOfflineRules();
      }
    }

    lastPublish = millis();
  }
}
