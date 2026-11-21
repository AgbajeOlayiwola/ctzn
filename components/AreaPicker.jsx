'use client';

import { useState } from 'react';
import { STATES } from '@/lib/areas';
import { useLocation } from './useLocation';

export default function AreaPicker({ area, onSelect }) {
  const loc = useLocation();
  const [editing, setEditing] = useState(!area);
  const [state, setState] = useState(area?.state || '');
  const [lga, setLga] = useState(area?.lga || '');
  const [ward, setWard] = useState(area?.ward || '');
  const [message, setMessage] = useState('');
  const [resolving, setResolving] = useState(false);
  const busy = loc.status === 'asking' || resolving;
  const somolu = state === 'Lagos' && /^(shomolu|somolu)$/i.test(lga.trim());

  async function findMe() {
    setMessage('');
    const position = await loc.locate();
    if (!position) {
      setMessage('Location could not be shared. Choose your state and enter your LGA below.');
      return;
    }
    setResolving(true);
    try {
      const params = new URLSearchParams({ latitude: position.lat, longitude: position.lng, localityLanguage: 'en' });
      const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?${params}`, { signal: AbortSignal.timeout(10000) });
      if (!response.ok) throw new Error('lookup');
      const result = await response.json();
      if (result.countryCode !== 'NG') {
        setMessage('This directory covers Nigeria. You can select a Nigerian home area manually.');
        return;
      }
      const detected = (result.principalSubdivision || '').replace(/ State$/i, '');
      setState(STATES.includes(detected) ? detected : '');
      setLga('');
      setWard('');
      setMessage(`Approximate location: ${[result.locality || result.city, result.principalSubdivision].filter(Boolean).join(', ')}. Confirm your state and enter your LGA; location does not determine your electoral ward.`);
    } catch {
      setMessage('Your location was shared, but the area lookup failed. Choose your state and LGA below.');
    } finally { setResolving(false); }
  }

  return <section className="card area-picker" aria-labelledby="area-heading">
    <div className="between wrap">
      <div className="stack-xs"><h2 id="area-heading">{area ? 'Your representative area' : 'Find your representatives'}</h2><div className="muted">{area ? `${area.lga}, ${area.state}${area.ward ? ' · Ward ' + area.ward : ''}` : 'Where do you live or vote? Share your location or choose an area.'}</div></div>
      {area && <button className="btn-outline" onClick={() => setEditing(!editing)} aria-expanded={editing}>{editing ? 'Close' : 'Change area'}</button>}
    </div>
    {editing && <>
      <button className="btn" onClick={findMe} disabled={busy}>{busy ? 'Finding your area…' : 'Use my current location'}</button>
      <div className="small muted">With your permission, your coordinates are sent to <a href="https://www.bigdatacloud.com/privacy-policy" target="_blank" rel="noreferrer">BigDataCloud</a> to find your area. Only your confirmed state, LGA and ward are saved on this device. You can enter them manually instead.</div>
      <div role="status" className="muted">{message}</div>
      <form className="stack-sm" onSubmit={(event) => { event.preventDefault(); onSelect({ state, lga: lga.trim(), ward: somolu ? ward : '' }); setEditing(false); }}>
        <div className="grid2">
          <label className="stack-xs">State / FCT<select className="field" required value={state} disabled={busy} onChange={(event) => { setState(event.target.value); setLga(''); setWard(''); }}><option value="">Choose state</option>{STATES.map((name) => <option key={name}>{name}</option>)}</select></label>
          <label className="stack-xs">Local government area<input className="field" required maxLength={80} value={lga} disabled={busy} placeholder="e.g. Shomolu" onChange={(event) => { setLga(event.target.value); setWard(''); }} pattern=".*\S.*" /></label>
        </div>
        {somolu && <label className="stack-xs">Electoral ward<select className="field" value={ward} onChange={(event) => setWard(event.target.value)}><option value="">Unknown / another ward</option><option value="F">Ward F — Bajulaye / Fola Agoro</option></select><span className="muted">Select Ward F only if it is your electoral ward. Other wards are not mapped yet.</span></label>}
        <button className="btn" disabled={busy}>Show representatives</button>
      </form>
    </>}
  </section>;
}
