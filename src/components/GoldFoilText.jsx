import React from 'react';

export function GoldFoilText({ children, className = '', as: Component = 'h2' }) {
  return (
    <Component 
      className={`relative inline-block font-serif bg-gradient-to-r from-[#B87A93] via-[#FFB3CE] to-[#E0A3BC] bg-clip-text text-transparent drop-shadow-sm ${className}`}
      style={{
        backgroundImage: 'linear-gradient(135deg, #B87A93 0%, #FFB3CE 45%, #FDF7F9 50%, #FFB3CE 55%, #B87A93 100%)',
        backgroundSize: '200% auto',
        animation: 'shine 8s linear infinite',
      }}
    >
      {children}
    </Component>
  );
}
