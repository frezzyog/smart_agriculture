# កសិកម្មឆ្លាតវៃ 4.0 - ឯកសារបច្ចេកទេស API (API Documentation)

ឯកសារនេះផ្តល់នូវបញ្ជីពេញលេញនៃ API Endpoints សម្រាប់ប្រព័ន្ធកសិកម្មឆ្លាតវៃ 4.0 រួមមានទាំង Backend (Node.js) និង AI Service (Python)។

---

## ១. Backend API (Node.js / Express)
Backend សំខាន់គ្រប់គ្រងការរក្សាទុកទិន្នន័យ (Data Persistence), ការទំនាក់ទំនងពេលវេលាជាក់ស្តែង (Real-time) តាមរយៈ MQTT/Socket.io និងបម្រើដល់ Dashboard។

**Base URL**: `http://localhost:3001` (ឬ Production URL)

### សុខភាពប្រព័ន្ធ & System
| Method | Endpoint | ការពិពណ៌នា |
| :--- | :--- | :--- |
| `GET` | `/api/health` | ពិនិត្យស្ថានភាពសុខភាពរបស់ Server។ |
| `GET` | `/api/test-telegram` | ផ្ញើសារសាកល្បងទៅកាន់ Telegram Admin chat ដែលបានកំណត់។ |

### ឧបករណ៍ & សិនស័រ (Devices & Sensors)
| Method | Endpoint | ការពិពណ៌នា |
| :--- | :--- | :--- |
| `GET` | `/api/devices` | ទាញយកឧបករណ៍ទាំងអស់សម្រាប់អ្នកប្រើប្រាស់ (តាមរយៈ `x-user-id` header)។ |
| `POST` | `/api/devices/register` | ចុះឈ្មោះឧបករណ៍ IoT ថ្មីសម្រាប់អ្នកប្រើប្រាស់។ |
| `GET` | `/api/sensors/:deviceId` | ទាញយកប្រវត្តិទិន្នន័យសិនស័រ (Sensor Data) សម្រាប់ឧបករណ៍ជាក់លាក់។ |
| `POST` | `/api/sensors/simulate` | បង្កើតទិន្នន័យសិនស័រសិប្បនិម្មិត (Simulated Data) សម្រាប់ការធ្វើតេស្ត។ |

### ការបញ្ជា & ការស្រោចស្រព (Control & Irrigation)
| Method | Endpoint | ការពិពណ៌នា |
| :--- | :--- | :--- |
| `POST` | `/api/devices/:deviceId/pump` | ផ្ញើពាក្យបញ្ជាបញ្ជាម៉ាស៊ីនបូម (ON/OFF) សម្រាប់ទឹក ឬជី។ |
| `GET` | `/api/irrigation-logs` | ទាញយកប្រវត្តិនៃសកម្មភាពម៉ាស៊ីនបូម និងរយៈពេលដំណើរការ។ |

### ការជូនដំណឹង (Alerts & Notifications)
| Method | Endpoint | ការពិពណ៌នា |
| :--- | :--- | :--- |
| `GET` | `/api/alerts` | ទាញយកការជូនដំណឹង (Alerts) សម្រាប់អ្នកប្រើប្រាស់បច្ចុប្បន្ន។ |
| `PATCH` | `/api/alerts/:alertId/read` | កំណត់ការជូនដំណឹងជាក់លាក់ថាបានអានរួច។ |

### តំបន់ដាំដុះ & ការព្យាករណ៍ AI (Zones & AI Predictions)
| Method | Endpoint | ការពិពណ៌នា |
| :--- | :--- | :--- |
| `GET` | `/api/zones` | បង្ហាញបញ្ជីតំបន់កសិកម្ម ឬកសិដ្ឋានទាំងអស់។ |
| `POST` | `/api/zones/create` | បង្កើតតំបន់កសិកម្មថ្មីជាមួយនឹងការកំណត់ប្រភេទដំណាំ និងដី។ |
| `GET` | `/api/ai/predictions/:zoneId` | ទាញយកការព្យាករណ៍ AI ដែលបានរក្សាទុកសម្រាប់តំបន់ជាក់លាក់។ |
| `POST` | `/api/ai/predictions/generate` | បញ្ជាឱ្យ AI Service បង្កើតការព្យាករណ៍ថ្មី។ |

### ហិរញ្ញវត្ថុ & អាកាសធាតុ (Financial & Weather)
| Method | Endpoint | ការពិពណ៌នា |
| :--- | :--- | :--- |
| `GET` | `/api/expenses` | បង្ហាញបញ្ជីចំណាយទាំងអស់ (ជី, ទឹក, អគ្គិសនី)។ |
| `POST` | `/api/expenses` | បញ្ចូលកំណត់ត្រាចំណាយថ្មី។ |
| `GET` | `/api/weather` | ទាញយកអាកាសធាតុបច្ចុប្បន្ន និងការព្យាករណ៍ ៣ ថ្ងៃ សម្រាប់ភ្នំពេញ (Cached)។ |

