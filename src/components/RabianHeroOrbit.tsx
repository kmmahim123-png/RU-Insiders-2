'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Trophy,
  GraduationCap,
  HeartPulse,
  Compass,
  Newspaper,
  Bot,
  MoveHorizontal,
  Download,
  Bus,
  Flame,
} from 'lucide-react';
import { useIsInstalledApp } from '@/lib/appRuntime';

interface OrbitNode {
  id: string;
  label: string;
  aiStatus: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  ring: string;
}

const ORBIT_NODES: OrbitNode[] = [
  {
    id: 'clubs',
    label: 'ক্লাব',
    aiStatus: 'ক্যাম্পাস ক্লাব ও মেম্বারশিপ পর্যবেক্ষণে',
    href: '/clubs',
    icon: Trophy,
    gradient: 'from-teal-500 to-emerald-600',
    ring: 'border-teal-300/60',
  },
  {
    id: 'academics',
    label: 'বিভাগ',
    aiStatus: '৫৯টি বিভাগ ও স্যারদের ডিরেক্টরি প্রস্তুত',
    href: '/academics',
    icon: GraduationCap,
    gradient: 'from-sky-500 to-blue-600',
    ring: 'border-sky-300/60',
  },
  {
    id: 'blood',
    label: 'রক্তদান',
    aiStatus: '৯০-দিন যাচাইকৃত ব্লাড ব্যাংক মনিটরিং',
    href: '/blood',
    icon: HeartPulse,
    gradient: 'from-rose-500 to-red-600',
    ring: 'border-rose-300/60',
  },
  {
    id: 'map',
    label: 'ম্যাপ',
    aiStatus: '৩-ধাপের ইন্টারঅ্যাক্টিভ ম্যাপ ও সনদ প্রস্তুত',
    href: '/map',
    icon: Compass,
    gradient: 'from-cyan-500 to-teal-600',
    ring: 'border-cyan-300/60',
  },
  {
    id: 'news',
    label: 'নিউজ',
    aiStatus: 'ক্যাম্পাস জার্নাল ও ব্রেকিং নিউজ আপডেট',
    href: '/inside-ru',
    icon: Newspaper,
    gradient: 'from-violet-500 to-indigo-600',
    ring: 'border-violet-300/60',
  },
  {
    id: 'bus',
    label: 'বাস',
    aiStatus: 'রাবি বাস চলাচল ও লাইভ কাউন্টডাউন টাইমার',
    href: '/bus',
    icon: Bus,
    gradient: 'from-emerald-600 to-teal-800',
    ring: 'border-emerald-300/70',
  },
  {
    id: 'marathon',
    label: 'ম্যারাথন',
    aiStatus: 'মাসিক রাবিয়ান ক্যাম্পাস রান ও রেজিস্ট্রেশন',
    href: '/marathon',
    icon: Flame,
    gradient: 'from-amber-500 to-rose-600',
    ring: 'border-amber-300/70',
  },
  {
    id: 'shop',
    label: 'কালেকশন',
    aiStatus: 'হুডি, জার্সি ও ক্যাম্পাস কালেকশন প্রস্তুত',
    href: '/shop',
    icon: ShoppingBag,
    gradient: 'from-amber-400 to-orange-500',
    ring: 'border-amber-300/70',
  },
];

