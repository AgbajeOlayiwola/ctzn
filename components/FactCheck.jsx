'use client';

import { useState } from 'react';
import { submitContribution } from '@/lib/supabase';
import { ContributionGate } from './ContributorAccount';
import NationalDigest from './NationalDigest';

export default function FactCheck({ t }) {
  const [draft, setDraft] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  async function saveClaim(event) {
    event.preventDefault();
    const claim = draft.trim();
    if (!claim || saving) return;
    setSaving(true);
    setMessage('');
    const error = await submitContribution('claim', claim.slice(0, 120), { text: claim });
    setSaving(false);
    setMessage(error || 'Claim submitted for manual review.');
    if (!error) setDraft('');
  }
  return <div className="stack"><h1>{t.t_fact}</h1><div className="muted">News and claim checks from around Nigeria. Short explanations use simple words while keeping the source, date and uncertainty visible.</div><NationalDigest /><section className="card"><h2>Heard another claim?</h2><ContributionGate><form className="stack-sm" onSubmit={saveClaim}><label className="stack-xs">Claim and original source<textarea className="field" maxLength={1600} value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="What was said? Add the original link and date." /></label><button className="btn" disabled={saving || !draft.trim()}>{saving ? 'Submitting…' : 'Submit claim for review'}</button></form></ContributionGate>{message && <div role="status" className="muted">{message}</div>}</section></div>;
}
