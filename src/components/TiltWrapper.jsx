import React, { useRef, useState, useEffect } from 'react';

export function TiltWrapper({ children, options = {}, className = '' }) {
  const ref = useRef(null);
  const { max = 15, scale = 1.05, speed = 400, glare = false } = options;
  
  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * max * -1;
    const rotateY = ((x - centerX) / centerX) * max;
    
    ref.current.style.transform = `perspective(1000px) scale(${scale}) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    if (glare) {
      const glareEl = ref.current.querySelector('.tilt-glare');
      if (glareEl) {
        // Position glare opposite to mouse
        const moveX = (x / rect.width) * 100;
        const moveY = (y / rect.height) * 100;
        glareEl.style.background = `radial-gradient(circle at ${moveX}% ${moveY}%, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 80%)`;
      }
    }
  };
  
  const handleMouseLeave = () => {
    if (!ref.current) return;
    ref.current.style.transform = `perspective(1000px) scale(1) rotateX(0deg) rotateY(0deg)`;
    if (glare) {
      const glareEl = ref.current.querySelector('.tilt-glare');
      if (glareEl) glareEl.style.background = 'transparent';
    }
  };

  return (
    <div 
      ref={ref} 
      onMouseMove={handleMouseMove} 
      onMouseLeave={handleMouseLeave} 
      className={`relative transition-transform ease-out will-change-transform ${className}`}
      style={{ transitionDuration: `${speed}ms` }}
    >
      {glare && (
        <div className="tilt-glare absolute inset-0 pointer-events-none rounded-[inherit] transition-all bg-transparent z-50"></div>
      )}
      {children}
    </div>
  );
}
