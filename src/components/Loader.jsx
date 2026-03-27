import React from 'react';

const Loader = ({ message, emotion }) => {
    return (
        <div className="flex-1 flex flex-col items-center justify-center text-center w-full h-full bg-[#0a0a12] animate-in fade-in duration-700">
            <div className="relative mb-12">
                {/* Outer Glow */}
                <div className={`absolute inset-0 rounded-full blur-3xl opacity-20 animate-pulse ${emotion ? emotion.gradient.split(' ')[0] : 'bg-violet-600'}`}></div>
                
                {/* Main Spinner */}
                <svg className="animate-spin h-24 w-24 text-cyan-400 relative z-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-10" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"></circle>
                    <path className="opacity-100" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </div>

            <div className="space-y-4">
                <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter italic leading-none">Crafting Your Vibe</h2>
                <div className="flex items-center justify-center space-x-3 text-cyan-400 font-bold uppercase tracking-[0.3em] text-[10px]">
                   <span className="w-12 h-0.5 bg-cyan-600 rounded-full animate-pulse"></span>
                   <span>{message}</span>
                   <span className="w-12 h-0.5 bg-cyan-600 rounded-full animate-pulse delay-500"></span>
                </div>
            </div>
            
            {/* Ambient Background Element */}
            <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-violet-900/10 to-transparent pointer-events-none"></div>
        </div>
    );
};

export default Loader;
