import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// null when the keys are not set: the app then runs on browser storage only.
export const supabase = url && key ? createClient(url, key) : null;

export async function submitContribution(kind, subject, details) {
  if (!supabase) return 'Online submissions are currently unavailable.';
  try {
    const { error } = await supabase.from('ctzn_contributions').insert({ kind, subject, details });
    if (error) return 'Could not submit your contribution. Check that you are signed in and try again.';
    return null;
  } catch {
    return 'Could not reach the submission service. Please try again.';
  }
}

export async function fetchReports() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('ctzn_reports')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500);
  if (error) {
    console.warn('ctzn: could not load reports', error.message);
    return [];
  }
  return (data || []).map(fromRow);
}

export async function saveReport(report, photoFile) {
  if (!supabase) return { report: { ...report, publication: 'local' }, published: false, error: 'Database not connected. Saved on this device only.' };
  let photoUrl = report.photo?.startsWith('https://') ? report.photo : null;
  if (photoFile) {
    const path = `${report.id}-${photoFile.name}`.replace(/[^a-zA-Z0-9._-]/g, '_');
    const up = await supabase.storage.from('ctzn-report-photos').upload(path, photoFile);
    if (!up.error) {
      photoUrl = supabase.storage.from('ctzn-report-photos').getPublicUrl(path).data.publicUrl;
    } else {
      console.warn('ctzn: photo upload failed', up.error.message);
    }
  }
  const { error } = await supabase.from('ctzn_reports').insert({
    id: report.id,
    category: report.cat,
    road_type: report.road || null,
    office: report.office,
    street: report.street,
    area: report.area,
    lat: report.lat,
    lng: report.lng,
    status: report.status,
    photo_url: photoUrl,
    description: report.description || null,
    report_state: report.state || null,
    lga: report.lga || null,
  });
  if (error) return { report: { ...report, photo: photoUrl || report.photo, publication: 'local' }, published: false, error: 'The public database could not save this report. A copy is kept on this device; please try publishing again later.' };
  return { report: { ...report, photo: photoUrl || report.photo, publication: 'published' }, published: true, warning: photoFile && !photoUrl ? 'Report published, but the photo upload failed.' : '' };
}

export async function updateReportStatus(id, status) {
  if (!supabase) return;
  const { error } = await supabase.from('ctzn_reports').update({ status }).eq('id', id);
  if (error) console.warn('ctzn: could not update report', error.message);
}

function fromRow(r) {
  const days = Math.max(1, Math.round((Date.now() - new Date(r.created_at).getTime()) / 86400000));
  return {
    id: r.id, cat: r.category, road: r.road_type, office: r.office, street: r.street, area: r.area,
    lat: r.lat, lng: r.lng, status: r.status, photo: r.photo_url, days, seen: r.confirmations || 0,
    description: r.description, state: r.report_state, lga: r.lga, publication: 'published',
  };
}

export async function fetchEvidence() {
  if (!supabase) return [];
  const { data, error } = await supabase.from('ctzn_report_evidence').select('*').eq('review_status', 'verified').order('created_at', { ascending: false }).limit(500);
  if (error) return [];
  return (data || []).map((row) => ({ id: row.id, reportId: row.report_id, contractor: row.contractor, authority: row.authority, reference: row.award_reference, claimedStatus: row.claimed_status, sourceType: row.source_type, url: row.source_url, sourceDate: row.source_date, note: row.note, reviewStatus: row.review_status, publication: 'published' }));
}

export async function saveEvidence(evidence) {
  if (!supabase || evidence.localOnly) return { ...evidence, reviewStatus: 'pending', publication: 'local' };
  const { error } = await supabase.from('ctzn_report_evidence').insert({ id: evidence.id, report_id: evidence.reportId, contractor: evidence.contractor, authority: evidence.authority, award_reference: evidence.reference, claimed_status: evidence.claimedStatus, source_type: evidence.sourceType, source_url: evidence.url, source_date: evidence.sourceDate, note: evidence.note, review_status: 'pending' });
  return { ...evidence, reviewStatus: 'pending', publication: error ? 'local' : 'published' };
}
