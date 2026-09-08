import React, { useEffect, useState } from 'react';
import Lenis from '@studio-freight/lenis';
import { TimelineProvider, useTimeline } from './context/TimelineContext';
import { ActiveNoteCard } from './components/ActiveNoteCard';
import { CustomCursor } from './components/CustomCursor';
import { ArtbookTexture } from './components/ArtbookTexture';
import { BreathingWrapper } from './components/BreathingWrapper';
import { CinematicIntro } from './components/CinematicIntro';
import { FirecrackerRopeUnlock } from './components/FirecrackerRopeUnlock';
import { InteractiveHeroArsenal } from './components/InteractiveHeroArsenal';
import { ScribbleCircle } from './components/HandDrawnElements';
import { PinboardArchive } from './components/PinboardArchive';
import { CozyBackgroundCanvas } from './components/CozyBackgroundCanvas';
import { AudioSoundscape } from './components/AudioSoundscape';
import { AuthorEditorModal } from './components/AuthorEditorModal';
import { ReactiveBessTitle } from './components/ReactiveBessTitle';
import { Prologue } from './components/Prologue';
import { StartGate } from './components/StartGate';

const PROLOGUE_UNTIL_KEY = 'bess_prologue_until';

// The letter has done its job — it greeted her at the start. It no longer
// opens on load; the "the letter" control replays it whenever she wants it.
// Set this back to true to have it greet a first-time visitor again, which is
// what a new device or a cleared browser would count as.
const PROLOGUE_AUTO_OPEN = false;

// Kept intact behind that switch: while the letter was opening itself, it did
// so on every visit until noon the day after the first, with the deadline
// stamped once and never refreshed so repeat visits could not push it forward.
function prologueDeadline(from = new Date()) {
  const d = new Date(from);
  d.setDate(d.getDate() + 1);
  d.setHours(12, 0, 0, 0);
  return d.getTime();
}

function prologueStillDue() {
  if (!PROLOGUE_AUTO_OPEN) return false;
  try {
    const raw = localStorage.getItem(PROLOGUE_UNTIL_KEY);
    if (!raw) return true;
    const until = Number(raw);
    if (!Number.isFinite(until)) return true;
    return Date.now() < until;
  } catch {
    return true;
  }
}

function StorySection({ children }) {
  return (
    <section className="py-16 px-6 md:px-12 flex flex-col items-center">
      <div className="w-full max-w-4xl mx-auto">
        {children}
      </div>
    </section>
  );
}

