import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

// ================= ORIGINAL ELEMENTS =================
export const DividerSketch1 = ({ className = '' }) => (
  <div className={`w-full flex justify-center opacity-70 ${className}`}>
    <svg className="overflow-visible" width="300" height="30" viewBox="0 0 400 30" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5,15 Q50,0 100,15 T200,15 T300,15 T395,15" />
      <path d="M10,20 Q60,5 110,20 T210,20 T310,20 T390,20" opacity="0.4" />
    </svg>
  </div>
);

export const DividerSketch2 = ({ className = '' }) => (
  <div className={`w-full flex justify-center opacity-60 ${className}`}>
    <svg className="overflow-visible" width="200" height="40" viewBox="0 0 200 40" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10,20 C50,40 150,0 190,20 M15,15 C80,35 120,5 185,25 M30,25 C100,5 100,35 170,15" opacity="0.7" />
    </svg>
  </div>
);

export const ScribbleCircle = ({ className = '' }) => (
  <svg className={`absolute overflow-visible pointer-events-none opacity-40 ${className}`} viewBox="0 0 200 100" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M100,10 C160,5 190,40 180,70 C160,110 40,110 20,70 C5,40 30,15 100,15 C150,15 170,35 160,60" />
    <path d="M90,20 C140,20 170,45 150,70 C120,100 60,90 30,60 C10,35 40,25 90,25" />
  </svg>
);

export const ArrowSketch = ({ className = '' }) => (
  <svg className={`absolute overflow-visible pointer-events-none opacity-60 ${className}`} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10,10 Q40,60 80,90 M60,90 L80,90 L75,70" />
  </svg>
);

export const InkDrop = ({ className = '' }) => (
  <svg className={`absolute overflow-visible pointer-events-none opacity-80 mix-blend-multiply ${className}`} viewBox="0 0 50 50" fill="currentColor">
    <path d="M25,5 C35,15 45,25 40,40 C35,50 15,50 10,40 C5,25 15,15 25,5 Z" />
    <circle cx="15" cy="45" r="3" />
    <circle cx="35" cy="10" r="2" />
  </svg>
);

// ================= NEW ALIVE/INTERACTIVE ELEMENTS =================

// An ink butterfly that constantly flaps its wings 
export const InkButterfly = ({ className = '' }) => {
  const leftWing = useRef(null);
  const rightWing = useRef(null);
  useEffect(() => {
    // Asynchronous pulsing for alive flapping
    gsap.to(leftWing.current, { scaleX: 0.2, duration: 1.2, transformOrigin: "right center", yoyo: true, repeat: -1, ease: "sine.inOut" });
    gsap.to(rightWing.current, { scaleX: 0.2, duration: 1.4, transformOrigin: "left center", yoyo: true, repeat: -1, ease: "sine.inOut" });
  }, []);
  
  return (
    <div className={`absolute pointer-events-none opacity-70 mix-blend-multiply ${className}`}>
      <svg width="40" height="40" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M50 20 L50 90" strokeWidth="4" strokeLinecap="round" opacity="0.8" />
        <path ref={leftWing} d="M50 30 C30 0 0 30 15 50 C0 70 20 100 50 70 Z" fill="currentColor" fillOpacity="0.4" />
        <path ref={rightWing} d="M50 30 C70 0 100 30 85 50 C100 70 80 100 50 70 Z" fill="currentColor" fillOpacity="0.3" />
      </svg>
    </div>
  );
};

