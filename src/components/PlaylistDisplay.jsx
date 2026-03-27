import React, { useState, useEffect, useRef } from 'react';

const PlaylistDisplay = ({ playlist, emotion, onReset, onSave }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [player, setPlayer] = useState(null);
    const playerRef = useRef(null);

    const currentSong = playlist[currentIndex];

    useEffect(() => {
        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        }
        window.onYouTubeIframeAPIReady = () => initPlayer();
        if (window.YT && window.YT.Player) initPlayer();
        return () => { if (playerRef.current) playerRef.current.destroy(); };
    }, []);

    const initPlayer = () => {
        if (playerRef.current) return;
        playerRef.current = new window.YT.Player('youtube-player', {
            height: '0', width: '0',
            videoId: currentSong?.youtubeId || '',
            playerVars: { 'playsinline': 1, 'controls': 0 },
            events: {
                'onReady': (event) => { setPlayer(event.target); setDuration(event.target.getDuration()); },
                'onStateChange': (event) => {
                    if (event.data === window.YT.PlayerState.PLAYING) setIsPlaying(true);
                    else if (event.data === window.YT.PlayerState.PAUSED) setIsPlaying(false);
                    else if (event.data === window.YT.PlayerState.ENDED) handleNext();
                }
            }
        });
    };

    useEffect(() => {
        if (player && currentSong?.youtubeId) {
            player.loadVideoById(currentSong.youtubeId);
            setIsPlaying(true);
        }
    }, [currentIndex, player]);

    useEffect(() => {
        let interval;
        if (isPlaying && player) {
            interval = setInterval(() => setCurrentTime(player.getCurrentTime()), 1000);
        }
        return () => clearInterval(interval);
    }, [isPlaying, player]);

    const togglePlayPause = () => {
        if (!player) return;
        if (isPlaying) player.pauseVideo();
        else player.playVideo();
    };

    const handleNext = () => currentIndex < playlist.length - 1 ? setCurrentIndex(currentIndex + 1) : setIsPlaying(false);
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

    const getAlbumArt = (song, idx) => `https://picsum.photos/seed/${encodeURIComponent(song.title + idx)}/300/300`;

    return (
        <div className="flex-1 w-full h-full bg-[#0a0a12] flex flex-col font-sans text-violet-200/50 overflow-hidden animate-in fade-in duration-700 relative">
            <div id="youtube-player" className="hidden"></div>
            <div className="flex-1 overflow-y-auto pb-32 scrollbar-hide">
                <div className={`pt-32 pb-12 px-8 bg-gradient-to-b ${emotion?.gradient || 'from-violet-500/10 to-[#0a0a12]'} to-[#0a0a12]/0 flex items-end space-x-8 relative`}>
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-3xl pointer-events-none"></div>
                    <div className="w-56 h-56 md:w-64 md:h-64 shadow-[0_30px_80px_rgba(0,0,0,0.8)] bg-[#1a1a2e] relative z-10 flex-shrink-0 group overflow-hidden rounded-3xl border border-white/10">
                        <img src={getAlbumArt(currentSong || {title: 'Playlist'}, 99)} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"/>
                    </div>
                    <div className="relative z-10">
                        <p className="uppercase text-xs font-black tracking-[0.4em] text-white/70 mb-3 drop-shadow-lg">Generated Vibe</p>
                        <h1 className="text-6xl md:text-9xl font-black text-white mb-6 tracking-tighter leading-none drop-shadow-2xl">{emotion?.name || 'Vibe'}</h1>
                        <div className="flex items-center space-x-3 text-sm font-black text-white/90">
                            <div className="w-7 h-7 bg-violet-600 rounded-full flex items-center justify-center p-1"><img src="/logo.png" className="w-full h-full rounded-full" alt="" /></div>
                            <span className="hover:underline cursor-pointer uppercase tracking-widest">EmotiTunes</span>
                            <span className="opacity-50 tracking-widest">• {playlist.length} TRACKS</span>
                        </div>
                    </div>
                </div>

                <div className="px-8 bg-gradient-to-b from-black/40 to-[#0a0a12] pt-8 min-h-screen">
                    <div className="flex items-center space-x-10 mb-10">
                        <button onClick={togglePlayPause} className="w-16 h-16 rounded-2xl bg-violet-600 hover:bg-violet-500 hover:rotate-3 transition-all text-white flex items-center justify-center shadow-[0_15px_40px_rgba(139,92,246,0.5)] active:scale-90">
                            {isPlaying ? <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg> : <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 ml-1"><path d="M8 5v14l11-7z"/></svg>}
                        </button>
                        <button onClick={onSave} className="flex items-center space-x-3 bg-white/5 hover:bg-white/10 text-white px-8 py-4 rounded-2xl border border-white/10 transition-all font-black uppercase text-xs tracking-widest active:scale-95 group">
                            <svg className="w-5 h-5 text-cyan-400 group-hover:scale-125 transition-transform" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                            <span>Save Collection</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-[30px_1fr_1fr] md:grid-cols-[30px_4fr_3fr_1fr] gap-6 px-6 py-4 border-b border-white/5 text-[10px] font-black tracking-[0.3em] text-violet-300/30 uppercase mb-6 text-left">
                        <div>#</div><div>Title</div><div className="hidden md:block">Album</div><div className="text-right">Duration</div>
                    </div>
                    <div className="space-y-2 mb-20 px-2">
                        {playlist.map((song, index) => {
                            const isCurrentlyPlaying = index === currentIndex;
                            return (
                                <div key={index} onClick={() => setCurrentIndex(index)} className={`group grid grid-cols-[30px_1fr_1fr] md:grid-cols-[30px_4fr_3fr_1fr] gap-6 px-4 py-3 rounded-2xl hover:bg-white/5 transition-all cursor-pointer items-center border border-transparent hover:border-violet-500/10 ${isCurrentlyPlaying ? 'bg-violet-600/10 border-violet-500/20 shadow-xl' : ''}`}>
                                    <div className="text-center">
                                        {isCurrentlyPlaying && isPlaying ? <div className="flex justify-center space-x-0.5 h-3"><div className="w-0.5 bg-cyan-400 animate-bounce delay-75"></div><div className="w-0.5 bg-violet-400 animate-bounce delay-150"></div><div className="w-0.5 bg-cyan-400 animate-bounce delay-0"></div></div> : <span className={`text-xs font-black ${isCurrentlyPlaying ? 'text-cyan-400' : 'text-violet-200/20'}`}>{index + 1}</span>}
                                    </div>
                                    <div className="flex items-center min-w-0">
                                        <div className="w-12 h-12 bg-[#1a1a2e] flex-shrink-0 mr-5 rounded-xl shadow-lg overflow-hidden"><img src={getAlbumArt(song, index)} alt="" className="w-full h-full object-cover" /></div>
                                        <div className="truncate"><div className={`font-black text-lg truncate tracking-tight ${isCurrentlyPlaying ? 'text-cyan-400' : 'text-white'}`}>{song.title}</div><div className="text-xs font-bold text-violet-300/40 truncate uppercase tracking-widest mt-0.5">{song.artist}</div></div>
                                    </div>
                                    <div className="hidden md:block text-sm font-bold text-violet-300/30 truncate uppercase tracking-widest">Acoustic Mix</div>
                                    <div className="text-right text-xs font-black text-violet-300/20 tabular-nums">3:42</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="fixed bottom-3 left-3 right-3 h-24 bg-[#12121e]/80 backdrop-blur-3xl border border-white/5 rounded-3xl px-8 flex items-center justify-between z-50">
                <div className="flex-[0.3] flex items-center min-w-0">
                    <div className="w-16 h-16 bg-[#1a1a2e] flex-shrink-0 mr-5 rounded-2xl shadow-xl overflow-hidden"><img src={getAlbumArt(currentSong || {}, currentIndex)} alt="" className="w-full h-full object-cover" /></div>
                    <div className="truncate pr-6 text-left">
                        <div className="text-white text-base font-black truncate uppercase tracking-tight">{currentSong?.title}</div>
                        <div className="text-[10px] font-black text-violet-400 uppercase tracking-widest mt-1 truncate">{currentSong?.artist}</div>
                    </div>
                </div>
                <div className="flex-[0.4] flex flex-col items-center">
                    <div className="flex items-center space-x-10 mb-2">
                        <button onClick={handlePrev} className="text-violet-200/20 hover:text-white" disabled={currentIndex === 0}><svg fill="currentColor" viewBox="0 0 16 16" className="w-5 h-5"><path d="M3.3 1a.7.7 0 01.7.7v5.15l9.95-5.744a.7.7 0 011.05.606v12.575a.7.7 0 01-1.05.607L4 9.149V14.3a.7.7 0 01-1.4 0V1.7a.7.7 0 01.7-.7z"/></svg></button>
                        <button onClick={togglePlayPause} className="w-11 h-11 rounded-xl bg-white text-black flex items-center justify-center shadow-xl">{isPlaying ? <svg fill="currentColor" viewBox="0 0 16 16" className="w-6 h-6"><path fillRule="evenodd" d="M2.7 1a.7.7 0 00-.7.7v12.6a.7.7 0 00.7.7h2.6a.7.7 0 00.7-.7V1.7a.7.7 0 00-.7-.7H2.7zm8 0a.7.7 0 00-.7.7v12.6a.7.7 0 00.7.7h2.6a.7.7 0 00.7-.7V1.7a.7.7 0 00-.7-.7h-2.6z"/></svg> : <svg fill="currentColor" viewBox="0 0 16 16" className="w-5 h-5 ml-1"><path d="M3 1.713a.7.7 0 011.05-.607l10.89 6.288a.7.7 0 010 1.212L4.05 14.894A.7.7 0 013 14.288V1.713z"/></svg>}</button>
                        <button onClick={handleNext} className="text-violet-200/20 hover:text-white" disabled={currentIndex === playlist.length - 1}><svg fill="currentColor" viewBox="0 0 16 16" className="w-5 h-5"><path d="M12.7 1a.7.7 0 00-.7.7v5.15L2.05 1.107A.7.7 0 001 1.712v12.575a.7.7 0 001.05.607L12 9.149V14.3a.7.7 0 001.4 0V1.7a.7.7 0 00-.7-.7z"/></svg></button>
                    </div>
                    <div className="w-full flex items-center space-x-4 text-[10px] font-black tracking-widest text-violet-300/30 group">
                        <span className="w-10 text-right tabular-nums">{formatTime(currentTime)}</span>
                        <input type="range" min="0" max={duration || 210} value={currentTime || 0} onChange={handleSeek} className="flex-1 h-1 bg-white/5 rounded-full appearance-none cursor-pointer accent-violet-500 overflow-hidden" style={{ backgroundSize: `${(currentTime / (duration || 210)) * 100}% 100%`, backgroundImage: 'linear-gradient(#8b5cf6, #8b5cf6)', backgroundRepeat: 'no-repeat' }}/>
                        <span className="w-10 text-left tabular-nums">{formatTime(duration)}</span>
                    </div>
                </div>
                <div className="flex-[0.3] flex justify-end items-center text-violet-200/20 space-x-6">
                    <svg className="w-5 h-5 group-hover:text-cyan-400" fill="currentColor" viewBox="0 0 16 16"><path d="M6.717 3.55A.5.5 0 0 1 7 4v8a.5.5 0 0 1-.812.39L3.825 10.5H1.5A.5.5 0 0 1 1 10V6a.5.5 0 0 1 .5-.5h2.325l2.363-1.89a.5.5 0 0 1 .529-.06z"/></svg>
                    <div className="w-32 h-1 bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-violet-600 w-[70%] shadow-[0_0_10px_rgba(139,92,246,1)]"></div></div>
                </div>
            </div>
        </div>
    );
};

export default PlaylistDisplay;
