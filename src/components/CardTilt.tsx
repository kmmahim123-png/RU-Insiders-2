'use client';

import React, { useRef, useState, useCallback } from 'react';

interface CardTiltProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  maxTilt?: number; // max tilt angle in degrees, default 8
  glare?: boolean;
  scale?: number;
  className?: string;
}

export default function CardTilt({
  children,
  maxTilt = 7,
  glare = true,
  scale = 1.015,
  className = '',
  ...props
}: CardTiltProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tiltStyle, setTiltStyle] = useState<React.CSSProperties>({});
  const [glareStyle, setGlareStyle] = useState<React.CSSProperties>({ opacity: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      // Disable 3D tilt on touch devices and respect reduced-motion preferences
      if (
        typeof window !== 'undefined' &&
        ('ontouchstart' in window ||
          navigator.maxTouchPoints > 0 ||
          window.matchMedia('(prefers-reduced-motion: reduce)').matches)
      ) {
        return;
      }
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -maxTilt;
      const rotateY = ((x - centerX) / centerX) * maxTilt;

      setTiltStyle({
        transform: `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(${scale}, ${scale}, 1)`,
        transition: 'transform 0.08s ease-out',
      });

      if (glare) {
        const glareX = (x / rect.width) * 100;
        const glareY = (y / rect.height) * 100;
        setGlareStyle({
          opacity: 0.18,
          background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0) 65%)`,
          transition: 'opacity 0.15s ease',
        });
      }
    },
    [maxTilt, glare, scale]
  );

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTiltStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      transition: 'transform 220ms cubic-bezier(0.23, 1, 0.32, 1)',
    });
    if (glare) {
      setGlareStyle({
        opacity: 0,
        transition: 'opacity 180ms cubic-bezier(0.23, 1, 0.32, 1)',
      });
    }
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        ...tiltStyle,
        transformStyle: 'preserve-3d',
      }}
      className={`relative will-change-transform ${className}`}
      {...props}
    >
      {children}
      {glare && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden z-20"
          style={glareStyle}
        />
      )}
    </div>
  );
}
