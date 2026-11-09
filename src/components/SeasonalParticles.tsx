'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, CloudRain, Wind, EyeOff } from 'lucide-react';

export type SeasonMode = 'leaves' | 'rain' | 'mist' | 'off';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  swaySpeed: number;
  swayAmplitude: number;
  swayOffset: number;
  opacity: number;
}

interface SeasonalParticlesProps {
  defaultMode?: SeasonMode;
  className?: string;
  showControls?: boolean;
}

export default function SeasonalParticles({
  defaultMode = 'leaves',
  className = '',
  showControls = true,
}: SeasonalParticlesProps) {
  const [mode, setMode] = useState<SeasonMode>(defaultMode);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (mode === 'off') {
      if (animIdRef.current) cancelAnimationFrame(animIdRef.current);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 500);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement?.clientHeight || 500;
    };

    window.addEventListener('resize', handleResize);

    // Generate particles according to mode
    const count = mode === 'rain' ? 45 : mode === 'leaves' ? 24 : 30;
    const particles: Particle[] = [];

    const leafColors = ['#f59e0b', '#d97706', '#b45309', '#10b981', '#059669', '#ca8a04'];
    const mistColors = ['rgba(255,255,255,0.25)', 'rgba(251,191,36,0.2)', 'rgba(167,243,208,0.2)'];

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: mode === 'rain' ? 1.5 : (Math.random() - 0.5) * 0.8,
        vy: mode === 'rain' ? 8 + Math.random() * 4 : 0.8 + Math.random() * 1.2,
        size: mode === 'rain' ? 12 : mode === 'leaves' ? 9 + Math.random() * 6 : 4 + Math.random() * 6,
        color:
          mode === 'rain'
            ? 'rgba(186, 230, 253, 0.5)'
            : mode === 'leaves'
            ? leafColors[Math.floor(Math.random() * leafColors.length)]
            : mistColors[Math.floor(Math.random() * mistColors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 1.5,
        swaySpeed: 0.02 + Math.random() * 0.02,
        swayAmplitude: 15 + Math.random() * 25,
        swayOffset: Math.random() * Math.PI * 2,
        opacity: mode === 'rain' ? 0.6 : 0.85,
      });
    }

    let time = 0;

    // Draw single leaf polygon
    const drawLeaf = (c: CanvasRenderingContext2D, size: number) => {
      c.beginPath();
      c.moveTo(0, -size);
      c.bezierCurveTo(size * 0.8, -size * 0.4, size * 0.8, size * 0.4, 0, size);
      c.bezierCurveTo(-size * 0.8, size * 0.4, -size * 0.8, -size * 0.4, 0, -size);
      c.closePath();
      c.fill();

      // Leaf middle vein
      c.strokeStyle = 'rgba(0, 0, 0, 0.15)';
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(0, -size * 0.85);
      c.lineTo(0, size * 0.85);
      c.stroke();
    };

    const render = () => {
      time += 0.03;
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        if (mode === 'leaves') {
          p.y += p.vy;
          p.x += Math.sin(time * p.swaySpeed + p.swayOffset) * 0.8 + p.vx;
          p.rotation += p.rotationSpeed;

          // Recycle
          if (p.y > height + 20) {
            p.y = -20;
            p.x = Math.random() * width;
          }
          if (p.x > width + 20) p.x = -20;
          if (p.x < -20) p.x = width + 20;

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.opacity;
          drawLeaf(ctx, p.size);
          ctx.restore();
        } else if (mode === 'rain') {
          p.x += p.vx;
          p.y += p.vy;

          if (p.y > height) {
            p.y = -10;
            p.x = Math.random() * width;
          }

          ctx.save();
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.vx * 1.5, p.y + p.size);
          ctx.stroke();
          ctx.restore();
        } else if (mode === 'mist') {
          p.y -= p.vy * 0.3;
          p.x += Math.sin(time + p.swayOffset) * 0.4;

          if (p.y < -20) {
            p.y = height + 10;
            p.x = Math.random() * width;
          }

          ctx.save();
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      });

      animIdRef.current = requestAnimationFrame(render);
    };

    animIdRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animIdRef.current) cancelAnimationFrame(animIdRef.current);
    };
  }, [mode]);

  return (
    <div className={`relative pointer-events-none ${className}`}>
      {mode !== 'off' && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
        />
      )}

      {/* Mode Switcher Pill */}
      {showControls && (
        <div className="absolute bottom-3 right-3 sm:top-4 sm:right-4 sm:bottom-auto z-30 pointer-events-auto flex items-center gap-1 bg-black/50 backdrop-blur-md p-1 rounded-2xl border border-white/20 text-white text-[11px] font-bold shadow-lg">
          <button
            onClick={() => setMode('leaves')}
            title="প্যারিস রোডের ঝরা পাতা"
            className={`px-2.5 py-1 rounded-xl flex items-center gap-1 transition ${
              mode === 'leaves' ? 'bg-amber-400 text-slate-950 font-black shadow-xs' : 'hover:bg-white/10'
            }`}
          >
            <Wind className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">ঝরা পাতা</span>
          </button>

          <button
            onClick={() => setMode('rain')}
            title="বর্ষার প্যারিস রোড"
            className={`px-2.5 py-1 rounded-xl flex items-center gap-1 transition ${
              mode === 'rain' ? 'bg-sky-400 text-slate-950 font-black shadow-xs' : 'hover:bg-white/10'
            }`}
          >
            <CloudRain className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">বৃষ্টি</span>
          </button>

          <button
            onClick={() => setMode('mist')}
            title="শীতের মতিহার কুয়াশা"
            className={`px-2.5 py-1 rounded-xl flex items-center gap-1 transition ${
              mode === 'mist' ? 'bg-emerald-400 text-slate-950 font-black shadow-xs' : 'hover:bg-white/10'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">কুয়াশা</span>
          </button>

          <button
            onClick={() => setMode((curr) => (curr === 'off' ? 'leaves' : 'off'))}
            title={mode === 'off' ? 'অ্যানিমেশন চালু করুন' : 'অ্যানিমেশন বন্ধ রাখুন'}
            className={`p-1.5 rounded-xl transition ${
              mode === 'off' ? 'bg-red-500 text-white' : 'hover:bg-white/10 text-white/70'
            }`}
          >
            <EyeOff className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
