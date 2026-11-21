'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { SAMPLE_REPORTS } from './data';
import { fetchEvidence, fetchReports, saveEvidence, saveReport, supabase, updateReportStatus } from './supabase';

const KEY = 'ctzn-v1';

const initial = {
  lang: 'en',
  representativeArea: null,
  evidence: [],
  lessons: {},
  officialSuggestions: [],
  points: 30,
  myReports: [],      // reports created on this device
  seen: {},           // report ids this user confirmed
  answers: {},        // fact-check guesses
  quiz: '',           // '', 'right', 'wrong'
  tasks: {},          // completed contribute tasks
  claims: [],         // claims submitted for checking
  planSaved: false,
  officeDelta: {},    // office key -> points change from this user's verified fixes
};

const Ctx = createContext(null);

export function StoreProvider({ children }) {
  const [state, setState] = useState(initial);
  const [remote, setRemote] = useState([]);
  const [remoteEvidence, setRemoteEvidence] = useState([]);
  const [ready, setReady] = useState(false);

  // Load saved state after mount (keeps server and client render identical).
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) setState((s) => ({ ...s, ...JSON.parse(raw) }));
    } catch (e) { /* storage unavailable: carry on in memory */ }
    setReady(true);
    fetchReports().then(setRemote).catch(() => setRemote([]));
    fetchEvidence().then(setRemoteEvidence).catch(() => setRemoteEvidence([]));
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      // Photos are object URLs and do not survive a reload, so they are not stored.
      const slim = { ...state, myReports: state.myReports.map((r) => ({ ...r, photo: r.photo && r.photo.startsWith('http') ? r.photo : null })) };
      window.localStorage.setItem(KEY, JSON.stringify(slim));
    } catch (e) { /* ignore */ }
  }, [state, ready]);

  const patch = useCallback((p) => setState((s) => ({ ...s, ...(typeof p === 'function' ? p(s) : p) })), []);
  const addPoints = useCallback((n) => setState((s) => ({ ...s, points: s.points + n })), []);
  const refreshPublic = useCallback(async () => {
    const [reports, sources] = await Promise.all([fetchReports(), fetchEvidence()]);
    setRemote(reports);
    setRemoteEvidence(sources);
  }, []);

  const addReport = useCallback(async (report, photoFile) => {
    let result;
    try { result = await saveReport(report, photoFile); }
    catch { result = { report: { ...report, publication: 'local' }, published: false, error: 'Publishing failed. Saved on this device only.' }; }
    setState((s) => ({ ...s, points: s.points + 25, myReports: [result.report, ...s.myReports] }));
    return result;
  }, []);

  const addEvidence = useCallback(async (evidence) => {
    let saved;
    try { saved = await saveEvidence(evidence); } catch { saved = { ...evidence, publication: 'local' }; }
    setState((s) => ({ ...s, evidence: [saved, ...s.evidence] }));
    return saved;
  }, []);

  const completeLesson = useCallback((id, correct) => {
    setState((s) => s.lessons[id] ? s : { ...s, lessons: { ...s.lessons, [id]: correct ? 'correct' : 'reviewed' }, points: s.points + (correct ? 10 : 0) });
  }, []);

  const confirmSeen = useCallback((id) => {
    setState((s) => (s.seen[id] ? s : { ...s, points: s.points + 10, seen: { ...s.seen, [id]: true } }));
  }, []);

  // The reporter says whether a claimed fix is real.
  const resolveFix = useCallback((id, fixed) => {
    setState((s) => {
      const r = s.myReports.find((x) => x.id === id);
      if (!r) return s;
      const delta = fixed ? 70 : -10;
      return {
        ...s,
        points: s.points + (fixed ? 30 : 0),
        myReports: s.myReports.map((x) => (x.id === id ? { ...x, status: fixed ? 'fixed' : 'open' } : x)),
        officeDelta: { ...s.officeDelta, [r.office]: (s.officeDelta[r.office] || 0) + delta },
      };
    });
    updateReportStatus(id, fixed ? 'fixed' : 'open');
  }, []);

  const markClaimed = useCallback((id) => {
    setState((s) => ({ ...s, myReports: s.myReports.map((x) => (x.id === id ? { ...x, status: 'claimed' } : x)) }));
    updateReportStatus(id, 'claimed');
  }, []);

  const reports = useMemo(() => {
    const mineIds = new Set(state.myReports.map((r) => r.id));
    const others = remote.filter((r) => !mineIds.has(r.id));
    const mine = state.myReports.map((r) => ({ ...r, mine: true }));
    return [...mine, ...others, ...SAMPLE_REPORTS];
  }, [state.myReports, remote]);
  const evidence = useMemo(() => {
    const ids = new Set(remoteEvidence.map((item) => item.id));
    return [...state.evidence.filter((item) => item.publication === 'local' && !ids.has(item.id)), ...remoteEvidence];
  }, [state.evidence, remoteEvidence]);

  const value = useMemo(() => ({
    ...state, ready, reports, evidence, online: !!supabase,
    patch, addPoints, addReport, addEvidence, completeLesson, refreshPublic, confirmSeen, resolveFix, markClaimed,
  }), [state, ready, reports, evidence, patch, addPoints, addReport, addEvidence, completeLesson, refreshPublic, confirmSeen, resolveFix, markClaimed]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useStore must be used inside StoreProvider');
  return v;
}
