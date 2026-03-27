import React from 'react';

const EmotionSelector = ({ emotions, onSelect, onOpenCamera, onOpenMic, isOffline }) => {
    const offlineTooltip = isOffline ? 'This feature requires an internet connection.' : '';
    
    // Simple greeting based on time like Spotify
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

    return (
    <div className="flex-1 overflow-y-auto w-full h-full bg-[#121212] rounded-md relative animate-in fade-in duration-500">
      {/* Background Gradient fade */}
      <div className="absolute top-0 left-0 right-0 h-80 bg-gradient-to-b from-[#3a3a3a] to-[#121212] opacity-50 z-0 pointer-events-none"></div>
      
      <div className="relative z-10 pt-24 px-6 md:px-8 pb-32">
          {/* Greeting */}
          <h1 className="text-3xl font-bold text-white mb-6 tracking-tight">{greeting}</h1>
          
          {/* Quick Actions (Mic / Camera) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
              <button 
                  onClick={onOpenCamera} 
                  disabled={isOffline} 
                  title={offlineTooltip} 
                  className="group flex items-center bg-[#ffffff1a] hover:bg-[#ffffff2a] transition-all rounded shadow overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
              >
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-[4px_0_10px_rgba(0,0,0,0.2)]">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
                      </svg>
                  </div>
                  <div className="flex-1 px-4 font-bold text-white text-left tracking-wide">
                      Detect via Camera
                  </div>
              </button>
              
              <button 
                  onClick={onOpenMic} 
                  disabled={isOffline} 
                  title={offlineTooltip} 
                  className="group flex items-center bg-[#ffffff1a] hover:bg-[#ffffff2a] transition-all rounded shadow overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
              >
                  <div className="w-20 h-20 bg-gradient-to-br from-[#1db954] to-emerald-700 flex items-center justify-center flex-shrink-0 shadow-[4px_0_10px_rgba(0,0,0,0.2)]">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/>
                      </svg>
                  </div>
                  <div className="flex-1 px-4 font-bold text-white text-left tracking-wide">
                      Detect via Microphone
                  </div>
              </button>
          </div>

          <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white hover:underline cursor-pointer tracking-tight">Select your mood manually</h2>
              <span className="text-[#a7a7a7] text-sm font-bold uppercase hover:underline cursor-pointer tracking-widest hidden sm:block">Show all</span>
          </div>
          
          {/* Emotion Cards (Spotify "Made for You" Style) */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {emotions.map((emotion, idx) => (
                <button 
                    key={emotion.name} 
                    onClick={() => onSelect(emotion)} 
                    disabled={isOffline} 
                    title={offlineTooltip} 
                    className="group flex flex-col items-start bg-[#181818] hover:bg-[#282828] p-4 rounded-md transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed text-left relative shadow-lg"
                >
                    {/* Fake Album Cover */}
                    <div className={`w-full aspect-square rounded-md mb-4 flex items-center justify-center shadow-2xl relative overflow-hidden`}>
                        <img 
                            src={`https://picsum.photos/seed/${emotion.name + idx}/300/300`} 
                            alt={emotion.name}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 brightness-75 group-hover:brightness-100"
                        />
                        <div className={`absolute inset-0 bg-gradient-to-br ${emotion.gradient} opacity-40`}></div>
                        
                        <emotion.icon className={`w-16 h-16 ${emotion.color} opacity-90 drop-shadow-2xl relative z-10 transition-transform group-hover:scale-110`}/>
                        
                        {/* Play overlay on hover */}
                        <div className="absolute right-2 bottom-2 w-12 h-12 rounded-full bg-[#1db954] text-black items-center justify-center opacity-0 group-hover:opacity-100 shadow-xl transition-all translate-y-2 group-hover:translate-y-0 hidden md:flex z-20">
                           <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 ml-1"><path d="M8 5v14l11-7z"/></svg>
                        </div>
                    </div>
                    
                    <h3 className="font-bold text-white mb-1 truncate w-full tracking-wide">{emotion.name}</h3>
                    <p className="text-sm text-[#a7a7a7] line-clamp-2 leading-relaxed group-hover:text-white transition-colors">{emotion.description}</p>
                </button>
            ))}
          </div>
      </div>
    </div>
    );
};

export default EmotionSelector;
