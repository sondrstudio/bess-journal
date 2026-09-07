import React, { useRef, useEffect } from 'react';

export function MagneticText({ text, className = '' }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Split massive text
    const chars = text.split('');
    el.innerHTML = '';
    
    chars.forEach((char) => {
      // Outer wrapper handles layout
      const span = document.createElement('span');
      // Use standard styling for flex gap vs hardcoded nbsp
      span.innerHTML = char === ' ' ? '&nbsp;' : char;
      span.className = 'inline-block relative z-10 transition-transform duration-500 ease-out will-change-transform char-repel';
      
      const innerTracker = document.createElement('span');
      innerTracker.className = 'inline-block';
      innerTracker.innerHTML = span.innerHTML;
      
      span.innerHTML = '';
      span.appendChild(innerTracker);
      el.appendChild(span);
    });

    const charNodes = el.querySelectorAll('span.char-repel');
    
    const handleMouseMove = (e) => {
      charNodes.forEach((node) => {
        const rect = node.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const dx = e.clientX - centerX;
        const dy = e.clientY - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        const maxDist = 200; // Repel radius
        if (distance < maxDist) {
          const force = (maxDist - distance) / maxDist;
          // Push away from cursor
          const pushX = (dx / distance) * -1 * force * 50; 
          const pushY = (dy / distance) * -1 * force * 50;
          
          node.firstChild.style.transform = `translate(${pushX}px, ${pushY}px) scale(${1 + force * 0.3}) rotate(${pushX * -0.2}deg)`;
        } else {
          node.firstChild.style.transform = `translate(0px, 0px) scale(1) rotate(0deg)`;
        }
      });
    };
    
    const handleMouseLeave = () => {
      charNodes.forEach((node) => {
        node.firstChild.style.transform = `translate(0px, 0px) scale(1) rotate(0deg)`;
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [text]);

  return (
    <div ref={containerRef} className={`${className} flex`} />
  );
}
