import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';

export function RedStringUnlock({ onUnlock }) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const containerRef = useRef(null);
  const pathRef = useRef(null);
  const textRef = useRef(null);
  const hasUnlocked = useRef(false);
  
  // Left point (static knot)
  const leftPoint = { x: 40, y: 150 };
  
  const [rightPoint, setRightPoint] = useState({ x: 500, y: 150 });
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(500);

  useEffect(() => {
    if (containerRef.current) {
        const dist = containerRef.current.clientWidth - 80; // Keep it safely inside the container
        setRightPoint({ x: dist, y: 150 });
        startX.current = dist;
    }
  }, []);

  const startDrag = (e) => {
    if (isUnlocked) return;
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMove = (e) => {
      if (!isDragging) return;
      
      const svgRect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - svgRect.left;
      const y = e.clientY - svgRect.top;
      
      // Calculate distance to snap point
      const dx = leftPoint.x - x;
      const dy = leftPoint.y - y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 30 && !hasUnlocked.current) {
        // SNAPPED! 
        hasUnlocked.current = true;
        setIsUnlocked(true);
        setIsDragging(false);
        setRightPoint({ x: leftPoint.x, y: leftPoint.y });
        
        // Trigger reveal GSAP animation
        gsap.to(pathRef.current, { strokeWidth: 5, stroke: '#e11d48', duration: 0.2, yoyo: true, repeat: 3 });
        gsap.to(textRef.current, { opacity: 0, duration: 0.5 });
        
        if (onUnlock) {
          setTimeout(onUnlock, 1200);
        }
      } else if (!hasUnlocked.current) {
        setRightPoint({ x, y });
      }
    };

    const handleUp = () => {
      if (!isUnlocked && isDragging) {
        setIsDragging(false);
        // Snap back if failed by tweening a proxy object
        let proxy = { x: rightPoint.x, y: rightPoint.y };
        gsap.to(proxy, {
           x: startX.current, y: 150, duration: 0.6, ease: 'elastic.out(1, 0.4)',
           onUpdate: () => setRightPoint({ x: proxy.x, y: proxy.y })
        });
      }
    };

    if (isDragging) {
      window.addEventListener('pointermove', handleMove);
      window.addEventListener('pointerup', handleUp);
    }
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };
  }, [isDragging, isUnlocked]);

  // Generate dynamic path using quadratic bezier.
  // The control point sags downwards slightly to simulate gravity.
  const controlPoint = {
    x: (leftPoint.x + rightPoint.x) / 2,
    y: Math.max(leftPoint.y, rightPoint.y) + (isDragging ? -20 : 40)
  };
  
  const pathD = `M ${leftPoint.x} ${leftPoint.y} Q ${controlPoint.x} ${controlPoint.y} ${rightPoint.x} ${rightPoint.y}`;

  return (
    <div className="relative w-full h-[300px] flex flex-col items-center justify-center -ml-10">
      <svg ref={containerRef} className="w-full h-full overflow-visible" style={{ touchAction: 'none' }}>
        
        {/* Wavy broken background line (Left Anchor) */}
        {!isUnlocked && (
           <path d="M -50 200 Q 0 160 50 150" fill="none" stroke="#F43F5E" strokeWidth="2" opacity="0.4" strokeDasharray="4 4" />
        )}

        {/* Curly Arrow Instruction */}
        {!isUnlocked && !isDragging && rightPoint.x > 300 && (
          <g className="animate-[pulse_2s_ease-in-out_infinite] opacity-70 pointer-events-none" transform={`translate(${startX.current}, 150)`}>
            {/* Arrow pointing explicitly at the knot (0,0) from the top-left */}
            <path d="M -100 -40 Q -50 -50 -20 -15" fill="none" stroke="#F43F5E" strokeWidth="2" strokeLinecap="round" />
            <path d="M -20 -15 L -30 -20 M -20 -15 L -25 -5" fill="none" stroke="#F43F5E" strokeWidth="2" strokeLinecap="round" />
            <text x="-120" y="-50" fill="#F43F5E" fontSize="20" className="font-handwritten" transform="rotate(-10 -120 -50)">Pull string</text>
          </g>
        )}
        
        {/* The dynamic string */}
        <path 
          ref={pathRef}
          d={pathD} 
          fill="none" 
          stroke="#F43F5E" 
          strokeWidth={isDragging ? 3 : 2} 
          strokeLinecap="round" 
          style={{ 
             filter: 'drop-shadow(0 0 6px rgba(244, 63, 94, 0.5))',
             transition: 'stroke-width 0.2s ease'
          }} 
        />
        
        {/* Left fixed knot */}
        <circle cx={leftPoint.x} cy={leftPoint.y} r="6" fill="#F43F5E" />
        <circle cx={leftPoint.x} cy={leftPoint.y} r="14" fill="none" stroke="#F43F5E" strokeWidth="1" strokeDasharray="2 2" className="animate-spin-slow" />
        
        {/* Right draggable knot */}
        {!isUnlocked && (
          <g 
            transform={`translate(${rightPoint.x}, ${rightPoint.y})`} 
            onPointerDown={startDrag} 
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
            data-cursor="" /* Transitions from BEGIN back to the dot */
          >
            {/* Extended invisible hit area for easier grabbing */}
            <circle cx="0" cy="0" r="40" fill="transparent" /> 
            <circle cx="0" cy="0" r="10" fill="#F43F5E" className="hover:scale-125 transition-transform" />
            <circle cx="0" cy="0" r="20" fill="none" stroke="#F43F5E" strokeWidth="1" className={isDragging ? 'opacity-100 scale-150' : 'opacity-0 scale-100'} style={{ transition: 'all 0.3s ease' }} />
          </g>
        )}
      </svg>
      
      <div className="absolute left-[80px] top-[140px] pointer-events-none">
         <p ref={textRef} className="font-handwritten text-2xl text-accent/80 opacity-90">
            Connect the thread...
         </p>
      </div>
    </div>
  );
}