/** Minimal crisp geometric ant silhouette leading each orbiting icon pod. */
function AntCourierSvg({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {/* Curved Antennae */}
      <path
        d="M10.5 6.2C9.2 4.4 7.8 3.6 6.5 3.5M13.5 6.2C14.8 4.4 16.2 3.6 17.5 3.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Head, Thorax, Abdomen */}
      <circle cx="12" cy="7.2" r="2.1" fill="currentColor" />
      <ellipse cx="12" cy="11.6" rx="1.65" ry="2.2" fill="currentColor" />
      <ellipse cx="12" cy="16.8" rx="2.55" ry="3.4" fill="currentColor" />
      {/* Symmetric Agile Legs */}
      <path
        d="M10.3 10.6L6.4 8.7M13.7 10.6L17.6 8.7M10.2 12.2L5.6 12.4M13.8 12.2L18.4 12.4M10.4 14.2L6.6 16.7M13.6 14.2L17.4 16.7"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Interactive 60fps orbital Rabian Solution showcase:
 * Tiny worker-ant couriers smoothly carry compact service icons in a movable ring
 * around the central Rabian AI observer hub.
 */
export default function RabianHeroOrbit() {
  const isInstalledApp = useIsInstalledApp();
  const stageRef = useRef<HTMLDivElement | null>(null);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const antRefs = useRef<(HTMLDivElement | null)[]>([]);

  const angleRef = useRef<number>(0);
  const velocityRef = useRef<number>(0.0048);
  const pausedRef = useRef<boolean>(false);
  const draggingRef = useRef<{ active: boolean; lastAngle: number; movedPx: number }>({
    active: false,
    lastAngle: 0,
    movedPx: 0,
  });

  const [hoveredNode, setHoveredNode] = useState<OrbitNode | null>(null);
  const [appHintVisible, setAppHintVisible] = useState(false);

  // Pure GPU requestAnimationFrame loop (zero React state churn during orbit motion)
  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let rafId = 0;
    let stageWidth = stageRef.current?.clientWidth || 280;

    const ro =
      typeof ResizeObserver !== 'undefined' && stageRef.current
        ? new ResizeObserver((entries) => {
            if (entries[0]?.contentRect?.width) {
              stageWidth = entries[0].contentRect.width;
            }
          })
        : null;
    if (ro && stageRef.current) ro.observe(stageRef.current);

    const step = () => {
      if (!draggingRef.current.active && !pausedRef.current && !prefersReduced) {
        // Ease velocity smoothly back to steady gentle clockwise cruise
        velocityRef.current += (0.0046 - velocityRef.current) * 0.04;
        angleRef.current += velocityRef.current;
      }

      const radius = stageWidth * 0.375;
      const antRadius = stageWidth * 0.375;
      const count = ORBIT_NODES.length;
      const baseAngle = angleRef.current;

      for (let i = 0; i < count; i++) {
        const theta = baseAngle + (i * Math.PI * 2) / count - Math.PI / 2;
        const dx = Math.cos(theta) * radius;
        const dy = Math.sin(theta) * radius;

        const pod = nodeRefs.current[i];
        if (pod) {
          pod.style.transform = `translate3d(${dx.toFixed(2)}px, ${dy.toFixed(2)}px, 0)`;
        }

        // Ant courier travels right ahead along the circular path carrying/pulling each icon
        const antTheta = theta + 0.30;
        const ax = Math.cos(antTheta) * antRadius;
        const ay = Math.sin(antTheta) * antRadius;
        const dirFlip = velocityRef.current < -0.002 ? 180 : 0;
        const antHeadingDeg = (antTheta * 180) / Math.PI + 180 + dirFlip;
        const antEl = antRefs.current[i];
        if (antEl) {
          antEl.style.transform = `translate3d(${ax.toFixed(2)}px, ${ay.toFixed(2)}px, 0) rotate(${antHeadingDeg.toFixed(1)}deg)`;
        }
      }

      rafId = requestAnimationFrame(step);
    };

    rafId = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(rafId);
      ro?.disconnect();
    };
  }, []);

  const getPointerAngle = (clientX: number, clientY: number) => {
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return 0;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    return Math.atan2(clientY - cy, clientX - cx);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Allow link taps cleanly while still enabling drag-to-spin anywhere on ring
    draggingRef.current = {
      active: true,
      lastAngle: getPointerAngle(e.clientX, e.clientY),
      movedPx: 0,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current.active) return;
    const nextAngle = getPointerAngle(e.clientX, e.clientY);
    let delta = nextAngle - draggingRef.current.lastAngle;
    // Normalize shortest angular jump across -PI / +PI boundary
    if (delta > Math.PI) delta -= Math.PI * 2;
    if (delta < -Math.PI) delta += Math.PI * 2;

    angleRef.current += delta;
    velocityRef.current = Math.max(-0.08, Math.min(0.08, delta * 0.65));
    draggingRef.current.lastAngle = nextAngle;
    draggingRef.current.movedPx += Math.abs(delta * 100);
  };

  const endDrag = () => {
    draggingRef.current.active = false;
  };

  const handleNodeClick = (e: React.MouseEvent) => {
    // Prevent accidental navigation right after spinning the wheel
    if (draggingRef.current.movedPx > 12) {
      e.preventDefault();
    }
  };

  const handleCenterAiClick = () => {
    if (isInstalledApp) {
      window.dispatchEvent(new Event('ru_open_ai'));
    } else {
      setAppHintVisible(true);
      setTimeout(() => setAppHintVisible(false), 4500);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-3 w-full">
      {/* Interactive Orbital Stage */}
      <div
        ref={stageRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onMouseEnter={() => {
          pausedRef.current = true;
        }}
        onMouseLeave={() => {
          pausedRef.current = false;
          endDrag();
        }}
        style={{ touchAction: 'pan-y' }}
        className="relative w-[280px] h-[280px] sm:w-[356px] sm:h-[356px] rounded-full flex items-center justify-center select-none cursor-grab active:cursor-grabbing"
      >
        {/* Ambient Emerald + Gold Radar Glow */}
        <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-emerald-500/15 via-teal-400/5 to-amber-400/15 blur-2xl pointer-events-none" />

        {/* Subtle Concentric Orbital Path Rings */}
        <div className="absolute inset-[12.5%] rounded-full border border-dashed border-amber-300/35 pointer-events-none" />
        <div className="absolute inset-[24%] rounded-full border border-emerald-400/20 pointer-events-none" />
        <div className="absolute inset-0 rounded-full border border-white/10 pointer-events-none" />

        {/* Central AI Observer Hub ("মাঝখানে AI বসে দেখছে") */}
        <button
          id="orbit-ai-center"
          type="button"
          onClick={handleCenterAiClick}
          className="relative z-20 w-[86px] h-[86px] sm:w-[104px] sm:h-[104px] rounded-full bg-gradient-to-b from-slate-900 via-emerald-950 to-slate-950 border-2 border-amber-400/80 shadow-[0_0_32px_rgba(251,191,36,0.28)] flex flex-col items-center justify-center gap-0.5 emil-press cursor-pointer group"
          title={isInstalledApp ? 'রাবিয়ান AI খুলুন' : 'AI শুধু রাবিয়ান অ্যাপে ব্যবহারযোগ্য'}
        >
          {/* Subtle inner halo */}
          <span className="absolute -inset-1.5 rounded-full border border-amber-400/25 pointer-events-none" />

          <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-300 text-slate-950 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)]">
            <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
          </span>
          <span className="text-[10px] sm:text-[11px] font-black text-white tracking-tight leading-none mt-1">
            রাবিয়ান AI
          </span>
          <span className="text-[8px] sm:text-[9px] font-bold text-emerald-300 flex items-center gap-1 leading-none">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            {isInstalledApp ? 'অ্যাক্টিভ' : 'পর্যবেক্ষণে'}
          </span>
        </button>

        {/* Moving Ant Couriers Carrying Each Service Icon */}
        {ORBIT_NODES.map((node, i) => (
          <div
            key={`ant-${node.id}`}
            ref={(el) => {
              antRefs.current[i] = el;
            }}
            className="absolute left-1/2 top-1/2 -ml-2.5 -mt-2.5 w-5 h-5 flex items-center justify-center text-amber-300/90 drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)] pointer-events-none will-change-transform z-10"
          >
            <AntCourierSvg className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
          </div>
        ))}

        {/* Orbiting Compact Interactive Service Icons */}
        {ORBIT_NODES.map((node, i) => {
          const IconComponent = node.icon;
          const isActive = hoveredNode?.id === node.id;
          return (
            <div
              key={node.id}
              ref={(el) => {
                nodeRefs.current[i] = el;
              }}
              className="absolute left-1/2 top-1/2 -ml-[26px] -mt-[26px] sm:-ml-[30px] sm:-mt-[30px] w-[52px] h-[52px] sm:w-[60px] sm:h-[60px] flex items-center justify-center will-change-transform z-30"
            >
              <Link
                href={node.href}
                onClick={handleNodeClick}
                onMouseEnter={() => setHoveredNode(node)}
                onMouseLeave={() => setHoveredNode(null)}
                onTouchStart={() => setHoveredNode(node)}
                className="flex flex-col items-center gap-1 group focus:outline-none"
              >
                <span
                  className={`w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br ${node.gradient} border ${node.ring} text-white flex items-center justify-center shadow-lg transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-110 group-active:scale-95 ${
                    isActive ? 'ring-2 ring-white scale-110' : ''
                  }`}
                >
                  <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />
                </span>
                <span className="px-2 py-0.5 rounded-full bg-slate-950/90 border border-white/15 text-[9px] sm:text-[10px] font-extrabold text-white whitespace-nowrap shadow-md">
                  {node.label}
                </span>
              </Link>
            </div>
          );
        })}
      </div>

      {/* Live AI Observer Status Pill + Move Hint */}
      <div className="w-full max-w-xs text-center space-y-1.5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-950/75 border border-emerald-400/25 backdrop-blur-md text-[11px] font-bold text-emerald-100 shadow-sm">
          <Bot className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="truncate">
            {hoveredNode
              ? hoveredNode.aiStatus
              : 'রাবিয়ান AI কেন্দ্র থেকে সকল সেবা পর্যবেক্ষণ করছে'}
          </span>
        </div>

        {appHintVisible && !isInstalledApp ? (
          <div className="px-3 py-2 rounded-2xl bg-amber-400 text-slate-950 text-[11px] font-black flex items-center justify-center gap-1.5 shadow-lg animate-scaleUp">
            <Download className="w-3.5 h-3.5 shrink-0" />
            <span>AI চ্যাট শুধু রাবিয়ান অ্যাপে সক্রিয় (ব্রাউজার থেকে Install / Open App করুন)</span>
          </div>
        ) : (
          <p className="text-[10px] text-emerald-200/75 flex items-center justify-center gap-1 font-medium">
            <MoveHorizontal className="w-3 h-3 text-amber-300" />
            <span>আইকনগুলো ঘুরাতে ড্র্যাগ করুন • সরাসরি প্রবেশ করতে ট্যাপ করুন</span>
          </p>
        )}
      </div>
    </div>
  );
}
