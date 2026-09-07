import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Volume2, VolumeX, Music, X } from 'lucide-react';
import { ArrowSketch } from './HandDrawnElements';
import { BreathingWrapper } from './BreathingWrapper';

const MUSIC_HINT_KEY = 'bess_music_hint_seen';

export function AudioSoundscape() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  // A one-time nudge toward the player. Retired for good the moment she starts
  // the music, or if she waves it away.
  const [showHint, setShowHint] = useState(() => {
    try {
      return !localStorage.getItem(MUSIC_HINT_KEY);
    } catch {
      return true;
    }
  });

  const dismissHint = useCallback(() => {
    setShowHint(false);
    try {
      localStorage.setItem(MUSIC_HINT_KEY, '1');
    } catch {
      /* private browsing — the hint simply offers itself again next time */
    }
  }, []);

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
          // Retired here rather than in an effect watching isPlaying: this is
          // the event that actually retires it.
          dismissHint();
        })
        .catch((err) => {
          console.error("Audio playback error:", err);
        });
    }
  };

  return (
    // Above the doorway, the letter and the title sequence, so the music is
    // reachable from the moment the page opens rather than only afterwards.
    <div className="fixed bottom-6 left-6 z-[80] flex items-center gap-3 select-none">
      {showHint && !isPlaying && (
        <div className="absolute bottom-full left-2 mb-4 w-[230px] pointer-events-auto">
          <BreathingWrapper>
            <div className="relative flex items-start gap-1.5">
              <button
                type="button"
                onClick={toggleSound}
                className="text-left font-handwritten text-2xl leading-tight text-ink rotate-[-4deg] drop-shadow-sm hover:text-accent transition-colors duration-300"
              >
                start the music?
              </button>
              <button
                type="button"
                onClick={dismissHint}
                aria-label="Dismiss music hint"
                className="mt-1 p-1 rounded-full text-ink/35 hover:text-accent transition-colors duration-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </BreathingWrapper>

          {/* Flipped so the sketch sweeps down-left onto the button below. */}
          <ArrowSketch className="w-12 h-12 text-accent left-3 top-8 -scale-x-100 rotate-[-10deg]" />
        </div>
      )}

      <button
        onClick={toggleSound}
        className={`px-5 py-3 rounded-full bg-surface/90 border backdrop-blur-md shadow-xl text-ink hover:text-accent hover:scale-105 transition-all duration-300 flex items-center gap-3 group ${
          showHint && !isPlaying ? 'border-accent/60 ring-2 ring-accent/25' : 'border-accent/25'
        }`}
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
