'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { AREA, FILTERS, NIGERIA_CENTER } from '@/lib/data';
import { categoryById } from '@/lib/routing';
import { googleLocationLinks } from '@/lib/google-maps';
import { useStore } from '@/lib/store';
import { locationMessage, useLocation } from './useLocation';
import Responsibility from './Responsibility';
import ProjectEvidence from './ProjectEvidence';
import EmailComplaint from './EmailComplaint';

const OpenStreetMap = dynamic(() => import('./MapView'), { ssr: false, loading: () => <div className="map" /> });

function statusOf(report) {
  if (report.status === 'fixed') return 'Residents report fixed';
  if (report.status === 'claimed') return 'Fix claimed — awaiting confirmation';
  return 'Reported open';
}

export default function MapTab({ t, goReport }) {
  const store = useStore();
  const loc = useLocation();
  const latest = store.myReports[0];
  const [filter, setFilter] = useState('all');
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [samples, setSamples] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState('');
  const [center, setCenter] = useState(latest ? [latest.lat, latest.lng] : AREA.center);
  const [zoom, setZoom] = useState(latest ? 16 : 14);
  const [selectedId, setSelectedId] = useState(latest?.id || '');
  const shown = useMemo(() => store.reports.filter((report) =>
    (samples || !report.sample) && (filter === 'all' || categoryById(report.cat).group === filter) &&
    (status === 'all' || report.status === status) &&
    `${report.street} ${report.area} ${report.state || ''} ${report.description || ''}`.toLowerCase().includes(search.toLowerCase().trim())
  ), [store.reports, filter, status, samples, search]);
  const selected = shown.find((report) => report.id === selectedId);
  const links = selected ? googleLocationLinks(selected) : null;
  const openCount = shown.filter((report) => report.status !== 'fixed').length;
  const findMe = async () => { const position = await loc.locate(); if (position) { setCenter([position.lat, position.lng]); setZoom(15); } };

  return <div className="stack">
    <div className="between wrap"><h1>{t.t_heat}</h1><div className="row wrap"><button className="btn-outline" disabled={refreshing || !store.online} onClick={async () => { setRefreshing(true); setRefreshError(''); try { await store.refreshPublic(); } catch { setRefreshError('Reports could not refresh. Your saved issues are still available.'); } finally { setRefreshing(false); } }}>{refreshing ? 'Refreshing…' : 'Refresh reports'}</button><button className="btn" onClick={goReport}>Report an issue</button></div></div>
    {refreshError && <div role="status" className="note-warn">{refreshError}</div>}
    <div className="muted">Explore resident reports. Open an issue to see the responsible office, government oversight, complaint contacts and project evidence.</div>
    <div className="row wrap"><button className="chip" onClick={() => { setCenter(AREA.center); setZoom(14); }}>Shomolu</button><button className="chip" onClick={() => { setCenter([6.5244, 3.3792]); setZoom(11); }}>Lagos</button><button className="chip" onClick={() => { setCenter(NIGERIA_CENTER); setZoom(6); }}>Nigeria</button><button className="chip" disabled={loc.status === 'asking'} onClick={findMe}>Near me</button></div>
    {locationMessage(loc.status) && <div role="status" className="muted">{locationMessage(loc.status)}</div>}
    <label className="stack-xs">Search street, area or issue<input className="field" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="e.g. waste, Bajulaye, Shomolu" /></label>
    <div className="row wrap">{FILTERS.map((item) => <button key={item.id} className={`chip ${filter === item.id ? 'on' : ''}`} aria-pressed={filter === item.id} onClick={() => setFilter(item.id)}>{item.label}</button>)}</div>
    <div className="between wrap"><label className="row">Status<select className="field" value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">All reports</option><option value="open">Open</option><option value="claimed">Fix claimed</option><option value="fixed">Residents report fixed</option></select></label><label className="row"><input type="checkbox" checked={samples} onChange={(event) => setSamples(event.target.checked)} />Show sample reports</label></div>
    <OpenStreetMap center={center} zoom={zoom} reports={shown} onSelect={setSelectedId} />
    <div className="muted">Orange: reported open. Purple: fix claimed. Green: residents report fixed. Reports saved only on your device appear in your view but are not public.</div>
    <div className="grid2"><div className="card"><strong className="big">{openCount}</strong><span>Open or awaiting confirmation</span></div><div className="card"><strong className="big">{shown.length - openCount}</strong><span>Residents report fixed</span></div></div>
    {selected && <section className="stack" aria-label="Selected report">
      <div className="card"><div className="between wrap"><h2>{categoryById(selected.cat).label}</h2><button className="btn-link" onClick={() => setSelectedId('')}>Close issue</button></div><strong>{selected.street}, {selected.area}</strong><div>{selected.description || 'No description was supplied.'}</div><div className="small muted">{statusOf(selected)} · {selected.sample ? 'Sample report' : selected.publication === 'published' ? 'Published report' : 'Saved on this device only'} · Reference {selected.id}</div>{selected.photo && <img className="photo" src={selected.photo} alt="Resident evidence for this issue" />}{links && <div className="row wrap"><a href={links.map} target="_blank" rel="noreferrer">Open Google Maps ↗</a><a href={links.streetView} target="_blank" rel="noreferrer">Street View ↗</a></div>}</div>
      {!selected.sample && <><Responsibility report={selected} /><EmailComplaint report={selected} /><ProjectEvidence key={selected.id} report={selected} /></>}
      {selected.sample && <div className="note-warn">This is demonstration data, not a current verified issue. Complaint and evidence submissions are disabled for samples.</div>}
    </section>}
    <section className="card"><h2>Issues matching your filters</h2>{shown.map((report) => <article className="issue-list-item stack-xs" key={report.id}><div className="between wrap"><strong>{categoryById(report.cat).label}</strong><span className={`badge ${report.status === 'fixed' ? 'ok' : 'warn'}`}>{statusOf(report)}</span></div><div>{report.street}, {report.area}</div><div className="small muted">{report.sample ? 'Sample' : report.publication === 'published' ? 'Public report' : 'Device only'} · {report.days} days recorded</div><button className="btn-outline" onClick={() => { setSelectedId(report.id); setCenter([report.lat, report.lng]); setZoom(17); }}>View issue and who is responsible</button></article>)}{!shown.length && <div className="muted">No reports match. Submit the first issue or change your filters.</div>}</section>
  </div>;
}
