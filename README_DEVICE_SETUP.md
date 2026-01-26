# 🚀 Quick Start - Device Setup

## Prerequisites
- ESP32 or ESP8266 board
- DHT22 sensor
- Soil moisture sensor
- Relay module for pump
- Arduino IDE installed

## Step 1: Start the Backend

### Windows
```bash
start-backend.bat
```

### Linux/Mac
```bash
npm start
```

You should see:
```
✅ HTTP Server running on port 5000
✅ MQTT Broker running on port 1883
```

## Step 2: Find Your PC's IP Address

### Windows
```bash
ipconfig
```
Look for "IPv4 Address" (e.g., `192.168.1.100`)

### Linux/Mac
```bash
ifconfig
# or
ip addr show
```

## Step 3: Configure and Upload Device Code

1. Open **Arduino IDE**
2. Open `device/smartag_device.ino`
3. Update these lines:

```cpp
const char* ssid = "YOUR_WIFI_SSID";          // Your WiFi name
const char* password = "YOUR_WIFI_PASSWORD";   // Your WiFi password
const char* mqtt_server = "192.168.1.100";     // Your PC's IP address
const char* device_id = "DEVICE_001";          // Unique device ID
```

4. Install required libraries:
   - Go to **Sketch → Include Library → Manage Libraries**
   - Search and install:
     - `PubSubClient`
     - `ArduinoJson`
     - `DHT sensor library`
     - `Adafruit Unified Sensor`

5. Select your board:
   - **Tools → Board → ESP32 Dev Module** (or ESP8266)
   
6. Select your COM port:
   - **Tools → Port → COM3** (or your port)

7. Click **Upload** (→)

8. Open **Serial Monitor** (Ctrl+Shift+M)
   - Set baud rate to **115200**

## Step 4: Register Device

Open browser and run:
```
http://localhost:5000/api/devices/register
```

Or use command line:
```bash
curl -X POST http://localhost:5000/api/devices/register \
  -H "Content-Type: application/json" \
  -d "{
    \"deviceId\": \"DEVICE_001\",
    \"name\": \"Farm Field 1\",
    \"type\": \"COMBO\",
    \"location\": \"North Field\",
    \"userId\": \"YOUR_USER_ID\"
  }"
```

> **Get your User ID from Supabase dashboard or create a user first**

## Step 5: Test Connection

In Serial Monitor, you should see:
```
✅ WiFi connected!
✅ MQTT Connected!
--- Reading Sensors ---
Temperature: 28.5°C
Humidity: 65.2%
Soil Moisture: 45.8%
✅ Data sent to server!
```

## Step 6: View Dashboard

1. Start frontend:
```bash
cd client
npm run dev
```

2. Open browser: `http://localhost:3000`

3. You should see real-time sensor data!

## Troubleshooting

### ❌ WiFi Connection Failed
- Check SSID and password
- Ensure 2.4GHz network (not 5GHz)

### ❌ MQTT Connection Failed
- Verify backend server is running
- Check PC IP address is correct
- Ensure firewall allows port 1883

### ❌ No Data in Dashboard
- Check device is registered
- Verify backend server logs
- Check browser console for errors

---

## 📖 Full Documentation

See [`device_integration_guide.md`](C:\Users\ASUS VIVOBOOK\.gemini\antigravity\brain\f133152b-177c-4e56-a0ab-97fb578fbd48\device_integration_guide.md) for complete setup instructions, API documentation, and advanced configuration.

## Hardware Wiring

| Component | ESP32 Pin | Notes |
|-----------|-----------|-------|
| DHT22 Data | GPIO 4 | |
| Moisture Sensor | GPIO 34 (ADC) | |
| Relay/Pump | GPIO 5 | |

---

**Need help? Check the full integration guide or ask for assistance!** 🌱
