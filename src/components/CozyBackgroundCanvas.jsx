import React, { useState } from 'react';

export function CozyBackgroundCanvas() {
  const [isHoveringStain, setIsHoveringStain] = useState(false);
  const [isHoveringRose, setIsHoveringRose] = useState(false);
  const [activeStars, setActiveStars] = useState([]);

  // Constellation Star Nodes
  const stars = [
    { id: 1, x: 80, y: 120, label: '★' },
    { id: 2, x: 130, y: 80, label: '★' },
    { id: 3, x: 180, y: 120, label: '★' },
    { id: 4, x: 160, y: 180, label: '★' },
    { id: 5, x: 130, y: 220, label: '★' },
    { id: 6, x: 100, y: 180, label: '★' },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* ================= 1. COZY AMBIENT CANDLELIGHT GLOW ================= */}
      <div
        className="absolute top-0 right-0 w-[55vw] h-[55vh] rounded-full blur-3xl pointer-events-none transition-opacity duration-1000"
        style={{
          background:
            'radial-gradient(circle at 80% 20%, rgba(255, 158, 0, 0.16) 0%, rgba(255, 110, 0, 0.08) 45%, transparent 70%)',
          animation: 'candleFlicker 6s infinite ease-in-out',
        }}
      />
      <div
        className="absolute bottom-0 left-0 w-[45vw] h-[45vh] rounded-full blur-3xl pointer-events-none transition-opacity duration-1000"
        style={{
          background:
            'radial-gradient(circle at 20% 80%, rgba(212, 175, 55, 0.12) 0%, rgba(183, 65, 14, 0.05) 50%, transparent 70%)',
          animation: 'candleFlicker 8s infinite ease-in-out 2s',
        }}
      />

      {/* ================= 2. COFFEE RING STAIN & PRESSED ROSE WATERMARKS ================= */}
      
      {/* Coffee Stain Ring (Top Left Background) */}
      <div
        onMouseEnter={() => setIsHoveringStain(true)}
        onMouseLeave={() => setIsHoveringStain(false)}
        className={`absolute top-12 left-6 md:left-16 pointer-events-auto cursor-pointer transition-all duration-700 opacity-25 mix-blend-multiply ${
          isHoveringStain ? 'opacity-60 scale-105 filter drop-shadow-[0_0_12px_#D4AF37]' : 'scale-100'
        }`}
      >
        <svg width="140" height="140" viewBox="0 0 200 200" fill="none" stroke="#5D4037" strokeLinecap="round">
          <circle cx="100" cy="100" r="75" strokeWidth="5" opacity="0.85" />
          <circle cx="103" cy="97" r="75" strokeWidth="2.5" opacity="0.45" />
          <path d="M 25 100 A 75 75 0 0 1 175 100" strokeWidth="8" opacity="0.3" filter="blur(2px)" />
          <circle cx="38" cy="155" r="3.5" fill="#5D4037" />
          <circle cx="155" cy="145" r="2" fill="#5D4037" />
        </svg>
      </div>

      {/* Pressed Rose Petal Watermark (Bottom Right Background) */}
      <div
        onMouseEnter={() => setIsHoveringRose(true)}
        onMouseLeave={() => setIsHoveringRose(false)}
        className={`absolute bottom-20 right-8 md:right-20 pointer-events-auto cursor-pointer transition-all duration-700 opacity-30 mix-blend-multiply ${
          isHoveringRose ? 'opacity-70 scale-110 filter drop-shadow-[0_0_16px_#B7410E]' : 'scale-100'
        }`}
      >
        <svg width="120" height="150" viewBox="0 0 100 130" fill="none" stroke="#B7410E" strokeWidth="1.5">
          {/* Rose Stem */}
          <path d="M 50 120 Q 45 80 50 40" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
          {/* Stem Leaves */}
          <path d="M 48 90 C 30 80 25 95 48 100 Z" fill="#B7410E" fillOpacity="0.2" />
          <path d="M 50 70 C 68 60 72 75 50 80 Z" fill="#B7410E" fillOpacity="0.2" />
          {/* Petal Bloom Layers */}
          <path d="M 50 40 C 30 20 30 -5 50 15 C 70 -5 70 20 50 40 Z" fill="#B7410E" fillOpacity="0.3" />
          <path d="M 50 35 C 38 22 38 5 50 20 C 62 5 62 22 50 35 Z" fill="#B7410E" fillOpacity="0.4" />
          <circle cx="50" cy="20" r="4" fill="#B7410E" fillOpacity="0.6" />
        </svg>
      </div>

      {/* ================= 3. INTERACTIVE STAR CONSTELLATION SKETCH ================= */}
      <div className="absolute top-28 right-12 md:right-24 pointer-events-auto hidden sm:block opacity-40 mix-blend-multiply">
        <svg width="240" height="260" viewBox="0 0 240 260" className="overflow-visible">
          {/* Constellation Golden Lines */}
          <path
            d="M 80 120 L 130 80 L 180 120 L 160 180 L 130 220 L 100 180 Z M 130 80 L 130 220"
            fill="none"
            stroke="#D4AF37"
            strokeWidth="1.2"
            strokeDasharray="4 4"
            className="animate-[pulse_4s_infinite_ease-in-out]"
          />
          {/* Star Nodes */}
          {stars.map((star) => (
            <g
              key={star.id}
              className="cursor-pointer hover:scale-150 transition-transform duration-300"
              onMouseEnter={() => setActiveStars((prev) => [...prev, star.id])}
            >
              <circle
                cx={star.x}
                cy={star.y}
                r="4"
                fill="#D4AF37"
                className="animate-[ping_3s_infinite_ease-in-out]"
              />
              <circle cx={star.x} cy={star.y} r="2.5" fill="#3D2817" />
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
