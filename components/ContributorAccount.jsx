'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const AccountContext = createContext(undefined);

export function ContributorProvider({ children }) {
  const [session, setSession] = useState(supabase ? undefined : null);

  useEffect(() => {
    if (!supabase) return;
    const { data } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession?.user?.is_anonymous ? null : currentSession);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  return <AccountContext.Provider value={session}>{children}</AccountContext.Provider>;
}

export function ContributionGate({ children }) {
  const session = useContext(AccountContext);
  return session ? children : <ContributorAccount />;
}

export default function ContributorAccount({ showSubmissions = false }) {
  const session = useContext(AccountContext);
  const [creating, setCreating] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  if (!supabase) return <p className="note-warn">Contributor accounts and online submissions are currently unavailable.</p>;
  if (session === undefined) return <p role="status">Checking your account…</p>;

  async function authenticate(event) {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      const credentials = { email: email.trim(), password };
      const { data, error } = creating
        ? await supabase.auth.signUp({ ...credentials, options: { emailRedirectTo: window.location.origin } })
        : await supabase.auth.signInWithPassword(credentials);
      if (error) {
        setMessage(error.message);
      } else {
        setPassword('');
        if (creating && !data.session) setMessage('Check your email for the confirmation link, then sign in.');
      }
    } catch {
      setMessage('Could not reach the account service. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    setBusy(true);
    setMessage('');
    try {
      const { error } = await supabase.auth.signOut({ scope: 'local' });
      if (error) setMessage(error.message);
    } catch {
      setMessage('Could not sign out. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  if (session) return <div className="stack-sm">
    <div className="between wrap"><span>{session.user.email}</span><button className="btn-link" disabled={busy} onClick={signOut}>Sign out</button></div>
    {message && <p role="status">{message}</p>}
    {showSubmissions && <SubmissionHistory key={session.user.id} userId={session.user.id} />}
  </div>;

  return <form className="stack-sm" onSubmit={authenticate}>
    <p>Sign in or create an account to send contributions for manual review.</p>
    <label className="stack-xs">Email<input className="field" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></label>
    <label className="stack-xs">Password<input className="field" type="password" autoComplete={creating ? 'new-password' : 'current-password'} minLength={creating ? 8 : undefined} required value={password} onChange={(event) => setPassword(event.target.value)} /></label>
    <button className="btn" disabled={busy}>{busy ? 'Please wait…' : creating ? 'Create account' : 'Sign in'}</button>
    <button className="btn-link" disabled={busy} type="button" onClick={() => { setCreating(!creating); setMessage(''); setPassword(''); }}>{creating ? 'Already have an account? Sign in' : 'Create an account'}</button>
    {message && <p role="status">{message}</p>}
  </form>;
}

function SubmissionHistory({ userId }) {
  const [items, setItems] = useState(null);
  const [failed, setFailed] = useState(false);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      const { data, error } = await supabase.from('ctzn_contributions')
        .select('id, subject, review_status, created_at')
        .eq('contributor_id', userId)
        .order('created_at', { ascending: false })
        .limit(50)
        .abortSignal(controller.signal);
      if (controller.signal.aborted) return;
      setItems(data);
      setFailed(Boolean(error));
    }
    load();
    return () => controller.abort();
  }, [userId, refresh]);

  return <section className="stack-sm">
    <div className="between wrap"><h2>Your submissions</h2><button className="btn-link" onClick={() => { setItems(null); setFailed(false); setRefresh((value) => value + 1); }}>Refresh status</button></div>
    {failed ? <p role="status">Could not load contributions. Please try again.</p>
      : !items ? <p role="status">Loading submissions…</p>
      : items.length === 0 ? <p>You haven’t submitted a contribution yet.</p>
      : items.map((item) => <article className="record-item between wrap" key={item.id}><strong>{item.subject}</strong><span className="badge neutral">{{ pending: 'Pending review', approved: 'Approved', rejected: 'Rejected' }[item.review_status]}</span></article>)}
  </section>;
}
