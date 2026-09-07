import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function OrganicText({ text, className = "", delay = 0 }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Split text by words for performance, not characters.
    // Characters + blur caused the massive GPU lag. Words look organic enough but cost 10x less GPU.
    const words = text.split(' ');
    el.innerHTML = '';
    
    words.forEach((word) => {
      const span = document.createElement('span');
      // Adding a space after each word
      span.innerHTML = word + '&nbsp;';
      span.className = 'inline-block opacity-0 transform translate-y-3 will-change-transform';
      el.appendChild(span);
    });

    const innerSpans = el.querySelectorAll('span');

    gsap.to(innerSpans, {
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
      },
      opacity: 1,
      y: 0,
      duration: 1.2,
      stagger: 0.05,
      ease: 'power2.out',
      delay: delay,
      clearProps: 'transform' // clean up for perf
    });
  }, [text, delay]);

  return (
    <div ref={containerRef} className={`${className} flex flex-wrap`} style={{ wordBreak: 'keep-all' }} />
  );
}