// Blinking sketched eye that looks around slightly when hovered
export const SketchyEye = ({ className = '' }) => {
  const pupilRef = useRef(null);
  const lidRef = useRef(null);
  
  const handleHover = () => {
    gsap.to(pupilRef.current, { x: (Math.random() - 0.5) * 15, duration: 0.3 });
    // Blink
    gsap.to(lidRef.current, { scaleY: 0.1, duration: 0.1, yoyo: true, repeat: 1, transformOrigin: "center" });
  };
  
  useEffect(() => {
    // Random blinking natively
    const blinkInterval = setInterval(() => {
       gsap.to(lidRef.current, { scaleY: 0.1, duration: 0.1, yoyo: true, repeat: 1, transformOrigin: "center" });
    }, 4000 + Math.random() * 3000);
    return () => clearInterval(blinkInterval);
  }, []);

  return (
    <div className={`absolute opacity-60 mix-blend-multiply cursor-pointer ${className}`} onMouseEnter={handleHover}>
      <svg width="60" height="40" viewBox="0 0 100 60" fill="none" stroke="currentColor" strokeWidth="2">
        <g ref={lidRef}>
          <path d="M5 30 Q50 -10 95 30 Q50 70 5 30" strokeLinecap="round" />
        </g>
        <circle ref={pupilRef} cx="50" cy="30" r="10" fill="currentColor" />
        <path d="M10 20 L0 10 M30 10 L25 0 M70 10 L75 0 M90 20 L100 10" strokeWidth="1.5" opacity="0.5" />
      </svg>
    </div>
  );
};

export const CoffeeRing = ({ className = '' }) => (
  <svg className={`absolute pointer-events-none opacity-20 mix-blend-multiply ${className}`} width="150" height="150" viewBox="0 0 200 200" fill="none" stroke="#7A3350" strokeLinecap="round">
    <circle cx="100" cy="100" r="80" strokeWidth="6" opacity="0.8" />
    <circle cx="104" cy="98" r="80" strokeWidth="3" opacity="0.4" />
    <path d="M20 100 A80 80 0 0 1 180 100" strokeWidth="10" opacity="0.3" filter="blur(2px)" />
    <circle cx="40" cy="160" r="4" fill="#7A3350" />
    <circle cx="160" cy="150" r="2" fill="#7A3350" />
  </svg>
);

export const HeartScribble = ({ className = '' }) => (
  <svg className={`absolute overflow-visible pointer-events-none opacity-60 ${className}`} viewBox="0 0 100 100" fill="none" stroke="#e11d48" strokeWidth="2" strokeLinecap="round">
    <path d="M50 30 C50 30 45 10 30 10 C10 10 10 40 50 80 C90 40 90 10 70 10 C55 10 50 30 50 30" style={{ animation: 'dashFlow 4s ease-in-out infinite alternate' }} />
    <path d="M48 30 C48 30 45 15 30 15 C15 15 15 40 50 75 C85 40 85 15 70 15 C55 15 52 30 52 30" opacity="0.5" />
  </svg>
);

export const MessyQuoteMarks = ({ className = '' }) => (
  <svg className={`absolute pointer-events-none opacity-40 mix-blend-multiply ${className}`} width="40" height="40" viewBox="0 0 50 50" fill="currentColor">
    <path d="M10 20 C20 15 25 5 25 5 L15 0 C10 5 0 15 5 30 Z" />
    <path d="M30 20 C40 15 45 5 45 5 L35 0 C30 5 20 15 25 30 Z" />
    <path d="M12 25 L10 20 M32 25 L30 20" stroke="currentColor" strokeWidth="2" />
  </svg>
);

export const SketchyStar = ({ className = '' }) => (
  <div className={`absolute opacity-50 mix-blend-multiply ${className}`}>
    <svg width="30" height="30" viewBox="0 0 50 50" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-[spin_20s_linear_infinite]">
      <path d="M25 5 L30 20 L45 20 L32 30 L38 45 L25 35 L12 45 L18 30 L5 20 L20 20 Z" />
      <path d="M25 8 L29 20 L40 20 L31 28 L35 40 L25 32 L15 40 L19 28 L10 20 L21 20 Z" opacity="0.5" />
    </svg>
  </div>
);

// Drawn frame wrapper
export const ScallopedFrame = ({ children, className = '' }) => (
  <div className={`relative ${className}`}>
    <svg className="absolute inset-[-10px] w-[calc(100%+20px)] h-[calc(100%+20px)] pointer-events-none opacity-30 mix-blend-multiply" fill="none" stroke="currentColor" strokeWidth="2">
       <rect x="5" y="5" width="calc(100% - 10px)" height="calc(100% - 10px)" strokeDasharray="10 10" />
       <rect x="8" y="8" width="calc(100% - 16px)" height="calc(100% - 16px)" strokeDasharray="40 20" opacity="0.6" />
    </svg>
    {children}
  </div>
);
