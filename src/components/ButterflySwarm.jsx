import React, { useEffect, useState } from 'react';

export function ButterflySwarm({ count = 25, active = false }) {
  const [butterflies, setButterflies] = useState([]);

  useEffect(() => {
    if (!active) return;
    const list = Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 90 + 5,
      top: Math.random() * 80 + 10,
      size: Math.random() * 24 + 18,
      duration: Math.random() * 3 + 2.5,
      delay: Math.random() * 0.8,
      color: i % 3 === 0 ? '#FFD700' : i % 3 === 1 ? '#B7410E' : '#F7E7CE',
      rotation: (Math.random() - 0.5) * 40,
    }));
    setButterflies(list);
  }, [active, count]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {butterflies.map((b) => (
        <div
          key={b.id}
          className="absolute animate-[floatUp_3.5s_ease-out_forwards]"
          style={{
            left: `${b.left}%`,
            top: `${b.top}%`,
            animationDelay: `${b.delay}s`,
            transform: `rotate(${b.rotation}deg)`,
          }}
        >
          {/* SVG Animated Butterfly */}
          <svg
            width={b.size}
            height={b.size}
            viewBox="0 0 50 50"
            className="drop-shadow-md"
          >
            <g fill={b.color}>
              {/* Left Wing */}
              <path
                d="M25,25 C15,10 0,15 5,30 C10,40 25,30 25,25 Z"
                className="animate-[flapLeft_0.3s_infinite_alternate_ease-in-out] origin-[25px_25px]"
              />
              {/* Right Wing */}
              <path
                d="M25,25 C35,10 50,15 45,30 C40,40 25,30 25,25 Z"
                className="animate-[flapRight_0.3s_infinite_alternate_ease-in-out] origin-[25px_25px]"
              />
              {/* Body */}
              <ellipse cx="25" cy="25" rx="1.5" ry="7" fill="#3D2817" />
            </g>
          </svg>
        </div>
      ))}
    </div>
  );
}
