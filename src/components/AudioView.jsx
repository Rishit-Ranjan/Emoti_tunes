import React, { useState, useRef, useEffect, useCallback } from 'react';
const AudioView = ({ onCapture, onClose, onError }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const timerIntervalRef = useRef(null);
    const streamRef = useRef(null);
    
    // Web Audio API refs
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const animationFrameRef = useRef(null);
    const featuresRef = useRef({ energy: [], frequency: [] });
    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
        }
        setIsRecording(false);
        setRecordingTime(0);
    }, []);
    const cleanup = useCallback(() => {
        stopRecording();
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (audioContextRef.current) {
            audioContextRef.current.close().catch(e => console.error("AudioContext close error", e));
            audioContextRef.current = null;
        }
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
    }, [stopRecording]);
    useEffect(() => {
        return () => {
            cleanup();
        };
    }, [cleanup]);
    const handleStartRecording = async () => {
        cleanup(); 
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            audioChunksRef.current = [];
            featuresRef.current = { energy: [], frequency: [] };

            // Initialize Audio Analysis
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            const audioContext = new AudioContext();
            const source = audioContext.createMediaStreamSource(stream);
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            source.connect(analyser);
            
            audioContextRef.current = audioContext;
            analyserRef.current = analyser;

            // Start Visualization & Feature Extraction
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            
            const extractFeatures = () => {
                if (!isRecording && !mediaRecorderRef.current) return;
                
                analyser.getByteFrequencyData(dataArray);
                
                // Calculate average energy (volume)
                let energy = 0;
                let maxFreq = 0;
                let maxIdx = 0;
                
                for (let i = 0; i < bufferLength; i++) {
                    energy += dataArray[i];
                    if (dataArray[i] > maxFreq) {
                        maxFreq = dataArray[i];
                        maxIdx = i;
                    }
                }
                
                featuresRef.current.energy.push(energy / bufferLength);
                featuresRef.current.frequency.push(maxIdx * (audioContext.sampleRate / analyser.fftSize));
                
                animationFrameRef.current = requestAnimationFrame(extractFeatures);
            };
            extractFeatures();

            const options = { mimeType: 'audio/webm;codecs=opus' };
            let recorder;
            try {
                recorder = new MediaRecorder(stream, options);
            } catch {
                recorder = new MediaRecorder(stream);
            }
            mediaRecorderRef.current = recorder;

            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) audioChunksRef.current.push(event.data);
            };

            recorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: recorder.mimeType });
                
                // Summarize features for AER
                const avgEnergy = featuresRef.current.energy.reduce((a, b) => a + b, 0) / featuresRef.current.energy.length;
                const avgFreq = featuresRef.current.frequency.reduce((a, b) => a + b, 0) / featuresRef.current.frequency.length;
                const stability = featuresRef.current.energy.filter((e, i, a) => i > 0 && Math.abs(e - a[i-1]) > 5).length / featuresRef.current.energy.length;

                const reader = new FileReader();
                reader.readAsDataURL(audioBlob);
                reader.onloadend = () => {
                    onCapture({ 
                        audioData: reader.result.split(',')[1], 
                        mimeType: recorder.mimeType,
                        aerFeatures: { avgEnergy, avgFreq, stability } // Audio Emotion Recognition features
                    });
                };
                cleanup();
            };

            recorder.start();
            setIsRecording(true);
            setRecordingTime(0);
            timerIntervalRef.current = window.setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } catch {
            onError("Microphone access failed. Please ensure permissions are granted.");
        }
    };
    const handleStopRecording = () => {
        stopRecording();
    };
    return (
        <div className="w-full max-w-lg mx-auto flex flex-col items-center text-center p-12 rounded-3xl bg-gradient-to-b from-[#181818] to-black shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/5 animate-in slide-in-from-bottom-8 duration-500">
            <h2 className="text-4xl font-black text-white mb-2 tracking-tighter">Analyze Mood</h2>
            <p className="text-[#a7a7a7] text-lg font-medium mb-12">
                {isRecording ? "Listening to your tone..." : "Express yourself for a moment."}
            </p>

            <div className="relative w-64 h-64 flex items-center justify-center mb-12 group">
                {isRecording && (
                    <div className="absolute inset-0 flex items-center justify-center gap-2">
                        {[1, 2, 3, 4, 12, 6, 7, 8, 9, 10, 11, 12].map(i => (
                            <div key={i} className="w-2.5 bg-[#1db954] rounded-full animate-pulse shadow-[0_0_15px_rgba(29,185,84,0.3)] transition-all duration-300" 
                                 style={{ 
                                     height: `${Math.random() * 80 + 10}%`, 
                                     animationDuration: `${Math.random() * 0.5 + 0.3}s`,
                                     opacity: 0.6 + Math.random() * 0.4
                                 }}></div>
                        ))}
                    </div>
                )}
                <button 
                    onClick={isRecording ? handleStopRecording : handleStartRecording} 
                    className={`z-10 w-44 h-44 rounded-full flex flex-col items-center justify-center text-white transition-all duration-500 shadow-2xl relative ${isRecording ? 'bg-red-500 scale-105 animate-pulse' : 'bg-[#1db954] hover:bg-[#1ed760] hover:scale-105'} active:scale-95`}
                >
                    <div className="absolute inset-0 rounded-full border-4 border-white/10 group-hover:border-white/20 transition-colors"></div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-2 drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                        {isRecording ? (<rect x="6" y="6" width="12" height="12" rx="2"/>) : (<><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></>)}
                    </svg>
                    <span className="font-black text-xl tracking-tight uppercase">
                        {isRecording ? "Analyze" : "Record"}
                    </span>
                </button>
            </div>
            
             {isRecording ? (<div className="text-3xl font-black text-[#1db954] tracking-widest animate-bounce">
                    0:{recordingTime.toString().padStart(2, '0')}
                </div>) : (<button onClick={onClose} className="text-[#a7a7a7] hover:text-white font-bold tracking-widest uppercase text-sm transition-all hover:scale-110">
                    Cancel
                </button>)}
        </div>);
};
export default AudioView;
