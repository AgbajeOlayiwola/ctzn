'use client';

import { useState } from 'react';
import { LEGAL_HELP, SECTORS } from '@/lib/data';
import { useStore } from '@/lib/store';

export default function Consumer() {
  const store = useStore();
  const [sector, setSector] = useState('');
  const s = SECTORS.find((x) => x.id === sector);

  const ladder = s ? [
    { title: 'Complain to the company in writing', body: s.first, contact: '', cost: 'Cost: free' },
    { title: s.regTitle, body: s.regBody, contact: s.regContact, cost: 'Cost: free' },
    { title: 'Report to FCCPC, the consumer protection commission', body: 'File online with your evidence. FCCPC can investigate, mediate and order compensation. Do this as soon as the company fails you.', contact: 'complaints.fccpc.gov.ng · 0805 600 2020 · contact@fccpc.gov.ng', cost: 'Cost: free' },
    { title: 'Go to the Small Claims Court (Lagos)', body: 'For money claims up to ₦5 million. Fill the forms at any Magistrate Court registry. You can represent yourself, and the rules aim for judgment within 60 days of filing.', contact: 'Nearest Magistrate Court registry', cost: 'Cost: a filing fee set by the court. No lawyer fee if you represent yourself.' },
  ] : [];

  return (
    <div className="stack" style={{ gap: 14 }}>
      <div className="note-ok">
        <div style={{ fontFamily: 'var(--display)', fontSize: 18, fontWeight: 700 }}>You have rights, and using them is cheap</div>
        <div style={{ fontWeight: 400, color: 'var(--ink)', marginTop: 6 }}>Complaining to the regulator is free. In Lagos, the Small Claims Court handles claims up to {'₦'}5 million, you can represent yourself, and the rules aim for judgment within 60 days.</div>
      </div>

      <div style={{ fontWeight: 600 }}>What let you down?</div>
      <div className="grid2">
        {SECTORS.map((x) => (
          <button key={x.id} className={`option ${sector === x.id ? 'on' : ''}`} aria-pressed={sector === x.id} onClick={() => setSector(x.id)}>
            <b>{x.label}</b>
          </button>
        ))}
      </div>

      {s ? (
        <div className="stack-sm">
          <div className="label">Your step-by-step plan</div>
          {ladder.map((d, i) => (
            <div key={d.title} className="card" style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <div className="step-num" aria-hidden="true">{i + 1}</div>
              <div className="stack-xs">
                <div className="strong">{d.title}</div>
                <div style={{ fontSize: 13 }}>{d.body}</div>
                {d.contact ? <div className="contact">{d.contact}</div> : null}
                <div className="small" style={{ color: 'var(--muted)' }}>{d.cost}</div>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <section className="card">
        <div className="label">Free and low-cost legal help</div>
        {LEGAL_HELP.map((h, i) => (
          <div key={h.name} className={`stack-xs ${i > 0 ? 'divider' : ''}`}>
            <div className="strong">{h.name}</div>
            <div style={{ fontSize: 13 }}>{h.what}</div>
            <div className="contact">{h.contact}</div>
          </div>
        ))}
        <div style={{ fontSize: 13 }}>Some private lawyers also agree to be paid only if you win. Ask before you sign anything.</div>
      </section>

      {s ? (
        store.planSaved
          ? <div className="note-ok">Saved. ctzn will remind you when it is time for the next step.</div>
          : <button className="btn" onClick={() => { store.patch({ planSaved: true }); store.addPoints(10); }}>Save this plan to my reports (+10 pts)</button>
      ) : null}

      <div className="small" style={{ color: 'var(--muted)' }}>
        General information, not legal advice. Sources: FCCPC, NCC, CBN, Lagos State Judiciary practice directions, UNODC court user guide. Court fees change, so confirm at the registry.
      </div>
    </div>
  );
}
