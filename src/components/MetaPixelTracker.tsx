'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { initMetaPixels } from '@/lib/metaPixel';

export default function MetaPixelTracker() {
  const pathname = usePathname();
  const cachedPixelIdsRef = useRef<string[]>([]);

  useEffect(() => {
    // Do not fire marketing pixels inside admin management routes
    if (pathname?.startsWith('/admin')) return;

    const loadAndTrack = async () => {
      try {
        if (cachedPixelIdsRef.current.length === 0) {
          const res = await fetch('/api/store');
          if (!res.ok) return;
          const data = await res.json();
          const ids: string[] = [];
          if (data.settings?.defaultFacebookPixelId) {
            ids.push(data.settings.defaultFacebookPixelId);
          }
          // Cache default pixel for app-wide PageView
          cachedPixelIdsRef.current = ids;
        }
        if (cachedPixelIdsRef.current.length > 0) {
          initMetaPixels(cachedPixelIdsRef.current, true);
        }
      } catch {}
    };

    loadAndTrack();
  }, [pathname]);

  return null;
}