---

## ២. AI Service API (Python / FastAPI)
AI Service គ្រប់គ្រងការងារធ្ងន់ៗលើ ML Processing, ការតភ្ជាប់ Gemini LLM និងតក្កវិជ្ជានៃការដាំដុះ។

**Base URL**: `http://localhost:8000`

| Method | Endpoint | ការពិពណ៌នា |
| :--- | :--- | :--- |
| `GET` | `/health` | ពិនិត្យស្ថានភាព AI Service និងការតភ្ជាប់ Gemini API។ |
| `POST` | `/api/ai/interpret` | វិភាគទិន្នន័យសិនស័រឆៅ និងផ្តល់ព័ត៌មានអំពីសុខភាពដំណាំ។ |
| `POST` | `/api/ai/predict/irrigation` | ព្យាករណ៍តម្រូវការទឹកផ្អែកលើសំណើមដី និងអាកាសធាតុ។ |
| `POST` | `/api/ai/predict/fertilizer` | គណនាតម្រូវការបន្ថែមជី NPK។ |
| `POST` | `/api/ai/chat` | តក្កវិជ្ជាស្នូលសម្រាប់ AI Agronomist Chatbot (Gemini)។ |

---

## ៣. ទម្រង់ទិន្នន័យ (Data Formats)

### ទិន្នន័យសិនស័រ - Sensor Data (JSON)
```json
{
  "deviceId": "SMARTAG-001",
  "moisture": 45.5,
  "temp": 32.1,
  "humidity": 65.0,
  "npk": { "n": 25, "p": 15, "k": 30 },
  "ec": 1.2,
  "ph": 6.8
}
```

### ពាក្យបញ្ជាម៉ាស៊ីនបូម - Pump Command (JSON)
```json
{
  "status": "ON",
  "type": "WATER",
  "duration": 300
}
```

---

## ៤. ការតភ្ជាប់ជាមួយ External API (External API Integrations)
ប្រព័ន្ធរបស់យើងប្រើប្រាស់ External API ខ្លាំងៗដើម្បីផ្តល់នូវភាពឆ្លាតវៃ ការដឹងពីអាកាសធាតុ និងការទំនាក់ទំនងប្រកបដោយសុវត្ថិភាព។

### 🌌 Google Gemini API (LLM)
ប្រើប្រាស់ដោយ AI Service សម្រាប់ការវិភាគលើកសិកម្ម និង Chatbot។
- **Model**: `gemini-1.5-flash` (រហ័ស និងមានភាពត្រឹមត្រូវខ្ពស់)។
- **មុខងារ**: វិភាគទិន្នន័យ NPK/Moisture ដើម្បីផ្តល់ដំបូន្មានជាភាសាខ្មែរ និងអង់គ្លេស។
- **Endpoint**: រួមបញ្ចូលក្នុង `/api/ai/chat` និង `/api/ai/interpret`។
- **Environment Key**: `GEMINI_API_KEY`

### 🌦️ OpenWeatherMap API
ផ្តល់ទិន្នន័យអាកាសធាតុពិតៗ និងការព្យាករណ៍ដើម្បីបង្កើនប្រសិទ្ធភាពការស្រោចស្រព។
- **Endpoints**: `weather` (ស្ថានភាពបច្ចុប្បន្ន) និង `forecast` (ការព្យាករណ៍ ៥ ថ្ងៃ)។
- **ការតភ្ជាប់**: Backend ទាញយកទិន្នន័យ រួចរក្សាទុក (Cache) រយៈពេល ៣០ នាទី។
- **Environment Key**: `OPENWEATHER_API_KEY`

### ⚡ Supabase API (Auth & Database)
គ្រប់គ្រងសុវត្ថិភាពអ្នកប្រើប្រាស់ និងការរក្សាទុកទិន្នន័យ។
- **Auth**: ការចូលប្រើប្រាស់ និងចុះឈ្មោះតាមរយៈ JWT។
- **Database**: PostgreSQL ជាមួយនឹង Row-Level Security (RLS)។
- **Environment Keys**: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`

### 🤖 Telegram Bot API
ប្រព័ន្ធផ្តល់ដំណឹងដែលអាចទុកចិត្តបានសម្រាប់ស្ថានភាពសំខាន់ៗក្នុងចំការ។
- **មុខងារ**: ផ្ញើសារជូនដំណឹងជាភាសាខ្មែរដោយស្វ័យប្រវត្តិ នៅពេលសំណើមដីទាបខ្លាំង ឬនៅពេល AI បញ្ជាម៉ាស៊ីនបូម។
- **Method**: `sendMessage` (តាមរយៈ Bot Token)។
- **Environment Keys**: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`

---
*ធ្វើបច្ចុប្បន្នភាពចុងក្រោយ៖ ខែកុម្ភៈ ឆ្នាំ២០២៦*
