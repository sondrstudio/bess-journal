import React, { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';
import { InkButterfly } from './HandDrawnElements';

const ButterflyFlood = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const moths = containerRef.current.querySelectorAll('.flood-moth');
    
    moths.forEach((moth, i) => {
      gsap.set(moth, { 
        x: -200 - (Math.random() * 500), 
        y: Math.random() * window.innerHeight,
        scale: 0.5 + Math.random() * 1.5,
        opacity: 0.7 + Math.random() * 0.3,
        rotation: -45 + Math.random() * 90
      });

      if (i < 3) {
        const targetMoth = document.getElementById(`hero-moth-${i}`);
        if (targetMoth) {
          const rect = targetMoth.getBoundingClientRect();
          gsap.to(moth, { 
            x: rect.left, 
            y: rect.top, 
            rotation: 0, 
            duration: 2.8, 
            ease: "power2.out" 
          });
        } else {
          gsap.to(moth, { x: window.innerWidth * 0.8, y: window.innerHeight * 0.5, duration: 3.0 });
        }
      } else {
        gsap.to(moth, {
          x: window.innerWidth + 200 + (Math.random() * 500),
          y: `+=${(Math.random() - 0.5) * 500}`,
          rotation: `+=${(Math.random() - 0.5) * 360}`,
          duration: 2.8 + Math.random() * 2.0,
          ease: "power1.inOut",
          delay: Math.random() * 0.6
        });
      }
    });
  }, []);

  const moths = Array.from({ length: 40 });

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      {moths.map((_, i) => (
        <div key={i} className="flood-moth absolute top-0 left-0">
          <InkButterfly className="w-12 h-12 text-ink" />
        </div>
      ))}
    </div>
  );
};

