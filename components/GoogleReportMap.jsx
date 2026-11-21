'use client';

import { useEffect, useRef, useState } from 'react';
import { loadGoogleMaps } from '@/lib/google-maps';

export default function GoogleReportMap({ apiKey, center, pin, onPick, onFailure }) {
  const container = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const onPickRef = useRef(onPick);
  const initialCenter = useRef(center);
  const requestRef = useRef(0);
  const [ready, setReady] = useState(false);
  const [showingStreet, setShowingStreet] = useState(false);
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState('');
  useEffect(() => { onPickRef.current = onPick; }, [onPick]);

  useEffect(() => {
    let cancelled = false;
    let map;
    let click;
    let visibility;
    window.addEventListener('ctzn-google-maps-auth-failure', onFailure);
    loadGoogleMaps(apiKey).then((maps) => {
      if (cancelled) return;
      map = new maps.Map(container.current, {
        center: { lat: initialCenter.current[0], lng: initialCenter.current[1] }, zoom: 15,
        streetViewControl: true, mapTypeControl: true, fullscreenControl: true, gestureHandling: 'cooperative',
      });
      mapRef.current = map;
      click = map.addListener('click', (event) => {
        if (event.latLng) onPickRef.current({ lat: event.latLng.lat(), lng: event.latLng.lng() });
      });
      visibility = map.getStreetView().addListener('visible_changed', () => setShowingStreet(map.getStreetView().getVisible()));
      setReady(true);
    }).catch(() => { if (!cancelled) onFailure(); });
    return () => {
      cancelled = true;
      window.removeEventListener('ctzn-google-maps-auth-failure', onFailure);
      requestRef.current += 1;
      click?.remove();
      visibility?.remove();
      if (map) map.getStreetView().setVisible(false);
      markerRef.current?.setMap(null);
      mapRef.current = null;
    };
  }, [apiKey, onFailure]);

  useEffect(() => {
    if (!ready || !mapRef.current || !pin) return;
    requestRef.current += 1;
    setChecking(false);
    setMessage('');
    const map = mapRef.current;
    map.getStreetView().setVisible(false);
    map.panTo(pin);
    map.setZoom(17);
    markerRef.current?.setMap(null);
    markerRef.current = new window.google.maps.Circle({
      map, center: pin, radius: 8, strokeColor: '#ffffff', strokeWeight: 3,
      fillColor: '#0b6b3a', fillOpacity: 1, clickable: false,
    });
  }, [ready, pin?.lat, pin?.lng]);

  function openStreetView() {
    if (!pin || !mapRef.current) return;
    const request = ++requestRef.current;
    setChecking(true);
    setMessage('');
    const maps = window.google.maps;
    new maps.StreetViewService().getPanorama({ location: pin, radius: 50, preference: maps.StreetViewPreference.NEAREST }, (data, status) => {
      if (request !== requestRef.current || !mapRef.current) return;
      setChecking(false);
      if (status !== 'OK' || !data?.location?.pano) {
        setMessage(status === 'ZERO_RESULTS' ? 'No Street View imagery was found within 50 metres of this pin. You can still submit this location.' : 'Street View could not load. Try again or continue with the map.');
        return;
      }
      const panorama = mapRef.current.getStreetView();
      panorama.setPano(data.location.pano);
      panorama.setVisible(true);
    });
  }

  return <div className="stack-sm">
    <div className="row wrap">
      <button type="button" className={`chip ${!showingStreet ? 'on' : ''}`} aria-pressed={!showingStreet} disabled={!ready} onClick={() => { requestRef.current += 1; setChecking(false); mapRef.current?.getStreetView().setVisible(false); }}>Map / place pin</button>
      <button type="button" className={`chip ${showingStreet ? 'on' : ''}`} aria-pressed={showingStreet} disabled={!ready || !pin || checking} onClick={openStreetView}>{checking ? 'Checking imagery…' : 'Street View at pin'}</button>
    </div>
    {!ready && <div role="status" className="muted">Loading Google Maps…</div>}
    <div ref={container} className="report-google-map" aria-label="Google map for choosing the report location" />
    <div role="status" className="muted">{message}</div>
    <div className="small muted">Street View may show an older image or a nearby spot. Exploring it does not move your report pin. Return to the map to change the pin.</div>
  </div>;
}
