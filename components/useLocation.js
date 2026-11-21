'use client';

import { useCallback, useState } from 'react';

// Asks the browser for the user's position. Works on https and on localhost.
export function useLocation() {
  const [pos, setPos] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | asking | ok | denied | unavailable

  const locate = useCallback(() => new Promise((resolve) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setStatus('unavailable');
      resolve(null);
      return;
    }
    setStatus('asking');
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const v = { lat: p.coords.latitude, lng: p.coords.longitude };
        setPos(v);
        setStatus('ok');
        resolve(v);
      },
      () => { setStatus('denied'); resolve(null); },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }), []);

  return { pos, status, locate };
}

export function locationMessage(status) {
  if (status === 'asking') return 'Finding your location...';
  if (status === 'denied') return 'Location was not shared. Tap the map to drop a pin instead.';
  if (status === 'unavailable') return 'This device cannot share location. Tap the map to drop a pin instead.';
  return '';
}
