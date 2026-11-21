'use client';

import { useState } from 'react';
import { complaintEmail, responsibilityFor } from '@/lib/accountability';

export default function EmailComplaint({ report }) {
  const [opened, setOpened] = useState(false);
  const draft = complaintEmail(report, responsibilityFor(report.cat, report.road, report.state, report.lga || report.area));
  return <section className="card stack-sm">
    <div className="label">Email the responsible office</div>
    {draft ? <><div>To: <strong>{draft.recipient}</strong></div><details><summary>Review complaint email</summary><p>{draft.subject}</p><pre className="complaint-preview">{draft.body}</pre></details><a className="btn email-button" href={draft.href} onClick={() => setOpened(true)}>Open email app with complaint</a><div className="muted" role="status">{opened ? 'Your email app was requested. Press Send there to submit the complaint; ctzn cannot confirm whether it was sent or delivered.' : 'Review and send from your email app. Automatic email delivery is not connected yet.'}</div></> : <div className="muted">No verified complaints inbox is mapped for this issue and area yet. Your report can still appear on the map; no email has been sent.</div>}
  </section>;
}
