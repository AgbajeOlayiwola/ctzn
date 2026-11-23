'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { CANDIDATE_PULSE } from '@/lib/candidate-pulse';
import ContributorAccount, { useContributorSession } from './ContributorAccount';

function shareChanges(rows, currentVotes) {
  const days = [...new Set(rows.map((row) => row.vote_date))].sort();
  if (days.length < 2) return { changes: new Map(), label: 'Trend forming' };

  const latest = days[days.length - 1];
  const latestTime = Date.parse(`${latest}T00:00:00Z`);
  const targetTime = latestTime - 7 * 24 * 60 * 60 * 1000;
  const earlierDays = days.filter((day) => Date.parse(`${day}T00:00:00Z`) <= targetTime);
  const baseline = earlierDays[earlierDays.length - 1] || days[0];
  const totals = new Map();
  rows.filter((row) => row.vote_date <= baseline).forEach((row) => {
    totals.set(row.candidate_id, (totals.get(row.candidate_id) || 0) + Number(row.vote_count));
  });
  const baselineTotal = [...totals.values()].reduce((sum, count) => sum + count, 0);
  const currentTotal = [...currentVotes.values()].reduce((sum, count) => sum + count, 0);
  if (!baselineTotal || !currentTotal || baseline === latest) return { changes: new Map(), label: 'Trend forming' };

  const changes = new Map();
  for (const candidate of CANDIDATE_PULSE.candidates) {
    const before = ((totals.get(candidate.id) || 0) / baselineTotal) * 100;
    const now = ((currentVotes.get(candidate.id) || 0) / currentTotal) * 100;
    changes.set(candidate.id, now - before);
  }
  const elapsedDays = Math.round((latestTime - Date.parse(`${baseline}T00:00:00Z`)) / (24 * 60 * 60 * 1000));
  return { changes, label: elapsedDays >= 7 ? 'change in vote share over 7 days' : 'change since first votes' };
}

