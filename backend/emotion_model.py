"""Emotion Recognition Model Module"""

import numpy as np
import tensorflow as tf
from tensorflow import keras
from sklearn.preprocessing import StandardScaler
from typing import Dict, Tuple
import logging
import os
import json

logger = logging.getLogger(__name__)

class EmotionRecognizer:
    """Emotion recognition model handler"""
    
    EMOTIONS = [
        'sadness', 'joy', 'anger', 'surprise', 'excitement',
        'fear', 'disgust', 'neutral',  # Add new emotions
        'peaceful', 'melancholy'
    ]
    
    def __init__(self, model_path: str = None):
        self.model_path = model_path
        self.model = None
        self.scaler = StandardScaler()
        self.emotion_map = {
            'sadness': 'calm',
            'joy': 'happy',
            'anger': 'energetic',
            'surprise': 'uplifting',
            'excitement': 'energetic',
            'fear': 'energetic',      # New
            'disgust': 'energetic',   # New
            'neutral': 'mixed',       # New
            'peaceful': 'calm',       # New
            'melancholy': 'calm'      # New
        }
        self.is_loaded = False
        self._load_model()
    
    def _load_model(self):
        """Load pre-trained model or create a simple one"""
        if self.model_path and os.path.exists(self.model_path):
            try:
                self.model = keras.models.load_model(self.model_path)
                logger.info(f"Loaded model from {self.model_path}")
                self.is_loaded = True
            except Exception as e:
                logger.warning(f"Could not load model from {self.model_path}: {str(e)}")
                self._create_default_model()
        else:
            logger.info("Creating default emotion recognition model")
            self._create_default_model()
    
    def _create_default_model(self):
        """Create a default CNN-based emotion recognition model"""
        try:
            self.model = keras.Sequential([
                keras.layers.Input(shape=(102,)),  # 40 MFCC mean + 40 std + spectral/temporal features
                keras.layers.Dense(256, activation='relu'),
                keras.layers.BatchNormalization(),
                keras.layers.Dropout(0.3),
                keras.layers.Dense(128, activation='relu'),
                keras.layers.BatchNormalization(),
                keras.layers.Dropout(0.3),
                keras.layers.Dense(64, activation='relu'),
                keras.layers.BatchNormalization(),
                keras.layers.Dropout(0.2),
                keras.layers.Dense(len(self.EMOTIONS), activation='softmax')
            ])
            
            self.model.compile(
                optimizer=keras.optimizers.Adam(learning_rate=0.001),
                loss='categorical_crossentropy',
                metrics=['accuracy']
            )
            
            logger.info("Default model created successfully")
            self.is_loaded = True
            
        except Exception as e:
            logger.error(f"Error creating default model: {str(e)}")
            raise
    
    def predict_emotion(self, features: np.ndarray) -> Dict[str, any]:
        """
        Predict emotion from audio features
        
        Args:
            features: Audio feature vector
            
        Returns:
            Dictionary with predictions and confidence
        """
        if not self.is_loaded or self.model is None:
            raise RuntimeError("Model not loaded")
        
        try:
            # Ensure features are normalized
            if len(features.shape) == 1:
                features = features.reshape(1, -1)
            
            features_scaled = self.scaler.fit_transform(features)
            predictions = self.model.predict(features_scaled, verbose=0)
            
            emotion_idx = np.argmax(predictions[0])
            emotion = self.EMOTIONS[emotion_idx]
            confidence = float(predictions[0][emotion_idx])
            
            # Get playlist category
            playlist_mood = self.emotion_map.get(emotion, 'mixed')
            
            # Get all emotion probabilities
            emotion_scores = {
                self.EMOTIONS[i]: float(predictions[0][i])
                for i in range(len(self.EMOTIONS))
            }
            
            result = {
                'predicted_emotion': emotion,
                'confidence': confidence,
                'playlist_mood': playlist_mood,
                'all_emotions': emotion_scores,
                'model_version': 'v1.0'
            }
            
            logger.info(f"Prediction: {emotion} (confidence: {confidence:.2%})")
            return result
            
        except Exception as e:
            logger.error(f"Error predicting emotion: {str(e)}")
            raise
    
    def train_on_batch(self, features: np.ndarray, labels: np.ndarray, epochs: int = 10):
        """
        Fine-tune model on batch of data (for transfer learning)
        
        Args:
            features: Training features
            labels: One-hot encoded labels
            epochs: Number of epochs
        """
        if not self.is_loaded:
            raise RuntimeError("Model not loaded")
        
        try:
            features_scaled = self.scaler.fit_transform(features)
            history = self.model.fit(
                features_scaled, labels,
                epochs=epochs,
                batch_size=32,
                validation_split=0.1,
                verbose=1
            )
            logger.info("Model fine-tuned successfully")
            return history
        except Exception as e:
            logger.error(f"Error fine-tuning model: {str(e)}")
            raise
    
    def save_model(self, path: str):
        """Save model to disk"""
        if self.model:
            self.model.save(path)
            logger.info(f"Model saved to {path}")
    
    def get_model_info(self) -> Dict:
        """Get model information"""
        return {
            'emotions': self.EMOTIONS,
            'emotion_map': self.emotion_map,
            'model_loaded': self.is_loaded,
            'model_type': 'Sequential Neural Network',
            'input_shape': '(102,)',
            'output_shape': f'({len(self.EMOTIONS)},)'
        }

# Singleton instance
emotion_recognizer = None

def get_emotion_recognizer(model_path: str = None):
    """Get or create emotion recognizer instance"""
    global emotion_recognizer
    if emotion_recognizer is None:
        emotion_recognizer = EmotionRecognizer(model_path)
    return emotion_recognizer
