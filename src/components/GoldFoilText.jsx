import React from 'react';

export function GoldFoilText({ children, className = '', as: Component = 'h2' }) {
  return (
    <Component 
      className={`relative inline-block font-serif bg-gradient-to-r from-[#AA771C] via-[#FFD700] to-[#D4AF37] bg-clip-text text-transparent drop-shadow-sm ${className}`}
      style={{
        backgroundImage: 'linear-gradient(135deg, #AA771C 0%, #FFD700 45%, #FAF8F5 50%, #FFD700 55%, #AA771C 100%)',
        backgroundSize: '200% auto',
        animation: 'shine 8s linear infinite',
      }}
    >
      {children}
    </Component>
  );
}
