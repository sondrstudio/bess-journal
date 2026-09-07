import React from 'react';
import { useTimeline } from '../context/TimelineContext';
import { Lock, CheckCircle2, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

export function TimelineNav() {
  const { entries, selectedDayId, setSelectedDayId, getUnlockStatus, isDevMode } = useTimeline();

  const currentIndex = entries.findIndex((e) => e.id === Number(selectedDayId));

  const handlePrev = () => {
    if (currentIndex > 0) {
      setSelectedDayId(entries[currentIndex - 1].id);
    }
  };

  const handleNext = () => {
    if (currentIndex < entries.length - 1) {
      setSelectedDayId(entries[currentIndex + 1].id);
    }
  };

  return (
    <nav className="w-full max-w-3xl mx-auto px-4 mb-6">
      <div className="bg-[#FAF8F5]/90 dark:bg-[#201914]/90 backdrop-blur-md border border-ink/15 dark:border-white/15 rounded-full shadow-lg p-2 flex items-center justify-between gap-2">
        {/* Previous Button */}
        <button
          onClick={handlePrev}
          disabled={currentIndex <= 0}
          className="p-2 rounded-full hover:bg-ink/10 dark:hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-colors text-ink dark:text-white"
          title="Previous Entry"
          aria-label="Previous Entry"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Days Pill List */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto py-1 no-scrollbar px-1">
          {entries.map((entry) => {
            const { isUnlocked } = getUnlockStatus(entry);
            const isSelected = entry.id === Number(selectedDayId);

            return (
              <button
                key={entry.id}
                onClick={() => setSelectedDayId(entry.id)}
                className={`relative px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-serif transition-all duration-300 flex items-center gap-1.5 shrink-0 ${
                  isSelected
                    ? 'bg-ink text-background shadow-md scale-105 font-bold'
                    : isUnlocked
                    ? 'bg-ink/5 dark:bg-white/10 text-ink dark:text-white hover:bg-accent/10'
                    : 'bg-ink/5 dark:bg-white/5 text-ink/40 dark:text-white/40 hover:bg-ink/10'
                }`}
              >
                <span>Day {entry.id}</span>
                {isUnlocked ? (
                  <CheckCircle2 className={`w-3.5 h-3.5 ${isSelected ? 'text-accent' : 'text-emerald-600 dark:text-emerald-400'}`} />
                ) : (
                  <Lock className="w-3.5 h-3.5 opacity-60" />
                )}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          onClick={handleNext}
          disabled={currentIndex >= entries.length - 1}
          className="p-2 rounded-full hover:bg-ink/10 dark:hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-colors text-ink dark:text-white"
          title="Next Entry"
          aria-label="Next Entry"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </nav>
  );
}
