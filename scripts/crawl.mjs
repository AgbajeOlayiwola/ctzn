import { mkdir, open, readFile, rename, stat, unlink, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CRAWL_SOURCES, NIGERIA_SCOPES } from '../lib/source-catalog.mjs';
import { extractClaimReview, extractPublisherVerdict, makeDigestItem, mergeItems, parseFeed, safePublicUrl } from '../lib/digest.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DATA = resolve(ROOT, 'data', 'crawl');
const USER_AGENT = 'ctzn-local-reader/1.0';
const wait = (ms) => new Promise((done) => setTimeout(done, ms));

export function parseRobots(text, agent = USER_AGENT) {
  const groups = [];
  let group = { agents: [], rules: [], delay: 1 };
  let directives = false;
  for (const line of text.split(/\r?\n/)) {
    const match = line.split('#')[0].match(/^\s*([\w-]+)\s*:\s*(.*?)\s*$/);
    if (!match) continue;
    const [, raw, value] = match;
    const key = raw.toLowerCase();
    if (key === 'user-agent') {
      if (directives) { groups.push(group); group = { agents: [], rules: [], delay: 1 }; directives = false; }
      group.agents.push(value.toLowerCase());
    } else if (group.agents.length) {
      directives = true;
      if (['allow', 'disallow'].includes(key) && value) group.rules.push({ allow: key === 'allow', path: value });
      if (key === 'crawl-delay' && Number.isFinite(Number(value))) group.delay = Math.max(1, Number(value));
    }
  }
  groups.push(group);
  const score = (item) => Math.max(-1, ...item.agents.map((name) => name === '*' ? 0 : agent.toLowerCase().includes(name) ? name.length : -1));
  const best = Math.max(-1, ...groups.map(score));
  const selected = best < 0 ? [] : groups.filter((item) => score(item) === best);
  return { rules: selected.flatMap((item) => item.rules), delay: Math.max(1, ...selected.map((item) => item.delay)) };
}

export function robotsAllows(policy, url) {
  const path = new URL(url).pathname + new URL(url).search;
  const matches = policy.rules.filter((rule) => {
    const pattern = rule.path.split('*').map((part) => part.replace(/[.+?^{}()|[\]\\]/g, '\\$&')).join('.*');
    return new RegExp('^' + pattern).test(path);
  }).sort((a, b) => b.path.replaceAll('*', '').length - a.path.replaceAll('*', '').length || Number(b.allow) - Number(a.allow));
  return !matches.length || matches[0].allow;
}

function hostsFor(url) {
  const host = new URL(url).hostname;
  return new Set([host, host.startsWith('www.') ? host.slice(4) : `www.${host}`]);
}

export function createReader(fetcher = fetch) {
  const policies = new Map();
  const queues = new Map();
  async function request(url, hosts, delay = 1) {
    const origin = new URL(url).origin;
    const previous = queues.get(origin) || Promise.resolve();
    let release;
    const gate = new Promise((done) => { release = done; });
    queues.set(origin, gate);
    await previous;
    try {
      const response = await fetcher(url, { redirect: 'manual', signal: AbortSignal.timeout(10000), headers: { 'User-Agent': USER_AGENT, Accept: 'application/rss+xml, application/atom+xml, text/html, text/plain;q=0.8' } });
      if ([301, 302, 303, 307, 308].includes(response.status)) return { redirect: response.headers.get('location') };
      if (response.status === 404 && new URL(url).pathname === '/robots.txt') return { text: '', status: 404 };
      if (!response.ok) throw new Error(`Source returned HTTP ${response.status}`);
      const reader = response.body.getReader();
      const chunks = [];
      let size = 0;
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        size += value.length;
        if (size > 2 * 1024 * 1024) { await reader.cancel(); throw new Error('Source exceeds 2 MB read limit'); }
        chunks.push(value);
      }
      return { text: Buffer.concat(chunks).toString('utf8'), status: response.status };
    } finally { await wait(delay * 1000); release(); }
  }
  async function raw(url, hosts, robots = false, redirects = 0) {
    if (!safePublicUrl(url) || !hosts.has(new URL(url).hostname) || redirects > 4) throw new Error('Unsafe or off-source redirect blocked');
    let policy;
    if (!robots) {
      const origin = new URL(url).origin;
      if (!policies.has(origin)) policies.set(origin, raw(origin + '/robots.txt', hosts, true).then((result) => parseRobots(result.text)));
      policy = await policies.get(origin);
      if (policy.delay > 120) throw new Error('Source requires a crawl delay above this reader’s limit; skipped');
      if (!robotsAllows(policy, url)) throw new Error('robots.txt disallows this path');
    }
    const result = await request(url, hosts, policy?.delay || 1);
    if (result.redirect) return raw(new URL(result.redirect, url).toString(), hosts, robots, redirects + 1);
    return result;
  }
  return (url, sourceUrl = url) => raw(url, hostsFor(sourceUrl));
}

