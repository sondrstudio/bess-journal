import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import confetti from 'canvas-confetti';

const NUM_NODES = 24;
const START_X = 110;
const START_Y = 18;
const END_X = 100;
const END_Y = 270;
const SEGMENT_LEN = 11.5;

// Helper function to draw sharp starburst glint flares
const drawStar = (ctx, cx, cy, spikes, outerRadius, innerRadius, rotation, fillStyle, alpha) => {
  let rot = (Math.PI / 2) * 3 + rotation;
  const step = Math.PI / spikes;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < spikes; i++) {
    let x = cx + Math.cos(rot) * outerRadius;
    let y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;
    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
  ctx.fillStyle = fillStyle;
  ctx.globalAlpha = alpha;
  ctx.fill();
  ctx.restore();
};

export function FirecrackerRopeUnlock({ onUnlock }) {
  const [isIgnited, setIsIgnited] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [svgPathD, setSvgPathD] = useState("");
  const [sparkPos, setSparkPos] = useState({ x: END_X, y: END_Y });

  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const ropePathRef = useRef(null);
  const resumeRef = useRef(null);
  const mountTimeRef = useRef(0);

  // Verlet Physics Nodes array
  const nodesRef = useRef([]);
  const particlesRef = useRef([]);
  const ashesRef = useRef([]);
  const smokeRef = useRef([]);

  const isIgnitedRef = useRef(false);
  const burnProgressRef = useRef(0);
  const mousePosRef = useRef({ x: -100, y: -100 });
  const isHoveredRef = useRef(false);

  // Initialize Verlet Physics Nodes
  useEffect(() => {
    const nodes = [];
    for (let i = 0; i < NUM_NODES; i++) {
      const t = i / (NUM_NODES - 1);
      // Natural initial drape curve
      const x = START_X + (END_X - START_X) * t - Math.sin(t * Math.PI) * 18;
      const y = START_Y + (END_Y - START_Y) * t;
      nodes.push({
        x,
        y,
        oldX: x,
        oldY: y,
        pinned: i === 0,
        burnt: false,
      });
    }
    nodesRef.current = nodes;
  }, []);

  useEffect(() => {
    isHoveredRef.current = isHovered;
    isIgnitedRef.current = isIgnited;
  }, [isHovered, isIgnited]);

  // 60FPS Verlet Physics Engine & Canvas Particle Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      if (containerRef.current) {
        canvas.width = containerRef.current.clientWidth;
        canvas.height = containerRef.current.clientHeight;
      }
    };
    resize();
    window.addEventListener('resize', resize);
    mountTimeRef.current = performance.now();

    const spawnCursorSparks = (x, y) => {
      for (let i = 0; i < 6; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 4.5 + 1.2;
        particlesRef.current.push({
          x: x + (Math.random() - 0.5) * 6,
          y: y + (Math.random() - 0.5) * 6,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.5,
          life: 1.0,
          decay: Math.random() * 0.045 + 0.02,
          size: Math.random() * 3.5 + 1.5,
          isStar: Math.random() > 0.35,
          spikes: Math.random() > 0.75 ? 8 : 4,
          rot: Math.random() * Math.PI,
          rotSpeed: (Math.random() - 0.5) * 0.35,
          canBurst: Math.random() > 0.7,
          hasBurst: false,
          sparkle: true,
        });
      }

      if (Math.random() > 0.4) {
        smokeRef.current.push({
          x: x + (Math.random() - 0.5) * 10,
          y: y + (Math.random() - 0.5) * 6,
          vx: (Math.random() - 0.5) * 0.6,
          vy: -Math.random() * 0.8 - 0.4,
          size: Math.random() * 4 + 3,
          life: 1.0,
          decay: Math.random() * 0.02 + 0.015,
        });
      }
    };

    const spawnFuseBurnEffects = (headX, headY) => {
      for (let i = 0; i < 14; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 8.0 + 2.5;
        particlesRef.current.push({
          x: headX,
          y: headY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 2.0,
          life: 1.0,
          decay: Math.random() * 0.055 + 0.025,
          size: Math.random() * 4.5 + 1.8,
          isStar: Math.random() > 0.4,
          spikes: Math.random() > 0.7 ? 8 : 4,
          rot: Math.random() * Math.PI,
          rotSpeed: (Math.random() - 0.5) * 0.4,
          canBurst: Math.random() > 0.65,
          hasBurst: false,
          sparkle: true,
        });
      }

      for (let i = 0; i < 2; i++) {
        smokeRef.current.push({
          x: headX + (Math.random() - 0.5) * 12,
          y: headY + (Math.random() - 0.5) * 6,
          vx: (Math.random() - 0.5) * 1.2,
          vy: -Math.random() * 1.5 - 0.8,
          size: Math.random() * 6 + 4,
          life: 1.0,
          decay: Math.random() * 0.025 + 0.015,
        });
      }

      for (let i = 0; i < 2; i++) {
        ashesRef.current.push({
          x: headX + (Math.random() - 0.5) * 14,
          y: headY + (Math.random() - 0.5) * 6,
          vx: (Math.random() - 0.5) * 2.0,
          vy: Math.random() * 2.5 + 1.0,
          life: 1.0,
          decay: Math.random() * 0.025 + 0.012,
          size: Math.random() * 3.5 + 2.0,
          color: '#2A1620',
        });
      }
    };

    const physicsStep = () => {
      const nodes = nodesRef.current;
      if (nodes.length === 0) return;

      const gravity = 0.32;
      const friction = 0.95;

      // Determine active unburnt nodes count based on burn progress
      let activeLimit = NUM_NODES;
      if (isIgnitedRef.current) {
        activeLimit = Math.max(2, Math.ceil((1 - burnProgressRef.current) * NUM_NODES));
      }

      // Mark nodes beyond activeLimit as burnt
      for (let i = 0; i < NUM_NODES; i++) {
        nodes[i].burnt = i >= activeLimit;
      }

      // 1. Verlet Integration & Gravity
      for (let i = 1; i < activeLimit; i++) {
        const n = nodes[i];
        if (n.pinned) continue;
        const vx = (n.x - n.oldX) * friction;
        const vy = (n.y - n.oldY) * friction;
        n.oldX = n.x;
        n.oldY = n.y;
        n.x += vx;
        n.y += vy + gravity;
      }

      // 2. Mouse Repulsion / Sway Physics Interaction
      const mx = mousePosRef.current.svgX;
      const my = mousePosRef.current.svgY;
      if (mx !== undefined && my !== undefined && !isIgnitedRef.current) {
        for (let i = 1; i < activeLimit; i++) {
          const n = nodes[i];
          const dist = Math.hypot(n.x - mx, n.y - my);
          if (dist < 60 && dist > 0) {
            const force = (60 - dist) / 60;
            const angle = Math.atan2(n.y - my, n.x - mx);
            n.x += Math.cos(angle) * force * 4.5;
            n.y += Math.sin(angle) * force * 4.5;
          }
        }
      }

      // 3. Distance Constraint Relaxation (8 Iterations)
      for (let iter = 0; iter < 8; iter++) {
        for (let i = 0; i < activeLimit - 1; i++) {
          const n1 = nodes[i];
          const n2 = nodes[i + 1];
          const dx = n2.x - n1.x;
          const dy = n2.y - n1.y;
          const dist = Math.hypot(dx, dy) || 0.001;
          const diff = (dist - SEGMENT_LEN) / dist;

          if (!n1.pinned) {
            n1.x += dx * 0.5 * diff;
            n1.y += dy * 0.5 * diff;
          }
          if (!n2.pinned) {
            n2.x -= dx * 0.5 * diff;
            n2.y -= dy * 0.5 * diff;
          }
        }
        // Always fix top anchor node 0
        nodes[0].x = START_X;
        nodes[0].y = START_Y;
      }

      // 4. Construct Smooth Bézier Path D String
      const active = nodes.slice(0, activeLimit);
      let pathD = "";
      let currentSpark = { x: END_X, y: END_Y };

      if (active.length >= 2) {
        pathD = `M ${active[0].x.toFixed(1)} ${active[0].y.toFixed(1)}`;
        for (let i = 1; i < active.length - 1; i++) {
          const xc = (active[i].x + active[i + 1].x) / 2;
          const yc = (active[i].y + active[i + 1].y) / 2;
          pathD += ` Q ${active[i].x.toFixed(1)} ${active[i].y.toFixed(1)}, ${xc.toFixed(1)} ${yc.toFixed(1)}`;
        }
        const tip = active[active.length - 1];
        pathD += ` L ${tip.x.toFixed(1)} ${tip.y.toFixed(1)}`;
        currentSpark = { x: tip.x, y: tip.y };
      }

      setSvgPathD(pathD);
      setSparkPos(currentSpark);

      // 5. Render Canvas Particle Layer
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let headCanvasX;
      let headCanvasY;

      if (isIgnitedRef.current && burnProgressRef.current < 1) {
        const svgBox = canvas.getBoundingClientRect();
        const scaleX = svgBox.width / 500;
        const scaleY = svgBox.height / 320;
        headCanvasX = currentSpark.x * scaleX;
        headCanvasY = currentSpark.y * scaleY;
        spawnFuseBurnEffects(headCanvasX, headCanvasY);
      } else if (isHoveredRef.current) {
        spawnCursorSparks(mousePosRef.current.canvasX, mousePosRef.current.canvasY);
      }

      // A. Incandescent Radial Core Glow Bloom
      const glowX = isIgnitedRef.current ? headCanvasX : isHoveredRef.current ? mousePosRef.current.canvasX : null;
      const glowY = isIgnitedRef.current ? headCanvasY : isHoveredRef.current ? mousePosRef.current.canvasY : null;

      if (glowX !== null && glowY !== null && glowX !== undefined && glowY !== undefined) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const glowRadius = isIgnitedRef.current ? 48 : 32;
        const grad = ctx.createRadialGradient(glowX, glowY, 0, glowX, glowY, glowRadius);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        grad.addColorStop(0.25, 'rgba(255, 179, 206, 0.6)');
        grad.addColorStop(0.6, 'rgba(255, 92, 138, 0.25)');
        grad.addColorStop(1, 'rgba(255, 92, 138, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(glowX, glowY, glowRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // B. Pyrotechnic Sparkles Layer (Additive Lighter Blending)
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';

      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.14; // Physics gravity on sparks
        p.vx *= 0.92; // Air resistance friction
        p.vy *= 0.92;
        p.life -= p.decay;

        // Mid-Air Crackle Micro-Burst
        if (p.canBurst && p.life < 0.55 && !p.hasBurst) {
          p.hasBurst = true;
          for (let b = 0; b < 3; b++) {
            const bAngle = Math.random() * Math.PI * 2;
            const bSpeed = Math.random() * 3.5 + 1.2;
            particlesRef.current.push({
              x: p.x,
              y: p.y,
              vx: Math.cos(bAngle) * bSpeed,
              vy: Math.sin(bAngle) * bSpeed - 0.5,
              life: 0.75,
              decay: Math.random() * 0.08 + 0.04,
              size: Math.random() * 2.0 + 1.0,
              isStar: true,
              spikes: 4,
              rot: Math.random() * Math.PI,
              rotSpeed: (Math.random() - 0.5) * 0.4,
              canBurst: false,
              sparkle: true,
            });
          }
        }

        if (p.life <= 0) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        // Thermal Color Shift Spectrum
        let color;
        if (p.life > 0.75) {
          color = '#FFFFFF'; // Incandescent White-Hot Core
        } else if (p.life > 0.42) {
          color = '#FFB3CE'; // Sizzling Electric Gold
        } else if (p.life > 0.22) {
          color = '#FF5C8A'; // Warm Amber Flame
        } else {
          color = '#E63946'; // Smoldering Red Ember
        }

        const alpha = p.sparkle && Math.random() > 0.2 ? p.life : p.life * 0.75;
        const speed = Math.hypot(p.vx, p.vy);

        // Motion Streak Blur Trail for Fast Sparks
        if (speed > 1.2) {
          const tailLen = Math.min(speed * 2.5, 15);
          const angle = Math.atan2(p.vy, p.vx);
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - Math.cos(angle) * tailLen, p.y - Math.sin(angle) * tailLen);
          ctx.strokeStyle = color;
          ctx.lineWidth = Math.max(0.6, p.size * 0.6 * p.life);
          ctx.globalAlpha = alpha * 0.85;
          ctx.stroke();
        }

        // Render Core Sparkle or Rotating Starburst Glint
        if (p.isStar) {
          p.rot = (p.rot || 0) + (p.rotSpeed || 0.05);
          drawStar(
            ctx,
            p.x,
            p.y,
            p.spikes || 4,
            p.size * 2.6 * p.life,
            p.size * 0.5 * p.life,
            p.rot,
            color,
            alpha
          );
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, Math.max(0.4, p.size * p.life), 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.globalAlpha = alpha;
          ctx.fill();
        }
      }

      // C. Wispy Warm Smoke Puffs Layer (Source-Over)
      ctx.globalCompositeOperation = 'source-over';
      for (let i = smokeRef.current.length - 1; i >= 0; i--) {
        const s = smokeRef.current[i];
        s.x += s.vx + Math.sin(Date.now() * 0.005 + i) * 0.35;
        s.y += s.vy;
        s.size += 0.28;
        s.life -= s.decay;

        if (s.life <= 0) {
          smokeRef.current.splice(i, 1);
          continue;
        }

        const smokeGrad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.size);
        smokeGrad.addColorStop(0, `rgba(224, 163, 188, ${s.life * 0.22})`);
        smokeGrad.addColorStop(0.6, `rgba(122, 51, 80, ${s.life * 0.09})`);
        smokeGrad.addColorStop(1, 'rgba(122, 51, 80, 0)');

        ctx.fillStyle = smokeGrad;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // D. Falling Ashes Layer
      for (let i = ashesRef.current.length - 1; i >= 0; i--) {
        const a = ashesRef.current[i];
        a.x += a.vx;
        a.y += a.vy;
        a.life -= a.decay;

        if (a.life <= 0) {
          ashesRef.current.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(a.x, a.y, a.size * a.life, 0, Math.PI * 2);
        ctx.fillStyle = a.color;
        ctx.globalAlpha = a.life * 0.75;
        ctx.fill();
      }

      ctx.restore();

      // Once the rope has fully dropped into its resting drape (a fixed
      // settle window after mount) and no sparks/smoke/ash are mid-flight,
      // stop scheduling frames instead of forcing a 60fps re-render forever.
      const stillSettling = performance.now() - mountTimeRef.current < 2500;
      const hasActiveFx = particlesRef.current.length > 0 || smokeRef.current.length > 0 || ashesRef.current.length > 0;
      const shouldContinue = stillSettling || isIgnitedRef.current || isHoveredRef.current || hasActiveFx;

      if (shouldContinue) {
        animRef.current = requestAnimationFrame(physicsStep);
      } else {
        animRef.current = null;
      }
    };

    resumeRef.current = () => {
      if (animRef.current === null) {
        animRef.current = requestAnimationFrame(physicsStep);
      }
    };

    physicsStep();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    resumeRef.current?.();
    const containerBox = containerRef.current.getBoundingClientRect();

    let canvasX = e.clientX - containerBox.left;
    let canvasY = e.clientY - containerBox.top;

    if (canvasRef.current) {
      const cBox = canvasRef.current.getBoundingClientRect();
      canvasX = e.clientX - cBox.left;
      canvasY = e.clientY - cBox.top;
    }

    const svgX = (canvasX / containerBox.width) * 500;
    const svgY = (canvasY / containerBox.height) * 320;

    mousePosRef.current = { canvasX, canvasY, svgX, svgY };

    // Distance check to ignite rope tip
    if (!isIgnitedRef.current && Math.hypot(svgX - sparkPos.x, svgY - sparkPos.y) < 50) {
      igniteFuse();
    }
  };

  const igniteFuse = () => {
    if (isIgnitedRef.current) return;
    setIsIgnited(true);
    isIgnitedRef.current = true;

    const obj = { progress: 0 };
    gsap.to(obj, {
      progress: 1,
      duration: 3.4,
      ease: "linear",
      onUpdate: () => {
        burnProgressRef.current = obj.progress;
      },
      onComplete: () => {
        confetti({
          particleCount: 150,
          spread: 130,
          origin: { y: 0.5 },
          colors: ['#FFB3CE', '#9E4A6B', '#FF5C8A', '#FDF7F9']
        });
        setTimeout(() => {
          onUnlock();
        }, 500);
      }
    });
  };

  return (
    <div
      ref={containerRef}
      data-firecracker="true"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => { setIsHovered(true); resumeRef.current?.(); }}
      onMouseLeave={() => setIsHovered(false)}
      className="relative w-full max-w-xl mx-auto py-4 px-2 flex flex-col items-center justify-center cursor-none select-none overflow-visible"
    >
      {/* 60FPS Canvas Physics & Particle Layer */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-30 overflow-visible"
      />

      <div className="relative w-full max-w-[500px] h-[320px] flex items-center justify-center z-10">
        
        {/* Hand-Drawn 60FPS Physics Coffee-Brown Braided Fuse Rope SVG */}
        <svg className="w-full h-full overflow-visible" viewBox="0 0 500 320">
          
          {/* Top Anchor Support - Heavy Wooden Beam & Brass Mount */}
          <g>
            <rect x="60" y="0" width="100" height="14" rx="4" fill="#45182C" stroke="#1A0E14" strokeWidth="2" />
            <rect x="64" y="2" width="92" height="10" rx="3" fill="#7A3350" />
            <circle cx="75" cy="7" r="2.5" fill="#1A0E14" />
            <circle cx="145" cy="7" r="2.5" fill="#1A0E14" />

            <circle cx="110" cy="20" r="15" fill="none" stroke="#1A0E14" strokeWidth="6" />
            <circle cx="110" cy="20" r="15" fill="none" stroke="#9E4A6B" strokeWidth="3.5" />
          </g>

          {/* Dynamic Physics-Driven Braided Rope Layers */}
          {svgPathD && (
            <g className="pointer-events-none">
              {/* Layer 1: Solid Base Core - Deep Heavy Coffee Brown (22px wide) */}
              <path
                ref={ropePathRef}
                d={svgPathD}
                fill="none"
                stroke="#5C2340"
                strokeWidth="22"
                strokeLinecap="round"
              />

              {/* Layer 2: Espresso Ink Outline / Contour Shading (24px wide) */}
              <path
                d={svgPathD}
                fill="none"
                stroke="#1A0E14"
                strokeWidth="24"
                strokeDasharray="14 14"
                strokeOpacity="0.45"
                strokeLinecap="round"
              />

              {/* Layer 3: Heavy Twisted Mocha Strand (11px wide) */}
              <path
                d={svgPathD}
                fill="none"
                stroke="#9E4A6B"
                strokeWidth="11"
                strokeDasharray="18 14"
                strokeLinecap="round"
              />

              {/* Layer 4: Dark Espresso Braided Twist Threads (7px wide) */}
              <path
                d={svgPathD}
                fill="none"
                stroke="#45182C"
                strokeWidth="7"
                strokeDasharray="14 16"
                strokeDashoffset="6"
                strokeLinecap="round"
              />

              {/* Layer 5: Coffee Cream Highlight Fiber Strands (3.5px wide) */}
              <path
                d={svgPathD}
                fill="none"
                stroke="#E0C3D2"
                strokeWidth="3.5"
                strokeDasharray="8 20"
                strokeDashoffset="4"
                strokeLinecap="round"
              />
            </g>
          )}

          {/* Top Anchor Knot Detail - Wraps around the ring at y=20 */}
          <g className="pointer-events-none">
            <ellipse cx="110" cy="22" rx="16" ry="9" fill="#5C2340" stroke="#1A0E14" strokeWidth="2.5" />
            <path d="M 98 19 C 105 26, 115 26, 122 19" fill="none" stroke="#9E4A6B" strokeWidth="3" />
            <path d="M 95 23 C 105 30, 115 30, 125 23" fill="none" stroke="#45182C" strokeWidth="2.5" />
          </g>

          {/* Sizzling Active Ember Edge (Appears right at the burning tip of the rope) */}
          {isIgnited && burnProgressRef.current < 1 && (
            <circle cx={sparkPos.x} cy={sparkPos.y} r="14" fill="#FF5C8A" opacity="0.8" />
          )}

          {/* Target Highlight Ring at Rope Tip - Warm Amber Coffee Style */}
          {!isIgnited && (
            <g transform={`translate(${sparkPos.x}, ${sparkPos.y})`}>
              <circle r="26" fill="#E0A3BC" opacity="0.25" className="animate-ping" />
              <circle r="11" fill="#7A3350" />
              <circle r="4" fill="#FDF7F9" />
            </g>
          )}

          {/* Bright White-Hot Spark Head */}
          {isIgnited && burnProgressRef.current < 1 && (
            <g transform={`translate(${sparkPos.x}, ${sparkPos.y})`}>
              <circle r="24" fill="#FF5C8A" opacity="0.6" className="animate-ping" />
              <circle r="14" fill="#FFB3CE" />
              <circle r="6" fill="#FFFFFF" />
            </g>
          )}

          {/* Hand-Drawn Coffee Ink Instruction Text & Curved Arrow - Positioned on the Right */}
          <g className="pointer-events-none">
            <text 
              x="210" 
              y="160" 
              fill="#45182C" 
              fontSize="22" 
              fontFamily="Satisfy, cursive" 
              transform="rotate(4, 210, 160)" 
              className="drop-shadow-sm"
            >
              {isIgnited ? "Sizzling up the fuse..." : "Bring the sparkles to the tip"}
            </text>

            {!isIgnited && (
              <path 
                d={`M 225 175 Q 175 240 ${sparkPos.x + 28} ${sparkPos.y - 10}`} 
                fill="none" 
                stroke="#45182C" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeDasharray="4 3" 
              />
            )}

            {!isIgnited && (
              <path 
                d={`M ${sparkPos.x + 38} ${sparkPos.y - 18} L ${sparkPos.x + 28} ${sparkPos.y - 10} L ${sparkPos.x + 36} ${sparkPos.y - 2}`} 
                fill="none" 
                stroke="#45182C" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
            )}
          </g>
        </svg>
      </div>
    </div>
  );
}


