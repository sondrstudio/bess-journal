import React, { useEffect, useState } from 'react';
import gsap from 'gsap';

export function CustomCursor() {
  const [hoverText, setHoverText] = useState('');
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const cursor = document.getElementById('custom-cursor');
    const cursorLabel = document.getElementById('cursor-label');
    
    if (!cursor) return;

    // Hide default cursor on body
    document.body.style.cursor = 'none';

    let ticking = false;
    let latestE = null;

    const updateCursor = () => {
      if (!latestE) {
        ticking = false;
        return;
      }

      gsap.to(cursor, {
        x: latestE.clientX,
        y: latestE.clientY,
        duration: 0.08,
        ease: 'power2.out',
        overwrite: 'auto',
      });

      ticking = false;
    };

    const onMouseMove = (e) => {
      latestE = e;
      if (!ticking) {
        requestAnimationFrame(updateCursor);
        ticking = true;
      }
    };

    const handleMouseOver = (e) => {
      if (e.target.closest('[data-firecracker="true"]')) {
        gsap.to(cursor, { opacity: 0, duration: 0.15 });
        return;
      }

      gsap.to(cursor, { opacity: 1, duration: 0.15 });

      const target = e.target.closest('[data-cursor]');
      if (target) {
        const text = target.getAttribute('data-cursor');
        setHoverText(text);
        setIsActive(true);
        gsap.to(cursor, {
          scale: text ? 4 : 2,
          backgroundColor: text ? 'rgba(194, 24, 91, 0.9)' : 'rgba(69, 24, 44, 0.1)',
          mixBlendMode: text ? 'normal' : 'difference',
          duration: 0.2,
          ease: 'power2.out'
        });
        if (text && cursorLabel) {
          gsap.to(cursorLabel, { opacity: 1, duration: 0.15 });
        }
      } else {
        setHoverText('');
        setIsActive(false);
        gsap.to(cursor, {
          scale: 1,
          backgroundColor: 'rgba(194, 24, 91, 1)',
          mixBlendMode: 'normal',
          duration: 0.2,
          ease: 'power2.out'
        });
        if (cursorLabel) {
          gsap.to(cursorLabel, { opacity: 0, duration: 0.15 });
        }
      }
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
      document.body.style.cursor = 'auto';
    };
  }, []);

  return (
    <div 
      id="custom-cursor" 
      className="fixed top-0 left-0 w-4 h-4 bg-accent rounded-full pointer-events-none z-[100000] flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 will-change-transform"
    >
      <span 
        id="cursor-label" 
        className="text-primary font-body text-[0.2rem] opacity-0 uppercase tracking-widest whitespace-nowrap pointer-events-none"
      >
        {hoverText}
      </span>
    </div>
  );
}
