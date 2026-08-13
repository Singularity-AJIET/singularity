"use client";
import { useEffect, useRef } from "react";

const TECH_SYMBOLS = [
  "+", "//", "SYS.ADMIN", "</>", "{ }", "0x1A", "[]", "NULL", "=>", "&&", "||", "0101",
  "func", "await", "yield", "var", "const", "0x00", "ERR", "OK"
];

interface Particle {
  x: number;
  y: number;
  symbol: string;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
}

export default function FloatingTechBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let particles: Particle[] = [];
    const mouse = { x: -1000, y: -1000 };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    const initParticles = () => {
      particles = [];
      const numParticles = Math.floor((window.innerWidth * window.innerHeight) / 25000); // Responsive amount
      for (let i = 0; i < numParticles; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          symbol: TECH_SYMBOLS[Math.floor(Math.random() * TECH_SYMBOLS.length)],
          size: Math.random() * 8 + 12, // 12px to 20px
          speedX: (Math.random() - 0.5) * 0.6,
          speedY: (Math.random() - 0.5) * 0.6,
          opacity: Math.random() * 0.15 + 0.05,
        });
      }
    };

    window.addEventListener("resize", resize);
    resize(); // initial setup

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseout", handleMouseLeave);

    let animationFrameId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      particles.forEach((p) => {
        // Move
        p.x += p.speedX;
        p.y += p.speedY;

        // Wrap around edges
        if (p.x < -50) p.x = canvas.width + 50;
        if (p.x > canvas.width + 50) p.x = -50;
        if (p.y < -50) p.y = canvas.height + 50;
        if (p.y > canvas.height + 50) p.y = -50;

        // Mouse interaction: repel from cursor
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 120) {
          const force = (120 - dist) / 120;
          p.x -= (dx / dist) * force * 4;
          p.y -= (dy / dist) * force * 4;
        }

        // Draw
        ctx.fillStyle = `rgba(200, 241, 53, ${p.opacity})`; // Neo-brutalist lime green
        ctx.font = `bold ${p.size}px monospace`;
        ctx.fillText(p.symbol, p.x, p.y);
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseout", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0, // ensure it sits behind content
      }}
    />
  );
}
