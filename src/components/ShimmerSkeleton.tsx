'use client';

import React from 'react';

interface ShimmerSkeletonProps {
  className?: string;
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full';
}

export default function ShimmerSkeleton({
  className = 'w-full h-24',
  rounded = '2xl',
}: ShimmerSkeletonProps) {
  const roundedClass = {
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    '3xl': 'rounded-3xl',
    full: 'rounded-full',
  }[rounded];

  return (
    <div
      className={`relative overflow-hidden bg-slate-200/80 ${roundedClass} ${className}`}
      aria-hidden="true"
    >
      <div
        className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-amber-100/40 to-transparent"
        style={{
          background:
            'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(251, 191, 36, 0.15) 50%, rgba(255,255,255,0) 100%)',
        }}
      />
    </div>
  );
}
