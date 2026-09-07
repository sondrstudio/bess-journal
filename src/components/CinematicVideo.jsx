import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Maximize } from 'lucide-react';
import gsap from 'gsap';

// Raw SVG Icons
const DrawnPlay = () => (
  <svg width="32" height="32" viewBox="0 0 50 50" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 10 L40 25 L15 40 Z" />
    <path d="M12 8 L42 25 L12 42 Z" opacity="0.4" />
  </svg>
);

const DrawnPause = () => (
  <svg width="32" height="32" viewBox="0 0 50 50" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round">
    <path d="M15 10 L15 40 M35 10 L35 40" />
    <path d="M12 8 L12 42 M38 8 L38 42" opacity="0.4" />
  </svg>
);

export function CinematicVideo({ src, poster, aspectRatio = "16/9", objectFit = "cover" }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState('00:00');
  const [duration, setDuration] = useState('00:00');
  const [isMuted, setIsMuted] = useState(false);
  
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  const formatTime = (timeInSeconds) => {
    if (isNaN(timeInSeconds)) return '00:00';
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setProgress((video.currentTime / video.duration) * 100);
      setCurrentTime(formatTime(video.currentTime));
    };

    const handleLoadedMetadata = () => {
      setDuration(formatTime(video.duration));
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = (e) => {
    e.stopPropagation();
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleSeek = (e) => {
    e.stopPropagation();
    const seekTime = (e.nativeEvent.offsetX / e.currentTarget.offsetWidth) * videoRef.current.duration;
    videoRef.current.currentTime = seekTime;
    setProgress((seekTime / videoRef.current.duration) * 100);
  };

  const toggleFullscreen = (e) => {
    e.stopPropagation();
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  // 35mm Sprocket Holes generator
  const renderSprockets = () => {
    const sprockets = [];
    for (let i = 0; i < 20; i++) {
      sprockets.push(
        <div key={i} className="w-4 h-6 border-2 border-ink bg-transparent opacity-80" style={{ borderRadius: '4px 2px 4px 2px', borderStyle: 'dashed' }}></div>
      );
    }
    return sprockets;
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto my-32">
      <p className="font-handwritten text-accent text-3xl mb-[-1rem] ml-12 rotate-[-4deg] opacity-80 z-20 relative">Play the tape...</p>
      
      {/* 35mm Film Strip Frame (1900s Analog) */}
      <div 
        ref={containerRef}
        className="relative w-full flex bg-primary border-[3px] border-ink p-2 rotate-[1deg] shadow-[10px_10px_0px_rgba(61,40,23,0.3)] transition-transform duration-500 hover:rotate-[-0.5deg]"
        style={{ borderRadius: '2px', aspectRatio }}
      >
        {/* Left Sprockets */}
        <div className="w-12 h-full bg-ink/10 flex flex-col justify-between py-4 items-center border-r-[2px] border-ink/40 mr-2">
          {renderSprockets()}
        </div>

        {/* The Actual Video Cell */}
        <div className="flex-1 relative overflow-hidden border-2 border-ink cursor-pointer bg-ink/5 flex items-center justify-center p-1" onClick={togglePlay}>
          <video
            ref={videoRef}
            src={src}
            poster={poster}
            className={`w-full h-full filter contrast-125 grayscale-[30%] sepia-[20%] ${objectFit === "contain" ? "object-contain" : "object-cover"}`}
            playsInline
          />
          
          {/* Overlay Noise */}
          <div className="absolute inset-0 pointer-events-none opacity-40 mix-blend-overlay animate-pulse bg-[url('/textures/dust.webp')]" />

          {/* Huge Center Play Indication */}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-ink/30 z-10">
              <div className="text-primary p-8 border-4 border-ink border-dashed bg-ink/40" style={{ borderRadius: '255px 15px 225px 15px/15px 225px 15px 255px' }}>
                 <DrawnPlay />
              </div>
            </div>
          )}
        </div>

        {/* Right Sprockets */}
        <div className="w-12 h-full bg-ink/10 flex flex-col justify-between py-4 items-center border-l-[2px] border-ink/40 ml-2">
          {renderSprockets()}
        </div>
      </div>

      {/* Sketched Control Deck */}
      <div className="w-full max-w-4xl mx-auto mt-8 flex flex-col gap-6 ml-12">
        {/* Drawn Progress Bar */}
        <div 
          className="w-[90%] h-6 relative cursor-pointer group"
          onClick={handleSeek}
        >
           {/* Background rough line */}
           <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
              <path d="M0 10 Q 50 15, 100 8 T 300 12 T 800 10" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-20 text-ink" />
           </svg>
           {/* Filled rough line masked to progress */}
           <div className="absolute top-0 left-0 h-full overflow-hidden transition-all duration-100 pointer-events-none" style={{ width: `${progress}%` }}>
             <svg className="w-[800px] h-full" preserveAspectRatio="none">
                <path d="M0 10 Q 50 15, 100 8 T 300 12 T 800 10" fill="none" stroke="#e11d48" strokeWidth="4" />
             </svg>
           </div>
        </div>
        
        {/* Playback Actions */}
        <div className="flex items-center justify-between text-ink w-[90%] font-serif">
          <div className="flex items-center gap-8">
            <button onClick={togglePlay} className="hover:text-accent flex items-center gap-2">
              {isPlaying ? <DrawnPause /> : <DrawnPlay />}
              <span className="text-sm tracking-widest uppercase">Motor</span>
            </button>
            <div className="font-handwritten text-xl opacity-70">
              {currentTime} / {duration}
            </div>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={() => { videoRef.current.muted = !isMuted; setIsMuted(!isMuted); }} className="hover:text-accent">
              {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
            </button>
            <button onClick={toggleFullscreen} className="hover:text-accent">
              <Maximize size={24} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
