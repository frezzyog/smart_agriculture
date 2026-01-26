/*
 * SENSOR EXPANSION TEMPLATE
 * Copy sections from here to add new sensors to smartag_device.ino
 */

// ============================================
// ADDITIONAL SENSOR PIN DEFINITIONS
// Add these to the PIN CONFIGURATION section
// ============================================

// NPK Sensor (RS485 Modbus)
#define NPK_RX 16
#define NPK_TX 17
#define NPK_DE 4      // Direction Enable

// pH Sensor (Analog)
#define PH_PIN 32
#define PH_CALIBRATION_NEUTRAL 1500  // Adjust based on calibration
#define PH_CALIBRATION_ACID 2000     // Adjust based on calibration

// Light Sensor (Analog LDR or I2C)
#define LIGHT_PIN 33

// Water Flow Sensor (Digital, Interrupt)
#define FLOW_PIN 13

// Temperature Sensor (DHT22 or DS18B20)
#define TEMP_PIN 21

// EC Sensor (Electrical Conductivity)
#define EC_PIN 36

// ============================================
// ADDITIONAL LIBRARIES
// Add these to the top of your file
// ============================================

// #include <ModbusMaster.h>    // For NPK sensor
// #include <BH1750.h>           // For light sensor (I2C)
// #include <DHT.h>              // For temperature/humidity
// #include <OneWire.h>          // For DS18B20 temperature
// #include <DallasTemperature.h> // For DS18B20

// ============================================
// SENSOR OBJECTS
// Add these to LIBRARIES & OBJECTS section
// ============================================

// ModbusMaster npkSensor;
// BH1750 lightMeter(0x23);
// DHT dht(TEMP_PIN, DHT22);

// ============================================
// SETUP CODE SNIPPETS
// Add these to setup() function
// ============================================

/*
// NPK Sensor Setup (RS485)
Serial2.begin(9600, SERIAL_8N1, NPK_RX, NPK_TX);
npkSensor.begin(1, Serial2);
pinMode(NPK_DE, OUTPUT);
digitalWrite(NPK_DE, LOW);

// Light Sensor Setup (I2C)
Wire.begin(21, 22);  // SDA, SCL
lightMeter.begin();

// Temperature Sensor Setup
dht.begin();

// Water Flow Setup
pinMode(FLOW_PIN, INPUT_PULLUP);
volatile int flowCount = 0;
attachInterrupt(digitalPinToInterrupt(FLOW_PIN), []() { flowCount++; }, FALLING);
*/

// ============================================
// READING CODE SNIPPETS
// Add these to readAndSendSensorData()
// ============================================

/*
// === NPK SENSOR ===
digitalWrite(NPK_DE, HIGH);  // Enable transmission
delay(10);
uint8_t result = npkSensor.readHoldingRegisters(0x001E, 3);
digitalWrite(NPK_DE, LOW);   // Disable transmission

float nitrogen = 0, phosphorus = 0, potassium = 0;
if (result == npkSensor.ku8MBSuccess) {
  nitrogen = npkSensor.getResponseBuffer(0);
  phosphorus = npkSensor.getResponseBuffer(1);
  potassium = npkSensor.getResponseBuffer(2);
  
  Serial.println("N: " + String(nitrogen) + " mg/kg");
  Serial.println("P: " + String(phosphorus) + " mg/kg");
  Serial.println("K: " + String(potassium) + " mg/kg");
  
  doc["nitrogen"] = nitrogen;
  doc["phosphorus"] = phosphorus;
  doc["potassium"] = potassium;
}

// === pH SENSOR ===
int phRaw = analogRead(PH_PIN);
float phVoltage = phRaw * (3.3 / 4095.0);
float pH = 7.0 + ((phRaw - PH_CALIBRATION_NEUTRAL) / 100.0);  // Simplified
pH = constrain(pH, 0, 14);

Serial.println("pH: " + String(pH));
doc["pH"] = pH;

// === LIGHT SENSOR (Analog) ===
int lightRaw = analogRead(LIGHT_PIN);
float lightPercent = map(lightRaw, 0, 4095, 0, 100);

Serial.println("Light: " + String(lightPercent) + "%");
doc["light"] = lightPercent;

// === LIGHT SENSOR (BH1750 I2C) ===
float lux = lightMeter.readLightLevel();
Serial.println("Light: " + String(lux) + " lux");
doc["light"] = lux;

// === WATER FLOW ===
extern volatile int flowCount;
float flowRate = (flowCount / 7.5);  // L/min (adjust based on sensor)
flowCount = 0;

Serial.println("Flow: " + String(flowRate) + " L/min");
doc["waterFlow"] = flowRate;

// === TEMPERATURE (DHT22) ===
float temperature = dht.readTemperature();
float humidity = dht.readHumidity();

if (!isnan(temperature) && !isnan(humidity)) {
  Serial.println("Temp: " + String(temperature) + "°C");
  Serial.println("Humidity: " + String(humidity) + "%");
  
  doc["temperature"] = temperature;
  doc["humidity"] = humidity;
}

// === EC SENSOR (Electrical Conductivity) ===
int ecRaw = analogRead(EC_PIN);
float ecVoltage = ecRaw * (3.3 / 4095.0);
float ec = ecVoltage * 1000;  // Simplified, adjust for your sensor

Serial.println("EC: " + String(ec) + " µS/cm");
doc["ec"] = ec;
*/

// ============================================
// REMEMBER TO:
// ============================================
// 1. Increase JSON document size:
//    StaticJsonDocument<600> doc;
//    char payload[600];
//
// 2. Add new fields to dashboard hook
// 3. Create sensor cards in dashboard UI
// 4. Install required libraries via Arduino Library Manager
