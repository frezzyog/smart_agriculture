# AI Training & Inference Details (៧.៤ ព័ត៌មានលម្អិតនៃការបង្វឹក)

## ភាសាខ្មែរ (Khmer)
AI ប្រើប្រាស់វិធីសាស្ត្រ **In-Context Learning** ដោយបញ្ចូលទិន្នន័យ **JSON Telemetry** ទៅក្នុង **Prompt** សម្រាប់ការវិភាគ និងផ្ដល់អនុសាសន៍ក្នុងពេលជាក់ស្តែង (**Real-Time Inference**)។

### ការកំណត់ប៉ារ៉ាម៉ែត្រ (Hyperparameters):
- **Temperature**: 0.7
- **Top-P**: 0.9
- **Output Token Limit**: 800

### ហេដ្ឋារចនាសម្ព័ន្ធ (Infrastructure):
- **Inference**: ត្រូវបានអនុវត្តនៅលើ **Cloud Infrastructure** (Google Cloud/Gemini API)។
- **Local Testing**: ប្រើប្រាស់ **Local GPU Environment** សម្រាប់ការអភិវឌ្ឍ និងតេស្តសាកល្បង។

---

## English
The AI utilizes **In-Context Learning** by injecting **JSON Telemetry** into the **Prompt** for **Real-Time Inference**.

### Hyperparameters:
- **Temperature**: 0.7
- **Top-P**: 0.9
- **Output Token Limit**: 800

### Infrastructure:
- **Inference**: Implemented on **Cloud Infrastructure** (Google Cloud via Gemini API).
- **Local Testing**: Utilizes a **Local GPU Environment** for development and testing.
