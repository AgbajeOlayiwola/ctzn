'use client';

import { useEffect, useRef, useState } from 'react';
import { loadGoogleMaps } from '@/lib/google-maps';

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
export default function GoogleIssuesMap({ center, zoom, reports, onSelect }) {
  const container = useRef(null);
  const mapRef = useRef(null);
  const overlays = useRef([]);
  const selectRef = useRef(onSelect);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => { selectRef.current = onSelect; }, [onSelect]);
  useEffect(() => {
    if (!apiKey) return;
    let cancelled = false;
    const fail = () => { if (!cancelled) setError('Google Maps is unavailable. Use the issue list and location links below.'); };
    window.addEventListener('ctzn-google-maps-auth-failure', fail);
    loadGoogleMaps(apiKey).then((maps) => {
      if (cancelled) return;
      mapRef.current = new maps.Map(container.current, { center: { lat: center[0], lng: center[1] }, zoom, streetViewControl: true, mapTypeControl: true, gestureHandling: 'cooperative' });
      setReady(true);
    }).catch(fail);
    return () => { cancelled = true; window.removeEventListener('ctzn-google-maps-auth-failure', fail); overlays.current.forEach((circle) => circle.setMap(null)); mapRef.current = null; };
  }, []);
  useEffect(() => {
    if (!ready || !mapRef.current) return;
    mapRef.current.setCenter({ lat: center[0], lng: center[1] });
    mapRef.current.setZoom(zoom);
  }, [ready, center[0], center[1], zoom]);
  useEffect(() => {
    if (!ready || !mapRef.current) return;
    const maps = window.google.maps;
    const map = mapRef.current;
    const info = new maps.InfoWindow();
    const listeners = [];
    overlays.current = reports.filter((r) => Number.isFinite(r.lat) && Number.isFinite(r.lng)).map((report) => {
      const color = report.status === 'fixed' ? '#0b6b3a' : report.status === 'claimed' ? '#6b4ac2' : '#b44a12';
      const circle = new maps.Circle({ map, center: { lat: report.lat, lng: report.lng }, strokeColor: '#fff', strokeWeight: 2, fillColor: color, fillOpacity: 0.85 });
      const resize = () => circle.setRadius((156543.03392 * Math.cos(report.lat * Math.PI / 180) / 2 ** map.getZoom()) * Math.min(20, 8 + Math.round((report.seen || 0) / 2)));
      resize();
      listeners.push(map.addListener('zoom_changed', resize));
      listeners.push(circle.addListener('click', () => {
        const content = document.createElement('div');
        const title = document.createElement('strong');
        title.textContent = `${report.street || 'Reported issue'}, ${report.area || ''}`;
        const details = document.createElement('p');
        details.textContent = `${report.sample ? 'Sample · ' : ''}${report.status === 'fixed' ? 'Residents report fixed' : report.status === 'claimed' ? 'Fix claimed; needs confirmation' : 'Reported open'}${report.publication === 'local' ? ' · saved only on this device' : ''}`;
        const button = document.createElement('button');
        button.textContent = 'View issue, responsibility and evidence';
        button.onclick = () => selectRef.current(report.id);
        content.append(title, details, button);
        info.setContent(content);
        info.setPosition({ lat: report.lat, lng: report.lng });
        info.open({ map });
        selectRef.current(report.id);
      }));
      return circle;
    });
    return () => { info.close(); listeners.forEach((listener) => listener.remove()); overlays.current.forEach((circle) => circle.setMap(null)); overlays.current = []; };
  }, [ready, reports]);
  if (!apiKey) return <div className="card note-warn"><strong>Google Maps is not connected yet.</strong><span>The issue list works below. Google Maps and Street View links open each report location in a new tab.</span></div>;
  return <div className="stack-xs">{error && <div role="status" className="note-warn">{error}</div>}<div ref={container} className="report-google-map" aria-label="Google map of reported issues" />{!ready && !error && <div role="status">Loading Google Maps…</div>}</div>;
}
