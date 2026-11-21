'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { PROJECT_STATUSES, SOURCE_TYPES, validateEvidence } from '@/lib/evidence';
import ProjectCoverage from './ProjectCoverage';
import { submitContribution } from '@/lib/supabase';
import { ContributionGate } from './ContributorAccount';

export default function ProjectEvidence({ report }) {
  const store = useStore();
  const [form, setForm] = useState({ contractor: '', authority: '', reference: '', claimedStatus: 'unknown', sourceType: 'news', url: '', sourceDate: '', note: '' });
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const evidence = store.evidence.filter((entry) => entry.reportId === report.id && (entry.publication === 'local' || entry.reviewStatus === 'verified'));
  const patch = (key) => (event) => setForm((previous) => ({ ...previous, [key]: event.target.value }));
  async function submit(event) {
    event.preventDefault();
    if (saving) return;
    const entry = { ...form, url: form.url.trim(), note: form.note.trim(), reportId: report.id };
    const error = validateEvidence(entry);
    if (error) { setMessage(error); return; }
    setSaving(true);
    setMessage('');
    const subject = `Project evidence for ${report.street || report.id}`;
    const submissionError = await submitContribution('project_evidence', subject.slice(0, 240), {
      ...entry,
      location: { street: report.street, lga: report.lga, state: report.state, lat: report.lat, lng: report.lng },
    });
    setSaving(false);
    setMessage(submissionError || 'Source submitted for manual review.');
    if (submissionError) return;
    setForm({ contractor: '', authority: '', reference: '', claimedStatus: 'unknown', sourceType: 'news', url: '', sourceDate: '', note: '' });
  }
  return <section className="card stack-sm">
    <div className="label">Project and contractor evidence</div>
    <h2>Who was awarded the work?</h2>
    <div className="note-warn">Contractor, contract value, deadline and current project status are not independently confirmed for this issue. A bad road alone does not prove that a contract was awarded or abandoned.</div>
    <div className="row wrap source-links"><a href="https://lagosppa.gov.ng/" target="_blank" rel="noreferrer">Lagos procurement records ↗</a><a href="https://www.bpp.gov.ng/" target="_blank" rel="noreferrer">Federal procurement records ↗</a><a href="https://www.wearegst.com/" target="_blank" rel="noreferrer">GST reporting ↗</a></div>
    <ProjectCoverage key={report.id} report={report} />
    {evidence.map((entry) => <article className="evidence-item stack-xs" key={entry.id}>
      <div className="between wrap"><strong>{entry.contractor || 'Contractor not identified'}</strong><span className={entry.reviewStatus === 'verified' ? 'badge ok' : 'badge warn'}>{entry.reviewStatus === 'verified' ? 'Reviewed source' : 'Unreviewed source submission'}</span></div>
      <div>{entry.authority ? `Authority named by contributor: ${entry.authority}` : 'Procuring authority not provided'}</div>
      {entry.reference && <div>Contract reference supplied: {entry.reference}</div>}
      <div>Contributor observation: {PROJECT_STATUSES[entry.claimedStatus] || 'Status unknown'}</div><p>{entry.note}</p>
      <a href={entry.url} target="_blank" rel="noreferrer">Open source ({SOURCE_TYPES[entry.sourceType] || 'Submitted link'}) ↗</a>
      <div className="small muted">Source dated {entry.sourceDate} · {entry.publication === 'local' ? 'Device-only draft' : 'Reviewed submission'}</div>
    </article>)}
    <details><summary>Add a contract record, article or video link</summary><ContributionGate>
      <form className="stack-sm evidence-form" onSubmit={submit}>
        <label className="stack-xs">Company named in the source (optional)<input className="field" maxLength={160} value={form.contractor} onChange={patch('contractor')} /></label>
        <label className="stack-xs">Procuring authority named (optional)<input className="field" maxLength={160} value={form.authority} onChange={patch('authority')} /></label>
        <label className="stack-xs">Award / contract reference (optional)<input className="field" maxLength={160} value={form.reference} onChange={patch('reference')} /></label>
        <label className="stack-xs">What does the source report?<select className="field" value={form.claimedStatus} onChange={patch('claimedStatus')}>{Object.entries(PROJECT_STATUSES).map(([id, title]) => <option key={id} value={id}>{title}</option>)}</select></label>
        <label className="stack-xs">Source type<select className="field" value={form.sourceType} onChange={patch('sourceType')}>{Object.entries(SOURCE_TYPES).map(([id, title]) => <option key={id} value={id}>{title}</option>)}</select></label>
        <label className="stack-xs">Public article, document or video URL<input className="field" type="url" required value={form.url} onChange={patch('url')} placeholder="https://…" /></label>
        <label className="stack-xs">Source publication / observation date<input className="field" type="date" required max={new Date(Date.now() + 3600000).toISOString().slice(0, 10)} value={form.sourceDate} onChange={patch('sourceDate')} /></label>
        <label className="stack-xs">What does it establish? Include video timestamps when relevant.<textarea className="field" required maxLength={1200} value={form.note} onChange={patch('note')} /></label>
        <div className="small muted">Avoid personal information. The review team will check the source and any supporting records.</div>
        <button className="btn" disabled={saving}>{saving ? 'Saving…' : 'Submit source for review'}</button>
      </form>
    </ContributionGate></details>
    <div role="status" className="muted">{message}</div>
  </section>;
}
