'use client';

import { useEffect, useState } from 'react';

export default function StartupReveal() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (window.sessionStorage.getItem('ctzn-startup-seen')) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        window.sessionStorage.setItem('ctzn-startup-seen', '1');
        return;
      }
      window.sessionStorage.setItem('ctzn-startup-seen', '1');
      setVisible(true);
      const timer = window.setTimeout(() => setVisible(false), 1050);
      return () => window.clearTimeout(timer);
    } catch {
      return undefined;
    }
  }, []);

  if (!visible) return null;
  return <div className="startup-reveal" aria-hidden="true"><img src="/ctzn-logo.svg" alt="" /></div>;
}
