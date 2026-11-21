export const ACCOUNTABILITY_SOURCES = {
  lawma: { title: 'LAWMA: legal mandate', url: 'https://lawma.gov.ng/home/about-us/' },
  contact: { title: 'LAWMA: official complaints contacts', url: 'https://lawma.gov.ng/contact/' },
  psp: { title: 'LAWMA: domestic and commercial PSP directory (2024)', url: 'https://www.lawma.gov.ng/wp-content/uploads/2024/01/Domestic-and-Commercial-PSP-Operators.pdf' },
  oversight: { title: 'Lagos State: Environment Commissioner Tokunbo Wahab (February 2026)', url: 'https://lagosstate.gov.ng/news/all/view/698f524588319a643b7b850b' },
  procurement: { title: 'Lagos Public Procurement Agency', url: 'https://lagosppa.gov.ng/' },
};

export function responsibilityFor(category, road, state, lga = '') {
  if (!state) return { agency: 'Confirm the report state first', summary: 'Responsibility depends on where the issue is and which authority owns the asset.', chain: [], sources: [] };
  if (state !== 'Lagos') return { agency: 'Local agency not yet mapped', summary: `The agency directory does not yet cover ${state}. Your issue can still be recorded; we will not send it to a Lagos agency.`, chain: [], sources: [] };
  if (category === 'dump') return {
    agency: 'Lagos Waste Management Authority (LAWMA)', email: 'info@lawma.gov.ng', phone: '+2347080601020', office: 'No. 3 Iddo Yard, Ijora Olopa, Lagos',
    summary: 'LAWMA is a public authority. Private PSP operators collect waste under its oversight. The assigned operator for this particular street must be confirmed from your bill or the official directory.',
    chain: ['Assigned private PSP operator — street assignment not yet confirmed', 'LAWMA — complaints, coordination and regulation', 'Lagos Ministry of the Environment and Water Resources — Commissioner Tokunbo Wahab (official source dated February 2026)', 'Lagos State Government — Governor Babajide Sanwo-Olu'],
    sources: Object.values(ACCOUNTABILITY_SOURCES).slice(0, 4), checked: '2026-11-17',
  };
  if (['road', 'drain', 'flood', 'light'].includes(category)) {
    const agency = road === 'federal' ? 'Federal Ministry of Works / FERMA — confirm asset ownership' : road === 'major' ? 'Lagos State Ministry of Works and Infrastructure / Public Works — confirm asset ownership' : `${lga || 'Local government'} council — confirm the street and drainage asset owner`;
    return { agency, summary: 'This is an initial routing estimate. Road size and map classifications do not prove ownership. A contract award or agency record is needed to identify the procuring authority and contractor.', chain: ['Contractor — not identified until a matching award or contract is sourced', agency, road === 'federal' ? 'Federal Government — responsible ministry' : 'Lagos State Government / relevant local council'], sources: [ACCOUNTABILITY_SOURCES.procurement] };
  }
  const agency = { power: 'Your electricity distribution company, then NERC', water: 'Lagos Water Corporation — confirm the network owner', phc: `${lga || 'Local government'} primary healthcare authority`, school: 'Lagos SUBEB / relevant education authority', project: 'Procuring ministry or council — contract not yet identified' }[category] || 'Agency to be confirmed';
  return { agency, summary: 'Confirm the service provider and asset owner before escalation. A contractor and a government supervisor have different responsibilities.', chain: ['Service provider or contractor — confirm identity', agency, 'Responsible government department or regulator'], sources: [] };
}

export function complaintEmail(report, responsibility) {
  if (!responsibility.email) return null;
  const subject = `ctzn report ${report.id}: ${report.street || 'Public service issue'}`;
  const body = [`Please investigate this resident-reported issue.`, `Reference: ${report.id}`, `Issue: ${report.description || report.cat}`, `Location: ${report.street}, ${report.area}${report.state ? ', ' + report.state : ''}`, `Google Maps: https://www.google.com/maps/search/?api=1&query=${report.lat},${report.lng}`, 'Please acknowledge receipt, confirm the responsible operator and provide a complaint reference and expected next action.', 'The issue is a resident observation; contractor identity and project status are not independently verified.'].join('\n\n');
  return { recipient: responsibility.email, subject, body, href: `mailto:${responsibility.email}?${new URLSearchParams({ subject, body }).toString().replace(/\+/g, '%20')}` };
}
