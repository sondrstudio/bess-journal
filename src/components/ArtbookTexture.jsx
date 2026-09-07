import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export function ArtbookTexture() {
  const containerRef = useRef(null);
  const liquidRef = useRef(null);
  const scratchRef = useRef(null);
  const paperRef = useRef(null);
  const scribbleRef = useRef(null);

  useEffect(() => {
    let ticking = false;
    let latestE = null;

    const updateParallax = () => {
      if (!latestE) {
        ticking = false;
        return;
      }
      const { innerWidth, innerHeight } = window;
      const xNorm = (latestE.clientX / innerWidth - 0.5);
      const yNorm = (latestE.clientY / innerHeight - 0.5);

      if (liquidRef.current) {
        gsap.to(liquidRef.current, { x: -xNorm * 30, y: -yNorm * 30, duration: 1.2, ease: 'power2.out', overwrite: 'auto' });
      }
      if (scratchRef.current) {
        gsap.to(scratchRef.current, { x: xNorm * 15, y: yNorm * 15, duration: 1, ease: 'power1.out', overwrite: 'auto' });
      }
      if (paperRef.current) {
        gsap.to(paperRef.current, { x: -xNorm * 8, y: -yNorm * 8, duration: 1.5, ease: 'sine.out', overwrite: 'auto' });
      }
      if (scribbleRef.current) {
        gsap.to(scribbleRef.current, { x: xNorm * 40, y: yNorm * 40, duration: 1, ease: 'power1.out', overwrite: 'auto' });
      }

      ticking = false;
    };

    const onMouseMove = (e) => {
      latestE = e;
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMouseMove);
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 w-full h-full pointer-events-none z-[-2] flex items-center justify-center overflow-hidden bg-primary">
      
      {/* Liquid Ink Blurs (Multiplied onto background with hardware accelerated blurs) */}
      <div ref={liquidRef} className="absolute inset-[-10%] w-[120%] h-[120%] z-0 scale-105 will-change-transform">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-accent/30 blur-[80px] rounded-full animate-pulse mix-blend-multiply" style={{ animationDuration: '10s' }} />
        <div className="absolute bottom-0 right-[-10%] w-[60vw] h-[60vw] bg-rose-800/25 blur-[90px] rounded-[40%] animate-spin-slow mix-blend-multiply" />
        <div className="absolute top-[30%] left-[20%] w-[45vw] h-[45vw] bg-ink/20 blur-[100px] rounded-full animate-pulse mix-blend-multiply" style={{ animationDuration: '18s', animationDelay: '2s' }} />
      </div>

      {/* Layered Dust Texture */}
      <div ref={scratchRef} className="absolute inset-[-10%] w-[120%] h-[120%] z-10 scale-105 opacity-50 mix-blend-screen will-change-transform" 
           style={{ backgroundImage: 'url(/textures/dust.webp)', backgroundRepeat: 'repeat' }} />

      {/* Alive Scribble Elements */}
      <div ref={scribbleRef} className="absolute inset-[-10%] w-[120%] h-[120%] z-0 scale-105 opacity-15 will-change-transform">
        <svg className="absolute top-[20%] left-[10%] w-[250px] h-[250px] text-ink stroke-current overflow-visible" viewBox="0 0 200 200" fill="none" strokeWidth="1.5">
          <path d="M10,10 Q50,90 150,30 T180,180" strokeLinecap="round" style={{ animation: 'dashFlow 8s ease-in-out infinite alternate' }} />
        </svg>
        <svg className="absolute bottom-[20%] right-[10%] w-[350px] h-[350px] text-accent stroke-current overflow-visible" viewBox="0 0 400 300" fill="none" strokeWidth="2">
          <path d="M50,250 C100,50 300,50 350,200 S50,150 100,200" strokeLinecap="round" style={{ animation: 'dashFlow 12s ease-in-out infinite alternate-reverse' }} />
        </svg>
      </div>

      {/* Heavy Cardboard / Raw Paper Substrate */}
      <div ref={paperRef} className="absolute inset-[-10%] w-[120%] h-[120%] z-20 scale-105 pointer-events-none will-change-transform">
        {/* The photographic paper substrate that used to sit here was a no-op:
            grayscale + contrast(1.25) blew it out to pure white across ~100% of
            its area, and multiply-blending white leaves the backdrop untouched.
            It cost a 1.1MB fetch, a full-page image decode and a blend layer to
            render nothing. The visible paper grain comes from the layer below. */}
        <img
          src="/textures/rice-paper-2.webp"
          alt=""
          aria-hidden="true"
          decoding="async"
          className="absolute inset-0 w-full h-full opacity-50 mix-blend-multiply"
        />
      </div>

      {/* Heavy Vignette Canvas Border */}
      <div className="absolute inset-0 w-full h-[100vh] z-30 pointer-events-none mix-blend-multiply opacity-60 fixed"
           style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(69, 24, 44,0.7) 150%)' }} />
    </div>
  );
}
