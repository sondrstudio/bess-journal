import React, { useState } from 'react';
import { useTimeline, useNow } from '../context/TimelineContext';
import { Lock, Eye, EyeOff, Sparkles, Heart, Clock, Share2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { GoldFoilText } from './GoldFoilText';
import { WatercolorWash } from './WatercolorWash';
import { BreathingWrapper } from './BreathingWrapper';
import { ShareExportModal } from './ShareExportModal';

export function DailyEntryCard({ entry, onOpenPhoto }) {
  const { getUnlockStatus, formatTimeLeft } = useTimeline();
  const staticStatus = getUnlockStatus(entry);
  const now = useNow(!staticStatus.isUnlocked);
  const { isUnlocked, timeLeft, unlockDate } = staticStatus.isUnlocked
    ? staticStatus
    : getUnlockStatus(entry, now);
  const [showSecret, setShowSecret] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  const handleSecretToggle = () => {
    if (!showSecret) {
      confetti({
        particleCount: 35,
        spread: 70,
        origin: { y: 0.7 },
        colors: ['#E0A3BC', '#FFB3CE', '#C2185B', '#FDF7F9']
      });
    }
    setShowSecret(!showSecret);
  };

  if (!isUnlocked) {
    return (
      <div className="relative w-full max-w-3xl mx-auto rounded-[2.5rem] bg-surface/90 border border-accent/15 p-8 md:p-12 shadow-xl overflow-hidden text-center my-8">
        <div className="absolute inset-0 bg-background/85 backdrop-blur-xl z-10 flex flex-col items-center justify-center p-6 space-y-4">
          <div className="p-4 rounded-full bg-accent/10 text-accent animate-pulse">
            <Lock className="w-8 h-8" />
          </div>
          <h3 className="font-serif text-2xl md:text-3xl text-ink">
            Day {entry.id} — {entry.title}
          </h3>
          <p className="font-handwritten text-xl text-accent">
            Unlocks on {unlockDate.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
          </p>

          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-surface-2 border border-accent/20 text-ink font-mono text-xl font-bold tracking-widest shadow-inner my-4">
            <Clock className="w-5 h-5 text-accent animate-spin" style={{ animationDuration: '8s' }} />
            <span>{formatTimeLeft(timeLeft)}</span>
          </div>

          <p className="text-xs font-serif text-ink/60 italic max-w-sm">
            Check back at midnight to read today's new poem and thought.
          </p>
        </div>

        {/* Blurred background silhouette */}
        <div className="space-y-6 opacity-20 filter blur-sm select-none">
          <div className="h-8 bg-ink/20 rounded-full w-1/2 mx-auto" />
          <div className="h-32 bg-ink/10 rounded-2xl w-full" />
          <div className="h-4 bg-ink/20 rounded-full w-3/4 mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <article className="relative w-full max-w-3xl mx-auto rounded-[2.5rem] bg-surface/95 border border-accent/15 p-6 md:p-12 shadow-xl my-8 space-y-10 animate-[fade-in_0.6s_ease-out] overflow-hidden">
      {/* Chapter Tag & Embossed Title */}
      <header className="text-center space-y-3 border-b border-ink/10 pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs uppercase tracking-widest font-serif font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{entry.themeTag || `Day ${entry.id}`}</span>
        </div>
        <div>
          <GoldFoilText className="text-3xl md:text-5xl font-bold leading-tight">
            {entry.title}
          </GoldFoilText>
        </div>
        <p className="font-handwritten text-2xl text-accent">
          {entry.subtitle}
        </p>
      </header>

      {/* Poem Section with Watercolor Wash & Breathing Aura */}
      <BreathingWrapper>
        <section className="relative bg-surface-2/40 rounded-[2rem] p-6 md:p-10 border border-accent/10 space-y-4 overflow-hidden">
          <WatercolorWash color="gold" />
          <h3 className="font-handwritten text-xl text-accent mb-2 flex items-center gap-2 relative z-10">
            <Heart className="w-4 h-4 fill-current" /> Today's Poem
          </h3>
          <div className="relative z-10 space-y-2 text-center font-serif text-lg md:text-xl text-ink/90 leading-relaxed italic">
            {entry.poem.map((line, idx) => (
              line === "" ? (
                <div key={idx} className="h-4" />
              ) : (
                <p key={idx} className="hover:text-accent transition-colors">
                  {line}
                </p>
              )
            ))}
          </div>
        </section>
      </BreathingWrapper>

      {/* Polaroid Memory Photo */}
      {entry.photoUrl && (
        <section className="flex flex-col items-center">
          <div 
            onClick={() => onOpenPhoto(entry.photoUrl, entry.photoCaption)}
            className="group cursor-pointer bg-surface p-4 pb-6 rounded-2xl shadow-md border border-ink/10 transform hover:rotate-1 hover:scale-[1.02] transition-all duration-300 max-w-md w-full"
          >
            <div className="aspect-[4/3] overflow-hidden rounded-xl bg-surface-2">
              <img 
                src={entry.photoUrl} 
                alt={entry.photoCaption || "Memory photo"}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
            </div>
            {entry.photoCaption && (
              <p className="mt-4 font-handwritten text-2xl text-ink text-center">
                "{entry.photoCaption}"
              </p>
            )}
            <span className="block text-center text-[10px] uppercase font-mono text-ink/40 mt-2">
              (Click to enlarge)
            </span>
          </div>
        </section>
      )}

      {/* Personal Thought Note */}
      <section className="space-y-3">
        <h3 className="font-serif text-sm uppercase tracking-widest text-accent font-semibold">
          Daily Reflection
        </h3>
        <p className="font-body text-base md:text-lg text-ink/80 leading-relaxed bg-surface/70 p-6 rounded-2xl border border-ink/5 shadow-sm">
          {entry.thought}
        </p>
      </section>

      {/* Top Right Export JPG Action */}
      <div className="absolute top-6 right-6 z-30">
        <button
          onClick={() => setIsShareOpen(true)}
          className="p-2.5 rounded-full bg-surface/90 border border-accent/20 text-accent hover:bg-accent hover:text-primary transition-all shadow-sm group"
          title="Export JPG version of this note"
        >
          <Share2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
        </button>
      </div>

      {/* Secret Reveal Interaction */}
      {entry.secretReveal && (
        <section className="pt-2">
          <button
            onClick={handleSecretToggle}
            className="w-full py-4 px-6 rounded-2xl bg-surface-2 hover:bg-accent/10 border border-accent/20 text-accent font-serif text-sm font-medium flex items-center justify-center gap-2 transition-all"
          >
            {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{showSecret ? "Hide Secret Note" : "Tap to reveal secret thought"}</span>
          </button>

          {showSecret && (
            <div className="mt-4 p-6 rounded-2xl bg-accent/10 border border-accent/30 text-center animate-[fade-in_0.4s_ease-out]">
              <p className="font-handwritten text-2xl text-accent">
                {entry.secretReveal}
              </p>
            </div>
          )}
        </section>
      )}

      {/* Share / Export Modal */}
      <ShareExportModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        entry={entry}
      />
    </article>
  );
}
