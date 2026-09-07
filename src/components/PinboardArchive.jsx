import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useTimeline } from '../context/TimelineContext';
import { X, Share2, Heart, Send, Loader2, Edit2, Trash2, Eye, EyeOff } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ShareExportModal } from './ShareExportModal';

// Five tints of the one pink family, distinguishable without leaving the
// palette. Deliberately fixed rather than tokens: a sticky note reads as paper
// in both modes, and the note text beside it is fixed to match.
const POST_IT_COLORS = [
  { bg: 'bg-[#FFF0F5]', border: 'border-[#FFD6E4]', pin: '#C2185B', tape: 'bg-rose-200/60' }, // Blush
  { bg: 'bg-[#FFE4EF]', border: 'border-[#FECDD3]', pin: '#E11D48', tape: 'bg-rose-200/60' }, // Rose
  { bg: 'bg-[#FCE7F3]', border: 'border-[#FBCFE8]', pin: '#DB2777', tape: 'bg-rose-200/60' }, // Peony
  { bg: 'bg-[#F7E4EC]', border: 'border-[#EFC9DA]', pin: '#9E4A6B', tape: 'bg-rose-200/60' }, // Mauve
  { bg: 'bg-[#FFE8EC]', border: 'border-[#FFCDD5]', pin: '#E63946', tape: 'bg-rose-200/60' }, // Coral
];

const ROTATIONS = [
  'rotate-[-3deg]',
  'rotate-[4deg]',
  'rotate-[-5deg]',
  'rotate-[3deg]',
  'rotate-[-2deg]',
  'rotate-[5deg]',
  'rotate-[-4deg]',
];

