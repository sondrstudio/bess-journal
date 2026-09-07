import React, { useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { InkButterfly } from './HandDrawnElements';

/*
   The letter that opens the journal, before the title sequence.

   Paced by the reader rather than a timer: a tap, a scroll or a key moves to
   the next stanza, so a line can be sat with for as long as she wants. The
   ground here is the same paper as CinematicIntro's, which is what lets the
   handoff between the two read as one continuous shot rather than a cut.
*/

const STANZAS = [
  {
    lines: [
      'Dear mirror, be honest for once:',
      'there was a time you told her the truth',
      'and somewhere along the way you learned to lie.',
    ],
  },
  {
    lines: [
      'You are such a beautiful person.',
      'Not the kind that needs a good angle or a good day,',
      "the kind that just is, whether or not anyone's looking,",
      'whether or not you believe me.',
    ],
  },
  {
    lines: [
      'I hope you find your way back to seeing it.',
      'I hope you learn to be soft with yourself',
      "the way you've always been soft with everyone else.",
    ],
  },
  {
    lines: [
      "This doesn't undo anything.",
      "I know it can't reach back and fix what already happened.",
      "But it's a hand held out across the gap that opened,",
      "and it's the truest thing I have:",
    ],
  },
  {
    // The line the whole letter is built toward, so it gets the page to itself
    // and the handwritten accent the site reserves for its warmest words.
    lines: ['through my eyes, you have always been worth loving.'],
    emphasis: true,
  },
  {
    lines: ["So here's a daily thought for you,", 'for 30 days'],
    handoff: true,
  },
];

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Ambient butterflies — a slow wander rather than the intro's flood, so they
   read as company while she reads. They surge rightward on the last stanza to
   pre-echo the flood that CinematicIntro opens with. */
function PrologueButterflies({ surge }) {
  const containerRef = useRef(null);
  const surgeRef = useRef(surge);

  useEffect(() => {
    surgeRef.current = surge;
  }, [surge]);

  useEffect(() => {
    if (!containerRef.current) return;
    const reduced = prefersReducedMotion();

    const ctx = gsap.context(() => {
      const moths = gsap.utils.toArray('.prologue-moth');

      moths.forEach((moth, i) => {
        gsap.set(moth, {
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          scale: 0.55 + Math.random() * 0.95,
          opacity: 0,
          rotation: -30 + Math.random() * 60,
        });

        // InkButterfly carries its own opacity-70, so these land at roughly
        // 0.3–0.6 on the page: present enough to read as company, faint enough
        // not to compete with the line being read.
        gsap.to(moth, {
          opacity: 0.45 + Math.random() * 0.4,
          duration: 2.6,
          delay: i * 0.14,
          ease: 'power1.out',
        });

        if (reduced) return;

        // Each butterfly wanders on its own loop, re-targeting on completion so
        // no two ever fall into the same rhythm.
        const wander = () => {
          if (!moth.isConnected) return;
          const surging = surgeRef.current;
          gsap.to(moth, {
            x: surging
              ? `+=${240 + Math.random() * 460}`
              : `+=${(Math.random() - 0.5) * 320}`,
            y: `+=${(Math.random() - 0.5) * (surging ? 160 : 220)}`,
            rotation: `+=${(Math.random() - 0.5) * 44}`,
            duration: surging ? 2.6 + Math.random() * 1.6 : 7 + Math.random() * 7,
            ease: surging ? 'power1.inOut' : 'sine.inOut',
            onComplete: wander,
          });
        };
        gsap.delayedCall(Math.random() * 1.5, wander);
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-0 pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      {Array.from({ length: 16 }).map((_, i) => (
        <div key={i} className="prologue-moth absolute top-0 left-0 will-change-transform">
          <InkButterfly className="text-ink" />
        </div>
      ))}
    </div>
  );
}

export function Prologue({ onComplete }) {
  const [index, setIndex] = useState(0);
  const [hintVisible, setHintVisible] = useState(false);
  const [surge, setSurge] = useState(false);

  const stanzaRef = useRef(null);
  const overlayRef = useRef(null);
  const busyRef = useRef(false);
  const indexRef = useRef(0);

  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  const stanza = STANZAS[index];
  const isLast = index === STANZAS.length - 1;

  // The page behind is a full scrolling document; hold it still while the
  // letter is up so a scroll advances the stanza instead of moving the page.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Reveal the current stanza, line by line.
  useEffect(() => {
    if (!stanzaRef.current) return;
    const reduced = prefersReducedMotion();
    setHintVisible(false);

    const ctx = gsap.context(() => {
      const lines = gsap.utils.toArray('.prologue-line');
      const stagger = reduced ? 0.12 : 0.42;
      const duration = reduced ? 0.4 : 1.5;

      gsap.fromTo(
        lines,
        {
          opacity: 0,
          y: reduced ? 0 : 26,
          filter: reduced ? 'blur(0px)' : 'blur(7px)',
        },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          stagger,
          duration,
          ease: 'power3.out',
          onComplete: () => setHintVisible(true),
        }
      );
    }, stanzaRef);

    return () => ctx.revert();
  }, [index]);

  const finish = useCallback(() => {
    const reduced = prefersReducedMotion();
    setSurge(true);
    setHintVisible(false);

    const tl = gsap.timeline({
      onComplete: () => onCompleteRef.current && onCompleteRef.current(),
    });

    // The text leaves first and the paper holds, so what remains on screen is
    // the same ground CinematicIntro paints — no flash between the two.
    tl.to(stanzaRef.current, {
      opacity: 0,
      filter: reduced ? 'blur(0px)' : 'blur(16px)',
      y: reduced ? 0 : -22,
      scale: reduced ? 1 : 0.96,
      duration: reduced ? 0.3 : 1.9,
      ease: 'power2.inOut',
    });

    // Let the butterflies carry the moment alone for a beat before handing over.
    tl.to({}, { duration: reduced ? 0.1 : 0.7 });
  }, []);

  const advance = useCallback(() => {
    if (busyRef.current) return;
    busyRef.current = true;

    const reduced = prefersReducedMotion();
    const current = indexRef.current;

    if (current >= STANZAS.length - 1) {
      finish();
      return;
    }

    setHintVisible(false);
    gsap.to(stanzaRef.current, {
      opacity: 0,
      filter: reduced ? 'blur(0px)' : 'blur(12px)',
      y: reduced ? 0 : -18,
      duration: reduced ? 0.25 : 1.0,
      ease: 'power2.inOut',
      onComplete: () => {
        gsap.set(stanzaRef.current, { filter: 'blur(0px)', y: 0, opacity: 1 });
        setIndex(current + 1);
        busyRef.current = false;
      },
    });
  }, [finish]);

  // Tap, key or scroll all move forward. Nothing moves backward: this is a
  // letter being read, not a carousel.
  useEffect(() => {
    const onKey = (e) => {
      if ([' ', 'Enter', 'ArrowRight', 'ArrowDown', 'PageDown'].includes(e.key)) {
        e.preventDefault();
        advance();
      }
    };

    let wheelLock = false;
    const onWheel = (e) => {
      if (e.deltaY <= 0 || wheelLock) return;
      wheelLock = true;
      advance();
      setTimeout(() => {
        wheelLock = false;
      }, 900);
    };

    let touchStartY = null;
    const onTouchStart = (e) => {
      touchStartY = e.touches[0].clientY;
    };
    const onTouchEnd = (e) => {
      if (touchStartY === null) return;
      const dy = touchStartY - e.changedTouches[0].clientY;
      touchStartY = null;
      if (dy > 40) advance();
    };

    window.addEventListener('keydown', onKey);
    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [advance]);

  return (
    <div
      ref={overlayRef}
      onClick={advance}
      role="button"
      tabIndex={0}
      aria-label="A letter. Tap to continue."
      className="fixed inset-0 z-[60] bg-[#F5F3EE] flex flex-col items-center justify-center px-7 md:px-20 cursor-pointer overflow-hidden select-none"
    >
      {/* Same paper as the title sequence, so the two read as one shot. */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40 mix-blend-overlay bg-[url('/textures/rice-paper.webp')]" />

      <PrologueButterflies surge={surge} />

      <div
        ref={stanzaRef}
        className="relative z-10 w-full max-w-3xl text-center will-change-transform"
      >
        {stanza.lines.map((line, i) => (
          <p
            key={`${index}-${i}`}
            className={
              stanza.emphasis
                ? 'prologue-line font-handwritten text-accent text-4xl md:text-6xl leading-[1.35] py-2'
                : stanza.handoff
                ? 'prologue-line font-serif text-ink/85 text-2xl md:text-4xl leading-[1.7] italic'
                : 'prologue-line font-serif text-ink/85 text-lg md:text-2xl leading-[1.9]'
            }
          >
            {line}
          </p>
        ))}
      </div>

      {/* Progress — six ink marks, one per stanza. */}
      <div className="absolute bottom-14 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2.5">
        {STANZAS.map((_, i) => (
          <span
            key={i}
            className={`block rounded-full transition-all duration-700 ${
              i === index
                ? 'w-2 h-2 bg-accent'
                : i < index
                ? 'w-1.5 h-1.5 bg-ink/30'
                : 'w-1.5 h-1.5 bg-ink/10'
            }`}
          />
        ))}
      </div>

      <div
        className={`absolute bottom-6 left-1/2 -translate-x-1/2 z-10 font-serif text-[10px] uppercase tracking-[0.35em] text-ink/40 transition-opacity duration-1000 ${
          hintVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {isLast ? 'begin' : 'tap to continue'}
      </div>
    </div>
  );
}
