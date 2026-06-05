# Emoti_Tunes Backend - Production-Ready ML Setup

## Overview
Production-grade Flask API for emotion-based music playlist generation using:
- **Audio Emotion Recognition (AER)** - Detects emotions from audio features
- **Music Information Retrieval (MIR)** - Generates curated playlists based on emotions

## Architecture

```
Emoti_Tunes Backend/
├── app.py                    # Main Flask application
├── config.py                 # Configuration settings
├── audio_processor.py        # Audio feature extraction
├── emotion_model.py          # ML emotion classifier
├── playlist_generator.py     # Playlist generation engine
├── requirements.txt          # Python dependencies
├── .env                      # Environment variables
├── models/                   # Trained ML models
│   └── emotion_classifier.h5 # Pre-trained emotion model
├── uploads/                  # Temporary audio uploads
└── data/                     # Training data & datasets
```

## Setup Instructions

### 1. Create Virtual Environment
```bash
cd backend
python -m venv venv
source venv/Scripts/activate  # Windows
# or
source venv/bin/activate      # Linux/Mac
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Environment Configuration
Create `.env` file:
```
FLASK_ENV=development
FLASK_DEBUG=1
PORT=5000
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

For production:
```
FLASK_ENV=production
FLASK_DEBUG=0
PORT=5000
CORS_ORIGINS=https://your-production-domain.com
```

### 4. Run Development Server
```bash
python app.py
```

Server runs on `http://localhost:5000`

---

## API Endpoints

### Health Check
```
GET /api/health
```
Response:
```json
{
  "status": "healthy",
  "components": {
    "emotion_model": "loaded",
    "audio_processor": "ready",
    "playlist_generator": "ready"
  }
}
```

### 1. Emotion Recognition
```
POST /api/recognize-emotion
Content-Type: multipart/form-data

Body:
- file: [audio file]
```

Response:
```json
{
  "predicted_emotion": "joy",
  "confidence": 0.87,
  "playlist_mood": "happy",
  "all_emotions": {
    "sadness": 0.05,
    "joy": 0.87,
    "anger": 0.02,
    "surprise": 0.04,
    "excitement": 0.02
  }
}
```

### 2. Generate Playlist
```
POST /api/generate-playlist
Content-Type: application/json

Body:
{
  "emotion": "joy",
  "mood": "happy",
  "num_songs": 10
}
```

Response:
```json
{
  "emotion": "joy",
  "mood": "happy",
  "created_at": "2024-01-15T10:30:00.123456",
  "songs": [
    {
      "title": "Walking On Sunshine",
      "artist": "Katrina & The Waves",
      "duration": 240,
      "bpm": 128
    },
    ...
  ],
  "total_duration": 2400,
  "total_duration_formatted": "00:40:00",
  "song_count": 10
}
```

### 3. Complete Pipeline (Emotion + Playlist)
```
POST /api/analyze-and-generate
Content-Type: multipart/form-data

Body:
- file: [audio file]
- num_songs: 10 (optional)
```

Response:
```json
{
  "emotion_analysis": {
    "predicted_emotion": "joy",
    "confidence": 0.87,
    "playlist_mood": "happy",
    "all_emotions": {...}
  },
  "playlist": {
    "emotion": "joy",
    "mood": "happy",
    "songs": [...],
    "total_duration": 2400
  }
}
```

### 4. Model Information
```
GET /api/model/info
```

### 5. Playlist Information
```
GET /api/playlists/info
```

---

## Emotion Classification

The model classifies audio into 5 emotions:
- **sadness** → Playlist mood: `calm` (relaxing, soothing)
- **joy** → Playlist mood: `happy` (uplifting, positive)
- **anger** → Playlist mood: `energetic` (high-energy, powerful)
- **surprise** → Playlist mood: `uplifting` (inspirational)
- **excitement** → Playlist mood: `energetic` (fast-paced, dynamic)

---

## Audio Feature Extraction

Features extracted per audio file:
- **MFCC** (Mel-Frequency Cepstral Coefficients) - 40 coefficients + statistics
- **Spectral Features**:
  - Spectral Centroid
  - Spectral Rolloff
  - Zero Crossing Rate
  - RMS Energy
- **Temporal Features**:
  - Onset Strength
  - Tempogram

Total feature vector: **102 dimensions**

---

## Production Deployment

### Using Gunicorn
```bash
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### Docker Deployment
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]
```

### Environment Variables (Production)
```
FLASK_ENV=production
PORT=5000
CORS_ORIGINS=https://your-domain.com
```

---

## Fine-Tuning the Model

To improve accuracy on your specific dataset:

1. Prepare labeled audio data (emotion: audio file pairs)
2. Extract features from dataset
3. Fine-tune the model:

```python
from emotion_model import emotion_recognizer
from audio_processor import audio_processor

# Load your training data
features = []
labels = []
for audio_file, emotion_label in your_training_data:
    feat, _ = audio_processor.extract_all_features(audio_file)
    features.append(feat)
    labels.append(emotion_to_index(emotion_label))

# Fine-tune
emotion_recognizer.train_on_batch(features, labels, epochs=20)
emotion_recognizer.save_model('models/emotion_classifier_finetuned.h5')
```

---

## Performance Targets

- **Emotion Detection Accuracy**: 80-90%
- **Real-time Processing**: <1 second for 10-second audio
- **API Response Time**: <500ms (with model loaded)
- **Concurrent Requests**: 10+ (with gunicorn workers)

---

## Troubleshooting

### Model not loading
- Check `models/emotion_classifier.h5` exists
- Verify TensorFlow version compatibility

### Audio processing errors
- Ensure audio file is valid (mp3, wav, ogg, flac)
- Check file size < 50MB

### CORS errors
- Verify `CORS_ORIGINS` in `.env` matches your frontend domain
- Check Flask-CORS is installed

---

## Next Steps

1. **Collect Training Data**: Use RAVDESS, TESS, or custom labeled audio
2. **Fine-tune Model**: Improve accuracy on your specific use case
3. **Add Authentication**: Implement API key/JWT for production
4. **Monitor Performance**: Set up logging and metrics
5. **Scale**: Deploy with Docker/Kubernetes for high load

