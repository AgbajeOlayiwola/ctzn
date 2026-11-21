'use client';

import { useStore } from '@/lib/store';
import { ACCOUNTABILITY_SOURCES } from '@/lib/accountability';
import PolicyImpact from './PolicyImpact';

const LESSONS = [
  { id: 'waste', title: 'Waste: collector, regulator and government', text: 'In Lagos, a private PSP may collect your waste. LAWMA is the public authority overseeing waste services. The Environment Ministry provides government oversight. Start with your assigned collector, keep a complaint reference, then escalate to LAWMA. The published complaints inbox is info@lawma.gov.ng.', question: 'Is LAWMA itself the private company assigned to collect your bin?', choices: ['Yes', 'No — the private collector is the PSP operator'], answer: 1, explanation: 'LAWMA is a public authority. Check your waste bill or LAWMA’s directory for your assigned PSP; an operator’s coverage can change.', source: ACCOUNTABILITY_SOURCES.lawma },
  { id: 'roads', title: 'A road has an owner and may have a contractor', text: 'First confirm whether the road is a federal, state or council asset. Then find the procuring authority, contract award, company, scope and completion date. Road width is only a clue, not proof of ownership. The contractor carries out an awarded scope; the procuring authority monitors it.', question: 'Does a pothole prove that a named contractor abandoned a road project?', choices: ['Yes', 'No — match the award, scope, timeline and dated site evidence first'], answer: 1, explanation: 'A bad surface can have many causes. An award notice establishes who won a contract, not current progress. Compare it with dated inspections and seek an agency or company response.', source: ACCOUNTABILITY_SOURCES.procurement },
  { id: 'sources', title: 'Turn a video into a useful evidence trail', text: 'Keep the original article or video link, publisher, date and relevant timestamp. Match the exact street and project. Compare reporting from GST or other outlets with procurement records and recent site observations. Record what remains unknown.', question: 'Which evidence is strongest for identifying the contractor?', choices: ['A popular comment naming a company', 'A matching official award record, checked against the project location'], answer: 1, explanation: 'Use social media as a lead. Popularity does not establish contractor identity, wrongdoing or current project status.', source: ACCOUNTABILITY_SOURCES.procurement },
];

export default function Learn({ goReport }) {
  const store = useStore();
  return <div className="stack"><h1>Know how things work</h1><div className="muted">Short lessons to help you report clearly, find the right office and follow public projects. Earn 10 points for each correct answer, once per lesson.</div>
    <PolicyImpact />
    {LESSONS.map((lesson) => <section key={lesson.id} className="card"><h2>{lesson.title}</h2><p>{lesson.text}</p><a href={lesson.source.url} target="_blank" rel="noreferrer">Read the official source ↗</a><strong>{lesson.question}</strong>{!store.lessons[lesson.id] ? lesson.choices.map((choice, index) => <button className="option" key={choice} onClick={() => store.completeLesson(lesson.id, index === lesson.answer)}>{choice}</button>) : <div className={store.lessons[lesson.id] === 'correct' ? 'note-ok' : 'note-warn'}>{store.lessons[lesson.id] === 'correct' ? 'Correct! +10 points. ' : 'Lesson reviewed. '}{lesson.explanation}</div>}</section>)}
    <button className="btn" onClick={goReport}>Put it into practice: report an issue</button>
  </div>;
}
