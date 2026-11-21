begin;

create table if not exists public.ctzn_contributions (
  id uuid primary key default gen_random_uuid(),
  contributor_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  kind text not null check (kind in ('claim', 'official_record', 'project_evidence')),
  subject text not null check (length(trim(subject)) between 1 and 240),
  details jsonb not null check (jsonb_typeof(details) = 'object' and octet_length(details::text) <= 12000),
  review_status text not null default 'pending' check (review_status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

create index if not exists ctzn_contributions_owner_idx
  on public.ctzn_contributions (contributor_id, created_at desc);
create index if not exists ctzn_contributions_pending_idx
  on public.ctzn_contributions (created_at) where review_status = 'pending';

alter table public.ctzn_contributions enable row level security;
revoke all on public.ctzn_contributions from public, anon, authenticated;
grant select on public.ctzn_contributions to authenticated;
grant insert (kind, subject, details) on public.ctzn_contributions to authenticated;

drop policy if exists "ctzn contributors read their submissions" on public.ctzn_contributions;
create policy "ctzn contributors read their submissions"
  on public.ctzn_contributions for select to authenticated
  using ((select auth.uid()) = contributor_id and not coalesce((select auth.jwt() ->> 'is_anonymous') = 'true', false));

drop policy if exists "ctzn contributors submit for review" on public.ctzn_contributions;
create policy "ctzn contributors submit for review"
  on public.ctzn_contributions for insert to authenticated
  with check ((select auth.uid()) = contributor_id and review_status = 'pending'
    and not coalesce((select auth.jwt() ->> 'is_anonymous') = 'true', false));

-- Retire the previous evidence intake. Editors can still review its existing rows.
revoke insert on public.ctzn_report_evidence from anon, authenticated;
drop policy if exists "ctzn submit pending evidence" on public.ctzn_report_evidence;
drop policy if exists "ctzn evidence public read" on public.ctzn_report_evidence;
create policy "ctzn evidence public read" on public.ctzn_report_evidence
  for select to anon, authenticated using (review_status = 'verified');

commit;
