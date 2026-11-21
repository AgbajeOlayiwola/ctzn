'use client';

import { useEffect, useState } from 'react';
import { ALLOCATION, CHAIN, LOCAL_OFFICES, MINISTERS, SENATE } from '@/lib/data';
import { PORTRAITS } from '@/lib/portraits';
import { areaCoverage, representativeMatches } from '@/lib/areas';
import OfficialNews from './OfficialNews';
import OfficialRecord from './OfficialRecord';

function initials(name) {
  const p = name.split(' ');
  return p[0].charAt(0) + p[p.length - 1].charAt(0);
}

function Person({ p, open, onToggle }) {
  const [failed, setFailed] = useState(false);
  const portrait = PORTRAITS[p.id];
  return (
    <article id={`person-${p.id}`} className={`person ${p.kind === 'law' ? 'law' : ''} ${p.kind === 'min' ? 'min' : ''}`}>
      <button className="person-toggle stack-xs" aria-expanded={open} aria-controls={`profile-${p.id}`} onClick={onToggle}>
      <span className="between">
        <span className="small" style={{ fontWeight: 600, color: 'var(--muted)' }}>{p.role}</span>
        <span className={`badge ${p.verified ? 'ok' : 'warn'}`}>{p.verified ? 'Role sourced' : 'Role needs checking'}</span>
      </span>
      <span className="row" style={{ gap: 10 }}>
        <span className="avatar" aria-hidden="true">
          {portrait && !failed ? <img src={portrait.src} alt="" width="56" height="56" loading="lazy" onError={() => setFailed(true)} /> : initials(p.name)}
        </span>
        <span className="stack-xs" style={{ gap: 2 }}>
          <span style={{ fontSize: 16, fontWeight: 600 }}>{p.name}</span>
          <span className="muted">{p.area}</span>
        </span>
      </span>
      <span className="small contact">{open ? 'Close profile −' : 'View background, record and contacts +'}</span>
      </button>
      {open ? (
        <div className="detail" id={`profile-${p.id}`}>
          <h3>About and responsibilities</h3>
          <p>{p.controls}</p>
          <span className="office-box">
            <span className="label" style={{ fontSize: 11 }}>Office location</span>
            <span className="strong">{p.office}</span>
            <span className="label" style={{ fontSize: 11, paddingTop: 6 }}>How to reach them</span>
            <span className="strong">{p.contact.includes('@') ? <a href={`mailto:${p.contact}`}>{p.contact}</a> : p.contact}</span>
            {p.id === 'gov' && <a href="https://www.lagosstate.gov.ng/connect" target="_blank" rel="noreferrer">Official Lagos contact page</a>}
            {['pres', 'vp'].includes(p.id) && <a href="https://statehouse.gov.ng/" target="_blank" rel="noreferrer">State House website</a>}
            {['sen', 'rep', 'lsha'].includes(p.id) && <a href={p.id === 'lsha' ? 'https://www.lagoshouseofassembly.gov.ng/' : 'https://nass.gov.ng/'} target="_blank" rel="noreferrer">Visit the legislature website</a>}
            <span className="small muted">Where a direct phone or email is not confirmed, use the listed office. Contact details in this directory may need updating.</span>
          </span>
          <span className="small" style={{ color: 'var(--muted)' }}>{p.sourceUrl ? <a href={p.sourceUrl} target="_blank" rel="noreferrer">{p.source}</a> : p.source}</span>
          <OfficialRecord key={p.id} person={p} />
          <OfficialNews person={p} />
        </div>
      ) : null}
    </article>
  );
}