async function readJson(path, fallback) {
  try { return JSON.parse(await readFile(path, 'utf8')); } catch { return fallback; }
}
async function atomicJson(path, value) {
  const temporary = `${path}.${process.pid}.tmp`;
  await writeFile(temporary, JSON.stringify(value, null, 2));
  await rename(temporary, path);
}

export async function crawl({ sources = CRAWL_SOURCES, directory = DATA, now = Date.now(), reader = createReader() } = {}) {
  await mkdir(directory, { recursive: true });
  const lockPath = resolve(directory, 'crawl.lock');
  try { const lock = await stat(lockPath); if (Date.now() - lock.mtimeMs > 2 * 3600000) await unlink(lockPath); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  let lock;
  try { lock = await open(lockPath, 'wx'); } catch { throw new Error('A crawler is already running. A stale lock expires after two hours.'); }
  try {
    await lock.writeFile(String(process.pid));
    const previous = await readJson(resolve(directory, 'latest.json'), { items: [], sources: [] });
    const incoming = [];
    const statuses = [];
    const queue = [...sources];
    await atomicJson(resolve(directory, 'status.json'), { state: 'running', startedAt: new Date(now).toISOString() });
    async function worker() {
      while (queue.length) {
        const source = queue.shift();
        try {
          const { text } = await reader(source.url);
          if (!/<(rss|feed)(\s|>)/i.test(text)) throw new Error('Not an RSS/Atom feed; no bypass attempted');
          const entries = parseFeed(text, now);
          let reviews = 0;
          for (const entry of entries) {
            let review = null;
            if (source.kind === 'factcheck' && reviews < (source.id === 'dubawa' ? 1 : 3)) {
              reviews += 1;
              try { const page = await reader(entry.url, source.url); review = extractClaimReview(page.text) || extractPublisherVerdict(page.text, source.id); } catch { /* retain link without a verdict */ }
            }
            incoming.push(makeDigestItem(entry, source, review));
          }
          statuses.push({ id: source.id, name: source.name, scope: source.scope, state: 'ok', count: entries.length, checkedAt: new Date().toISOString() });
          console.log(`${source.name}: ${entries.length} items`);
        } catch (error) {
          statuses.push({ id: source.id, name: source.name, scope: source.scope, state: 'failed', error: error.message, checkedAt: new Date().toISOString() });
          console.log(`${source.name}: skipped (${error.message})`);
        }
      }
    }
    await Promise.all([worker(), worker()]);
    const completedAt = new Date().toISOString();
    const successes = statuses.filter((source) => source.state === 'ok').length;
    const items = mergeItems(previous.items || [], incoming, now);
    const statusMap = new Map((previous.sources || []).map((source) => [source.id, source]));
    statuses.forEach((source) => statusMap.set(source.id, source));
    const digest = { version: 1, updatedAt: successes ? completedAt : previous.updatedAt || null, attemptedAt: completedAt, scopes: NIGERIA_SCOPES, sources: [...statusMap.values()], items, lastRun: { successes, failed: statuses.length - successes, incoming: incoming.length } };
    await atomicJson(resolve(directory, 'latest.json'), digest);
    await atomicJson(resolve(directory, 'status.json'), { state: successes ? 'complete' : 'failed', completedAt, successes, failed: statuses.length - successes });
    return digest;
  } finally { await lock.close(); await unlink(lockPath); }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const selected = process.argv.indexOf('--source');
  const sources = selected >= 0 ? CRAWL_SOURCES.filter((source) => source.id === process.argv[selected + 1]) : CRAWL_SOURCES;
  if (!sources.length) { console.error('Unknown source ID'); process.exitCode = 1; }
  else crawl({ sources }).then((result) => { console.log(`Saved ${result.items.length} items locally; ${result.lastRun.successes} sources succeeded.`); if (!result.lastRun.successes) process.exitCode = 1; }).catch((error) => { console.error(error.message); process.exitCode = 1; });
}
