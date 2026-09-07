import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export function AmbientBackground() {
  const bgRef = useRef(null);

  useEffect(() => {
    const bg = bgRef.current;
    if (!bg) return;

    let ticking = false;
    let latestE = null;

    const updateBg = () => {
      if (!latestE) {
        ticking = false;
        return;
      }
      const { innerWidth, innerHeight } = window;
      const xPos = (latestE.clientX / innerWidth - 0.5) * 30;
      const yPos = (latestE.clientY / innerHeight - 0.5) * 30;

      gsap.to(bg, {
        x: -xPos,
        y: -yPos,
        duration: 1.2,
        ease: 'power2.out',
        overwrite: 'auto'
      });

      ticking = false;
    };

    const onMouseMove = (e) => {
      latestE = e;
      if (!ticking) {
        requestAnimationFrame(updateBg);
        ticking = true;
      }
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none overflow-hidden z-[-1] bg-background">
      {/* Background Gradient Base */}
      <div 
        ref={bgRef} 
        className="absolute inset-[-5%] w-[110%] h-[110%] opacity-20 pointer-events-none scale-105 will-change-transform"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(183, 65, 14, 0.15) 0%, rgba(245, 243, 238, 0.05) 50%, transparent 100%)',
        }}
      />
      {/* Animated Light Leaks */}
      <div className="absolute top-0 right-0 w-[45vw] h-[45vw] bg-accent/5 blur-[80px] rounded-full animate-pulse opacity-40 mix-blend-multiply" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-[-10%] left-[-10%] w-[55vw] h-[55vw] bg-rose-500/5 blur-[90px] rounded-full animate-pulse opacity-30 mix-blend-multiply" style={{ animationDuration: '12s' }} />
    </div>
  );
}
