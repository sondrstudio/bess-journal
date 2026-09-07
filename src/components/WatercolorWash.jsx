import React from 'react';

export function WatercolorWash({ color = 'gold', className = '' }) {
  const gradientMap = {
    gold: 'radial-gradient(circle, rgba(255,215,0,0.15) 0%, rgba(212,175,55,0.05) 50%, transparent 70%)',
    rose: 'radial-gradient(circle, rgba(244,114,182,0.15) 0%, rgba(183,65,14,0.05) 50%, transparent 70%)',
    amber: 'radial-gradient(circle, rgba(183,65,14,0.15) 0%, rgba(255,171,64,0.05) 50%, transparent 70%)',
  };

  return (
    <div 
      className={`absolute inset-0 pointer-events-none mix-blend-multiply rounded-[3rem] blur-2xl transition-opacity duration-1000 ${className}`}
      style={{
        background: gradientMap[color] || gradientMap.gold,
      }}
    />
  );
}
