import React, { useState, useEffect, useRef } from 'react';
import { Share2 } from 'lucide-react';
import { ShareExportModal } from './ShareExportModal';

export function LivingNoteWrapper({ children, entryData }) {
  const [isFocused, setIsFocused] = useState(false);
  const [ripples, setRipples] = useState([]);
  const [isShareOpen, setIsShareOpen] = useState(false);
  
  // 3 Hand-drawn Ink Butterflies (matching opening cluster InkButterfly style)
  const [butterflies, setButterflies] = useState([
    { id: 1, x: 88, y: -20, isFlying: false, targetX: 88, targetY: -20, rotation: 15 },
    { id: 2, x: -8, y: 140, isFlying: false, targetX: -8, targetY: 140, rotation: -18 },
    { id: 3, x: 86, y: 260, isFlying: false, targetX: 86, targetY: 260, rotation: 10 },
  ]);

  const containerRef = useRef(null);

  // Handle Click & Typing Wet Ink Ripples
  const handleContainerClick = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newRipple = { id: Date.now() + Math.random(), x, y };
    setRipples((prev) => [...prev.slice(-4), newRipple]);
  };

  // Startle Butterfly to take flight across the note
  const scareButterfly = (id) => {
    setButterflies((prev) =>
      prev.map((b) => {
        if (b.id === id && !b.isFlying) {
          const newX = b.x > 40 ? Math.random() * 20 - 10 : Math.random() * 20 + 75;
          const newY = Math.random() * 200 + 30;
          return { ...b, isFlying: true, targetX: newX, targetY: newY };
        }
        return b;
      })
    );

    setTimeout(() => {
      setButterflies((prev) =>
        prev.map((b) => (b.id === id ? { ...b, isFlying: false, x: b.targetX, y: b.targetY } : b))
      );
    }, 3500);
  };

  const handleFocus = () => {
    setIsFocused(true);
    scareButterfly(1);
    scareButterfly(2);
    scareButterfly(3);
  };

  return (
    <div
      ref={containerRef}
      onClick={handleContainerClick}
      onFocusCapture={handleFocus}
      onBlurCapture={() => setIsFocused(false)}
      className="relative w-full max-w-5xl mx-auto py-16 md:py-24 pl-10 md:pl-20 pr-6 md:pr-12 select-text overflow-visible"
    >
      {/* MAIN NOTE CARD CONTAINER (Vine anchored to this container) */}
      <div className="relative w-full">
        {/* ================= ELEGANT ROOTED MARGIN VINE ================= */}
        <div className="absolute left-[-20px] md:left-[-32px] top-4 bottom-4 w-12 pointer-events-none z-10 opacity-55 mix-blend-multiply">
          <svg viewBox="0 0 50 500" className="w-full h-full text-ink overflow-visible">
            <g className="origin-top animate-[vineBreeze_8s_infinite_ease-in-out]">
              {/* Smooth Continuous Vine Stem */}
              <path
                d="M 25 10 Q 38 140 16 270 T 28 480"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              />

              {/* Top Curled Tendril */}
              <path
                d="M 25 10 C 15 -10 40 -15 35 5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />

              {/* Leaf Pair 1 */}
              <path
                d="M 26 70 C 44 55, 48 80, 26 88 Z"
                fill="currentColor"
                fillOpacity="0.45"
                className="origin-[26px_70px] animate-[leafSway_5s_infinite_ease-in-out]"
              />
              <path
                d="M 23 120 C 5 105, -2 130, 23 138 Z"
                fill="currentColor"
                fillOpacity="0.38"
                className="origin-[23px_120px] animate-[leafSway_6s_infinite_ease-in-out_1s]"
              />

              {/* Leaf Pair 2 */}
              <path
                d="M 21 210 C 40 195, 46 220, 21 228 Z"
                fill="currentColor"
                fillOpacity="0.45"
                className="origin-[21px_210px] animate-[leafSway_5.5s_infinite_ease-in-out_0.5s]"
              />
              <path
                d="M 18 290 C 0 275, -6 300, 18 308 Z"
                fill="currentColor"
                fillOpacity="0.38"
                className="origin-[18px_290px] animate-[leafSway_6.5s_infinite_ease-in-out_1.5s]"
              />

              {/* Leaf Pair 3 */}
              <path
                d="M 25 380 C 44 365, 50 390, 25 398 Z"
                fill="currentColor"
                fillOpacity="0.4"
                className="origin-[25px_380px] animate-[leafSway_5.2s_infinite_ease-in-out_0.8s]"
              />
              <path
                d="M 26 440 C 8 425, 2 450, 26 458 Z"
                fill="currentColor"
                fillOpacity="0.35"
                className="origin-[26px_440px] animate-[leafSway_6.2s_infinite_ease-in-out_1.2s]"
              />

              {/* Delicate Ink Flower Bud */}
              <circle
                cx="35"
                cy="5"
                r="3"
                fill="currentColor"
                className="animate-[pulse_4s_infinite_ease-in-out]"
              />
            </g>
          </svg>
        </div>

        {/* ================= HAND-DRAWN INK BUTTERFLIES ================= */}
        {butterflies.map((b) => (
          <div
            key={b.id}
            onMouseEnter={() => scareButterfly(b.id)}
            className={`absolute z-30 cursor-pointer opacity-80 mix-blend-multiply transition-all duration-[3500ms] cubic-bezier(0.25,1,0.5,1) ${
              b.isFlying ? 'scale-125 z-40' : 'scale-100'
            }`}
            style={{
              left: `${b.isFlying ? b.targetX : b.x}%`,
              top: `${b.isFlying ? b.targetY : b.y}px`,
              transform: `rotate(${b.isFlying ? b.rotation + 35 : b.rotation}deg)`,
            }}
          >
            <svg width="44" height="44" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M50 20 L50 90" stroke="#1F140D" strokeWidth="4" strokeLinecap="round" opacity="0.85" />
              <path
                d="M50 30 C30 0 0 30 15 50 C0 70 20 100 50 70 Z"
                fill="currentColor"
                fillOpacity="0.4"
                className={`${
                  b.isFlying
                    ? 'animate-[flapFast_0.15s_infinite_alternate_ease-in-out]'
                    : 'animate-[flapSlow_2.2s_infinite_alternate_ease-in-out]'
                } origin-[50px_50px] hover:fill-accent`}
              />
              <path
                d="M50 30 C70 0 100 30 85 50 C100 70 80 100 50 70 Z"
                fill="currentColor"
                fillOpacity="0.32"
                className={`${
                  b.isFlying
                    ? 'animate-[flapFast_0.15s_infinite_alternate_ease-in-out]'
                    : 'animate-[flapSlow_2.2s_infinite_alternate_ease-in-out]'
                } origin-[50px_50px] hover:fill-accent`}
              />
            </svg>
          </div>
        ))}

        {/* ================= PEN TIP FIREFLIES ================= */}
        {isFocused && (
          <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
            <div className="absolute top-1/3 left-1/4 w-2 h-2 rounded-full bg-[#FFB3CE] shadow-[0_0_15px_#FFB3CE] animate-[fireflyOrbit_4s_infinite_ease-in-out]" />
            <div className="absolute top-1/2 right-1/4 w-2.5 h-2.5 rounded-full bg-[#FF9EC0] shadow-[0_0_18px_#FF9EC0] animate-[fireflyOrbit_5s_infinite_ease-in-out_1s]" />
            <div className="absolute bottom-1/3 left-1/2 w-2 h-2 rounded-full bg-[#FFD6E4] shadow-[0_0_12px_#FFD6E4] animate-[fireflyOrbit_3.5s_infinite_ease-in-out_0.5s]" />
          </div>
        )}

        {/* Wet Ink Ripples */}
        {ripples.map((r) => (
          <span
            key={r.id}
            className="absolute pointer-events-none rounded-full bg-accent/20 border border-accent/40 animate-[inkRipple_0.8s_ease-out_forwards] z-10"
            style={{
              left: r.x,
              top: r.y,
              transform: 'translate(-50%, -50%)',
            }}
          />
        ))}

        {/* Top Right Share & Export JPG Action */}
        {entryData && (
          <div className="absolute top-4 right-4 z-30">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsShareOpen((prev) => !prev);
              }}
              className={`p-3.5 rounded-full transition-all shadow-md group ${
                isShareOpen
                  ? 'bg-ink text-background scale-105 ring-2 ring-accent'
                  : 'bg-accent hover:bg-ink text-background hover:scale-110 active:scale-95'
              }`}
              title={isShareOpen ? "Close Export Studio" : "Export JPG version of this note"}
              aria-label="Export JPG version"
            >
              <Share2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        )}

        {/* Note Children */}
        <div className="relative z-20">{children}</div>
      </div>

      {/* Share & Export Modal (Expands below card without moving the vine) */}
      {entryData && (
        <ShareExportModal
          isOpen={isShareOpen}
          onClose={() => setIsShareOpen(false)}
          entry={entryData}
        />
      )}
    </div>
  );
}