function MainApp() {
  const { activeEntry } = useTimeline();
  const [diaryUnlocked, setDiaryUnlocked] = useState(false);
  const [ropeFading, setRopeFading] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [activeTab, setActiveTab] = useState('today'); // 'today' | 'archive'

  // See prologueDeadline: the letter greets her on every visit until noon
  // tomorrow, then stands aside so it is not between her and that day's entry.
  // The replay control brings it back at any point after that.
  const [showPrologue, setShowPrologue] = useState(prologueStillDue);

  // The doorway only stands in front of the letter when the letter is due. A
  // deliberate replay goes straight to the first stanza — she already chose it.
  const [showStart, setShowStart] = useState(prologueStillDue);

  const handlePrologueComplete = React.useCallback(() => {
    setShowPrologue(false);
    try {
      // Stamped only if absent, so a replay never extends the window.
      if (!localStorage.getItem(PROLOGUE_UNTIL_KEY)) {
        localStorage.setItem(PROLOGUE_UNTIL_KEY, String(prologueDeadline()));
      }
    } catch {
      /* private browsing — the letter simply plays again next time */
    }
  }, []);

  const handleIntroComplete = React.useCallback(() => {
    setShowIntro(false);
  }, []);

  const handleUnlock = () => {
    setShowIntro(false);
    setRopeFading(true);
    setTimeout(() => {
      setDiaryUnlocked(true);
    }, 700);
  };

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => lenis.destroy();
  }, []);

  return (
    <div className="min-h-screen bg-transparent relative selection:bg-accent selection:text-primary">
      {showStart && <StartGate onStart={() => setShowStart(false)} />}

      {!showStart && showPrologue && <Prologue onComplete={handlePrologueComplete} />}

      <CustomCursor />
      <ArtbookTexture />
      <CozyBackgroundCanvas />
      <AudioSoundscape />
      <AuthorEditorModal />
      
      {!showStart && !showPrologue && (
        <button
          onClick={() => setShowPrologue(true)}
          className="fixed bottom-5 right-5 z-40 font-handwritten text-lg text-ink/35 hover:text-accent transition-colors duration-500 pointer-events-auto"
          title="Read the letter again"
        >
          ↺ the letter
        </button>
      )}

      {/* Hero Section */}
      <section className="h-[100dvh] flex flex-col items-start justify-center relative overflow-hidden text-background px-6 md:px-20">
        <div className="absolute inset-0 bg-ink/10 z-10 pointer-events-none mix-blend-multiply"></div>

        <InteractiveHeroArsenal isUnlocked={diaryUnlocked} showIntro={showIntro} />
        
        {!showStart && !showPrologue && showIntro && <CinematicIntro onComplete={handleIntroComplete} />}
        
        <div className="relative z-20 space-y-8 max-w-2xl mt-12 pointer-events-none transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]">
          <div className="space-y-3 transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform">
            <div className="relative inline-block">
              <ReactiveBessTitle showIntro={showIntro} />
              <ScribbleCircle className="w-[120%] h-[120%] text-ink left-[-10%] top-[-10%]" />
            </div>
            <p className="font-serif text-2xl md:text-3xl text-ink/80 italic leading-relaxed">
              A daily{' '}
              <span
                id="target-word-journal"
                className={`inline-block font-handwritten text-accent text-4xl md:text-5xl rotate-[-2deg] ${showIntro ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
              >
                journal
              </span>
              , written with{' '}
              <span className="font-handwritten text-accent text-4xl md:text-5xl rotate-[-2deg] inline-block">
                love
              </span>
              ,
              <br />unfolding day by day.
            </p>
          </div>

          <div className={`w-[90vw] md:w-full pointer-events-auto transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-visible ${
            !diaryUnlocked ? (ropeFading ? 'h-[320px] opacity-0 blur-md' : 'h-[320px] opacity-100') : 'h-[90px] opacity-100'
          }`}>
            {!diaryUnlocked ? (
               <FirecrackerRopeUnlock onUnlock={handleUnlock} />
            ) : (
              <div className="animate-fade-blur-in pointer-events-auto pt-2">
                <BreathingWrapper delay={0.2}>
                  <button 
                    onClick={() => {
                      const target = document.getElementById('unlocked-content');
                      if (target) target.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="magnetic-btn px-10 py-5 bg-ink text-background font-serif hover:bg-accent flex items-center gap-4 transition-all duration-500 shadow-xl hover:shadow-2xl hover:shadow-accent/20 group relative overflow-hidden"
                    style={{ borderRadius: '255px 15px 225px 15px/15px 225px 15px 255px' }}
                  >
                    <span className="absolute inset-0 bg-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-md pointer-events-none" />
                    <span className="text-xl tracking-wide">Read Today's Entry</span>
                  </button>
                </BreathingWrapper>
              </div>
            )}
          </div>
        </div>
      </section>

      {diaryUnlocked && (
        <div id="unlocked-content" className="relative z-10 animate-fade-blur-in min-h-screen pt-12 flex flex-col justify-between">
          <div className="flex-1 flex flex-col">
            {/* Tab Switcher Navigation Header */}
            <div className="w-full max-w-4xl mx-auto px-4 mb-8 flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  setActiveTab('today');
                  const target = document.getElementById('unlocked-content');
                  if (target) target.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`px-8 py-3 rounded-full font-serif text-lg transition-all duration-300 ${
                  activeTab === 'today'
                    ? 'bg-ink text-background shadow-lg scale-105'
                    : 'bg-ink/5 text-ink/70 hover:bg-ink/10'
                }`}
              >
                ✦ Today's Note
              </button>

              <button
                onClick={() => {
                  setActiveTab('archive');
                  const target = document.getElementById('unlocked-content');
                  if (target) target.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`px-8 py-3 rounded-full font-serif text-lg transition-all duration-300 ${
                  activeTab === 'archive'
                    ? 'bg-ink text-background shadow-lg scale-105'
                    : 'bg-ink/5 text-ink/70 hover:bg-ink/10'
                }`}
              >
                📌 Pin Board Archive
              </button>
            </div>

            {/* TAB 1: Today's Active Note */}
            {activeTab === 'today' && (
              <div className="animate-fade-blur-in flex-1">
                <StorySection>
                  <ActiveNoteCard entry={activeEntry} />
                </StorySection>
              </div>
            )}

            {/* TAB 2: Pin Board Archive Tab */}
            {activeTab === 'archive' && (
              <div className="animate-fade-blur-in flex-1">
                <PinboardArchive />
              </div>
            )}
          </div>

          {/* Sticky Bottom Footer */}
          <footer className="w-full bg-ink text-background py-12 text-center mt-auto border-t border-ink/20 shadow-lg relative z-20">
            <div className="max-w-xl mx-auto px-4 space-y-1.5">
              <p className="font-handwritten text-3xl md:text-4xl text-background/95 drop-shadow-sm">
                Made for Bess.
              </p>
              <p className="font-serif text-xs uppercase tracking-widest text-background/50">
                A daily journal
              </p>
            </div>
          </footer>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <TimelineProvider>
      <MainApp />
    </TimelineProvider>
  );
}
