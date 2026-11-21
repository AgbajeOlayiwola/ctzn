'use client';

import { responsibilityFor } from '@/lib/accountability';

export default function Responsibility({ report }) {
  const info = responsibilityFor(report.cat, report.road, report.state, report.lga || report.area);
  return <section className="card stack-sm">
    <div className="label">Who to contact and who oversees them</div>
    <h2>{info.agency}</h2><p>{info.summary}</p>
    {info.chain.length > 0 && <ol className="responsibility-chain">{info.chain.map((step) => <li key={step}>{step}</li>)}</ol>}
    {info.email && <a href={`mailto:${info.email}`}>{info.email}</a>}
    {info.phone && <a href={`tel:${info.phone}`}>Call {info.phone}</a>}
    {info.office && <div className="muted">{info.office}</div>}
    {info.sources.map((source) => <a className="small" key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.title} ↗</a>)}
    {info.checked && <div className="small muted">Directory checked {info.checked}. Source dates are shown above; roles and contacts can change.</div>}
  </section>;
}
