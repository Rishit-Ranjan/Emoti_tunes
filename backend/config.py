"""Configuration settings for Emoti_Tunes backend"""

import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Base configuration"""
    DEBUG = False
    TESTING = False
    
    # Audio settings
    AUDIO_SAMPLE_RATE = 22050
    AUDIO_DURATION = 10  # seconds
    AUDIO_N_MFCC = 40
    AUDIO_N_FFT = 2048
    AUDIO_HOP_LENGTH = 512
    
    # Emotion classes
    EMOTIONS = ['sadness', 'joy', 'anger', 'surprise', 'excitement']
    EMOTION_MAP = {
        'sadness': 'calm',
        'joy': 'happy',
        'anger': 'energetic',
        'surprise': 'uplifting',
        'excitement': 'energetic'
    }
    
    # Model paths
    MODEL_DIR = os.path.join(os.path.dirname(__file__), 'models')
    EMOTION_MODEL_PATH = os.path.join(MODEL_DIR, 'emotion_classifier.h5')
    
    # CORS settings
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:5173,http://localhost:3000').split(',')
    
    # API settings
    MAX_AUDIO_SIZE = 50 * 1024 * 1024  # 50MB
    UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')
    
    # Ensure upload folder exists
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False

class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True
    DEBUG = True

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}
