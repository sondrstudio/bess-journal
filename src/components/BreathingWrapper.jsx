import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';

export function BreathingWrapper({ children, className = '', delay = 0 }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Start a continuous yoyo up/down and gentle rotation float based on sine physics
    const tl = gsap.to(el, {
      y: -6,
      rotation: (Math.random() > 0.5 ? 1 : -1) * 0.5,
      duration: 3 + Math.random() * 2, // 3-5 seconds duration
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
      delay: Math.random() * delay
    });

    return () => tl.kill();
  }, [delay]);

  return (
    <div ref={containerRef} className={`${className} will-change-transform`}>
      {children}
    </div>
  );
}
