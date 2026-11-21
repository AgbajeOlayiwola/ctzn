'use client';

import { useEffect, useRef, useState } from 'react';

export default function ProjectCoverage({ report }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const controller = useRef(null);
  useEffect(() => () => controller.current?.abort(), []);
  async function search() {
    controller.current?.abort();
    const current = new AbortController();
    controller.current = current;
    setLoading(true);
    try {
      const params = new URLSearchParams({ street: report.street, area: report.area });
      const response = await fetch(`/api/project-coverage?${params}`, { signal: current.signal });
      const data = await response.json();
      if (!current.signal.aborted) setResult(data);
    } catch { if (!current.signal.aborted) setResult({ error: 'Reporting could not load. Use the external search link.' }); }
    finally { if (!current.signal.aborted) setLoading(false); }
  }
  const query = new URLSearchParams({ q: `"${report.street}" "${report.area}" when:30d`, hl: 'en-NG', gl: 'NG', ceid: 'NG:en' });
  return <div className="stack-sm">
    <button className="btn-outline" disabled={loading} onClick={search}>{loading ? 'Looking for coverage…' : 'Find recent reporting about this street'}</button>
    <div className="small muted">Search matches are leads, not a confirmed match to this report or its contract. Unindexed videos and social posts can be added manually below.</div>
    <div role="status">{result?.error || (result?.articles?.length === 0 ? 'No indexed reporting found for this street and area in the last 30 days.' : '')}</div>
    {result?.articles?.map((article) => <article key={article.url} className="news-item stack-xs"><a href={article.url} target="_blank" rel="noreferrer">{article.title}</a><span className="small muted">{article.publisher} · <time dateTime={article.date}>{new Date(article.date).toLocaleDateString('en-NG', { timeZone: 'Africa/Lagos' })}</time></span></article>)}
    <a href={`https://news.google.com/search?${query}`} target="_blank" rel="noreferrer">Search more news coverage ↗</a>
  </div>;
}
