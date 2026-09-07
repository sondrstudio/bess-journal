import React, { useState } from 'react';

const NAME = "Bess's";

export function ReactiveBessTitle({ showIntro }) {
  const letters = NAME.split('');
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [poppedIndex, setPoppedIndex] = useState(null);

  const handleLetterClick = (index) => {
    setPoppedIndex(index);
    setTimeout(() => setPoppedIndex(null), 600);
  };

  return (
    <h1
      id="target-title-bess"
      aria-label="Bess's"
      onMouseLeave={() => setHoveredIndex(null)}
      className={`font-handwritten text-7xl md:text-9xl leading-none inline-flex items-center select-none pointer-events-auto transition-opacity duration-500 ${
        showIntro ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {letters.map((char, index) => {
        // Calculate distance from hovered letter (0 = active center, 1 = adjacent neighbors, 2 = distant)
        const distance = hoveredIndex !== null ? Math.abs(index - hoveredIndex) : 99;
        const isCenter = distance === 0;
        const isNeighbor = distance === 1;
        const isPopped = poppedIndex !== null && Math.abs(index - poppedIndex) <= 1;

        // Alternating rotational tilt for a organic handwritten cluster feel
        const tiltDirection = index % 2 === 0 ? 1 : -1;
        const rot = isCenter ? tiltDirection * 8 : isNeighbor ? tiltDirection * 4 : 0;

        return (
          <span
            key={index}
            onMouseEnter={() => setHoveredIndex(index)}
            onClick={() => handleLetterClick(index)}
            className={`inline-block cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] transform origin-bottom ${
              isCenter
                ? 'text-ink dark:text-rose-100 z-30 drop-shadow-[0_12px_24px_rgba(194,24,91,0.45)]'
                : isNeighbor
                ? 'text-accent/90 z-20 drop-shadow-[0_6px_14px_rgba(194,24,91,0.25)]'
                : 'text-accent translate-y-0 scale-100 rotate-0 z-10'
            } ${isPopped ? 'animate-bounce' : ''}`}
            style={{
              transform: isCenter
                ? `translateY(-1.5rem) scale(1.32) rotate(${rot}deg)`
                : isNeighbor
                ? `translateY(-0.75rem) scale(1.16) rotate(${rot}deg)`
                : undefined,
              transitionDelay: `${distance * 20}ms`,
            }}
          >
            {char}
          </span>
        );
      })}
    </h1>
  );
}
