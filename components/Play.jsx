'use client';

import { AREA, LEADERBOARD, OFFICES, OFFICE_SCORES, QUIZ, TASKS } from '@/lib/data';
import { useStore } from '@/lib/store';

export default function Play({ t }) {
  const store = useStore();

  const pickQuiz = (id) => {
    if (store.quiz) return;
    const right = id === QUIZ.answer;
    store.patch((s) => ({ quiz: right ? 'right' : 'wrong', points: s.points + (right ? 15 : 0) }));
  };

  const doTask = (k) => {
    if (store.tasks[k.id]) return;
    store.patch((s) => ({ tasks: { ...s.tasks, [k.id]: true }, points: s.points + k.pts }));
  };

  const offices = OFFICE_SCORES
    .map((o) => ({ ...o, name: OFFICES[o.key].name, pts: o.pts + (store.officeDelta[o.key] || 0) }))
    .sort((a, b) => b.pts - a.pts);

  const board = LEADERBOARD
    .map((b) => ({ ...b, pts: b.pts + (b.name === AREA.lga ? store.points : 0) }))
    .sort((a, b) => b.pts - a.pts);

  const badges = [
    { name: 'First Report', earned: store.myReports.length > 0 },
    { name: 'Quiz Whiz', earned: store.quiz === 'right' },
    { name: 'Area Scout', earned: Object.keys(store.seen).length > 0 },
  ];

  return (
    <div className="stack">
      <h1>{t.t_play}</h1>

      <section className="card" style={{ gap: 10 }}>
        <div className="label">Quiz of the day</div>
        <div className="strong" style={{ fontSize: 16, lineHeight: 1.35 }}>{QUIZ.question}</div>
        {!store.quiz ? (
          <div className="stack-sm" style={{ gap: 8 }}>
            {QUIZ.options.map((q) => (
              <button key={q.id} className="option" style={{ minHeight: 48, background: 'var(--ground)' }} onClick={() => pickQuiz(q.id)}><b style={{ fontSize: 15 }}>{q.label}</b></button>
            ))}
          </div>
        ) : null}
        {store.quiz === 'right' ? <div className="note-ok">Correct! +15 pts. {QUIZ.reveal}</div> : null}
        {store.quiz === 'wrong' ? <div className="note-warn" style={{ fontWeight: 600, fontSize: 14 }}>Not quite. {QUIZ.reveal} Come back tomorrow for another one.</div> : null}
      </section>

      <div className="label">Help map your council</div>
      {TASKS.map((k) => (
        <section key={k.id} className="card" style={{ gap: 10 }}>
          <div style={{ fontWeight: 600, lineHeight: 1.35 }}>{k.title}</div>
          <div className="muted">{k.detail}</div>
          {k.sourceUrl && <a href={k.sourceUrl} target="_blank" rel="noreferrer">Read the source ↗</a>}
          {store.tasks[k.id] ? <div className="note-ok">{k.thanks}</div> : <button className="btn" onClick={() => doTask(k)}>{k.cta}</button>}
        </section>
      ))}

      <div className="label">Which offices are delivering (sample scores)</div>
      <section className="card" style={{ gap: 0, padding: '6px 14px' }}>
        {offices.map((o, i) => (
          <div key={o.key} className="between" style={{ padding: '12px 0', borderBottom: i < offices.length - 1 ? '1px solid var(--line-soft)' : 'none' }}>
            <div className="stack-xs" style={{ gap: 2 }}>
              <span className="strong">{i + 1}. {o.name}</span>
              <span className="small" style={{ color: 'var(--muted)' }}>{o.fixes} fixes confirmed {'·'} about {o.days} days each</span>
            </div>
            <span className="strong" style={{ color: 'var(--green-dark)' }}>{o.pts} pts</span>
          </div>
        ))}
      </section>
      <div className="small" style={{ color: 'var(--muted)' }}>How offices earn: +50 when residents confirm a fix, +20 bonus if it happens within 14 days, minus 10 if they claim a fix that residents reject. The office scores, not an individual.</div>

      <div className="label">Your badges</div>
      <div className="grid3">
        {badges.map((b) => (
          <div key={b.name} style={{ borderRadius: 12, padding: '12px 8px', textAlign: 'center', background: b.earned ? 'var(--green)' : '#fff', border: `1px solid ${b.earned ? 'var(--green)' : 'var(--line)'}`, color: b.earned ? '#fff' : 'var(--muted)' }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>{b.name}</div>
            <div className="small">{b.earned ? 'Earned' : 'Locked'}</div>
          </div>
        ))}
      </div>

      <div className="label">Lagos area leaderboard (sample scores)</div>
      <section className="card" style={{ gap: 0, padding: '6px 14px' }}>
        {board.map((b, i) => (
          <div key={b.name} className="between" style={{ padding: '12px 0', borderBottom: i < board.length - 1 ? '1px solid var(--line-soft)' : 'none', fontWeight: b.name === AREA.lga ? 700 : 500 }}>
            <span>{i + 1}. {b.name}</span><span>{b.pts} pts</span>
          </div>
        ))}
      </section>
    </div>
  );
}
