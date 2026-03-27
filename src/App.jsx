import React, { useState, useCallback, useEffect } from 'react';
import { EMOTIONS } from './constants';
import { generatePlaylist, detectEmotionFromImage, detectEmotionFromAudio } from './services/Service';
import EmotionSelector from './components/EmotionSelector';
import PlaylistDisplay from './components/PlaylistDisplay';
import Loader from './components/Loader';
import CameraView from './components/CameraView';
import AudioView from './components/AudioView';
import ProfileView from './components/ProfileView';

const OfflineBanner = () => (<div className="fixed top-0 left-0 right-0 bg-slate-800 border-b border-yellow-500/30 text-center p-2 text-sm text-yellow-300 z-50 flex items-center justify-center shadow-lg" role="status">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636a9 9 0 010 12.728m-2.828-2.828a5 5 0 010-7.072m-2.828-2.828a1 1 0 010-1.414A1 1 0 0111.314 3a1 1 0 011.414 0l.001.001.001.001a1 1 0 010 1.414m-2.828 2.828a1 1 0 010 1.414m-2.829-1.414a5 5 0 000 7.072m-2.828 2.828a9 9 0 0012.728 0M1 1l22 22"/>
        </svg>
        You are currently offline. Some features are unavailable.
    </div>);

const App = () => {
    const [view, setView] = useState('home');
    const [currentEmotion, setCurrentEmotion] = useState(null);
    const [playlist, setPlaylist] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [error, setError] = useState(null);
    const [isOffline, setIsOffline] = useState(!navigator.onLine);

    useEffect(() => {
        const handleOnline = () => {
            setIsOffline(false);
            setError(null);
        };
        const handleOffline = () => setIsOffline(true);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const handleEmotionSelect = useCallback(async (emotion) => {
        if (isOffline) {
            setError("You're offline. Please connect to the internet to generate a playlist.");
            return;
        }
        setCurrentEmotion(emotion);
        setLoadingMessage(`Finding the perfect ${emotion.name.toLowerCase()} tracks for you...`);
        setIsLoading(true);
        setError(null);
        setPlaylist([]);
        setView('playlist');
        try {
            const newPlaylist = await generatePlaylist(emotion.name);
            setPlaylist(newPlaylist);
        }
        catch (err) {
            console.error("Playlist generation error:", err);
            setError(err instanceof Error ? err.message : 'An unknown error occurred while generating your playlist.');
        }
        finally {
            setIsLoading(false);
        }
    }, [isOffline]);

    const handleReset = useCallback(() => {
        setCurrentEmotion(null);
        setPlaylist([]);
        setError(null);
        setIsLoading(false);
        setView('home');
    }, []);

    const handleCapture = useCallback(async (imageData) => {
        if (isOffline) {
            setError("You're offline. Please connect to the internet to analyze images.");
            setView('home');
            return;
        }
        setView('home');
        setLoadingMessage('Analyzing your emotion...');
        setIsLoading(true);
        setError(null);
        try {
            const detectedEmotionName = await detectEmotionFromImage(imageData);
            const matchedEmotion = EMOTIONS.find(e => e.name.toLowerCase() === detectedEmotionName.toLowerCase()) || 
                                   EMOTIONS.find(e => e.name === 'Joy');
            
            if (matchedEmotion) {
                await handleEmotionSelect(matchedEmotion);
            }
            else {
                throw new Error("Could not process your image. Please try again.");
            }
        }
        catch (err) {
            console.error("Emotion detection (image) error:", err);
            setError(err instanceof Error ? err.message : 'An unknown error occurred while analyzing your image.');
            setIsLoading(false);
        }
    }, [handleEmotionSelect, isOffline]);

    const handleAudioCapture = useCallback(async ({ audioData, mimeType, aerFeatures }) => {
        if (isOffline) {
            setError("You're offline. Please connect to the internet to analyze audio.");
            setView('home');
            return;
        }
        setView('home');
        setLoadingMessage('Analyzing your voice...');
        setIsLoading(true);
        setError(null);
        try {
            const detectedEmotionName = await detectEmotionFromAudio(audioData, mimeType, aerFeatures);
            const matchedEmotion = EMOTIONS.find(e => e.name.toLowerCase() === detectedEmotionName.toLowerCase()) || 
                                   EMOTIONS.find(e => e.name === 'Joy');
            
            if (matchedEmotion) {
                await handleEmotionSelect(matchedEmotion);
            }
            else {
                throw new Error("Could not process your audio. Please try again.");
            }
        }
        catch (err) {
            console.error("Emotion detection (audio) error:", err);
            setError(err instanceof Error ? err.message : 'An unknown error occurred while analyzing your voice.');
            setIsLoading(false);
        }
    }, [handleEmotionSelect, isOffline]);

    const handleCameraError = useCallback((errorMessage) => {
        setError(errorMessage);
        setView('home');
    }, []);

    const handleAudioError = useCallback((errorMessage) => {
        setError(errorMessage);
        setView('home');
    }, []);

    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchActive, setIsSearchActive] = useState(false);

    const renderContent = () => {
        if (isLoading) {
            return <div className="h-full w-full flex items-center justify-center"><Loader message={loadingMessage}/></div>;
        }
        if (error) {
            return (
            <div className="h-full w-full flex items-center justify-center p-8">
                <div className="text-center bg-[#282828] border border-red-500/30 rounded-2xl p-8 max-w-lg shadow-2xl" role="alert">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                  </svg>
                  <h2 className="text-2xl font-bold text-white mb-2">An Error Occurred</h2>
                  <p className="text-[#a7a7a7] text-md mb-6">{error}</p>
                  <button onClick={handleReset} className="bg-white hover:scale-105 text-black font-bold py-3 px-8 rounded-full transition-transform">
                    Try Again
                  </button>
                </div>
            </div>
            );
        }

        switch (view) {
            case 'profile':
                return <ProfileView onBack={() => setView('home')} />;
            case 'camera':
                return <div className="h-full w-full flex items-center justify-center overflow-y-auto"><CameraView onCapture={handleCapture} onClose={handleReset} onError={handleCameraError}/></div>;
            case 'mic':
                return <div className="h-full w-full flex items-center justify-center overflow-y-auto"><AudioView onCapture={handleAudioCapture} onClose={handleReset} onError={handleAudioError}/></div>;
            case 'playlist':
                return <PlaylistDisplay playlist={playlist} emotion={currentEmotion} onReset={handleReset}/>;
            case 'library':
                return (
                    <div className="flex-1 p-8">
                        <h2 className="text-3xl font-black mb-8 uppercase tracking-tighter">Your Library</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div onClick={() => setView('home')} className="bg-[#181818] p-4 rounded-xl hover:bg-[#282828] cursor-pointer transition-all group">
                                <div className="aspect-square bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg mb-4 flex items-center justify-center shadow-lg">
                                    <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                                </div>
                                <h3 className="font-bold">Liked Songs</h3>
                                <p className="text-sm text-[#a7a7a7]">Playlist • 0 songs</p>
                            </div>
                        </div>
                    </div>
                );
            case 'home':
            default:
                return <EmotionSelector emotions={EMOTIONS} onSelect={handleEmotionSelect} onOpenCamera={() => setView('camera')} onOpenMic={() => setView('mic')} isOffline={isOffline}/>;
        }
    };

    return (
    <div className="h-screen w-screen bg-black text-white flex flex-col font-sans overflow-hidden p-2 gap-2">
        {isOffline && <OfflineBanner />}
        
        <div className="flex-1 flex gap-2 min-h-0 w-full relative">
            {/* Left Sidebar */}
            <nav className="w-80 bg-[#121212] rounded-lg hidden md:flex flex-col">
                <div className="p-6 space-y-6">
                    <div onClick={handleReset} className="flex items-center space-x-2 cursor-pointer font-bold text-2xl tracking-tight text-white transition-colors">
                        <img src="/logo.png" alt="EmotiTunes Logo" className="w-8 h-8 rounded-full shadow-lg" />
                        <span>EmotiTunes</span>
                    </div>

                    <div className="space-y-4 font-bold text-[#a7a7a7]">
                        <div onClick={handleReset} className={`flex items-center space-x-4 cursor-pointer hover:text-white transition-colors ${view === 'home' ? 'text-white' : ''}`}>
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12.5 3.247a1 1 0 00-1 0L4 7.577V20h4.5v-6a1 1 0 011-1h5a1 1 0 011-1v6H20V7.577l-7.5-4.33zm-2-1.732a3 3 0 013 0l7.5 4.33a2 2 0 011 1.732V21a1 1 0 01-1 1h-6.5a1 1 0 01-1-1v-6h-3v6a1 1 0 01-1 1H3a1 1 0 01-1-1V7.577a2 2 0 011-1.732l7.5-4.33z"/></svg>
                            <span>Home</span>
                        </div>
                    </div>
                </div>

                <div className="mx-4 mt-2 mb-4 border-t border-[#282828]"></div>

                <div className="px-6 flex-1 text-[#a7a7a7] font-semibold flex flex-col space-y-4">
                    <div onClick={() => setView('library')} className={`flex items-center space-x-4 cursor-pointer hover:text-white transition-colors ${view === 'library' ? 'text-white' : ''}`}>
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M14.5 2.134v-2c5.968.225 10.775 5.032 11 11h-2c-.221-4.869-4.131-8.779-9-9zM3 10V8A10.007 10.007 0 0 1 12 2.05V4a8.006 8.006 0 0 0-7.85 7.85H2v-1.85zM2 13v1.85A10.007 10.007 0 0 0 12 21.95v-1.95A8.006 8.006 0 0 1 4.15 12.15H2V13zm12.5 8.866v2c5.968-.225 10.775-5.032 11-11h-2c-.221 4.869-4.131-8.779-9 9zM12 14v4a2 2 0 0 0 2 2h3v-2h-3v-4h2.5L12 9 7.5 14H10z"/></svg>
                        <span>Your Library</span>
                    </div>

                    <div onClick={handleReset} className="flex items-center space-x-4 cursor-pointer hover:text-white transition-colors mt-6 pt-4 group">
                        <div className="w-6 h-6 bg-[#b3b3b3] group-hover:bg-white text-black flex items-center justify-center transition-colors">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M11 11v-11h1v11h11v1h-11v11h-1v-11h-11v-1h11z" stroke="currentColor" strokeWidth="1"/></svg>
                        </div>
                        <span>Create Playlist</span>
                    </div>
                </div>
            </nav>

            {/* Main Center UI */}
            <main className="flex-1 bg-[#121212] rounded-lg relative overflow-hidden flex flex-col">
                {/* Top Nav Header inside main box */}
                <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between px-6 z-20 pointer-events-none">
                     <div className="flex items-center space-x-4 pointer-events-auto">
                         <div className="flex space-x-2">
                             <button onClick={handleReset} className="w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white/70 hover:text-white"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg></button>
                             <button className="w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white/70 hover:text-white opacity-50"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg></button>
                         </div>
                         
                         {/* Search Bar in Nav */}
                         <div className="relative flex items-center group">
                            <button 
                                onClick={() => setIsSearchActive(!isSearchActive)}
                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isSearchActive ? 'bg-white text-black' : 'bg-black/40 text-[#a7a7a7] hover:text-white hover:scale-105'}`}
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M10.533 1.27893C5.242 1.27893 1 5.49893 1 10.7489C1 15.9989 5.242 20.2189 10.533 20.2189C12.636 20.2189 14.57 19.5389 16.14 18.3989L21.293 23.5089C21.684 23.8989 22.316 23.8989 22.707 23.5089C23.098 23.1189 23.098 22.4889 22.707 22.0989L17.65 17.0789C19.117 15.4289 20.066 13.1989 20.066 10.7489C20.066 5.49893 15.824 1.27893 10.533 1.27893ZM10.533 3.27893C14.73 3.27893 18.066 6.57893 18.066 10.7489C18.066 14.9189 14.73 18.2189 10.533 18.2189C6.335 18.2189 3 14.9189 3 10.7489C3 6.57893 6.335 3.27893 10.533 3.27893Z"/></svg>
                            </button>
                            
                            <div className={`overflow-hidden transition-all duration-300 ease-in-out flex items-center ${isSearchActive ? 'max-w-xs ml-3 opacity-100' : 'max-w-0 opacity-0'}`}>
                                <input 
                                    type="text" 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search songs, moods..." 
                                    className="bg-white/10 border-none rounded-full py-2 px-4 text-white text-sm w-64 focus:ring-1 focus:ring-white/30 transition-all outline-none" 
                                    autoFocus={isSearchActive}
                                />
                            </div>
                         </div>
                     </div>
                     
                     <div className="flex space-x-4 pointer-events-auto items-center">
                         <button className="bg-white text-black font-bold px-4 py-1.5 rounded-full text-sm hover:scale-105 transition-transform hidden sm:block shadow-xl">Explore Premium</button>
                         <button onClick={() => setView('profile')} className={`w-8 h-8 rounded-full bg-[#282828] text-white flex items-center justify-center border border-[#333] hover:scale-105 transition-transform ${view === 'profile' ? 'ring-2 ring-white' : ''} shadow-lg`}>
                             <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Rishit%20Ranjan`} alt="U" className="w-full h-full rounded-full" />
                         </button>
                     </div>
                </div>

                {renderContent()}
            </main>
        </div>
    </div>
    );
};

export default App;
