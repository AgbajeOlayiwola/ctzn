import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { NIGERIA_SCOPES, SOURCE_DIRECTORY } from '@/lib/source-catalog.mjs';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
async function read(name, fallback) {
  try { return JSON.parse(await readFile(join(process.cwd(), 'data', 'crawl', name), 'utf8')); } catch { return fallback; }
}
export async function GET() {
  const digest = await read('latest.json', { updatedAt: null, items: [], sources: [] });
  const status = await read('status.json', { state: 'not-run' });
  return Response.json({ ...digest, status, scopes: NIGERIA_SCOPES, directory: SOURCE_DIRECTORY }, { headers: { 'Cache-Control': 'no-store' } });
}
