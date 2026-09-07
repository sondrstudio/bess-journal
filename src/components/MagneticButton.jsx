import React, { useRef } from 'react';

export function MagneticButton({ children, onClick, className = '' }) {
  const btnRef = useRef(null);

  const handleMouseMove = (e) => {
    const btn = btnRef.current;
    if (!btn) return;
    
    // Calculate mouse position relative to center
    const rect = btn.getBoundingClientRect();
    const mapX = (e.clientX - rect.left) / rect.width;
    const mapY = (e.clientY - rect.top) / rect.height;

    // Move button towards cursor (max 10px translate)
    const moveX = (mapX - 0.5) * 20;
    const moveY = (mapY - 0.5) * 20;

    btn.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.03)`;
  };

  const handleMouseLeave = () => {
    const btn = btnRef.current;
    if (!btn) return;
    btn.style.transform = `translate(0px, 0px) scale(1)`;
  };

  return (
    <button
      ref={btnRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden transition-all duration-[400ms] ease-out hover:shadow-lg ${className}`}
      style={{
        transitionTimingFunction: "cubic-bezier(0.25, 0.46, 0.45, 0.94)"
      }}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </button>
  );
}
