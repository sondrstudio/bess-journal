import React from 'react';
import { useTimeline } from '../context/TimelineContext';
import { DailyEntryCard } from './DailyEntryCard';
import { Sparkles, Heart } from 'lucide-react';

export function ArtbookLayout({ onOpenPhoto }) {
  const { entries } = useTimeline();

  return (
    <div className="w-full max-w-4xl mx-auto space-y-24 py-12 px-4">
      {entries.map((entry, index) => (
        <React.Fragment key={entry.id}>
          {/* Deckled Paper Sheet Container */}
          <div id={`day-${entry.id}`} className="relative scroll-mt-24">
            <DailyEntryCard 
              entry={entry} 
              onOpenPhoto={onOpenPhoto} 
            />
          </div>

          {/* Delicate Divider Line between days */}
          {index < entries.length - 1 && (
            <div className="flex flex-col items-center justify-center py-6 opacity-60">
              <div className="w-48 h-[1px] bg-gradient-to-r from-transparent via-[#E0A3BC] to-transparent mb-3" />
              <div className="flex items-center gap-3 text-accent">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E0A3BC]" />
                <Heart className="w-3.5 h-3.5 fill-current" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#E0A3BC]" />
              </div>
              <div className="w-48 h-[1px] bg-gradient-to-r from-transparent via-[#E0A3BC] to-transparent mt-3" />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
