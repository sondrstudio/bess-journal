import React, { useCallback, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { InkButterfly } from './HandDrawnElements';

/*
   A quiet doorway in front of the letter.

   It paints the same paper as the prologue and the title sequence, so handing
   over is a dissolve of the content rather than a change of scene — the ground
   never moves. Only shown when the letter is due; a deliberate replay goes
   straight to the first stanza.
*/

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function StartGate({ onStart }) {
  const contentRef = useRef(null);
  const mothRef = useRef(null);
  const busyRef = useRef(false);

  const onStartRef = useRef(onStart);
  useEffect(() => {
    onStartRef.current = onStart;
  }, [onStart]);

  // Hold the page behind still while the doorway is up.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    const reduced = prefersReducedMotion();

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.gate-in',
        {
          opacity: 0,
          y: reduced ? 0 : 18,
          filter: reduced ? 'blur(0px)' : 'blur(8px)',
        },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          stagger: reduced ? 0.06 : 0.3,
          duration: reduced ? 0.4 : 1.3,
          ease: 'power3.out',
        }
      );

      if (!reduced && mothRef.current) {
        // One butterfly, circling unhurriedly. The swarm belongs to the letter.
        const wander = () => {
          if (!mothRef.current) return;
          gsap.to(mothRef.current, {
            x: `+=${(Math.random() - 0.5) * 150}`,
            y: `+=${(Math.random() - 0.5) * 90}`,
            rotation: `+=${(Math.random() - 0.5) * 30}`,
            duration: 5 + Math.random() * 4,
            ease: 'sine.inOut',
            onComplete: wander,
          });
        };
        wander();
      }
    }, contentRef);

    return () => ctx.revert();
  }, []);

  const start = useCallback(() => {
    if (busyRef.current) return;
    busyRef.current = true;
    const reduced = prefersReducedMotion();

    // Only the content leaves. The paper stays, and the prologue mounts onto
    // the identical ground, so there is nothing to see between the two.
    const tl = gsap.timeline({
      onComplete: () => onStartRef.current && onStartRef.current(),
    });
    tl.to(contentRef.current, {
      opacity: 0,
      y: reduced ? 0 : -18,
      filter: reduced ? 'blur(0px)' : 'blur(12px)',
      duration: reduced ? 0.25 : 1.0,
      ease: 'power2.inOut',
    });
    tl.to({}, { duration: reduced ? 0.05 : 0.2 });
  }, []);

  return (
    <div
      onClick={start}
      className="fixed inset-0 z-[70] bg-background flex items-center justify-center px-7 overflow-hidden cursor-pointer select-none"
    >
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40 mix-blend-overlay bg-[url('/textures/rice-paper.webp')]" />

      <div ref={contentRef} className="relative z-10 flex flex-col items-center text-center">
        <div ref={mothRef} className="gate-in relative w-10 h-10 mb-8 opacity-70">
          <InkButterfly className="text-accent" />
        </div>

        <p className="gate-in font-serif text-[11px] uppercase tracking-[0.4em] text-ink/50 mb-4">
          for Bess
        </p>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            start();
          }}
          className="gate-in magnetic-btn px-9 py-4 bg-ink text-background font-serif text-lg tracking-wide hover:bg-accent transition-colors duration-500 shadow-xl hover:shadow-2xl hover:shadow-accent/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          style={{ borderRadius: '255px 15px 225px 15px/15px 225px 15px 255px' }}
        >
          click to start
        </button>
      </div>
    </div>
  );
}
