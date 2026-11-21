'use client';

import { useRef, useState } from 'react';
import { AREA, CATEGORIES, ROAD_TYPES } from '@/lib/data';
import { categoryById, complaintText, lookupRoad, officeKeyFor } from '@/lib/routing';
import { STATES } from '@/lib/areas';
import { useStore } from '@/lib/store';
import { locationMessage, useLocation } from './useLocation';
import Consumer from './Consumer';
import ReportLocation from './ReportLocation';
import Responsibility from './Responsibility';
import EmailComplaint from './EmailComplaint';
import ProjectEvidence from './ProjectEvidence';

export default function Report({ t, goLeader, goMap }) {
  const store = useStore();
  const loc = useLocation();
  const [mode, setMode] = useState('public');
  const [step, setStep] = useState(0);
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [cat, setCat] = useState('road');
  const [pin, setPin] = useState(null);
  const [street, setStreet] = useState('');
  const [area, setArea] = useState(AREA.lga);
  const [state, setState] = useState(store.representativeArea?.state || '');
  const [lga, setLga] = useState(store.representativeArea?.lga || '');
  const [description, setDescription] = useState('');
  const [posting, setPosting] = useState(false);
  const [result, setResult] = useState(null);
  const [road, setRoad] = useState('inner');
  const [roadNote, setRoadNote] = useState('');
  const [copied, setCopied] = useState(false);
  const pinRequest = useRef(0);

  const c = categoryById(cat);
  const message = complaintText(cat, road, street, area);
  const preview = { cat, road, state, lga, area, street, description, lat: pin?.lat, lng: pin?.lng };

  const reset = () => { pinRequest.current += 1; setStep(0); setPhotoUrl(''); setPhotoFile(null); setPin(null); setStreet(''); setDescription(''); setResult(null); setRoadNote(''); setCopied(false); };

  const onPhoto = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    setPhotoFile(f);
    setPhotoUrl(URL.createObjectURL(f));
    setStep(1);
  };

  const placePin = async (p) => {
    const request = ++pinRequest.current;
    setPin(p);
    setStreet('');
    setRoadNote('Checking the road type...');
    const info = await lookupRoad(p.lat, p.lng);
    if (request !== pinRequest.current) return;
    if (!info) { setRoadNote('Could not read the road from the map. Please choose it below.'); return; }
    if (info.street) setStreet(info.street);
    if (info.area) setArea(info.area);
    if (info.roadType) { setRoad(info.roadType); setRoadNote('Road type read from the map. Change it if it looks wrong.'); }
    else setRoadNote('Please confirm the road type below.');
  };

  const useMyLocation = async () => {
    const p = await loc.locate();
    if (p) placePin(p);
  };

  const post = async () => {
    if (posting || !pin || !state || !lga.trim() || !description.trim()) return;
    setPosting(true);
    const report = {
      id: crypto.randomUUID(), cat, road: c.byRoad ? road : null, office: state === 'Lagos' ? officeKeyFor(cat, road) : 'unknown', state, lga: lga.trim(), description: description.trim(),
      street: street || 'Unnamed street', area, lat: pin.lat, lng: pin.lng, days: 1, seen: 0, status: 'open', photo: photoUrl,
    };
    const saved = await store.addReport(report, photoFile);
    setResult(saved);
    setPosting(false);
    setStep(4);
  };

  const copy = async () => {
    try { await navigator.clipboard.writeText(message); setCopied(true); } catch (e) { setCopied(false); }
  };

  return (
    <div className="stack">
      <h1>{t.t_report}</h1>
      <div className="grid2" style={{ gap: 8 }}>
        <button className={`seg ${mode === 'public' ? 'on' : ''}`} aria-pressed={mode === 'public'} onClick={() => setMode('public')}>Public problem</button>
        <button className={`seg ${mode === 'consumer' ? 'on' : ''}`} aria-pressed={mode === 'consumer'} onClick={() => setMode('consumer')}>Bad product or service</button>
      </div>

      {mode === 'consumer' ? <Consumer /> : null}

      {mode === 'public' ? (
        <>
          <div className="muted">Report the place, not the person. Do not include faces or number plates in your photo.</div>

          {step === 0 ? (
            <div className="stack-sm">
              <div style={{ fontWeight: 600 }}>1. Add a photo (optional)</div>
              <div className="muted">A recent photo helps people understand the issue. You can report without one.</div>
              <label htmlFor="photo" className="btn-photo">
                <span>{t.b_snap}</span>
                <span style={{ fontSize: 13 }}>Tap here to open the camera</span>
              </label>
              <input id="photo" className="visually-hidden" type="file" accept="image/*" capture="environment" onChange={onPhoto} />
              <button className="btn-outline" onClick={() => setStep(1)}>Continue without a photo</button>
            </div>
          ) : null}

          {step === 1 ? (
            <div className="stack-sm">
              <div style={{ fontWeight: 600 }}>2. What did you see?</div>
              <div className="grid2">
                {CATEGORIES.map((k) => (
                  <button key={k.id} className="option" onClick={() => { setCat(k.id); setStep(2); }}>
                    <b>{k.label}</b><span>{k.sub}</span>
                  </button>
                ))}
              </div>
              <button className="btn-link" onClick={reset}>Start again</button>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="stack-sm">
              <div style={{ fontWeight: 600 }}>3. Where is it?</div>
              <button className="btn" disabled={loc.status === 'asking'} onClick={useMyLocation}>{loc.status === 'asking' ? 'Finding your location…' : 'Use my location'}</button>
              <div className="muted">Or tap the map to drop the pin on the exact spot.</div>
              {locationMessage(loc.status) ? <div className="muted">{locationMessage(loc.status)}</div> : null}
              <ReportLocation center={pin ? [pin.lat, pin.lng] : AREA.center} pin={pin} onPick={placePin} user={loc.pos} />
              {pin ? (
                <div className="stack-sm">
                  <label htmlFor="street" style={{ fontSize: 13, fontWeight: 600 }}>Street name</label>
                  <input id="street" className="field" value={street} onChange={(e) => setStreet(e.target.value)} placeholder="For example, Bajulaye Road" />
                  <div className="grid2">
                    <label className="stack-xs">Report state<select className="field" value={state} onChange={(e) => { setState(e.target.value); setLga(''); }}><option value="">Confirm state</option>{STATES.map((name) => <option key={name}>{name}</option>)}</select></label>
                    <label className="stack-xs">Report LGA<input className="field" maxLength={80} value={lga} onChange={(e) => setLga(e.target.value)} placeholder="Confirm local government" /></label>
                  </div>
                  <label className="stack-xs">Area / neighbourhood<input className="field" maxLength={100} value={area} onChange={(e) => setArea(e.target.value)} /></label>
                  <label className="stack-xs">What is happening?<textarea className="field" maxLength={1200} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe what you saw and when. Avoid personal information." /></label>
                  {c.byRoad ? (
                    <>
                      <label htmlFor="road" style={{ fontSize: 13, fontWeight: 600 }}>Kind of road</label>
                      <select id="road" className="field" value={road} onChange={(e) => setRoad(e.target.value)}>
                        {ROAD_TYPES.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
                      </select>
                      {roadNote ? <div className="muted">{roadNote}</div> : null}
                    </>
                  ) : null}
                  <button className="btn" disabled={!street.trim() || !state || !lga.trim() || !description.trim()} onClick={() => setStep(3)}>Review issue and responsibility</button>
                </div>
              ) : null}
              <button className="btn-link" onClick={() => setStep(1)}>Go back</button>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="stack-sm" style={{ gap: 12 }}>
              <div style={{ fontWeight: 600 }}>4. Check, then post</div>
              {photoUrl ? <img className="photo" src={photoUrl} alt="The photo you added" /> : null}
              <div className="note-ok">{description}</div>
              <Responsibility report={preview} />
              <div className="muted">Your issue and pin will be public if publishing succeeds. Emailing the office is a separate step after saving.</div>
              <div className="card" style={{ gap: 8 }}>
                <div className="label">Your complaint, ready to send</div>
                <div style={{ fontSize: 14 }}>{message}</div>
                <button className="btn-outline" onClick={copy}>{copied ? 'Copied' : 'Copy complaint text'}</button>
              </div>
              <button className="btn" disabled={posting} onClick={post}>{posting ? 'Saving report…' : store.online ? t.b_post : 'Save issue on this device (+25 pts)'}</button>
              <button className="btn-link" disabled={posting} onClick={() => setStep(2)}>Go back</button>
            </div>
          ) : null}

          {step === 4 ? (
            <div className="stack-sm" style={{ gap: 12 }}>
              <div className="note-ok">
                <div style={{ fontFamily: 'var(--display)', fontSize: 22, fontWeight: 700 }}>{result?.published ? 'Report published! +25 pts' : 'Issue saved on this device. +25 pts'}</div>
                <div style={{ fontWeight: 400, color: 'var(--ink)', marginTop: 6 }}>{result?.published ? 'Your issue is on the public map. Track it under My reports.' : result?.error}</div>
              </div>
              {result?.warning && <div className="note-warn">{result.warning}</div>}
              {result?.report && <><EmailComplaint report={result.report} /><ProjectEvidence report={result.report} /></>}
              <button className="btn" onClick={goMap}>Show me on the map</button>
              <button className="btn-link" onClick={reset}>Report something else</button>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