export const CinematicIntro = ({ onComplete }) => {
  const [phase, setPhase] = useState('text'); // 'text' | 'text-morph' | 'flood' | 'morph'
  const overlayRef = useRef(null);
  const wordsGroupRef = useRef(null);
  const thoughtWordsRef = useRef(null);
  const gridRef = useRef(null);
  const bessRef = useRef(null);
  const journalRef = useRef(null);

  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (phase === 'text') {
      // 1. Reveal "a daily thought journal."
      gsap.fromTo('.intro-anim-word', 
        { opacity: 0, y: 25, filter: "blur(6px)" }, 
        { opacity: 1, y: 0, filter: "blur(0px)", stagger: 0.35, duration: 1.4, ease: "power3.out" }
      );
      
      const timer = setTimeout(() => {
        setPhase('text-morph');
      }, 3000);

      return () => clearTimeout(timer);
    }

    if (phase === 'text-morph') {
      // 2. Slow 2.2-second GSAP fade out of "a daily thought"
      if (thoughtWordsRef.current) {
        gsap.to(thoughtWordsRef.current, { 
          opacity: 0, 
          filter: "blur(14px)", 
          y: -15, 
          scale: 0.95,
          duration: 2.2, 
          ease: "power2.inOut" 
        });
      }

      // 3. Simultaneous 2.4-second slow emergence of "Bess" in the exact grid slot
      if (bessRef.current) {
        gsap.fromTo(bessRef.current,
          { opacity: 0, scale: 0.95, filter: "blur(14px)", y: 15 },
          { opacity: 1, scale: 1, filter: "blur(0px)", y: 0, duration: 2.4, delay: 0.3, ease: "power2.out" }
        );
      }

      // The two share a grid cell, so the cell is sized to the wider of them —
      // "a daily thought". Left alone, "Bess's" ends up centred in a cell as wide
      // as the phrase it replaced, stranding "journal." far to its right. Once
      // the thought is on its way out, collapse the cell to the width of the
      // name so "journal." slides in beside it.
      // offsetWidth, not getBoundingClientRect: the tween above has already put
      // scale 0.95 on the name, and a bounding rect would report that scaled
      // width, collapsing the cell ~5% too far.
      if (gridRef.current && bessRef.current) {
        const from = gridRef.current.offsetWidth;
        const to = bessRef.current.offsetWidth;
        if (from && to && Math.abs(from - to) > 1) {
          gsap.set(gridRef.current, { width: from });
          gsap.to(gridRef.current, {
            width: to,
            duration: 1.7,
            delay: 0.95,
            ease: 'power2.inOut',
          });
        }
      }

      const timer = setTimeout(() => {
        setPhase('flood');
      }, 3200);

      return () => clearTimeout(timer);
    }

    if (phase === 'flood') {
      // Fade background overlay to transparent as butterflies flood in
      gsap.to(overlayRef.current, { backgroundColor: 'transparent', duration: 1.8 });

      const timer = setTimeout(() => {
        setPhase('morph');
      }, 1600);

      return () => clearTimeout(timer);
    }

    if (phase === 'morph') {
      const bessIntro = bessRef.current;
      const bessTarget = document.getElementById('target-title-bess');

      const journalIntro = journalRef.current;
      const journalTarget = document.getElementById('target-word-journal');

      const tl = gsap.timeline({
        onComplete: () => {
          if (bessTarget) gsap.set(bessTarget, { opacity: 1 });
          if (journalTarget) gsap.set(journalTarget, { opacity: 1 });
          if (wordsGroupRef.current) gsap.set(wordsGroupRef.current, { opacity: 0 });
          if (onCompleteRef.current) onCompleteRef.current();
        }
      });

      // 1. Bess glides UP to main title
      if (bessIntro && bessTarget) {
        const cIntroRect = bessIntro.getBoundingClientRect();
        const cTargetRect = bessTarget.getBoundingClientRect();

        const cDeltaX = cTargetRect.left - cIntroRect.left;
        const cDeltaY = cTargetRect.top - cIntroRect.top;
        const cScale = cTargetRect.height / cIntroRect.height;

        tl.to(bessIntro, {
          x: cDeltaX,
          y: cDeltaY,
          scale: cScale,
          transformOrigin: "top left",
          duration: 2.2,
          ease: "power3.inOut"
        }, 0);
      }

      // 2. Journal glides DOWN to subtitle
      if (journalIntro && journalTarget) {
        const jIntroRect = journalIntro.getBoundingClientRect();
        const jTargetRect = journalTarget.getBoundingClientRect();

        const jDeltaX = jTargetRect.left - jIntroRect.left;
        const jDeltaY = jTargetRect.top - jIntroRect.top;
        const jScale = jTargetRect.height / jIntroRect.height;

        tl.to(journalIntro, {
          x: jDeltaX,
          y: jDeltaY,
          scale: jScale,
          transformOrigin: "top left",
          duration: 2.2,
          ease: "power3.inOut"
        }, 0);
      }
    }
  }, [phase]);

  return (
    <div 
      ref={overlayRef} 
      className="fixed inset-0 z-50 bg-background flex items-center justify-center p-8 md:p-20 pointer-events-auto transition-colors duration-1000 overflow-hidden"
    >
      {/* Background analog noise texture */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40 mix-blend-overlay bg-[url('/textures/rice-paper.webp')]"></div>

      <div ref={wordsGroupRef} className="relative z-10 w-full max-w-4xl flex items-center justify-center text-center">
        <div className="flex flex-wrap items-center justify-center gap-4">
          
          {/* Shared Grid Cell for "a daily thought" and "Bess" so they never overlap */}
          <div
            ref={gridRef}
            className="inline-grid grid-cols-1 grid-rows-1 items-center justify-items-center"
          >
            {/* "a daily thought" */}
            <div 
              ref={thoughtWordsRef} 
              className="col-start-1 row-start-1 intro-word-thought-group font-serif text-3xl md:text-6xl text-ink/90 inline-flex items-center gap-3"
            >
              <span className="intro-anim-word inline-block">a</span>
              <span className="intro-anim-word inline-block">daily</span>
              <span className="intro-anim-word inline-block">thought</span>
            </div>

            {/* "Bess" */}
            <span 
              ref={bessRef} 
              className="col-start-1 row-start-1 font-handwritten text-6xl md:text-8xl text-accent opacity-0 inline-block transform-gpu origin-top-left"
            >
              Bess's
            </span>
          </div>

          {/* "journal." - sits right next to the grid container without any overlap */}
          <span 
            ref={journalRef} 
            className="intro-anim-word inline-block font-handwritten text-accent text-5xl md:text-7xl rotate-[-2deg] transform-gpu origin-top-left"
          >
            journal.
          </span>
        </div>
      </div>

      {(phase === 'flood' || phase === 'morph') && <ButterflyFlood />}
    </div>
  );
};
