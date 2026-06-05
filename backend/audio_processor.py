"""Audio Feature Extraction Module"""

import numpy as np
import librosa
from typing import Tuple, List
import logging

logger = logging.getLogger(__name__)

class AudioProcessor:
    """Handles audio loading and feature extraction"""
    
    def __init__(self, sr=22050, duration=10):
        self.sr = sr
        self.duration = duration
        self.max_samples = sr * duration
    
    def load_audio(self, file_path: str) -> np.ndarray:
        """
        Load audio file and resample to target sample rate
        
        Args:
            file_path: Path to audio file
            
        Returns:
            Audio time series
        """
        try:
            y, sr = librosa.load(file_path, sr=self.sr, duration=self.duration)
            logger.info(f"Loaded audio: {file_path}, shape: {y.shape}")
            return y
        except Exception as e:
            logger.error(f"Error loading audio {file_path}: {str(e)}")
            raise
    
    def extract_mfcc(self, y: np.ndarray, n_mfcc: int = 40) -> np.ndarray:
        """
        Extract Mel-Frequency Cepstral Coefficients (MFCCs)
        
        Args:
            y: Audio time series
            n_mfcc: Number of MFCCs to extract
            
        Returns:
            MFCC feature matrix (n_mfcc, time_steps)
        """
        mfcc = librosa.feature.mfcc(y=y, sr=self.sr, n_mfcc=n_mfcc)
        return mfcc
    
    def extract_mel_spectrogram(self, y: np.ndarray) -> np.ndarray:
        """
        Extract Mel-scale spectrogram
        
        Args:
            y: Audio time series
            
        Returns:
            Mel spectrogram
        """
        mel_spec = librosa.feature.melspectrogram(y=y, sr=self.sr)
        mel_spec_db = librosa.power_to_db(mel_spec, ref=np.max)
        return mel_spec_db
    
    def extract_spectral_features(self, y: np.ndarray) -> dict:
        """
        Extract spectral features
        
        Args:
            y: Audio time series
            
        Returns:
            Dictionary of spectral features
        """
        features = {}
        
        # Spectral centroid
        features['spectral_centroid'] = librosa.feature.spectral_centroid(y=y, sr=self.sr).mean()
        
        # Spectral rolloff
        features['spectral_rolloff'] = librosa.feature.spectral_rolloff(y=y, sr=self.sr).mean()
        
        # Zero crossing rate
        features['zero_crossing_rate'] = librosa.feature.zero_crossing_rate(y).mean()
        
        # RMS energy
        features['rms_energy'] = librosa.feature.rms(y=y).mean()
        
        return features
    
    def extract_temporal_features(self, y: np.ndarray) -> dict:
        """
        Extract temporal features
        
        Args:
            y: Audio time series
            
        Returns:
            Dictionary of temporal features
        """
        features = {}
        
        # Tempo and beat frames
        onset_env = librosa.onset.onset_strength(y=y, sr=self.sr)
        features['onset_strength'] = onset_env.mean()
        features['onset_std'] = onset_env.std()
        
        # Tempogram
        tempogram = librosa.feature.tempogram(onset_env=onset_env, sr=self.sr)
        features['tempogram_mean'] = tempogram.mean()
        
        return features
    
    def extract_all_features(self, file_path: str) -> Tuple[np.ndarray, dict]:
        """
        Extract all audio features
        
        Args:
            file_path: Path to audio file
            
        Returns:
            Tuple of (combined_features, feature_dict)
        """
        try:
            y = self.load_audio(file_path)
            
            # Extract features
            mfcc = self.extract_mfcc(y)
            spectral_feats = self.extract_spectral_features(y)
            temporal_feats = self.extract_temporal_features(y)
            
            # Combine MFCC statistics
            mfcc_mean = mfcc.mean(axis=1)
            mfcc_std = mfcc.std(axis=1)
            
            # Stack all features
            feature_vector = np.concatenate([
                mfcc_mean,
                mfcc_std,
                list(spectral_feats.values()),
                list(temporal_feats.values())
            ])
            
            feature_dict = {
                'mfcc_mean': mfcc_mean.tolist(),
                'mfcc_std': mfcc_std.tolist(),
                'spectral_features': spectral_feats,
                'temporal_features': temporal_feats,
                'shape': feature_vector.shape
            }
            
            logger.info(f"Extracted features: shape {feature_vector.shape}")
            return feature_vector, feature_dict
            
        except Exception as e:
            logger.error(f"Error extracting features: {str(e)}")
            raise

# Singleton instance
audio_processor = AudioProcessor()
