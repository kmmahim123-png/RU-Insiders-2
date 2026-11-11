'use client';

import React, { useState } from 'react';
import ShimmerSkeleton from './ShimmerSkeleton';

interface ImageWithPlaceholderProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  wrapperClassName?: string;
  fallbackSrc?: string;
}

export default function ImageWithPlaceholder({
  src,
  alt,
  className = '',
  wrapperClassName = '',
  fallbackSrc = '/mockups/hoodie-front.jpg',
  ...props
}: ImageWithPlaceholderProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className={`relative overflow-hidden ${wrapperClassName}`}>
      {!loaded && (
        <ShimmerSkeleton className="absolute inset-0 w-full h-full rounded-[inherit]" />
      )}
      <img
        src={error ? fallbackSrc : src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        onError={() => {
          setError(true);
          setLoaded(true);
        }}
        className={`w-full h-full object-cover transition-[opacity,transform,filter] duration-250 ease-[cubic-bezier(0.23,1,0.32,1)] ${
          loaded ? 'opacity-100 blur-0 scale-100' : 'opacity-0 blur-sm scale-[1.02]'
        } ${className}`}
        {...props}
      />
    </div>
  );
}
