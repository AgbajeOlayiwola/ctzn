'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { OFFICIAL_RECORDS, RECORD_SOURCE_TYPES, RECORDS_CHECKED, validateOfficialSuggestion } from '@/lib/official-records';
import PolicyImpact from './PolicyImpact';
import { submitContribution } from '@/lib/supabase';
import { ContributionGate } from './ContributorAccount';

function SourceTag({ kind }) {
  return <span className={`badge record-tag record-${kind}`} title={RECORD_SOURCE_TYPES[kind].description}>{RECORD_SOURCE_TYPES[kind].label}</span>;
}

export default function OfficialRecord({ person }) {
  const store = useStore();
  const [filter, setFilter] = useState('all');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', summary: '', date: '', url: '', claimedKind: 'news' });
  const record = OFFICIAL_RECORDS[person.id];
  if (!record) return null;
  const shown = record.items.filter((item) => filter === 'all' || item.kind === filter);
  const drafts = (store.officialSuggestions || []).filter((item) => item.officialId === person.id);
  const patch = (key) => (event) => setForm((previous) => ({ ...previous, [key]: event.target.value }));
  async function suggest(event) {
    event.preventDefault();
    if (saving) return;
    const entry = { ...form, url: form.url.trim(), officialId: person.id, officialName: person.name };
    const error = validateOfficialSuggestion(entry);
    if (error) { setMessage(error); return; }
    setSaving(true);
    setMessage('');
    const submissionError = await submitContribution('official_record', entry.title.trim(), entry);
    setSaving(false);
    setMessage(submissionError || 'Suggestion submitted for manual review.');
    if (submissionError) return;
    setForm({ title: '', summary: '', date: '', url: '', claimedKind: 'news' });
  }
  return <section className="official-record stack-sm" aria-label={`Background and track record of ${person.name}`}>
    <h3>Background and credentials</h3>
    {record.background.length ? record.background.map((entry, index) => <article className="record-item stack-xs" key={index}><SourceTag kind={entry.kind} /><p>{entry.text}</p><a href={entry.source.url} target="_blank" rel="noreferrer">{entry.source.publisher} ↗</a></article>) : <p className="muted">No sourced background has been added yet.</p>}
    <PolicyImpact officialId={person.id} />
    <h3>What is documented</h3>
    <div className="small muted">Sources checked {RECORDS_CHECKED}. Historical entries are not a live performance assessment.</div>
    <div className="row wrap" aria-label="Filter track-record sources"><button className={`chip ${filter === 'all' ? 'on' : ''}`} aria-pressed={filter === 'all'} onClick={() => setFilter('all')}>All sources</button>{Object.entries(RECORD_SOURCE_TYPES).map(([id, type]) => <button key={id} className={`chip ${filter === id ? 'on' : ''}`} aria-pressed={filter === id} onClick={() => setFilter(id)}>{type.label}</button>)}</div>
    {shown.map((entry) => <article className="record-item stack-sm" key={entry.id}><div className="between wrap"><SourceTag kind={entry.kind} /><span className="small muted">{entry.dateLabel}: <time dateTime={entry.date}>{entry.date}</time></span></div><strong>{entry.title}</strong>{entry.stage && <div className="record-stage">{entry.stage}</div>}<p>{entry.text}</p>{entry.context && <p className="note-warn">{entry.context}</p>}<a href={entry.source.url} target="_blank" rel="noreferrer">Read source: {entry.source.publisher} ↗</a></article>)}
    {!shown.length && <div className="note-ok">{record.items.length ? 'No entries match this source filter.' : 'No dated track-record entries have been added yet. This is a coverage gap, not evidence that no work was done. Add a sourced suggestion below.'}</div>}
    <div className="office-box small">Attendance, bills enacted and independently checked project completion have not been compiled here. A sponsored bill is not necessarily a law. Uneven source coverage is not a ranking.</div>
    <details><summary>How ctzn includes records</summary><div className="stack-sm editorial-policy">{Object.entries(RECORD_SOURCE_TYPES).map(([id, type]) => <p key={id}><strong>{type.label}:</strong> {type.description}</p>)}<p>Apply the same inclusion rules to every official: a relevant action, credential or accountability issue, a traceable source and accurate attribution. Include documented achievements and significant criticism. Date the event or clearly label the reporting date. Do not turn publicity, allegations or historical totals into confirmed outcomes.</p><p>ctzn does not score politicians or recommend votes. You decide. Missing records and corrections stay visible. Contributor suggestions are kept separate until reviewed; they are not corroboration.</p></div></details>
    <details><summary>Suggest a sourced item or correction</summary><ContributionGate><form className="stack-sm evidence-form" onSubmit={suggest}>
      <label className="stack-xs">Item or correction title<input className="field" required maxLength={160} value={form.title} onChange={patch('title')} /></label>
      <label className="stack-xs">What does the source establish?<textarea className="field" required maxLength={1200} value={form.summary} onChange={patch('summary')} /></label>
      <label className="stack-xs">Source type claimed<select className="field" value={form.claimedKind} onChange={patch('claimedKind')}>{Object.entries(RECORD_SOURCE_TYPES).map(([id, type]) => <option key={id} value={id}>{type.label}</option>)}</select></label>
      <label className="stack-xs">Source publication date<input className="field" type="date" required max={new Date(Date.now() + 3600000).toISOString().slice(0, 10)} value={form.date} onChange={patch('date')} /></label>
      <label className="stack-xs">Public source URL<input className="field" type="url" required value={form.url} onChange={patch('url')} placeholder="https://…" /></label>
      <button className="btn" disabled={saving}>{saving ? 'Submitting…' : 'Submit suggestion for review'}</button>
    </form></ContributionGate></details>
    <div role="status" className="muted">{message}</div>
    {drafts.length > 0 && <details><summary>Your unreviewed suggestions ({drafts.length})</summary>{drafts.map((entry) => <article className="record-item stack-xs" key={entry.id}><span className="badge warn">Unreviewed · device only</span><strong>{entry.title}</strong><p>{entry.summary}</p><a href={entry.url} target="_blank" rel="noreferrer">Submitted source ↗</a><span className="small muted">{entry.date} · claimed source type: {RECORD_SOURCE_TYPES[entry.claimedKind]?.label}</span><button className="btn-link" onClick={() => store.patch((state) => ({ officialSuggestions: state.officialSuggestions.filter((item) => item.id !== entry.id) }))}>Remove my suggestion</button></article>)}</details>}
    <div className="note-ok">You decide. ctzn does not tell you how to vote.</div>
  </section>;
}