export default function CandidatePulse() {
  const session = useContributorSession();
  const [totals, setTotals] = useState([]);
  const [daily, setDaily] = useState([]);
  const [myVote, setMyVote] = useState(null);
  const [selected, setSelected] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [updatedAt, setUpdatedAt] = useState(null);
  const [refresh, setRefresh] = useState(0);

  const load = useCallback(async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    if (session === undefined) return;
    setLoading(true);
    setError('');
    const voteQuery = session?.user?.id
      ? supabase.from('ctzn_pulse_votes').select('candidate_id, created_at').eq('election_id', CANDIDATE_PULSE.electionId).maybeSingle()
      : Promise.resolve({ data: null, error: null });
    try {
      const [totalsResult, dailyResult, voteResult] = await Promise.all([
        supabase.from('ctzn_pulse_totals').select('candidate_id, vote_count').eq('election_id', CANDIDATE_PULSE.electionId),
        supabase.from('ctzn_pulse_daily').select('candidate_id, vote_date, vote_count').eq('election_id', CANDIDATE_PULSE.electionId).order('vote_date', { ascending: true }),
        voteQuery,
      ]);
      if (totalsResult.error || dailyResult.error || voteResult.error) {
        setError('Shared voting is not set up yet. Apply the candidate pulse SQL setup and connect this app to Supabase.');
        return;
      }
      setTotals(totalsResult.data || []);
      setDaily(dailyResult.data || []);
      setMyVote(voteResult.data || null);
      setUpdatedAt(new Date());
    } catch {
      setError('Could not load the shared poll. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => { load(); }, [load, refresh]);
  useEffect(() => {
    if (!supabase) return undefined;
    const timer = window.setInterval(() => setRefresh((value) => value + 1), 60000);
    return () => window.clearInterval(timer);
  }, []);

  const resultRows = useMemo(() => {
    const voteMap = new Map(totals.map((row) => [row.candidate_id, Number(row.vote_count)]));
    const total = [...voteMap.values()].reduce((sum, count) => sum + count, 0);
    const movement = shareChanges(daily, voteMap);
    return {
      total,
      trendLabel: movement.label,
      candidates: CANDIDATE_PULSE.candidates.map((candidate) => {
        const votes = voteMap.get(candidate.id) || 0;
        return { ...candidate, votes, share: total ? (votes / total) * 100 : 0, movement: movement.changes.get(candidate.id) };
      }).sort((a, b) => b.votes - a.votes || a.name.localeCompare(b.name)),
    };
  }, [totals, daily]);

  async function castVote(event) {
    event.preventDefault();
    if (!supabase || !selected || !session?.user?.id || myVote || busy) return;
    setBusy(true);
    setError('');
    try {
      const { error: insertError } = await supabase.from('ctzn_pulse_votes').insert({ election_id: CANDIDATE_PULSE.electionId, candidate_id: selected });
      if (insertError) {
        setError(insertError.code === '23505' ? 'A ballot has already been recorded for this account.' : 'Your ballot could not be recorded. Please try again.');
        return;
      }
      setSelected('');
      setRefresh((value) => value + 1);
    } catch {
      setError('Your ballot could not be recorded. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  const checkedDate = new Intl.DateTimeFormat('en-NG', { dateStyle: 'medium', timeZone: 'Africa/Lagos' }).format(new Date(CANDIDATE_PULSE.checkedAt));
  const refreshedTime = updatedAt && new Intl.DateTimeFormat('en-NG', { timeStyle: 'short', timeZone: 'Africa/Lagos' }).format(updatedAt);

  return <div className="stack">
    <div className="between wrap"><h1>Election pulse</h1><button type="button" className="btn-outline" disabled={loading || !supabase} onClick={() => setRefresh((value) => value + 1)}>Refresh results</button></div>
    <section className="card pulse-intro">
      <div className="label">{CANDIDATE_PULSE.title}</div>
      <p>This is a voluntary, self-selected pulse poll, not a scientific survey or an INEC election result. One ballot is allowed per signed-in account; accounts and voter eligibility are not independently verified.</p>
      <p>Votes are not linked to your selected area. Results show the overall ctzn poll only. No money, prizes or trading are involved.</p>
      <div className="small muted">Candidate names are transcribed from INEC's current published list, checked {checkedDate}. Candidate status can change. <a href={CANDIDATE_PULSE.sourceUrl} target="_blank" rel="noreferrer">Check INEC's list ↗</a></div>
      {CANDIDATE_PULSE.candidates.filter((candidate) => candidate.statusNote).map((candidate) => <div className="note-warn pulse-status-note" key={candidate.id}><strong>{candidate.party} ticket status:</strong> {candidate.statusNote} <a href={candidate.statusUrl} target="_blank" rel="noreferrer">Read the appeal update ↗</a></div>)}
    </section>

    {!supabase && <div role="status" className="note-warn">Shared voting needs a connected Supabase project. Set the app's Supabase URL and publishable key, then run the setup in <code>supabase/candidate-pulse.sql</code>.</div>}
    {error && <div role="status" className="note-warn">{error}</div>}

    {supabase && !loading && !error && !session && <section className="card">
      <h2>Cast your ballot</h2>
      <p>Sign in or create an account to choose one candidate. Your selection is locked after submission.</p>
      <ContributorAccount description="Sign in or create an account to cast one ballot in the ctzn pulse poll." />
    </section>}
    {supabase && session === undefined && <p role="status">Checking your account…</p>}
    {supabase && !loading && !error && session?.user?.id && !myVote && <form className="card" onSubmit={castVote}>
      <h2>Who would you choose today?</h2>
      <div className="pulse-choices" role="radiogroup" aria-label="Choose a presidential candidate">
        {CANDIDATE_PULSE.candidates.map((candidate) => <label key={candidate.id} className={`pulse-choice ${selected === candidate.id ? 'on' : ''}`}>
          <input type="radio" name="candidate" value={candidate.id} checked={selected === candidate.id} onChange={() => setSelected(candidate.id)} />
          <span><strong>{candidate.name}</strong><small>{candidate.party}</small></span>
        </label>)}
      </div>
      <button className="btn" disabled={!selected || busy}>{busy ? 'Recording ballot…' : 'Submit my ballot'}</button>
      <div className="small muted">One ballot per account. You cannot change it after submitting.</div>
    </form>}
    {session?.user?.id && myVote && <div role="status" className="note-ok">Your ballot is recorded for {CANDIDATE_PULSE.candidates.find((candidate) => candidate.id === myVote.candidate_id)?.name || 'your selected candidate'}. It cannot be changed.</div>}

    {loading && supabase && <p role="status">Loading shared results…</p>}
    {!loading && !error && totals.length > 0 && <section className="card">
      <div className="between wrap"><div><h2>Current pulse</h2><div className="muted">{resultRows.total.toLocaleString()} ballots across all candidates</div></div><span className="badge neutral">{refreshedTime ? `Updated ${refreshedTime}` : 'Live results'}</span></div>
      <div className="small muted">Ranked by current vote share · Movement is percentage-point change {resultRows.trendLabel}.</div>
      <div className="pulse-results">
        {resultRows.candidates.map((candidate, index) => <div className="pulse-result" key={candidate.id}>
          <span className="pulse-rank">{index + 1}</span>
          <span className="pulse-candidate-name"><strong>{candidate.name}</strong><small>{candidate.party}</small></span>
          <span className="pulse-share">{candidate.share.toFixed(1)}%</span>
          <span className="pulse-count">{candidate.votes.toLocaleString()} votes</span>
          <span className="pulse-track" role="progressbar" aria-label={`${candidate.name} vote share`} aria-valuenow={candidate.share.toFixed(1)} aria-valuemin="0" aria-valuemax="100"><span style={{ width: `${candidate.share}%` }} /></span>
          <span className={`pulse-movement ${candidate.movement > 0 ? 'up' : candidate.movement < 0 ? 'down' : ''}`}>
            {candidate.movement == null ? '—' : `${candidate.movement > 0 ? '+' : ''}${candidate.movement.toFixed(1)} pp`}
          </span>
        </div>)}
      </div>
    </section>}
    {!loading && !error && totals.length === 0 && supabase && <p className="note-warn">Shared voting is not set up yet. Apply <code>supabase/candidate-pulse.sql</code> to this project.</p>}
  </div>;
}
