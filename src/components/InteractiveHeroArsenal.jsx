import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { InkButterfly } from './HandDrawnElements';

// 1. The Scratch-Off Canvas
const ScratchOffSecret = ({ className = '' }) => {
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = 300;
    canvas.height = 150;
    
    // Fill with messy ink
    ctx.fillStyle = "rgba(61, 40, 23, 0.95)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add "scratch me" text
    ctx.font = "italic 16px serif";
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.textAlign = "center";
    ctx.fillText("Scratch to reveal", canvas.width/2, canvas.height/2);

    // Prepare for erasing
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.lineWidth = 40;

    const getCursorPos = (e) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return { x: clientX - rect.left, y: clientY - rect.top };
    };

    const startDraw = (e) => {
      isDrawing.current = true;
      const pos = getCursorPos(e);
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      e.preventDefault();
    };

    const moveDraw = (e) => {
      if (!isDrawing.current) return;
      const pos = getCursorPos(e);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      e.preventDefault();
    };

    const endDraw = () => { isDrawing.current = false; };

    canvas.addEventListener('mousedown', startDraw);
    canvas.addEventListener('mousemove', moveDraw);
    window.addEventListener('mouseup', endDraw);
    canvas.addEventListener('touchstart', startDraw, {passive:false});
    canvas.addEventListener('touchmove', moveDraw, {passive:false});
    window.addEventListener('touchend', endDraw);

    return () => {
      canvas.removeEventListener('mousedown', startDraw);
      canvas.removeEventListener('mousemove', moveDraw);
      window.removeEventListener('mouseup', endDraw);
      canvas.removeEventListener('touchstart', startDraw);
      canvas.removeEventListener('touchmove', moveDraw);
      window.removeEventListener('touchend', endDraw);
    };
  }, []);

  return (
    <div className={`relative w-[300px] h-[150px] ${className}`} style={{ borderRadius: '15px 225px 15px 255px/255px 15px 225px 15px' }}>
      {/* Hidden Text Beneath */}
      <div className="absolute inset-0 flex items-center justify-center p-6 bg-primary border-2 border-ink/30" style={{ borderRadius: '15px 225px 15px 255px/255px 15px 225px 15px' }}>
        <p className="font-handwritten text-xl text-accent rotate-[-2deg]">I kept every single piece of paper you ever gave me.</p>
      </div>
      {/* Scratch Canvas Overlay */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full cursor-crosshair" style={{ borderRadius: '15px 225px 15px 255px/255px 15px 225px 15px' }} />
    </div>
  );
};

// 2. Pluckable Strings
const PluckableStrings = ({ className = '' }) => {
  const stringsRef = useRef(null);
  
  const handleMouseMove = (e) => {
    if(!stringsRef.current) return;
    const rect = stringsRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    
    // Animate the 3 paths if mouse is near
    const paths = stringsRef.current.querySelectorAll('path');
    paths.forEach((path, index) => {
      const baseX = 20 + (index * 20);
      const dist = Math.abs(x - baseX);
      if (dist < 40) {
        // Bend it
        const bend = x > baseX ? 20 : -20;
        gsap.to(path, { attr: { d: `M ${baseX} 0 Q ${baseX + bend} 150 ${baseX} 600` }, duration: 0.1 });
      } else {
        // Snap back
        gsap.to(path, { attr: { d: `M ${baseX} 0 Q ${baseX} 150 ${baseX} 600` }, duration: 0.8, ease: "elastic.out(1, 0.3)" });
      }
    });
  };

  const resetStrings = () => {
    const paths = stringsRef.current.querySelectorAll('path');
    paths.forEach((path, index) => {
      const baseX = 20 + (index * 20);
      gsap.to(path, { attr: { d: `M ${baseX} 0 Q ${baseX} 150 ${baseX} 600` }, duration: 0.8, ease: "elastic.out(1, 0.3)" });
    });
  };

  return (
    <svg 
      ref={stringsRef} 
      className={`absolute opacity-30 ${className}`} 
      onMouseMove={handleMouseMove}
      onMouseLeave={resetStrings}
      width="100" height="600" viewBox="0 0 100 600"
    >
      <path d="M 20 0 Q 20 150 20 600" fill="none" stroke="#45182C" strokeWidth="1" strokeLinecap="round" />
      <path d="M 40 0 Q 40 150 40 600" fill="none" stroke="#45182C" strokeWidth="2" strokeLinecap="round" />
      <path d="M 60 0 Q 60 150 60 600" fill="none" stroke="#45182C" strokeWidth="1" strokeDasharray="4 4" strokeLinecap="round" />
    </svg>
  );
};

