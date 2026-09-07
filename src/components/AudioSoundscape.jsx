import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Music } from 'lucide-react';

export function AudioSoundscape() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = new Audio();
    // Don't spend first-load bandwidth on a 2.3MB track nobody has asked to hear yet;
    // the src is attached on the first play tap instead.
    audio.preload = 'none';
    audio.loop = true;
    audio.volume = 0.55;
    audioRef.current = audio;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const toggleSound = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (!audioRef.current.src) {
        audioRef.current.src = '/audio/lights-are-on.mp3';
      }
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err) => {
          console.error("Audio playback error:", err);
        });
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-50 flex items-center gap-3 select-none">
      <button
        onClick={toggleSound}
        className="px-5 py-3 rounded-full bg-[#FAF8F5]/90 dark:bg-[#2A221E]/90 border border-accent/25 backdrop-blur-md shadow-xl text-ink hover:text-accent hover:scale-105 transition-all duration-300 flex items-center gap-3 group"
        aria-label="Toggle background music"
      >
        <Music className={`w-4 h-4 text-accent ${isPlaying ? 'animate-spin' : 'opacity-70'}`} style={{ animationDuration: '8s' }} />
        <span className="font-serif text-sm tracking-wide font-medium">
          {isPlaying ? 'Playing "Lights Are On"' : 'Play "Lights Are On"'}
        </span>
        {isPlaying ? (
          <Volume2 className="w-4 h-4 text-accent animate-pulse" />
        ) : (
          <VolumeX className="w-4 h-4 opacity-50" />
        )}
      </button>

      {/* Floating Music Notes Animation when Playing */}
      {isPlaying && (
        <div className="flex items-center gap-1 text-accent opacity-80 animate-pulse text-xs font-serif">
          <span>♪</span>
          <span className="animate-[bounce_1.5s_infinite_0.2s]">♩</span>
          <span className="animate-[bounce_1.5s_infinite_0.4s]">♫</span>
        </div>
      )}
    </div>
  );
}
