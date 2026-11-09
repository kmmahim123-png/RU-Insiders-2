// Zero-dependency, lightweight, high-performance Canvas Confetti for React 19 & Next.js

export interface ConfettiOptions {
  particleCount?: number;
  spread?: number;
  startVelocity?: number;
  origin?: { x: number; y: number }; // 0 to 1 normalized coordinates
  colors?: string[];
  duration?: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  shape: 'circle' | 'square' | 'strip' | 'star';
  opacity: number;
  decay: number;
}

const DEFAULT_COLORS = [
  '#f59e0b', // Amber Gold
  '#10b981', // Emerald Green
  '#ef4444', // University Crimson
  '#3b82f6', // Sky Blue
  '#8b5cf6', // Violet
  '#fbbf24', // Yellow Gold
  '#059669', // Dark Emerald
];

export function fireConfetti(options: ConfettiOptions = {}) {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const particleCount = options.particleCount || 80;
  const spread = options.spread || 70;
  const startVelocity = options.startVelocity || 45;
  const origin = options.origin || { x: 0.5, y: 0.6 };
  const colors = options.colors || DEFAULT_COLORS;
  const duration = options.duration || 3200;

  // Create or reuse canvas
  let canvas = document.getElementById('ru-confetti-canvas') as HTMLCanvasElement | null;
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'ru-confetti-canvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '99999';
    document.body.appendChild(canvas);
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const dpr = window.devicePixelRatio || 1;
  const width = window.innerWidth;
  const height = window.innerHeight;

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);

  const particles: Particle[] = [];
  const shapes: Particle['shape'][] = ['circle', 'square', 'strip', 'star'];

  for (let i = 0; i < particleCount; i++) {
    const angle = (Math.PI / 180) * (90 - spread / 2 + Math.random() * spread);
    const speed = startVelocity * (0.6 + Math.random() * 0.8);
    particles.push({
      x: origin.x * width,
      y: origin.y * height,
      vx: Math.cos(angle) * speed * (Math.random() > 0.5 ? 1 : -1) * (0.4 + Math.random() * 0.6),
      vy: -Math.sin(angle) * speed,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 12,
      shape: shapes[Math.floor(Math.random() * shapes.length)],
      opacity: 1,
      decay: 0.007 + Math.random() * 0.008,
    });
  }

  const startTime = performance.now();

  function drawStar(c: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number) {
    let rot = (Math.PI / 2) * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    c.beginPath();
    c.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      c.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      c.lineTo(x, y);
      rot += step;
    }
    c.lineTo(cx, cy - outerRadius);
    c.closePath();
    c.fill();
  }

  function frame(currentTime: number) {
    if (!ctx || !canvas) return;
    const elapsed = currentTime - startTime;

    ctx.clearRect(0, 0, width, height);

    let activeCount = 0;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      if (p.opacity <= 0) continue;

      activeCount++;

      // Physics
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.8; // gravity
      p.vx *= 0.98; // air drag
      p.rotation += p.rotationSpeed;
      p.opacity -= p.decay;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.globalAlpha = Math.max(0, p.opacity);
      ctx.fillStyle = p.color;

      if (p.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.shape === 'strip') {
        ctx.fillRect(-p.size / 2, -p.size * 1.5, p.size, p.size * 3);
      } else if (p.shape === 'star') {
        drawStar(ctx, 0, 0, 5, p.size, p.size / 2);
      } else {
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      }

      ctx.restore();
    }

    if (activeCount > 0 && elapsed < duration) {
      requestAnimationFrame(frame);
    } else {
      ctx.clearRect(0, 0, width, height);
      if (canvas && canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    }
  }

  requestAnimationFrame(frame);
}

// 100% Celebration Full Screen Double Burst
export function celebrate100Percent() {
  // Left cannon
  fireConfetti({
    particleCount: 70,
    spread: 60,
    origin: { x: 0.15, y: 0.7 },
  });
  // Right cannon
  setTimeout(() => {
    fireConfetti({
      particleCount: 70,
      spread: 60,
      origin: { x: 0.85, y: 0.7 },
    });
  }, 200);
  // Center high burst
  setTimeout(() => {
    fireConfetti({
      particleCount: 110,
      spread: 100,
      startVelocity: 55,
      origin: { x: 0.5, y: 0.5 },
    });
  }, 400);
}
