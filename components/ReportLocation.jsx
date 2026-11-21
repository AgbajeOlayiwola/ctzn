'use client';

import dynamic from 'next/dynamic';
import { useCallback, useState } from 'react';
import { googleLocationLinks } from '@/lib/google-maps';

const MapView = dynamic(() => import('./MapView'), { ssr: false, loading: () => <div className="map small" /> });
const GoogleReportMap = dynamic(() => import('./GoogleReportMap'), { ssr: false, loading: () => <div className="map small">Loading Google Maps…</div> });
const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export default function ReportLocation({ center, pin, onPick, user }) {
  const [provider, setProvider] = useState(apiKey ? 'google' : 'osm');
  const [failed, setFailed] = useState(false);
  const fallback = useCallback(() => { setFailed(true); setProvider('osm'); }, []);
  const links = googleLocationLinks(pin);
  return <div className="stack-sm">
    {apiKey && <div className="row wrap" aria-label="Map provider">
      <button type="button" className={`chip ${provider === 'google' ? 'on' : ''}`} aria-pressed={provider === 'google'} onClick={() => { setFailed(false); setProvider('google'); }}>Google Maps</button>
      <button type="button" className={`chip ${provider === 'osm' ? 'on' : ''}`} aria-pressed={provider === 'osm'} onClick={() => setProvider('osm')}>OpenStreetMap</button>
    </div>}
    {failed && <div role="status" className="muted">Google Maps could not load. Use this map to choose the same report location.</div>}
    {provider === 'google' && apiKey ? <GoogleReportMap apiKey={apiKey} center={center} pin={pin} onPick={onPick} onFailure={fallback} /> : <MapView small center={center} zoom={pin ? 17 : 15} picked={pin} onPick={onPick} user={user} />}
    {links ? <>
      <div className="small muted">Report pin: {pin.lat.toFixed(6)}, {pin.lng.toFixed(6)}</div>
      <div className="row wrap google-location-links"><a href={links.map} target="_blank" rel="noreferrer">Open spot in Google Maps ↗</a><a href={links.streetView} target="_blank" rel="noreferrer">Open Street View ↗</a></div>
      {provider !== 'google' && <div className="small muted">Street View opens in a new tab where imagery is available. Return here to finish your report; your pin stays saved.</div>}
    </> : <div className="muted">Choose a report pin to inspect that spot in Google Maps or Street View.</div>}
  </div>;
}
