'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { LANGS, strings } from '@/lib/i18n';
import Leaders from './Leaders';
import Report from './Report';
import MapTab from './MapTab';
import FactCheck from './FactCheck';
import Play from './Play';
import AreaPicker from './AreaPicker';
import Learn from './Learn';
import ContributorAccount, { ContributorProvider } from './ContributorAccount';
import Brand from './Brand';
import CandidatePulse from './CandidatePulse';
import StartupReveal from './StartupReveal';

const LEVEL_BANDS = [[0, 50], [50, 150], [150, 300], [300, 600]];

export default function Shell() {
  return <ContributorProvider><AppShell /></ContributorProvider>;
}

function AppShell() {
  const store = useStore();
  const t = strings(store.lang);
  const [tab, setTab] = useState('power');
  const [openPerson, setOpenPerson] = useState('');

  let li = 0;
  LEVEL_BANDS.forEach(([lo], i) => { if (store.points >= lo) li = i; });
  const [lo, hi] = LEVEL_BANDS[li];
  const pct = Math.max(6, Math.min(100, Math.round(((store.points - lo) / (hi - lo)) * 100)));
  const next = li < LEVEL_BANDS.length - 1 ? `${hi - store.points} pts to reach ${t.levels[li + 1]}` : 'You have reached the top level.';

  const goLeader = (id) => { setOpenPerson(id); setTab('power'); window.scrollTo(0, 0); };
  const go = (id) => { setTab(id); window.scrollTo(0, 0); };

  const tabs = [
    { id: 'power', label: t.nav_power }, { id: 'report', label: t.nav_report }, { id: 'heat', label: t.nav_map },
    { id: 'learn', label: 'Learn' }, { id: 'pulse', label: t.nav_pulse }, { id: 'fact', label: t.nav_fact }, { id: 'play', label: t.nav_play },
  ];

  return (
    <div className="app">
      <StartupReveal />
      <header className="header">
        <div className="header-row">
          <Brand />
          <div className="row">
            <select aria-label="Language" className="lang-select" value={store.lang} onChange={(e) => store.patch({ lang: e.target.value })}>
              {LANGS.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
            </select>
            <div className="pill">{store.points} pts</div>
            <button className="pill account-button" aria-current={tab === 'account' ? 'page' : undefined} onClick={() => go('account')}>Account</button>
          </div>
        </div>
        <div className="header-row">
          <div style={{ fontSize: 14 }}>{store.representativeArea ? `${store.representativeArea.lga}, ${store.representativeArea.state}` : 'Choose your representative area'}</div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{t.l_level}: {t.levels[li]}</div>
        </div>
        <div className="progress"><div style={{ width: `${pct}%` }} /></div>
        <div className="small">{next}</div>
        {t.note ? <div className="lang-note">{t.note}</div> : null}
      </header>

      <main className={`main main-${tab}`} id="main-content">
        {tab === 'power' && <>
          {store.ready && <AreaPicker area={store.representativeArea} onSelect={(representativeArea) => { store.patch({ representativeArea }); setOpenPerson(''); }} />}
          {store.representativeArea ? <Leaders t={t} area={store.representativeArea} openPerson={openPerson} setOpenPerson={setOpenPerson} /> : <div className="note-ok">Choose an area above to see matching representatives and open their profiles.</div>}
        </>}
        {tab === 'report' && <Report t={t} goLeader={goLeader} goMap={() => go('heat')} />}
        {tab === 'heat' && <MapTab t={t} goReport={() => go('report')} />}
        {tab === 'learn' && <Learn goReport={() => go('report')} />}
        {tab === 'fact' && <FactCheck t={t} />}
        {tab === 'play' && <Play t={t} />}
        {tab === 'pulse' && <CandidatePulse />}
        {tab === 'account' && <section className="card stack-sm"><h1>Contributor account</h1><ContributorAccount showSubmissions /></section>}
      </main>

      <nav className="nav" aria-label="Main">
        {tabs.map((n) => (
          <button key={n.id} className={tab === n.id ? 'on' : ''} aria-current={tab === n.id ? 'page' : undefined} onClick={() => go(n.id)}>
            {n.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
