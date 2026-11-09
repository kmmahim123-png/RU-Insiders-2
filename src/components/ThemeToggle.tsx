'use client';

import { useEffect } from 'react';

export default function ThemeToggle() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.classList.remove('dark');
      try {
        localStorage.removeItem('ru_theme');
      } catch {}
    }
  }, []);

  return null;
}
