export const PROJECT_STATUSES = { unknown: 'Status unknown', active: 'Work observed', stalled: 'Work appears stalled', completed: 'Completion claimed' };
export const SOURCE_TYPES = { government: 'Government / procurement document', news: 'News reporting (including GST video)', social: 'Public social media / video', resident: 'Resident evidence link' };

export function validateEvidence(input, today = new Date(Date.now() + 3600000).toISOString().slice(0, 10)) {
  if (!input.reportId || !Object.hasOwn(SOURCE_TYPES, input.sourceType) || !Object.hasOwn(PROJECT_STATUSES, input.claimedStatus)) return 'Choose a report, source type and project status.';
  try {
    const url = new URL(input.url);
    if (url.protocol !== 'https:' || url.username || url.password) return 'Use a public HTTPS source link.';
  } catch { return 'Enter a valid public HTTPS source link.'; }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.sourceDate) || !Number.isFinite(Date.parse(input.sourceDate)) || new Date(input.sourceDate).toISOString().slice(0, 10) !== input.sourceDate || input.sourceDate > today) return 'Enter a valid source date that is not in the future.';
  if (!input.note?.trim() || input.note.length > 1200) return 'Explain what the source supports (up to 1200 characters).';
  for (const key of ['contractor', 'authority', 'reference']) if ((input[key] || '').length > 160) return 'Keep company, authority and contract reference fields under 160 characters.';
  return '';
}