// 3. Theme Toggler (Formerly Spilled Coffee)
const ThemeToggleSwitch = ({ isUnlocked }) => {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });
  
  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };
  
  const positionClasses = isUnlocked 
    ? 'fixed top-6 right-6 z-[100] scale-50 rotate-0 translate-x-4 -translate-y-4' 
    : 'absolute right-[5vw] top-[40%] z-10 scale-75 xl:scale-90 rotate-[10deg]';

  return (
    <div className={`cursor-pointer group ${positionClasses} transition-all duration-[1500ms] ease-[cubic-bezier(0.4,0,0.2,1)]`} onClick={toggleTheme}>
      {/* Hand-drawn Instruction Arrow */}
      <div className={`absolute left-[-220px] top-[50px] w-[200px] flex flex-col items-end pointer-events-none transition-opacity duration-1000 ease-in-out z-50 ${isUnlocked ? 'opacity-0' : 'opacity-100'}`}>
        <span className="font-handwritten text-3xl text-ink whitespace-nowrap rotate-[-8deg] mb-2 drop-shadow-md transition-colors duration-700">
          {isDark ? "Turn on the lights" : "Turn off the lights"}
        </span>
        <svg width="60" height="30" viewBox="0 0 60 30" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="opacity-80 text-ink transition-colors duration-700 relative right-[-40px]">
          <path d="M 0 15 Q 30 0 60 15 M 50 5 L 62 16 L 45 22" />
        </svg>
      </div>

      <svg width="200" height="200" viewBox="0 0 200 200" fill="none" stroke="#7A3350" strokeLinecap="round" className="relative z-10 hover:scale-105 transition-transform duration-300">
        <circle cx="100" cy="100" r="80" strokeWidth="6" opacity="0.8" />
        <circle cx="104" cy="98" r="80" strokeWidth="3" opacity="0.4" />
        <path d="M20 100 A80 80 0 0 1 180 100" strokeWidth="10" opacity="0.3" filter="blur(2px)" />
        <circle 
           cx="100" cy="100" r="76" 
           className="transition-all duration-700 ease-in-out fill-ink" 
           style={{ opacity: isDark ? 0.95 : 0, filter: isDark ? 'blur(0px)' : 'blur(8px) contrast(150%)' }} 
        />
        <text 
           x="100" y="105" 
           fontSize="32" 
           textAnchor="middle" 
           fill={isDark ? "#FDF7F9" : "#45182C"}
           stroke={isDark ? "#FDF7F9" : "#45182C"}
           strokeWidth="1.5"
           className="font-handwritten pointer-events-none transition-colors duration-700 drop-shadow-lg"
           style={{ opacity: 1 }}
        >
          {isDark ? 'Light' : 'Dark'}
        </text>
      </svg>
    </div>
  );
};

// 4. Moth Swarm
const InteractiveMoth = ({ startX, startY, id }) => {
  const mothRef = useRef(null);
  
  useEffect(() => {
    const handleMove = (e) => {
      if(!mothRef.current) return;
      const rect = mothRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width/2;
      const centerY = rect.top + rect.height/2;
      const dist = Math.hypot(e.clientX - centerX, e.clientY - centerY);
      
      if (dist < 150) {
        // Scatter away
        const escapeX = (centerX - e.clientX) * 1.5 + (Math.random() - 0.5) * 100;
        const escapeY = (centerY - e.clientY) * 1.5 + (Math.random() - 0.5) * 100;
        gsap.to(mothRef.current, {
           x: `+=${escapeX}`,
           y: `+=${escapeY}`,
           rotate: `+=${(Math.random()-0.5)*90}`,
           duration: 1,
           ease: "power2.out"
        });
      }
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  return (
    <div id={`hero-moth-${id}`} ref={mothRef} className="absolute" style={{ left: startX, top: startY }}>
      <InkButterfly className="w-12 h-12 text-ink/70" />
    </div>
  );
};

export const InteractiveHeroArsenal = ({ isUnlocked, showIntro }) => {
  return (
    <>
      <div className={`absolute top-0 right-0 w-[40vw] h-[100dvh] z-10 hidden md:block transition-all duration-[1500ms] ${isUnlocked ? 'opacity-0 pointer-events-none blur-sm scale-110' : 'opacity-100 pointer-events-none scale-100'}`}>
        
        {/* Container for interactive right-side items */}
        <PluckableStrings className="right-4 top-0 h-full pointer-events-auto" />

        {/* The Moth Swarm scattered logically around the objects */}
        <div className="pointer-events-auto z-40">
           <InteractiveMoth id="0" startX="75%" startY="25%" />
           <InteractiveMoth id="1" startX="85%" startY="45%" />
           <InteractiveMoth id="2" startX="65%" startY="80%" />
        </div>
      </div>

      {/* Extracted Theme Toggle out of fading container so it can persist */}
      <div className={`hidden md:block pointer-events-auto z-[100] transition-opacity duration-1000 ${showIntro ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
         <ThemeToggleSwitch isUnlocked={isUnlocked} />
      </div>
    </>
  );
};
