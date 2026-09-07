import React, { useState, useEffect } from 'react';
import { LivingNoteWrapper } from './LivingNoteWrapper';
import { useTimeline, useNow } from '../context/TimelineContext';
import { Lock, Clock, Heart, Eye, EyeOff, Sparkles, Send, Loader2, Edit2, Trash2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { GoldFoilText } from './GoldFoilText';
import { WatercolorWash } from './WatercolorWash';
import { BreathingWrapper } from './BreathingWrapper';

export function ActiveNoteCard({ entry }) {
  const { getUnlockStatus, formatTimeLeft, saveHerReaction } = useTimeline();
  const [showSecret, setShowSecret] = useState(false);
  const [reactionText, setReactionText] = useState('');
  const [isEditingReaction, setIsEditingReaction] = useState(false);
  const [isSavingReaction, setIsSavingReaction] = useState(false);

  useEffect(() => {
    if (entry && entry.herReaction) {
      setReactionText(entry.herReaction);
    } else {
      setReactionText('');
    }
    setIsEditingReaction(false);
  }, [entry?.id]);

  const staticStatus = entry ? getUnlockStatus(entry) : null;
  const now = useNow(Boolean(staticStatus && !staticStatus.isUnlocked));

  if (!entry) return null;

  const { isUnlocked, timeLeft, unlockDate } = staticStatus.isUnlocked
    ? staticStatus
    : getUnlockStatus(entry, now);

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

  const handleSaveReaction = async () => {
    if (!reactionText.trim()) return;
    setIsSavingReaction(true);

    try {
      await saveHerReaction(entry.id, reactionText.trim());
      setIsEditingReaction(false);
      confetti({
        particleCount: 45,
        spread: 80,
        origin: { y: 0.8 },
        colors: ['#E11D48', '#FFB3CE', '#C2185B', '#FDF7F9']
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingReaction(false);
    }
  };

  const handleDeleteReaction = async () => {
    setIsSavingReaction(true);
    try {
      await saveHerReaction(entry.id, '');
      setReactionText('');
      setIsEditingReaction(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingReaction(false);
    }
  };

  if (!isUnlocked) {
    return (
      <div className="relative w-full max-w-3xl mx-auto rounded-[2.5rem] bg-surface/90 border border-ink/15 p-8 md:p-12 shadow-xl overflow-hidden text-center my-8">
        <div className="absolute inset-0 bg-background/85 backdrop-blur-xl z-10 flex flex-col items-center justify-center p-6 space-y-4">
          <div className="p-4 rounded-full bg-accent/10 text-accent animate-pulse">
            <Lock className="w-8 h-8" />
          </div>
          <h3 className="font-serif text-2xl md:text-3xl text-ink font-bold">
            Day {entry.id} — {entry.title || 'Locked Entry'}
          </h3>
          <p className="font-handwritten text-xl text-accent">
            Unlocks on {unlockDate.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
          </p>

          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-ink/5 border border-ink/15 text-ink font-mono text-xl font-bold tracking-widest shadow-inner my-4">
            <Clock className="w-5 h-5 text-accent animate-spin" style={{ animationDuration: '8s' }} />
            <span>{formatTimeLeft(timeLeft)}</span>
          </div>

          <p className="text-xs font-serif text-ink/60 italic max-w-sm">
            Check back when the timer expires to read this daily entry.
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
    <LivingNoteWrapper entryData={entry}>
      <div className="space-y-12 md:space-y-16 w-full">
        {/* Chapter Tag & Title */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs uppercase tracking-widest font-serif font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{entry.themeTag || `Day ${entry.id}`}</span>
          </div>
          <h2 className="font-serif text-4xl md:text-6xl text-ink tracking-tight select-none px-1">
            {entry.title || `Day ${entry.id}`}
          </h2>
          <p className="font-handwritten text-2xl text-accent px-1">
            {entry.subtitle ? entry.subtitle.replace(/ — .*$/, '') : `Day ${entry.id}`}
          </p>
        </div>

        {/* Optional Poem Block */}
        {Array.isArray(entry.poem) && entry.poem.length > 0 && (
          <BreathingWrapper>
            <section className="relative py-6 md:py-8 space-y-4 overflow-hidden my-4 border-l-2 border-accent/20 pl-6 md:pl-8">
              <h3 className="font-handwritten text-2xl text-accent mb-2 flex items-center gap-2 relative z-10">
                <Heart className="w-4 h-4 fill-current" /> Today's Poem
              </h3>
              <div className="relative z-10 space-y-2 text-left font-serif text-lg md:text-xl text-ink/90 leading-relaxed italic">
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
        )}

        {/* Optional Photo */}
        {entry.photoUrl && (
          <div className="flex flex-col items-center my-6">
            <div className="group bg-surface p-4 pb-6 rounded-2xl shadow-md border border-ink/10 transform hover:rotate-1 hover:scale-[1.02] transition-all duration-300 max-w-md w-full">
              <div className="aspect-[4/3] overflow-hidden rounded-xl bg-ink/5">
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
            </div>
          </div>
        )}

        {/* Main Thought Text */}
        <p className="w-full bg-transparent font-handwritten text-3xl md:text-4xl text-ink/90 leading-relaxed block px-2 md:px-4 py-2 select-text whitespace-pre-wrap">
          {entry.thought}
        </p>

        {/* Secret Reveal Interaction */}
        {entry.secretReveal && (
          <div className="pt-2">
            <button
              onClick={handleSecretToggle}
              className="py-3 px-5 text-accent font-handwritten text-2xl hover:text-ink flex items-center gap-2 transition-all group"
            >
              {showSecret ? <EyeOff className="w-4 h-4 text-accent/70" /> : <Eye className="w-4 h-4 text-accent/70" />}
              <span className="underline underline-offset-4 decoration-accent/40 group-hover:decoration-accent">
                {showSecret ? "Hide Secret Note" : "✨ Tap to reveal secret thought..."}
              </span>
            </button>

            {showSecret && (
              <div className="mt-3 pl-6 border-l-2 border-accent/40 animate-fade-blur-in">
                <p className="font-handwritten text-2xl md:text-3xl text-accent italic">
                  "{entry.secretReveal}"
                </p>
              </div>
            )}
          </div>
        )}

        {/* ================= HER REACTION / HANDWRITTEN MARGIN WHISPER ================= */}
        <section className="mt-10 pt-4 select-none relative">
          {entry.herReaction && !isEditingReaction ? (
            <div className="relative pl-6 md:pl-10 my-4 space-y-2 group animate-fade-blur-in">
              {/* Delicate Hand-drawn Margin Vertical Accent Line */}
              <div className="absolute left-0 top-1 bottom-1 w-1 bg-accent/40 rounded-full group-hover:bg-accent transition-colors" />

              <div className="flex items-center justify-end gap-3 text-xs font-serif text-accent/70 tracking-widest uppercase">
                <button
                  onClick={() => setIsEditingReaction(true)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-ink/40 hover:text-accent flex items-center gap-1 text-[11px]"
                >
                  <Edit2 className="w-3 h-3" /> Edit
                </button>
                <button
                  onClick={handleDeleteReaction}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-rose-500/70 hover:text-rose-600 flex items-center gap-1 text-[11px]"
                  title="Delete whisper"
                >
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
              </div>

              {/* Organic Handwritten Margin Note in Ink */}
              <p className="font-handwritten text-3xl md:text-4xl text-ink dark:text-rose-100 leading-relaxed italic rotate-[-1deg] select-text py-1">
                "{entry.herReaction}"
              </p>

              <span className="block font-handwritten text-xl text-accent/80 text-right pr-4 italic">
                — Bess ♡
              </span>
            </div>
          ) : (
            <div className="relative pl-4 md:pl-6 my-4 space-y-3">
              {/* Hand-drawn Left Margin Line */}
              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-ink/15 rounded-full" />

              <div className="space-y-3">
                <textarea
                  value={reactionText}
                  onChange={(e) => setReactionText(e.target.value)}
                  rows={2}
                  className="w-full bg-transparent border-b border-ink/20 focus:border-accent font-handwritten text-2xl md:text-3xl text-ink leading-relaxed focus:outline-none resize-none placeholder:text-ink/25 placeholder:font-handwritten"
                  placeholder="a reaction maybe?"
                />

                <div className="flex items-center justify-between pt-1">
                  {isEditingReaction ? (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setIsEditingReaction(false)}
                        className="text-xs font-serif text-ink/40 hover:text-ink"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleDeleteReaction}
                        className="text-xs font-serif text-rose-500 hover:text-rose-700 flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" /> Delete
                      </button>
                    </div>
                  ) : <div />}

                  <button
                    onClick={handleSaveReaction}
                    disabled={!reactionText.trim() || isSavingReaction}
                    className="p-3 bg-accent text-background hover:bg-ink rounded-full transition-all shadow-md hover:scale-110 active:scale-95 disabled:opacity-30 disabled:pointer-events-none ml-auto group flex items-center justify-center"
                    title="Send Whisper"
                    aria-label="Send Whisper"
                  >
                    {isSavingReaction ? (
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    ) : (
                      <Send className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform text-primary" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </LivingNoteWrapper>
  );
}