export function PinboardArchive() {
  const { entries, saveHerReaction, getUnlockStatus } = useTimeline();

  // The archive shows only what has actually opened. Rendering every entry
  // put a future note's title and the first lines of its body on the board,
  // and made it tappable through to the full text — readable before its date.
  // getUnlockStatus honours dev mode, so ?dev still previews the run.
  const unlockedEntries = useMemo(
    () => entries.filter((e) => getUnlockStatus(e).isUnlocked),
    [entries, getUnlockStatus]
  );
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [exportingNote, setExportingNote] = useState(null);
  const [showSecret, setShowSecret] = useState(false);

  // Ref to the modal dialog content for focused, smooth scrolling
  const modalScrollRef = useRef(null);

  // Lock background body scroll whenever the modal is open so the page behind cannot scroll
  useEffect(() => {
    if (selectedNoteId) {
      const originalOverflow = document.body.style.overflow;
      const originalPaddingRight = document.body.style.paddingRight;
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      if (scrollBarWidth > 0) {
        document.body.style.paddingRight = `${scrollBarWidth}px`;
      }
      const originalRootOverflow = document.documentElement.style.overflow;
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
        document.documentElement.style.overflow = originalRootOverflow;
        document.body.style.paddingRight = originalPaddingRight;
      };
    }
  }, [selectedNoteId]);

  // Reaction State for the selected archived note
  const [reactionText, setReactionText] = useState('');
  const [isEditingReaction, setIsEditingReaction] = useState(false);
  const [isSavingReaction, setIsSavingReaction] = useState(false);

  // Dynamic reactive selected note from context
  const selectedNote = unlockedEntries.find((e) => e.id === selectedNoteId) || null;

  useEffect(() => {
    if (selectedNote) {
      if (selectedNote.herReaction) {
        setReactionText(selectedNote.herReaction);
        setIsEditingReaction(false);
      } else {
        setReactionText('');
        setIsEditingReaction(true);
      }
    } else {
      setReactionText('');
      setIsEditingReaction(false);
      setShowSecret(false);
    }
  }, [selectedNoteId, selectedNote?.herReaction]);

  const handleSecretToggle = () => {
    if (!showSecret) {
      confetti({
        particleCount: 35,
        spread: 70,
        origin: { y: 0.7 },
        colors: ['#E0A3BC', '#FFB3CE', '#C2185B', '#FDF7F9'],
      });
    }
    setShowSecret(!showSecret);
  };

  const handleSaveReaction = async () => {
    if (!selectedNote || !reactionText.trim()) return;
    setIsSavingReaction(true);

    try {
      await saveHerReaction(selectedNote.id, reactionText.trim());
      setIsEditingReaction(false);
      confetti({
        particleCount: 45,
        spread: 80,
        origin: { y: 0.8 },
        colors: ['#E11D48', '#FFB3CE', '#C2185B', '#FDF7F9'],
      });
    } catch (err) {
      console.error('Failed to save reaction from archive:', err);
    } finally {
      setIsSavingReaction(false);
    }
  };

  const handleDeleteReaction = async () => {
    if (!selectedNote) return;
    setIsSavingReaction(true);
    try {
      await saveHerReaction(selectedNote.id, '');
      setReactionText('');
      setIsEditingReaction(true);
    } catch (err) {
      console.error('Failed to delete reaction from archive:', err);
    } finally {
      setIsSavingReaction(false);
    }
  };

  return (
    <section className="py-16 px-4 md:px-12 max-w-6xl mx-auto my-12">
      {/* Pin Board Surface.

          The board and its notes are fixed paper in both modes — a cork board
          does not invert. So the ink on them is fixed too: a token here would
          flip to near-white in dark mode and leave light text on a light note.
          The detail modal below is a different case; it sits on bg-surface,
          which does flip, so it keeps the tokens. */}
      <div className="relative bg-[#F7E4EC] border-4 border-[#9E4A6B]/40 rounded-[3rem] p-6 md:p-14 shadow-2xl overflow-hidden">
        {/* Pin Board Header */}
        <div className="text-center space-y-3 mb-12 relative z-10">
          <p className="font-handwritten text-2xl md:text-3xl text-[#45182C]/80">
            A cluster of thoughts, pinned in time. Tap any note to read and whisper back.
          </p>
        </div>

        {unlockedEntries.length === 0 && (
          <div className="relative z-10 text-center py-16">
            <p className="font-handwritten text-3xl md:text-4xl text-[#45182C]/70">
              Nothing pinned here yet.
            </p>
            <p className="font-serif text-sm text-[#45182C]/50 mt-3">
              Each note appears on the day it opens.
            </p>
          </div>
        )}

        {/* Cluster of Post-it Notes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 relative z-10 p-2">
          {unlockedEntries.map((entry, index) => {
            const color = POST_IT_COLORS[index % POST_IT_COLORS.length];
            const rotation = ROTATIONS[index % ROTATIONS.length];

            return (
              <div
                key={entry.id}
                onClick={() => setSelectedNoteId(entry.id)}
                className={`group cursor-pointer relative ${color.bg} ${color.border} border p-6 md:p-8 rounded-2xl ${rotation} hover:rotate-0 hover:scale-105 hover:z-30 transition-all duration-300 shadow-[8px_10px_25px_rgba(40,30,20,0.15)] hover:shadow-[15px_20px_40px_rgba(40,30,20,0.25)] select-none flex flex-col justify-between min-h-[240px]`}
              >
                {/* Washi Tape or Push Pin Accent */}
                {index % 2 === 0 ? (
                  <div className={`absolute top-[-12px] left-1/2 -translate-x-1/2 w-20 h-6 ${color.tape} backdrop-blur-sm rotate-[-1deg] border border-[#45182C]/40 shadow-sm z-20 pointer-events-none`} />
                ) : (
                  <div className="absolute top-2 right-4 z-20 pointer-events-none">
                    <svg viewBox="0 0 24 24" className="w-6 h-6 drop-shadow-sm" fill={color.pin}>
                      <path d="M12 2C8.686 2 6 4.686 6 8c0 5.25 6 12 6 12s6-6.75 6-12c0-3.314-2.686-6-6-6zm0 8a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </div>
                )}

                {/* Note Content Header */}
                <div className="space-y-2">
                  <span className="font-mono text-xs uppercase tracking-widest text-[#45182C] font-bold block opacity-75">
                    Day {String(entry.id).padStart(2, '0')}
                  </span>
                  <h3 className="font-serif text-xl md:text-2xl text-[#2A1620] font-bold leading-tight group-hover:text-[#C2185B] transition-colors">
                    {entry.title}
                  </h3>
                </div>

                {/* Note Snippet */}
                <p className="font-handwritten text-xl md:text-2xl text-[#45182C] leading-snug line-clamp-3 mt-4">
                  "{entry.thought}"
                </p>

                {/* Footer Tag & Reaction Status */}
                <div className="mt-4 pt-3 border-t border-[#45182C]/15 flex items-center justify-between text-xs font-serif text-[#45182C]">
                  <div className="flex items-center gap-2">
                    <span>{entry.themeTag || 'Thought'}</span>
                    {entry.herReaction && (
                      <span
                        className="text-rose-500 text-sm"
                        title={`Whisper: "${entry.herReaction}"`}
                      >
                        💌
                      </span>
                    )}
                  </div>
                  <span className="font-handwritten text-lg text-[#C2185B] group-hover:translate-x-1 transition-transform">
                    Read note →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lightbox Modal for Selected Archived Note */}
      {selectedNote && (
        <div
          className="fixed inset-0 z-[9999] bg-ink/70 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 md:p-10 animate-fade-blur-in overflow-hidden select-none overscroll-contain"
          onClick={() => setSelectedNoteId(null)}
          onWheel={(e) => {
            if (modalScrollRef.current) {
              modalScrollRef.current.scrollTop += e.deltaY;
            }
          }}
        >
          <div
            ref={modalScrollRef}
            tabIndex={0}
            data-lenis-prevent
            className="relative bg-surface max-w-2xl w-full max-h-[85vh] overflow-y-auto overscroll-contain custom-scrollbar p-6 sm:p-8 md:p-12 rounded-[2.5rem] border border-ink/15 shadow-2xl space-y-6 animate-fade-blur-in my-auto select-auto focus:outline-none"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedNoteId(null)}
              className="absolute top-6 right-6 p-3 rounded-full bg-ink/5 text-ink hover:bg-accent/20 hover:text-accent transition-colors"
              aria-label="Close modal"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Title */}
            <div className="space-y-2 border-b border-ink/10 pb-4">
              <span className="font-mono text-xs uppercase tracking-widest text-accent font-bold">
                Day 0{selectedNote.id} — Archived Note
              </span>
              <h2 className="font-serif text-3xl md:text-5xl text-[#2A1620]">
                {selectedNote.title}
              </h2>
            </div>

            {/* Full Handwritten Text Field */}
            <div className="py-2">
              <p className="font-handwritten text-2xl md:text-3xl text-ink leading-relaxed">
                "{selectedNote.thought}"
              </p>
            </div>

            {/* Secret Reveal (if present on archived note) */}
            {selectedNote.secretReveal && (
              <div className="pt-2 border-t border-ink/10">
                <button
                  onClick={handleSecretToggle}
                  className="font-handwritten text-xl text-accent/80 hover:text-accent transition-colors flex items-center gap-2 group"
                >
                  {showSecret ? <EyeOff className="w-4 h-4 text-accent/70" /> : <Eye className="w-4 h-4 text-accent/70" />}
                  <span className="underline underline-offset-4 decoration-accent/40 group-hover:decoration-accent">
                    {showSecret ? "Hide Secret Note" : "✨ Tap to reveal secret thought..."}
                  </span>
                </button>

                {showSecret && (
                  <div className="mt-3 pl-6 border-l-2 border-accent/40 animate-fade-blur-in">
                    <p className="font-handwritten text-2xl md:text-3xl text-accent italic">
                      "{selectedNote.secretReveal}"
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ================= HER REACTION / HANDWRITTEN MARGIN WHISPER ================= */}
            <section className="pt-4 border-t border-ink/10 select-none relative">
              <div className="flex items-center justify-between mb-3">
                <span className="font-handwritten text-xl text-accent font-bold flex items-center gap-1.5">
                  <Heart className="w-4 h-4 fill-current text-rose-500" />
                  {selectedNote.herReaction && !isEditingReaction ? "Bess's Whisper" : "Add Your Reaction"}
                </span>
                {selectedNote.herReaction && !isEditingReaction && (
                  <div className="flex items-center gap-3 text-xs font-serif text-accent/70 tracking-widest uppercase">
                    <button
                      onClick={() => setIsEditingReaction(true)}
                      className="text-ink/50 hover:text-accent flex items-center gap-1 text-[11px] transition-colors"
                    >
                      <Edit2 className="w-3 h-3" /> Edit
                    </button>
                    <button
                      onClick={handleDeleteReaction}
                      disabled={isSavingReaction}
                      className="text-rose-500/70 hover:text-rose-600 flex items-center gap-1 text-[11px] transition-colors disabled:opacity-50"
                      title="Delete whisper"
                    >
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                  </div>
                )}
              </div>

              {selectedNote.herReaction && !isEditingReaction ? (
                <div className="relative pl-6 md:pl-8 my-2 space-y-2 group animate-fade-blur-in">
                  {/* Delicate hand-drawn margin vertical accent line */}
                  <div className="absolute left-0 top-1 bottom-1 w-1 bg-accent/40 rounded-full group-hover:bg-accent transition-colors" />
                  <p className="font-handwritten text-2xl md:text-3xl text-ink dark:text-rose-100 leading-relaxed italic rotate-[-1deg] select-text py-1">
                    "{selectedNote.herReaction}"
                  </p>
                  <span className="block font-handwritten text-lg text-accent/80 text-right pr-2 italic">
                    — Bess ♡
                  </span>
                </div>
              ) : (
                <div className="relative pl-4 md:pl-6 my-2 space-y-3 animate-fade-blur-in">
                  <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-accent/30 rounded-full" />

                  <textarea
                    value={reactionText}
                    onChange={(e) => setReactionText(e.target.value)}
                    rows={2}
                    className="w-full bg-transparent border-b border-ink/20 focus:border-accent font-handwritten text-2xl md:text-3xl text-ink leading-relaxed focus:outline-none resize-none placeholder:text-ink/30 dark:placeholder:text-primary/30 placeholder:font-handwritten"
                    placeholder="Leave a whisper or reaction for this memory..."
                    autoFocus={isEditingReaction}
                  />

                  <div className="flex items-center justify-between pt-1">
                    {selectedNote.herReaction ? (
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setReactionText(selectedNote.herReaction || '');
                            setIsEditingReaction(false);
                          }}
                          className="text-xs font-serif text-ink/50 hover:text-ink transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleDeleteReaction}
                          disabled={isSavingReaction}
                          className="text-xs font-serif text-rose-500 hover:text-rose-700 flex items-center gap-1 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      </div>
                    ) : <div />}

                    <button
                      type="button"
                      onClick={handleSaveReaction}
                      disabled={!reactionText.trim() || isSavingReaction}
                      className="px-4 py-2 bg-accent text-primary hover:bg-ink rounded-full transition-all shadow-md hover:scale-105 active:scale-95 disabled:opacity-30 disabled:pointer-events-none ml-auto group flex items-center gap-2 font-handwritten text-lg"
                      title="Send Whisper"
                      aria-label="Send Whisper"
                    >
                      {isSavingReaction ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-primary" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <span>Send Whisper</span>
                          <Send className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform text-primary" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </section>

            {/* Footer */}
            <div className="pt-4 border-t border-ink/10 flex items-center justify-end">
              <button
                onClick={() => setExportingNote(selectedNote)}
                className="p-3.5 rounded-full bg-accent hover:bg-ink text-background hover:scale-110 active:scale-95 transition-all shadow-md group"
                title="Export JPG version of this note"
                aria-label="Export JPG version"
              >
                <Share2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share / Export Modal for Archived Note */}
      {exportingNote && (
        <ShareExportModal
          isOpen={!!exportingNote}
          onClose={() => setExportingNote(null)}
          entry={exportingNote}
        />
      )}
    </section>
  );
}