export default function Leaders({ t, area, openPerson, setOpenPerson }) {
  const [showMin, setShowMin] = useState(false);
  const [senOpen, setSenOpen] = useState('');
  const max = Math.max(...ALLOCATION.months.map((m) => m.v));
  const coverage = areaCoverage(area);

  // When another screen sends the user to a specific person, reveal and scroll to them.
  useEffect(() => {
    if (!openPerson) return;
    if (openPerson.startsWith('m')) setShowMin(true);
    const id = window.setTimeout(() => {
      const el = document.getElementById(`person-${openPerson}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 80);
    return () => window.clearTimeout(id);
  }, [openPerson]);

  const toggle = (id) => setOpenPerson(openPerson === id ? '' : id);

  return (
    <div className="stack leaders-layout">
      <h1>{t.t_power}</h1>
      <div className="note-ok coverage-note">Showing: {area.lga}, {area.state}{area.ward ? ` · Ward ${area.ward}` : ''}. {coverage.somolu ? 'Open a representative to see their profile, contacts and recent coverage. Ward-specific representatives appear only for mapped wards.' : 'The local directory currently covers Shomolu, Lagos. National officials are shown below; other local representatives have not been mapped yet.'} {!coverage.ward && coverage.somolu ? 'Select your mapped electoral ward to see your assembly member and councillor.' : ''}</div>

      {coverage.somolu && <section className="card allocation-card">
        <div className="label">{ALLOCATION.label}</div>
        <div className="big">{ALLOCATION.latest}</div>
        <div className="bars" role="img" aria-label="Monthly allocation January to July 2026, highest in February at 3.8 billion naira">
          {ALLOCATION.months.map((m, i) => (
            <div key={m.m} className={i === ALLOCATION.months.length - 1 ? 'now' : ''} style={{ height: `${Math.round((m.v / max) * 64)}px` }} />
          ))}
        </div>
        <div className="between small" style={{ color: 'var(--muted)' }}>
          {ALLOCATION.months.map((m) => <span key={m.m}>{m.m}</span>)}
        </div>
        <div style={{ fontSize: 13 }}>{ALLOCATION.total}</div>
        <div className="note-warn">Allocated is not the same as received. Council funds can pass through a state joint account first.</div>
        <div className="small" style={{ color: 'var(--muted)' }}>{ALLOCATION.source}</div>
      </section>}

      {coverage.somolu && <section className="card offices-card">
        <div className="label">Offices in your LGA</div>
        {LOCAL_OFFICES.map((o, i) => (
          <div key={o.name} className={`stack-xs ${i > 0 ? 'divider' : ''}`}>
            <div className="strong">{o.name}</div>
            <div style={{ fontSize: 13 }}>{o.address}</div>
            <div className="muted">{o.note}</div>
          </div>
        ))}
        <div className="stack-xs divider">
          <div className="strong">Senator's liaison office and Rep's constituency office</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--warn)' }}>Street address not yet added. Add it in the Play tab (+50 pts).</div>
        </div>
        <div className="small" style={{ color: 'var(--muted)' }}>Sources: Lagos State Public Procurement Agency notice; INEC centre locator, 2026.</div>
      </section>}

      <div className="leaders-directory stack">
      <div className="label">Chain of command: from Aso Rock to your street</div>
      <div className="chain">
        {CHAIN.map((p, i) => {
          if (p.tier) {
            if (p.tier.startsWith('State') && !coverage.lagos) return null;
            if (p.tier.startsWith('Local') && !coverage.somolu) return null;
            return <div key={p.tier} className="tier">{p.tier}</div>;
          }
          if (p.ministers) {
            return (
              <div key="ministers" className="stack-sm" style={{ gap: 8 }}>
                <button className="btn" style={{ marginLeft: 10, textAlign: 'left', fontSize: 14 }} onClick={() => setShowMin(!showMin)}>
                  {showMin ? 'Hide ministers' : `Show ${MINISTERS.length} ministers relevant to local issues`}
                </button>
                {showMin ? MINISTERS.map((m) => <Person key={m.id} p={m} open={openPerson === m.id} onToggle={() => toggle(m.id)} />) : null}
              </div>
            );
          }
          return representativeMatches(p, area) ? <Person key={p.id} p={p} open={openPerson === p.id} onToggle={() => toggle(p.id)} /> : null;
        })}
      </div>
      </div>

      <section className="card senate-card">
        <div className="label">The Senate</div>
        <h2>109 people who shape your daily life</h2>
        <div style={{ fontSize: 14 }}>{coverage.somolu ? SENATE.intro : 'Three senators represent each state, and one represents the FCT. Your district senator will appear when your area is mapped.'}</div>
        <div style={{ fontSize: 13, fontWeight: 600 }}>How they affect you (tap to open)</div>
        {SENATE.items.map((n) => (
          <button key={n.id} className="person" style={{ background: 'var(--ground)' }} aria-expanded={senOpen === n.id} onClick={() => setSenOpen(senOpen === n.id ? '' : n.id)}>
            <span className="strong">{n.title}</span>
            {senOpen === n.id ? (
              <span className="stack-xs" style={{ gap: 6 }}>
                <span style={{ fontSize: 14 }}>{n.body}</span>
                <span className="small" style={{ color: 'var(--muted)' }}>{n.source}</span>
              </span>
            ) : null}
          </button>
        ))}
        <div className="note-ok" style={{ fontWeight: 500, fontSize: 13 }}>Your vote put your senator there. Elections are the only time you can hire or fire them.</div>
      </section>

      <div className="small portrait-credits" style={{ color: 'var(--muted)' }}>
        <p>White cards show executives; grey cards show lawmakers. Initials appear where a portrait is unavailable. Names and office details come from the existing directory; entries marked as needing verification are not confirmed.</p>
        <details>
          <summary>Portrait sources and credits</summary>
          <ul>{Object.values(PORTRAITS).map((photo) => <li key={photo.source}><a href={photo.source} target="_blank" rel="noreferrer">{photo.name}</a> — {photo.author}, <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noreferrer">CC BY-SA 4.0</a>. Displayed with a circular crop.</li>)}</ul>
        </details>
      </div>
    </div>
  );
}
