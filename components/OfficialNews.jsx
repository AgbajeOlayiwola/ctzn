'use client';

import { useEffect, useState } from 'react';
import { newsSearchUrl } from '@/lib/official-news';

export default function OfficialNews({ person }) {
  const [result, setResult] = useState(null);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setResult(null);
    fetch(`/api/official-news?id=${encodeURIComponent(person.id)}`, { signal: controller.signal }).then(async (response) => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      if (!controller.signal.aborted) setResult(data);
    }).catch((error) => { if (!controller.signal.aborted) setResult({ error: error.message || 'News could not be loaded.' }); });
    return () => controller.abort();
  }, [person.id, retry]);

  return <section className="stack-sm" aria-label={`Recent news about ${person.name}`}>
    <h3>In the news · past 30 days</h3>
    <div className="small muted">Headlines from Google News. Coverage may include allegations or opinion; read the linked reporting for context.</div>
    <div role="status">{!result ? 'Loading recent coverage…' : result.error ? <span>{result.error} <button className="btn-link" onClick={() => setRetry((n) => n + 1)}>Try again</button></span> : result.articles.length === 0 ? 'No recent articles were found for this name.' : null}</div>
    {result?.articles?.map((article) => <article className="news-item stack-xs" key={article.url}><a href={article.url} target="_blank" rel="noreferrer">{article.title}</a><div className="small muted">{article.publisher} · <time dateTime={article.date}>{new Date(article.date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Africa/Lagos' })}</time></div></article>)}
    <a href={newsSearchUrl(person.name)} target="_blank" rel="noreferrer">Search recent coverage of {person.name}</a>
  </section>;
}
