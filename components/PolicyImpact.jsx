'use client';

import { useState } from 'react';
import { POLICY_IMPACTS } from '@/lib/policy-impact';

export default function PolicyImpact({ officialId }) {
  const [topic, setTopic] = useState('All');
  const available = officialId ? POLICY_IMPACTS.filter((policy) => policy.officials.includes(officialId)) : POLICY_IMPACTS;
  const topics = ['All', ...new Set(available.map((policy) => policy.topic))];
  if (!available.length) return null;
  return <section className="card policy-impact stack-sm" aria-label="How policies affect everyday life">
    <h2>What does this mean for everyday life?</h2>
    <p>Follow the link from a government decision to your pocket, work and public services. Possible benefits depend on implementation; they are not guaranteed results.</p>
    {officialId && <p className="small muted">These topics relate to this office’s responsibilities or oversight. Their inclusion does not establish this official’s personal role in a policy or its results.</p>}
    {!officialId && <div className="row wrap" aria-label="Policy topics">{topics.map((name) => <button className={`chip ${topic === name ? 'on' : ''}`} key={name} aria-pressed={topic === name} onClick={() => setTopic(name)}>{name}</button>)}</div>}
    {available.filter((policy) => officialId || topic === 'All' || policy.topic === topic).map((policy) => <details key={policy.id} className="policy-explainer">
      <summary>{policy.title}</summary><div className="stack-sm editorial-policy">
        <div><h3>The decision in plain language</h3><p>{policy.meaning}</p></div>
        <div><h3>How you may feel it</h3><p>{policy.everyday}</p></div>
        <div className="note-ok"><strong>Possible benefit</strong><p>{policy.benefit}</p></div>
        <div className="note-warn"><strong>Cost or trade-off</strong><p>{policy.tradeoff}</p></div>
        <div><h3>Everyday example</h3><p>{policy.example}</p></div>
        <div><h3>What the source establishes</h3><p>{policy.evidence}</p></div>
        <div className="office-box"><strong>What to ask the responsible office</strong><p>{policy.ask}</p></div>
        <a href={policy.source.url} target="_blank" rel="noreferrer">{policy.source.title} ↗</a>
      </div>
    </details>)}
    <div className="small muted">Reviewed 17 November 2026. Examples explain how a policy can work; they do not measure your household’s actual costs or recommend how to vote.</div>
  </section>;
}
