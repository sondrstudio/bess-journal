import React, { useRef, useEffect } from 'react';

export function LivingAmbientCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const mouse = { x: -1000, y: -1000, radius: 140 };
    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;

      // Spawn subtle cursor sparkle wake
      if (Math.random() > 0.4) {
        particles.push(new CursorSparkle(e.clientX, e.clientY));
      }
    };
    window.addEventListener('mousemove', handleMouseMove);

    // 1. Petals & Dust Motes
    class Petal {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height - height;
        this.size = Math.random() * 8 + 4;
        this.vx = (Math.random() - 0.5) * 0.8;
        this.vy = Math.random() * 0.7 + 0.3;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotSpeed = (Math.random() - 0.5) * 0.03;
        this.oscFreq = Math.random() * 0.02 + 0.01;
        this.alpha = Math.random() * 0.35 + 0.15;
        this.color = Math.random() > 0.4 ? '#C2185B' : Math.random() > 0.5 ? '#E0A3BC' : '#7A3350';
        this.type = Math.random() > 0.3 ? 'petal' : 'dust';
      }

      update() {
        this.x += this.vx + Math.sin(Date.now() * 0.001 + this.y * 0.01) * 0.6;
        this.y += this.vy;
        this.rotation += this.rotSpeed;

        if (this.y > height + 20 || this.x < -20 || this.x > width + 20) {
          this.reset();
          this.y = -20;
        }

        // Mouse avoidance
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.hypot(dx, dy);
        if (dist < mouse.radius && dist > 0) {
          const force = (mouse.radius - dist) / mouse.radius;
          this.x -= (dx / dist) * force * 3;
          this.y -= (dy / dist) * force * 3;
        }
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;

        if (this.type === 'petal') {
          ctx.beginPath();
          ctx.moveTo(0, -this.size);
          ctx.bezierCurveTo(this.size * 0.6, -this.size * 0.5, this.size * 0.6, this.size * 0.5, 0, this.size);
          ctx.bezierCurveTo(-this.size * 0.6, this.size * 0.5, -this.size * 0.6, -this.size * 0.5, 0, -this.size);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, this.size * 0.3, 0, Math.PI * 2);
          ctx.shadowBlur = 8;
          ctx.shadowColor = this.color;
          ctx.fill();
        }
        ctx.restore();
      }
    }

    // 2. Interactive Butterflies
    class Butterfly {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 1.5;
        this.vy = (Math.random() - 0.5) * 1.5;
        this.size = Math.random() * 12 + 10;
        this.wingAngle = 0;
        this.wingSpeed = Math.random() * 0.15 + 0.1;
        this.color = Math.random() > 0.5 ? '#C2185B' : '#45182C';
        this.targetAngle = Math.random() * Math.PI * 2;
      }

      update() {
        this.wingAngle += this.wingSpeed;

        // Smooth direction change
        if (Math.random() < 0.02) {
          this.targetAngle = Math.random() * Math.PI * 2;
        }

        this.vx += Math.cos(this.targetAngle) * 0.08;
        this.vy += Math.sin(this.targetAngle) * 0.08;
        this.vx *= 0.94;
        this.vy *= 0.94;

        this.x += this.vx;
        this.y += this.vy;

        // Wrap around edges
        if (this.x < -30) this.x = width + 30;
        if (this.x > width + 30) this.x = -30;
        if (this.y < -30) this.y = height + 30;
        if (this.y > height + 30) this.y = -30;

        // Mouse repulsion
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 130 && dist > 0) {
          const force = (130 - dist) / 130;
          this.vx -= (dx / dist) * force * 4;
          this.vy -= (dy / dist) * force * 4;
          this.wingSpeed = 0.35; // Scared wing flap!
        } else {
          this.wingSpeed = 0.12;
        }
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        const angle = Math.atan2(this.vy, this.vx) + Math.PI / 2;
        ctx.rotate(angle);

        const wingScale = Math.sin(this.wingAngle);

        ctx.fillStyle = this.color;
        ctx.globalAlpha = 0.55;

        // Left Wing
        ctx.save();
        ctx.scale(wingScale, 1);
        ctx.beginPath();
        ctx.ellipse(-this.size * 0.6, 0, this.size * 0.7, this.size * 0.45, -0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Right Wing
        ctx.save();
        ctx.scale(-wingScale, 1);
        ctx.beginPath();
        ctx.ellipse(-this.size * 0.6, 0, this.size * 0.7, this.size * 0.45, -0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Body
        ctx.fillStyle = '#1A120B';
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.ellipse(0, 0, 1.5, this.size * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }
    }

    // 3. Cursor Sparkle Wake
    class CursorSparkle {
      constructor(x, y) {
        this.x = x + (Math.random() - 0.5) * 12;
        this.y = y + (Math.random() - 0.5) * 12;
        this.size = Math.random() * 2.5 + 1.0;
        this.vx = (Math.random() - 0.5) * 1.2;
        this.vy = (Math.random() - 0.5) * 1.2 - 0.4;
        this.life = 1.0;
        this.decay = Math.random() * 0.05 + 0.03;
        this.color = Math.random() > 0.5 ? '#FFB3CE' : '#C2185B';
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= this.decay;
      }

      draw() {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = this.life * 0.6;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * this.life, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 6;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.restore();
      }
    }

    const petals = Array.from({ length: 28 }, () => new Petal());
    const butterflies = Array.from({ length: 6 }, () => new Butterfly());
    let particles = [];

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Render Petals & Motes
      petals.forEach((p) => {
        p.update();
        p.draw();
      });

      // Render Butterflies
      butterflies.forEach((b) => {
        b.update();
        b.draw();
      });

      // Render Cursor Sparkles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.update();
        p.draw();
        if (p.life <= 0) particles.splice(i, 1);
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-10" style={{ opacity: 0.85 }} />;
}
