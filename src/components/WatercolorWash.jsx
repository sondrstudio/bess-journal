import React from 'react';

export function WatercolorWash({ color = 'blush', className = '' }) {
  const gradientMap = {
    blush: 'radial-gradient(circle, rgba(255, 179, 206,0.15) 0%, rgba(224, 163, 188,0.05) 50%, transparent 70%)',
    rose: 'radial-gradient(circle, rgba(244,114,182,0.15) 0%, rgba(194, 24, 91,0.05) 50%, transparent 70%)',
    peony: 'radial-gradient(circle, rgba(194, 24, 91,0.15) 0%, rgba(255, 179, 206,0.05) 50%, transparent 70%)',
  };

  return (
    <div 
      className={`absolute inset-0 pointer-events-none mix-blend-multiply rounded-[3rem] blur-2xl transition-opacity duration-1000 ${className}`}
      style={{
        background: gradientMap[color] || gradientMap.blush,
      }}
    />
  );
}
