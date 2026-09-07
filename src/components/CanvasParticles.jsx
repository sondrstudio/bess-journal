import React, { useRef, useEffect } from 'react';

export function CanvasParticles() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let particles = [];
    const numParticles = 120;
    
    let mouse = { x: null, y: null, radius: 150 };
    
    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);
    
    const resizeHandler = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      init();
    };
    window.addEventListener('resize', resizeHandler); // Double bind caught? Wait, no this is correct
    
    class Particle {
      constructor(x, y, size, color, velX, velY) {
        this.x = x;
        this.y = y;
        this.baseX = x;
        this.baseY = y;
        this.size = size;
        this.color = color;
        this.velX = velX;
        this.velY = velY;
        this.density = (Math.random() * 30) + 1;
      }
      
      draw() {
        ctx.beginPath();
        // Give the particles a soft blur natively
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.globalAlpha = 0.4;
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
      }
      
      update() {
        // Natural drift
        this.x += this.velX;
        this.y += this.velY;
        this.baseX += this.velX;
        this.baseY += this.velY;
        
        // Wrap edges seamlessly
        if (this.x > canvas.width + 10) { this.x = -10; this.baseX = -10; }
        if (this.x < -10) { this.x = canvas.width + 10; this.baseX = canvas.width + 10; }
        if (this.y > canvas.height + 10) { this.y = -10; this.baseY = -10; }
        if (this.y < -10) { this.y = canvas.height + 10; this.baseY = canvas.height + 10; }
        
        // Mouse interact
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        let forceDirectionX = dx / distance;
        let forceDirectionY = dy / distance;
        let maxDistance = mouse.radius;
        let force = (maxDistance - distance) / maxDistance;
        let directionX = forceDirectionX * force * this.density;
        let directionY = forceDirectionY * force * this.density;
        
        if (distance < mouse.radius && mouse.x !== null) {
          // Repel outward
          this.x -= directionX;
          this.y -= directionY;
        } else {
          // Snap back elastically
          if (this.x !== this.baseX) {
            let dxBase = this.x - this.baseX;
            this.x -= dxBase / 20;
          }
          if (this.y !== this.baseY) {
            let dyBase = this.y - this.baseY;
            this.y -= dyBase / 20;
          }
        }
        this.draw();
      }
    }
    
    function init() {
      particles = [];
      const colors = ['#C2185B', '#F0DEE6', '#45182C']; // Vintage accents
      for (let i = 0; i < numParticles; i++) {
        let size = (Math.random() * 2) + 0.5;
        let x = (Math.random() * ((canvas.width - size * 2) - (size * 2)) + size * 2);
        let y = (Math.random() * ((canvas.height - size * 2) - (size * 2)) + size * 2);
        let velX = (Math.random() * 0.4) - 0.2;
        let velY = (Math.random() * 0.4) - 0.2;
        let color = colors[Math.floor(Math.random() * colors.length)];
        particles.push(new Particle(x, y, size, color, velX, velY));
      }
    }
    
    let animationFrameId;
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
      }
      animationFrameId = requestAnimationFrame(animate);
    }
    
    resizeHandler();
    animate();
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', resizeHandler);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 opacity-60" />;
}
