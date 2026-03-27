import React, { useState, useEffect, useRef } from 'react';

const PlaylistDisplay = ({ playlist, emotion, onReset }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [player, setPlayer] = useState(null);
    const videoRef = useRef(null);
    const playerRef = useRef(null);

    const currentSong = playlist[currentIndex];

    // Load YouTube API
    useEffect(() => {
        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        }

        window.onYouTubeIframeAPIReady = () => {
            initPlayer();
        };

        if (window.YT && window.YT.Player) {
            initPlayer();
        }

        return () => {
            if (playerRef.current) {
                playerRef.current.destroy();
            }
        };
    }, []);

    const initPlayer = () => {
        if (playerRef.current) return;
        
        playerRef.current = new window.YT.Player('youtube-player', {
            height: '0',
            width: '0',
            videoId: currentSong?.youtubeId || '',
            playerVars: {
                'playsinline': 1,
                'controls': 0,
                'disablekb': 1,
                'fs': 0,
                'modestbranding': 1,
                'rel': 0
            },
            events: {
                'onReady': (event) => {
                    setPlayer(event.target);
                    setDuration(event.target.getDuration());
                },
                'onStateChange': (event) => {
                    // 1 = playing, 2 = paused, 0 = ended
                    if (event.data === window.YT.PlayerState.PLAYING) {
                        setIsPlaying(true);
                        setDuration(event.target.getDuration());
                    } else if (event.data === window.YT.PlayerState.PAUSED) {
                        setIsPlaying(false);
                    } else if (event.data === window.YT.PlayerState.ENDED) {
                        handleNext();
                    }
                }
            }
        });
    };

    // Update song when currentIndex changes
    useEffect(() => {
        if (player && currentSong?.youtubeId) {
            player.loadVideoById(currentSong.youtubeId);
            setIsPlaying(true);
        }
    }, [currentIndex, player]);

    // Update Progress
    useEffect(() => {
        let interval;
        if (isPlaying && player) {
            interval = setInterval(() => {
                const time = player.getCurrentTime();
                setCurrentTime(time);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isPlaying, player]);

    const togglePlayPause = () => {
        if (!player) return;
        if (isPlaying) {
            player.pauseVideo();
        } else {
            player.playVideo();
        }
    };

    const handleNext = () => {
        if (currentIndex < playlist.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            setIsPlaying(false);
        }
    };
    
    const handlePrev = () => currentIndex > 0 && setCurrentIndex(currentIndex - 1);

    const handleSeek = (e) => {
        const time = Number(e.target.value);
        setCurrentTime(time);
        if (player) player.seekTo(time, true);
    };

    const formatTime = (time) => {
        if (isNaN(time)) return "0:00";
        const m = Math.floor(time / 60);
        const s = Math.floor(time % 60);
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    // Helper for placeholder album art
    const getAlbumArt = (song, idx) => {
        return `https://picsum.photos/seed/${encodeURIComponent(song.title + idx)}/300/300`;
    };

    return (
    <div className="flex-1 w-full h-full bg-[#121212] flex flex-col font-sans text-[#b3b3b3] overflow-hidden animate-in fade-in duration-500 relative">
        
        {/* Hidden YT Container */}
        <div id="youtube-player" className="hidden"></div>

        {/* Main Scrolling Area */}
        <div className="flex-1 overflow-y-auto pb-32 scrollbar-hide">
            {/* Spotify-style Header Banner */}
            <div className={`pt-24 pb-8 px-8 bg-gradient-to-b ${emotion.gradient} to-[#121212]/0 flex items-end space-x-6 relative`}>
                <div className="absolute inset-0 bg-black/40 pointer-events-none"></div>
                
                {/* Playlist Art Cover */}
                <div className="w-48 h-48 md:w-56 md:h-56 shadow-[0_8px_40px_rgba(0,0,0,0.5)] bg-[#282828] relative z-10 flex-shrink-0 group overflow-hidden">
                    <img 
                        src={getAlbumArt(currentSong || {title: 'Playlist'}, 99)} 
                        alt="Playlist Cover" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors"></div>
                </div>

                <div className="relative z-10">
                    <p className="uppercase text-xs font-bold tracking-widest text-white mb-2">Public Playlist</p>
                    <h1 className="text-5xl md:text-8xl font-black text-white mb-6 tracking-tighter leading-none">{emotion.name} Vibes</h1>
                    <div className="flex items-center space-x-2 text-sm font-semibold text-white/90">
                        <img src="/logo.png" className="w-6 h-6 rounded-full" alt="Logo" />
                        <span className="font-bold cursor-pointer hover:underline">EmotiTunes</span>
                        <span>• {playlist.length} songs, approx. 45 min</span>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="px-8 bg-gradient-to-b from-black/20 to-[#121212] pt-6 flex-1 min-h-screen">
                
                {/* Big Action Buttons */}
                <div className="flex items-center space-x-8 mb-8">
                    <button 
                        onClick={togglePlayPause} 
                        className="w-14 h-14 rounded-full bg-[#1db954] hover:bg-[#1ed760] hover:scale-105 transition-all text-black flex items-center justify-center shadow-xl active:scale-95"
                    >
                        {isPlaying ? (
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                        ) : (
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 ml-1"><path d="M8 5v14l11-7z"/></svg>
                        )}
                    </button>

                    <button className="text-[#a7a7a7] hover:text-white transition-colors">
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                    </button>
                    
                    <button onClick={onReset} className="text-[#a7a7a7] hover:text-white transition-colors">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></svg>
                    </button>
                </div>

                {/* Track List Header */}
                <div className="grid grid-cols-[16px_1fr_1fr] md:grid-cols-[16px_4fr_3fr_1fr] gap-4 px-4 py-2 border-b border-white/10 text-xs font-bold tracking-[.1em] text-[#a7a7a7] uppercase mb-4">
                    <div className="text-center font-normal">#</div>
                    <div>Title</div>
                    <div className="hidden md:block">Album</div>
                    <div className="text-right"><svg className="w-4 h-4 inline-block" fill="currentColor" viewBox="0 0 16 16"><path d="M8 3.5a.5.5 0 00-1 0V9a.5.5 0 00.252.434l3.5 2a.5.5 0 00.496-.868L8 8.71V3.5z"/></svg></div>
                </div>

                {/* Tracks */}
                <div className="space-y-1 mb-20">
                    {playlist.map((song, index) => {
                        const isCurrentlyPlaying = index === currentIndex;
                        return (
                            <div 
                                key={index} 
                                onClick={() => setCurrentIndex(index)} 
                                className={`group grid grid-cols-[16px_1fr_1fr] md:grid-cols-[16px_4fr_3fr_1fr] gap-4 px-4 py-2 rounded-md hover:bg-white/10 transition-colors cursor-pointer items-center ${isCurrentlyPlaying ? 'bg-white/10' : ''}`}
                            >
                                <div className="text-center">
                                    {isCurrentlyPlaying && isPlaying ? (
                                        <img src="https://open.spotifycdn.com/cdn/images/equaliser-animated-green.f93a2ef4.gif" alt="playing" className="w-4 h-4 mx-auto" />
                                    ) : (
                                        <span className={`text-sm ${isCurrentlyPlaying ? 'text-[#1db954]' : 'text-[#a7a7a7] group-hover:hidden'}`}>{index + 1}</span>
                                    )}
                                    {!isCurrentlyPlaying && (
                                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-white hidden group-hover:block mx-auto"><path d="M8 5v14l11-7z"/></svg>
                                    )}
                                </div>
                                <div className="flex items-center min-w-0">
                                    <div className="w-10 h-10 bg-[#282828] flex-shrink-0 mr-4 shadow-lg overflow-hidden">
                                        <img src={getAlbumArt(song, index)} alt="Art" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="truncate">
                                        <div className={`font-semibold text-base truncate ${isCurrentlyPlaying ? 'text-[#1db954]' : 'text-white'}`}>{song.title}</div>
                                        <div className="text-sm text-[#a7a7a7] group-hover:text-white truncate">{song.artist}</div>
                                    </div>
                                </div>
                                <div className="hidden md:block text-sm text-[#a7a7a7] group-hover:text-white truncate">
                                    {song.title} Special Mix
                                </div>
                                <div className="text-right text-xs text-[#a7a7a7]">
                                    3:45
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
        
        {/* Fixed Player Bar (Bottom) */}
        <div className="fixed bottom-0 left-0 right-0 h-24 bg-black border-t border-white/5 px-4 flex items-center justify-between z-50">
            {/* Left Box: Current Track Info */}
            <div className="flex-[0.3] flex items-center min-w-0">
                <div className="w-14 h-14 bg-[#282828] flex-shrink-0 mr-4 rounded shadow-lg overflow-hidden group relative">
                    <img src={getAlbumArt(currentSong || {}, currentIndex)} alt="Art" className="w-full h-full object-cover" />
                    <button className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 bg-black/50 rounded-full p-1"><svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg></button>
                </div>
                <div className="truncate pr-4">
                    <div className="text-white text-sm font-bold hover:underline cursor-pointer truncate">{currentSong?.title}</div>
                    <div className="text-xs text-[#a7a7a7] hover:text-white hover:underline cursor-pointer transition-colors mt-0.5 truncate">{currentSong?.artist}</div>
                </div>
                <button className="text-[#a7a7a7] hover:text-[#1db954] transition-colors"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg></button>
            </div>

            {/* Middle Box: Controls */}
            <div className="flex-[0.4] max-w-2xl flex flex-col items-center justify-center -mt-2">
                <div className="flex items-center space-x-6 mb-2">
                    <button className="text-[#a7a7a7] hover:text-white transition-colors"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 16 16"><path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41zm-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9z"/><path d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9a5.002 5.002 0 0 0-4.9-4zM3.108 9a5.002 5.002 0 0 0 4.9 4c1.552 0 2.94-.707 3.857-1.818a.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9H3.108z"/></svg></button>
                    
                    <button onClick={handlePrev} className="text-[#a7a7a7] hover:text-white disabled:opacity-30 transition-colors" disabled={currentIndex === 0}>
                        <svg fill="currentColor" viewBox="0 0 16 16" className="w-5 h-5"><path d="M3.3 1a.7.7 0 01.7.7v5.15l9.95-5.744a.7.7 0 011.05.606v12.575a.7.7 0 01-1.05.607L4 9.149V14.3a.7.7 0 01-1.4 0V1.7a.7.7 0 01.7-.7z"/></svg>
                    </button>
                    
                    <button 
                        onClick={togglePlayPause} 
                        className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 shadow-lg active:scale-90 transition-all"
                    >
                        {isPlaying ? (
                            <svg fill="currentColor" viewBox="0 0 16 16" className="w-5 h-5"><path fillRule="evenodd" d="M2.7 1a.7.7 0 00-.7.7v12.6a.7.7 0 00.7.7h2.6a.7.7 0 00.7-.7V1.7a.7.7 0 00-.7-.7H2.7zm8 0a.7.7 0 00-.7.7v12.6a.7.7 0 00.7.7h2.6a.7.7 0 00.7-.7V1.7a.7.7 0 00-.7-.7h-2.6z"/></svg>
                        ) : (
                            <svg fill="currentColor" viewBox="0 0 16 16" className="w-4 h-4 ml-0.5"><path d="M3 1.713a.7.7 0 011.05-.607l10.89 6.288a.7.7 0 010 1.212L4.05 14.894A.7.7 0 013 14.288V1.713z"/></svg>
                        )}
                    </button>

                    <button onClick={handleNext} className="text-[#a7a7a7] hover:text-white disabled:opacity-30 transition-colors" disabled={currentIndex === playlist.length - 1}>
                        <svg fill="currentColor" viewBox="0 0 16 16" className="w-5 h-5"><path d="M12.7 1a.7.7 0 00-.7.7v5.15L2.05 1.107A.7.7 0 001 1.712v12.575a.7.7 0 001.05.607L12 9.149V14.3a.7.7 0 001.4 0V1.7a.7.7 0 00-.7-.7z"/></svg>
                    </button>

                    <button className="text-[#a7a7a7] hover:text-white transition-colors"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 16 16"><path d="M11 5.466V1.7a.7.7 0 1 1 1.4 0v4a.7.7 0 0 1-.7.7H7.7a.7.7 0 0 1 0-1.4h3.3zm-6.067.97a.7.7 0 0 1 0 1.4H1.7a.7.7 0 1 1 0-1.4h3.233zM11 10.534V14.3a.7.7 0 0 1-1.4 0v-4a.7.7 0 0 1 .7-.7h4a.7.7 0 0 1 0 1.4H11zm-6.067-.97a.7.7 0 0 1 0-1.4H1.7a.7.7 0 1 1 0-1.4h3.233z"/></svg></button>
                </div>
                
                {/* Functional Timeline bar */}
                <div className="w-full flex items-center justify-center space-x-2 text-xs text-[#a7a7a7] group">
                    <span className="w-8 text-right font-mono">{formatTime(currentTime)}</span>
                    <input 
                        type="range" 
                        min="0" 
                        max={duration || 210} 
                        value={currentTime || 0} 
                        onChange={handleSeek}
                        className="flex-1 max-w-sm h-1 bg-[#4d4d4d] rounded-full appearance-none cursor-pointer accent-white hover:accent-[#1db954] outline-none transition-all group-hover:h-1.5" 
                        style={{ backgroundSize: `${(currentTime / (duration || 210)) * 100}% 100%`, backgroundImage: 'linear-gradient(#1db954, #1db954)', backgroundRepeat: 'no-repeat' }}
                    />
                    <span className="w-8 text-left font-mono">{formatTime(duration)}</span>
                </div>
            </div>

            {/* Right Box: Volume controls & More */}
            <div className="flex-[0.3] flex justify-end items-center text-[#a7a7a7] space-x-3 pr-2">
                <svg className="w-4 h-4 hover:text-white cursor-pointer" fill="currentColor" viewBox="0 0 16 16"><path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/><path d="M11 3.5a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-1 0V4a.5.5 0 0 1 .5-.5zm-6 3a.5.5 0 0 1 .5.5v5a.5.5 0 0 1-1 0V7a.5.5 0 0 1 .5-.5zm3-2a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5z"/></svg>
                <svg className="w-4 h-4 hover:text-white cursor-pointer" fill="currentColor" viewBox="0 0 16 16" onClick={onReset}><path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41zm-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9z"/></svg>
                <div className="flex items-center space-x-2 group w-32">
                    <svg className="w-5 h-5 hover:text-white cursor-pointer" fill="currentColor" viewBox="0 0 16 16"><path d="M11.536 14.01A8.473 8.473 0 0 0 14.026 8a8.473 8.473 0 0 0-2.49-6.01l-.708.707A7.476 7.476 0 0 1 13.025 8c0 2.071-.84 3.946-2.197 5.303l.708.707z"/><path d="M10.121 12.596A6.48 6.48 0 0 0 12.025 8a6.48 6.48 0 0 0-1.904-4.596l-.707.707A5.483 5.483 0 0 1 11.025 8a5.483 5.483 0 0 1-1.61 3.89l.706.706z"/><path d="M8.707 11.182A4.486 4.486 0 0 0 10.025 8a4.486 4.486 0 0 0-1.318-3.182L8 5.525A3.489 3.489 0 0 1 9.025 8 3.49 3.49 0 0 1 8 10.475l.707.707zM6.717 3.55A.5.5 0 0 1 7 4v8a.5.5 0 0 1-.812.39L3.825 10.5H1.5A.5.5 0 0 1 1 10V6a.5.5 0 0 1 .5-.5h2.325l2.363-1.89a.5.5 0 0 1 .529-.06z"/></svg>
                    <div className="flex-1 h-1 bg-[#4d4d4d] rounded-full overflow-hidden group-hover:h-1.5 transition-all">
                        <div className="h-full bg-white group-hover:bg-[#1db954] w-[70%]"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    );
};

export default PlaylistDisplay;
