'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Play, Pause, Sparkles, Wind } from 'lucide-react';

interface CampusAudioPlayerProps {
  initialScene?: 'paris_road' | 'shaheed_minar' | 'padma_river';
  title?: string;
  className?: string;
  compact?: boolean;
}

export default function CampusAudioPlayer({
  initialScene = 'paris_road',
  title = 'প্যারিস রোডের শান্ত নিসর্গ ও বাতাসের শব্দ',
  className = '',
  compact = false,
}: CampusAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [scene, setScene] = useState<'paris_road' | 'shaheed_minar' | 'padma_river'>(initialScene);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const timerRef = useRef<any>(null);

  // Stop audio on unmount
  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  const startAudio = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.001, ctx.currentTime);
      masterGain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 1.5);
      masterGain.connect(ctx.destination);
      gainNodeRef.current = masterGain;

      // 1. Gentle Wind / Rustle Noise Buffer
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      // Filter noise to sound like campus leaves and breeze
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(scene === 'padma_river' ? 320 : 540, ctx.currentTime);
      filter.Q.setValueAtTime(scene === 'shaheed_minar' ? 1.5 : 2.2, ctx.currentTime);

      whiteNoise.connect(filter);
      filter.connect(masterGain);
      whiteNoise.start();

      // 2. Periodic natural bird chirps or bell resonance
      if (scene === 'paris_road') {
        const playChirp = () => {
          if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') return;
          const actx = audioCtxRef.current;
          const osc = actx.createOscillator();
          const chirpGain = actx.createGain();

          const baseFreq = 2200 + Math.random() * 600;
          osc.type = 'sine';
          osc.frequency.setValueAtTime(baseFreq, actx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(baseFreq + 700, actx.currentTime + 0.08);
          osc.frequency.exponentialRampToValueAtTime(baseFreq + 300, actx.currentTime + 0.16);

          chirpGain.gain.setValueAtTime(0.001, actx.currentTime);
          chirpGain.gain.linearRampToValueAtTime(0.04, actx.currentTime + 0.04);
          chirpGain.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + 0.22);

          osc.connect(chirpGain);
          chirpGain.connect(actx.destination);
          osc.start();
          osc.stop(actx.currentTime + 0.25);

          timerRef.current = setTimeout(playChirp, 3500 + Math.random() * 4500);
        };
        timerRef.current = setTimeout(playChirp, 1500);
      } else if (scene === 'shaheed_minar') {
        // Serene bell chime
        const playBell = () => {
          if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') return;
          const actx = audioCtxRef.current;
          const osc = actx.createOscillator();
          const bellGain = actx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(523.25, actx.currentTime); // C5 chime

          bellGain.gain.setValueAtTime(0.001, actx.currentTime);
          bellGain.gain.linearRampToValueAtTime(0.07, actx.currentTime + 0.05);
          bellGain.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + 3.2);

          osc.connect(bellGain);
          bellGain.connect(actx.destination);
          osc.start();
          osc.stop(actx.currentTime + 3.3);

          timerRef.current = setTimeout(playBell, 7000 + Math.random() * 5000);
        };
        timerRef.current = setTimeout(playBell, 1000);
      }

      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    }
  };

  const stopAudio = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (gainNodeRef.current && audioCtxRef.current) {
      try {
        gainNodeRef.current.gain.linearRampToValueAtTime(0.001, audioCtxRef.current.currentTime + 0.5);
        setTimeout(() => {
          audioCtxRef.current?.close();
          audioCtxRef.current = null;
          gainNodeRef.current = null;
        }, 550);
      } catch {
        audioCtxRef.current = null;
      }
    }
    setIsPlaying(false);
  };

  const togglePlay = () => {
    if (isPlaying) {
      stopAudio();
    } else {
      startAudio();
    }
  };

  return (
    <div
      className={`rounded-2xl border p-3 flex items-center justify-between gap-3 transition-[background-color,border-color,color,box-shadow] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] ${
        isPlaying
          ? 'bg-emerald-950/90 text-white border-emerald-500/40 shadow-md ring-1 ring-emerald-500/30'
          : 'bg-slate-50 text-slate-800 border-slate-200'
      } ${className}`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <button
          onClick={togglePlay}
          type="button"
          aria-label={isPlaying ? 'Pause Campus Ambience' : 'Play Campus Ambience'}
          className={`w-9 h-9 rounded-xl flex items-center justify-center emil-press shrink-0 cursor-pointer ${
            isPlaying
              ? 'bg-amber-400 text-slate-950 hover:bg-amber-300 shadow-md'
              : 'bg-emerald-700 text-white hover:bg-emerald-800'
          }`}
        >
          {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 ml-0.5 fill-current" />}
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h5 className="text-xs font-black truncate">{title}</h5>
            {isPlaying && (
              <span className="text-[10px] bg-amber-400/20 text-amber-300 px-1.5 py-0.2 rounded border border-amber-400/30 font-bold shrink-0">
                লাইভ অডিও
              </span>
            )}
          </div>
          <p className={`text-[10px] truncate ${isPlaying ? 'text-emerald-200' : 'text-slate-500'}`}>
            {isPlaying ? 'প্রাকৃতিক বায়ুমণ্ডলীয় শব্দ সক্রিয় (হেডফোনে শুনুন)' : 'ক্যাম্পাসের প্রাকৃতিক পরিবেশের শব্দ শুনুন'}
          </p>
        </div>
      </div>

      {/* Pulsing Audio Wave Equalizer */}
      <div className="flex items-center gap-1 shrink-0 h-6">
        {[0.4, 0.9, 0.6, 1.0, 0.5, 0.7].map((height, i) => (
          <span
            key={i}
            className={`w-1 rounded-full transition-[height,background-color] duration-250 ease-[cubic-bezier(0.23,1,0.32,1)] ${
              isPlaying
                ? 'bg-amber-400 animate-pulse'
                : 'bg-slate-300'
            }`}
            style={{
              height: isPlaying ? `${Math.max(4, height * 20)}px` : '4px',
              animationDelay: `${i * 120}ms`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
