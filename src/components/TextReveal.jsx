import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function TextReveal({ text, className = "", delay = 0 }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Split text into lines/words
    const words = text.split(' ');
    el.innerHTML = '';
    
    words.forEach(word => {
      const span = document.createElement('span');
      span.className = 'inline-block overflow-hidden mr-[0.3em] pb-[0.1em] align-bottom';
      
      const innerSpan = document.createElement('span');
      innerSpan.className = 'inline-block transform translate-y-full opacity-0 will-change-transform';
      innerSpan.textContent = word;
      
      span.appendChild(innerSpan);
      el.appendChild(span);
    });

    const innerSpans = el.querySelectorAll('span > span');

    gsap.to(innerSpans, {
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
      },
      y: 0,
      opacity: 1,
      duration: 0.8,
      stagger: 0.05,
      ease: 'power3.out',
      delay: delay
    });
  }, [text, delay]);

  return (
    <div ref={containerRef} className={`${className} flex flex-wrap`} />
  );
}
