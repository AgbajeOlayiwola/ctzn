-- ctzn uses isolated tables and a bucket, including when sharing a project.
-- Public contributors can read and insert. They cannot edit reports or verify sources.
create table if not exists public.ctzn_reports (
  id text primary key,
  category text not null check (length(category) between 1 and 40),
  road_type text,
  office text not null,
  street text not null check (length(trim(street)) between 1 and 160),
  area text check (length(area) <= 100),
  report_state text not null check (length(trim(report_state)) between 1 and 80),
  lga text not null check (length(trim(lga)) between 1 and 80),
  description text not null check (length(trim(description)) between 1 and 1200),
  lat double precision not null check (lat between -90 and 90),
  lng double precision not null check (lng between -180 and 180),
  status text not null default 'open' check (status in ('open', 'claimed', 'fixed')),
  photo_url text,
  confirmations integer not null default 0 check (confirmations >= 0),
  created_at timestamptz not null default now()
);
create index if not exists ctzn_reports_created_idx on public.ctzn_reports(created_at desc);
alter table public.ctzn_reports enable row level security;
revoke all on public.ctzn_reports from public, anon, authenticated;
grant select, insert on public.ctzn_reports to anon, authenticated;
drop policy if exists "ctzn reports public read" on public.ctzn_reports;
create policy "ctzn reports public read" on public.ctzn_reports for select to anon, authenticated using (true);
drop policy if exists "ctzn submit open report" on public.ctzn_reports;
create policy "ctzn submit open report" on public.ctzn_reports for insert to anon, authenticated with check (status = 'open' and confirmations = 0 and created_at between now() - interval '5 minutes' and now() + interval '1 minute');

create table if not exists public.ctzn_report_evidence (
  id text primary key,
  report_id text not null references public.ctzn_reports(id) on delete cascade,
  contractor text check (length(contractor) <= 160),
  authority text check (length(authority) <= 160),
  award_reference text check (length(award_reference) <= 160),
  claimed_status text not null check (claimed_status in ('unknown', 'active', 'stalled', 'completed')),
  source_type text not null check (source_type in ('government', 'news', 'social', 'resident')),
  source_url text not null check (source_url ~ '^https://'),
  source_date date not null check (source_date <= current_date),
  note text not null check (length(trim(note)) between 1 and 1200),
  review_status text not null default 'pending' check (review_status in ('pending', 'verified', 'rejected')),
  created_at timestamptz not null default now()
);
create index if not exists ctzn_evidence_report_idx on public.ctzn_report_evidence(report_id, created_at desc);
create index if not exists ctzn_evidence_created_idx on public.ctzn_report_evidence(created_at desc);
alter table public.ctzn_report_evidence enable row level security;
revoke all on public.ctzn_report_evidence from public, anon, authenticated;
grant select, insert on public.ctzn_report_evidence to anon, authenticated;
drop policy if exists "ctzn evidence public read" on public.ctzn_report_evidence;
create policy "ctzn evidence public read" on public.ctzn_report_evidence for select to anon, authenticated using (review_status <> 'rejected');
drop policy if exists "ctzn submit pending evidence" on public.ctzn_report_evidence;
create policy "ctzn submit pending evidence" on public.ctzn_report_evidence for insert to anon, authenticated with check (review_status = 'pending');

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('ctzn-report-photos', 'ctzn-report-photos', true, 10485760, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;
drop policy if exists "ctzn photo public read" on storage.objects;
create policy "ctzn photo public read" on storage.objects for select to anon, authenticated using (bucket_id = 'ctzn-report-photos');
drop policy if exists "ctzn photo insert" on storage.objects;
create policy "ctzn photo insert" on storage.objects for insert to anon, authenticated with check (bucket_id = 'ctzn-report-photos');
