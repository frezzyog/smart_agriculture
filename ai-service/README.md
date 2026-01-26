# Python AI Service

AI/ML service for Smart Agriculture 4.0

## Setup

### 1. Create Virtual Environment

```bash
python -m venv venv
```

### 2. Activate Virtual Environment

**Windows:**
```bash
venv\Scripts\activate
```

**Linux/Mac:**
```bash
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment

Create `.env` file with your configuration (see `.env` for template)

### 5. Run Server

```bash
python app.py
```

Or with uvicorn directly:
```bash
uvicorn app:app --reload --port 8000
```

## API Endpoints

### Health Check
- `GET /` - Service info
- `GET /api/health` - Health status

### AI Interpretation
- `POST /api/ai/interpret` - Real-time sensor data interpretation

### Predictions
- `POST /api/ai/predict/irrigation` - Irrigation predictions
- `POST /api/ai/predict/fertilizer` - Fertilizer predictions

### Optimization
- `POST /api/ai/optimize/zones` - Multi-zone optimization

## Development

Models are in `models/` directory:
- `irrigation_predictor.py` - Irrigation forecasting
- `fertilizer_predictor.py` - NPK depletion prediction
- `zone_optimizer.py` - Resource allocation optimization

Utilities in `utils/`:
- `data_processor.py` - Sensor data analysis

## Future Enhancements

- [ ] Implement Prophet/LSTM for time-series forecasting
- [ ] Add model training pipeline
- [ ] Connect to PostgreSQL for historical data
- [ ] Add caching for predictions
- [ ] Implement model versioning
- [ ] Add comprehensive testing
