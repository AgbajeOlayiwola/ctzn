-- Run after the base ctzn schema in the Supabase SQL Editor.
-- Votes are private and immutable. Public users can read only aggregate counts.
-- Keep the private schema out of the Supabase Data API's exposed schemas.

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists public.ctzn_pulse_totals (
  election_id text not null,
  candidate_id text not null,
  vote_count bigint not null default 0 check (vote_count >= 0),
  updated_at timestamptz not null default now(),
  primary key (election_id, candidate_id)
);

create table if not exists public.ctzn_pulse_daily (
  election_id text not null,
  candidate_id text not null,
  vote_date date not null,
  vote_count bigint not null default 0 check (vote_count >= 0),
  primary key (election_id, candidate_id, vote_date)
);

create table if not exists public.ctzn_pulse_votes (
  election_id text not null check (election_id = 'ng-presidential-2027'),
  candidate_id text not null,
  voter_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (election_id, voter_id),
  foreign key (election_id, candidate_id)
    references public.ctzn_pulse_totals (election_id, candidate_id)
);

alter table public.ctzn_pulse_totals enable row level security;
alter table public.ctzn_pulse_daily enable row level security;
alter table public.ctzn_pulse_votes enable row level security;

revoke all on public.ctzn_pulse_totals, public.ctzn_pulse_daily, public.ctzn_pulse_votes from public, anon, authenticated;
grant select on public.ctzn_pulse_totals, public.ctzn_pulse_daily to anon, authenticated;
grant select (election_id, candidate_id, created_at) on public.ctzn_pulse_votes to authenticated;
grant insert (election_id, candidate_id) on public.ctzn_pulse_votes to authenticated;

drop policy if exists "Public can read candidate pulse totals" on public.ctzn_pulse_totals;
create policy "Public can read candidate pulse totals"
  on public.ctzn_pulse_totals for select to anon, authenticated using (true);

drop policy if exists "Public can read candidate pulse trend" on public.ctzn_pulse_daily;
create policy "Public can read candidate pulse trend"
  on public.ctzn_pulse_daily for select to anon, authenticated using (true);

drop policy if exists "Voters can read their own ballot" on public.ctzn_pulse_votes;
create policy "Voters can read their own ballot"
  on public.ctzn_pulse_votes for select to authenticated
  using ((select auth.uid()) = voter_id);

drop policy if exists "Signed-in users can cast one ballot" on public.ctzn_pulse_votes;
create policy "Signed-in users can cast one ballot"
  on public.ctzn_pulse_votes for insert to authenticated
  with check (
    (select auth.uid()) is not null
    and (select auth.uid()) = voter_id
    and election_id = 'ng-presidential-2027'
  );

insert into public.ctzn_pulse_totals (election_id, candidate_id) values
  ('ng-presidential-2027', 'aa_omoaje'),
  ('ng-presidential-2027', 'aac_sowore'),
  ('ng-presidential-2027', 'adc_atiku'),
  ('ng-presidential-2027', 'adp_abbas'),
  ('ng-presidential-2027', 'apc_tinubu'),
  ('ng-presidential-2027', 'apm_makinde'),
  ('ng-presidential-2027', 'app_yusuf'),
  ('ng-presidential-2027', 'bp_adenuga'),
  ('ng-presidential-2027', 'dla_adebisi'),
  ('ng-presidential-2027', 'lp_okereke'),
  ('ng-presidential-2027', 'ndc_obi'),
  ('ng-presidential-2027', 'ndp_okwori'),
  ('ng-presidential-2027', 'nrm_okereke'),
  ('ng-presidential-2027', 'pdp_onor'),
  ('ng-presidential-2027', 'prp_duke'),
  ('ng-presidential-2027', 'sdp_adebayo'),
  ('ng-presidential-2027', 'ypp_agada'),
  ('ng-presidential-2027', 'zlp_nwanyanwu')
on conflict (election_id, candidate_id) do nothing;

create or replace function private.record_candidate_pulse_vote()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.ctzn_pulse_totals as totals (election_id, candidate_id, vote_count, updated_at)
  values (new.election_id, new.candidate_id, 1, pg_catalog.now())
  on conflict (election_id, candidate_id) do update
    set vote_count = totals.vote_count + 1,
        updated_at = pg_catalog.now();

  insert into public.ctzn_pulse_daily as daily (election_id, candidate_id, vote_date, vote_count)
  values (new.election_id, new.candidate_id, (new.created_at at time zone 'Africa/Lagos')::date, 1)
  on conflict (election_id, candidate_id, vote_date) do update
    set vote_count = daily.vote_count + 1;

  return new;
end;
$$;

revoke all on function private.record_candidate_pulse_vote() from public, anon, authenticated;
drop trigger if exists ctzn_record_candidate_pulse_vote on public.ctzn_pulse_votes;
create trigger ctzn_record_candidate_pulse_vote
  after insert on public.ctzn_pulse_votes
  for each row execute function private.record_candidate_pulse_vote();
