import { useEffect, useRef } from 'react';
import { useGame } from '../store/GameContext';

export default function ConfettiEffect({ trigger }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    if (!trigger) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#ff6b9d', '#a29bfe', '#fdcb6e', '#00b894', '#6c5ce7', '#ff9f43', '#ff0066', '#00ff88'];
    const particles = [];
    const count = 150;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: -20 - Math.random() * canvas.height * 0.5,
        w: 4 + Math.random() * 8,
        h: 4 + Math.random() * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 6,
        vy: 2 + Math.random() * 4,
        rot: Math.random() * 360,
        rv: (Math.random() - 0.5) * 10,
        opacity: 1,
      });
    }

    let startTime = Date.now();
    const duration = 3000;

    function animate() {
      const elapsed = Date.now() - startTime;
      if (elapsed > duration) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const progress = elapsed / duration;
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05;
        p.rot += p.rv;
        p.opacity = 1 - progress;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
      animRef.current = requestAnimationFrame(animate);
    }
    animate();

    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [trigger]);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 9999 }}
    />
  );
}
