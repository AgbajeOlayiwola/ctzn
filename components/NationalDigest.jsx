'use client';

import { useCallback, useEffect, useState } from 'react';
import { NIGERIA_SCOPES, SOURCE_DIRECTORY } from '@/lib/source-catalog.mjs';
import { VERDICTS, sharePost } from '@/lib/digest.mjs';

function ShareCard({ item }) {
  const [message, setMessage] = useState('');
  const post = sharePost(item);
  async function copy() {
    try { await navigator.clipboard.writeText(post); setMessage('Copied with source and verification status.'); }
    catch { setMessage('Copy was unavailable. Select and copy the text below.'); }
  }
  return <div className="stack-sm"><label className="stack-xs">Copyable short explanation<textarea className="field share-post" readOnly value={post} onFocus={(event) => event.target.select()} /></label><div className="row wrap"><button className="btn-outline" onClick={copy}>Copy explanation</button><a href={`https://twitter.com/intent/tweet?${new URLSearchParams({ text: post })}`} target="_blank" rel="noreferrer">Open draft on X ↗</a></div><div role="status" className="small muted">{message}</div><div className="small muted">Opening X creates a draft; it does not post for you. Read the full source first.</div></div>;
}

export default function NationalDigest() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [area, setArea] = useState('All Nigeria');
  const [lane, setLane] = useState('all');
  const [search, setSearch] = useState('');
  const refresh = useCallback(async (signal) => {
    try {
      const response = await fetch('/api/digest', { cache: 'no-store', signal });
      if (!response.ok) throw new Error('Local feed could not load.');
      const result = await response.json();
      if (!signal?.aborted) { setData(result); setError(''); }
    } catch (failure) { if (!signal?.aborted) setError(failure.message || 'Local updates unavailable.'); }
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    refresh(controller.signal);
    const timer = window.setInterval(() => { if (!document.hidden) refresh(controller.signal); }, 60000);
    return () => { controller.abort(); window.clearInterval(timer); };
  }, [refresh]);
  const shown = (data?.items || []).filter((item) =>
    (area === 'All Nigeria' || item.scope === area || item.scopes?.includes(area) || item.regions?.includes(area)) &&
    (lane === 'all' || (lane === 'checked' ? item.verdict !== 'unverified' : item.verdict === 'unverified')) &&
    `${item.title} ${item.claim || ''} ${item.sourceName}`.toLowerCase().includes(search.toLowerCase().trim())
  );
  const format = (date) => date ? new Date(date).toLocaleString('en-NG', { timeZone: 'Africa/Lagos', dateStyle: 'medium', timeStyle: 'short' }) : 'No successful update yet';
  const coverage = data?.sources?.find((source) => source.scope === area);

  return <section className="stack" aria-label="Nationwide news and fact checks">
    <div className="note-ok">Source searches cover all 36 states and the FCT, plus national reporting. Representative profiles and agency contacts still have partial coverage; a news search does not verify an officeholder.</div>
    <div className="card"><div className="between wrap"><h2>Morning news, explained simply</h2><button className="btn-outline" onClick={() => refresh()}>Load saved updates</button></div><div className="muted">Last successful source run: {format(data?.updatedAt)} (Lagos time).</div><div className="small muted">{data?.status?.state === 'running' ? 'The local crawler is running. Saved updates will refresh here.' : data?.lastRun ? `${data.lastRun.successes} sources succeeded and ${data.lastRun.failed} were unavailable in the last run.` : 'No crawl has completed yet. The source directory below is available now.'}</div>{error && <div role="status" className="note-warn">{error}</div>}</div>
    <div className="grid2"><label className="stack-xs">Area to follow<select className="field" value={area} onChange={(event) => setArea(event.target.value)}><option>All Nigeria</option><option>National</option>{NIGERIA_SCOPES.map((state) => <option key={state}>{state}</option>)}</select></label><label className="stack-xs">Show<select className="field" value={lane} onChange={(event) => setLane(event.target.value)}><option value="all">All reporting</option><option value="checked">Publisher-rated checks</option><option value="news">Reports needing verification</option></select></label></div>
    <label className="stack-xs">Search a topic<input className="field" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Roads, school, a claim or a publisher" /></label>
    {area !== 'All Nigeria' && area !== 'National' && <div className="small muted">Area results come from a state-scoped search or a name in the headline, not a verified incident location. Source status: {coverage?.state || 'not fetched yet'}{coverage?.error ? ` — ${coverage.error}` : ''}.</div>}
    <div className="small muted">ctzn does not judge truth from headlines. Ratings are attributed to a fact-checker’s structured review or explicitly labelled verdict. “Not proven” is different from “false.”</div>
    {shown.slice(0, 50).map((item) => <article className="card" key={item.id}><div className="between wrap"><span className={`badge ${item.verdict === 'true' ? 'ok' : item.verdict === 'unverified' ? 'neutral' : 'warn'}`}>{VERDICTS[item.verdict]?.label || VERDICTS.unverified.label}</span><time className="small muted" dateTime={item.date}>{format(item.date)}</time></div><h2>{item.title}</h2><div className="small muted">{item.publisher || item.sourceName}{item.sourceKind === 'official' ? ' · government source' : ''}</div><details><summary>Explain it simply and share</summary><div className="stack-sm editorial-policy">{item.claim && <div><strong>Claim checked by the publisher</strong><p>{item.claim}</p></div>}<p>{item.explanation}</p>{item.publisherRating && <p><strong>Publisher’s exact rating:</strong> {item.publisherRating}</p>}<p className="small muted">{item.verificationBasis}</p><div className="office-box">Before sharing: check the event date, exact location, original document and whether a proposal actually became law. A clip can be real and still have the wrong caption.</div><ShareCard item={item} /></div></details><a href={item.url} target="_blank" rel="noreferrer">Read the original report or check ↗</a></article>)}
    {shown.length === 0 && <div className="card muted">No saved articles match yet. This does not mean nothing happened or that a claim is false. Change the filters or check the source directory.</div>}
    {shown.length > 50 && <div className="muted">Showing 50 matches. Narrow the area or topic to find more specific items.</div>}
    <details className="card"><summary>Nationwide source directory and crawl health</summary><div className="stack-sm editorial-policy">{(data?.directory || SOURCE_DIRECTORY).map((source) => <article key={source.url} className="record-item stack-xs"><strong>{source.name} · {source.type}</strong><p>{source.purpose}</p><a href={source.url} target="_blank" rel="noreferrer">Open source ↗</a></article>)}{data?.sources?.map((source) => <div className="small muted" key={source.id}>{source.name}: {source.state === 'ok' ? `${source.count} items` : source.error || 'unavailable'}</div>)}</div></details>
  </section>;
}
