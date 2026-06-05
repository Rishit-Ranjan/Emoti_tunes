"""Music Playlist Generator Module"""

import json
import os
import logging
from typing import List, Dict
from datetime import datetime

logger = logging.getLogger(__name__)

class PlaylistGenerator:
    """Generates playlists based on detected emotions"""
    
    def __init__(self):
        self.playlists = self._load_default_playlists()
    
    def _load_default_playlists(self) -> Dict[str, List[Dict]]:
        """Load default playlist database"""
        return {
            'calm': [
                {'title': 'Weightless', 'artist': 'Marconi Union', 'duration': 480, 'bpm': 60},
                {'title': 'Music for Airports', 'artist': 'Brian Eno', 'duration': 1260, 'bpm': 55},
                {'title': 'Sunrise', 'artist': 'Ólafur Arnalds', 'duration': 240, 'bpm': 65},
                {'title': 'Re: Stacks', 'artist': 'Bon Iver', 'duration': 300, 'bpm': 70},
                {'title': 'Nuvole Bianche', 'artist': 'Ludovico Einaudi', 'duration': 270, 'bpm': 68},
                {'title': 'River Flows in You', 'artist': 'Yiruma', 'duration': 240, 'bpm': 75},
                {'title': 'Clocks', 'artist': 'Coldplay', 'duration': 300, 'bpm': 130},
            ],
            'happy': [
                {'title': 'Walking On Sunshine', 'artist': 'Katrina & The Waves', 'duration': 240, 'bpm': 128},
                {'title': 'Good As Hell', 'artist': 'Lizzo', 'duration': 160, 'bpm': 98},
                {'title': 'Levitating', 'artist': 'Dua Lipa', 'duration': 203, 'bpm': 103},
                {'title': 'Good as it Gets', 'artist': 'Niki', 'duration': 222, 'bpm': 88},
                {'title': 'Electric Feel', 'artist': 'MGMT', 'duration': 234, 'bpm': 105},
                {'title': 'Walking in Sunshine', 'artist': 'Vampire Weekend', 'duration': 181, 'bpm': 120},
                {'title': 'Shut Up and Dance', 'artist': 'Walk the Moon', 'duration': 210, 'bpm': 115},
            ],
            'energetic': [
                {'title': 'Eye of the Tiger', 'artist': 'Survivor', 'duration': 246, 'bpm': 108},
                {'title': 'Pump It Up', 'artist': 'Endor', 'duration': 233, 'bpm': 128},
                {'title': 'Kickstart My Heart', 'artist': 'Mötley Crüe', 'duration': 239, 'bpm': 112},
                {'title': 'We Will Rock You', 'artist': 'Queen', 'duration': 302, 'bpm': 78},
                {'title': 'You Reap What You Sow', 'artist': 'The The', 'duration': 234, 'bpm': 110},
                {'title': 'Thunderstruck', 'artist': 'AC/DC', 'duration': 292, 'bpm': 120},
                {'title': 'Turn It Up', 'artist': 'Ruel', 'duration': 180, 'bpm': 110},
            ],
            'uplifting': [
                {'title': 'Here Comes the Sun', 'artist': 'The Beatles', 'duration': 185, 'bpm': 129},
                {'title': 'Three Little Birds', 'artist': 'Bob Marley', 'duration': 181, 'bpm': 76},
                {'title': 'Don\'t Stop Me Now', 'artist': 'Queen', 'duration': 236, 'bpm': 156},
                {'title': 'I Will Survive', 'artist': 'Gloria Gaynor', 'duration': 315, 'bpm': 117},
                {'title': 'Believer', 'artist': 'Imagine Dragons', 'duration': 204, 'bpm': 123},
                {'title': 'Titanium', 'artist': 'David Guetta ft. Sia', 'duration': 240, 'bpm': 128},
                {'title': 'Firework', 'artist': 'Katy Perry', 'duration': 214, 'bpm': 128},
            ],
            'mixed': [
                {'title': 'Bohemian Rhapsody', 'artist': 'Queen', 'duration': 354, 'bpm': 72},
                {'title': 'Stairway to Heaven', 'artist': 'Led Zeppelin', 'duration': 482, 'bpm': 82},
                {'title': 'Imagine', 'artist': 'John Lennon', 'duration': 183, 'bpm': 76},
                {'title': 'The Scientist', 'artist': 'Coldplay', 'duration': 307, 'bpm': 110},
                {'title': 'Hotel California', 'artist': 'Eagles', 'duration': 391, 'bpm': 75},
            ]
        }
    
    def generate_playlist(self, emotion: str, mood: str, num_songs: int = 10) -> Dict:
        """
        Generate a playlist based on detected emotion
        
        Args:
            emotion: Detected emotion (sadness, joy, anger, etc.)
            mood: Mood category (calm, happy, energetic, uplifting, mixed)
            num_songs: Number of songs to include
            
        Returns:
            Playlist dictionary
        """
        try:
            # Get songs for mood
            mood_songs = self.playlists.get(mood, self.playlists['mixed'])
            
            # Shuffle and limit to requested number
            import random
            selected_songs = random.sample(mood_songs, min(num_songs, len(mood_songs)))
            
            # Calculate total duration
            total_duration = sum(song['duration'] for song in selected_songs)
            
            playlist = {
                'emotion': emotion,
                'mood': mood,
                'created_at': datetime.now().isoformat(),
                'songs': selected_songs,
                'total_duration': total_duration,
                'total_duration_formatted': self._format_duration(total_duration),
                'song_count': len(selected_songs)
            }
            
            logger.info(f"Generated playlist for emotion: {emotion}, mood: {mood}, songs: {len(selected_songs)}")
            return playlist
            
        except Exception as e:
            logger.error(f"Error generating playlist: {str(e)}")
            raise
    
    def _format_duration(self, seconds: int) -> str:
        """Format duration in seconds to HH:MM:SS"""
        hours = seconds // 3600
        minutes = (seconds % 3600) // 60
        secs = seconds % 60
        return f"{hours:02d}:{minutes:02d}:{secs:02d}"
    
    def add_custom_playlist(self, name: str, songs: List[Dict]):
        """Add custom playlist"""
        self.playlists[name] = songs
        logger.info(f"Added custom playlist: {name} with {len(songs)} songs")
    
    def get_playlist_info(self) -> Dict:
        """Get available playlists info"""
        return {
            'available_moods': list(self.playlists.keys()),
            'mood_counts': {mood: len(songs) for mood, songs in self.playlists.items()}
        }

# Singleton instance
playlist_generator = PlaylistGenerator()
