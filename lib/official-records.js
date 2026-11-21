export const RECORD_SOURCE_TYPES = {
  official: { label: 'Official record', description: 'Government, parliamentary or electoral material. An official biography is not an independent credential audit.' },
  news: { label: 'News report', description: 'Reporting or an independent investigation. Attribution, disputes and limits remain visible.' },
  self: { label: 'Their own account', description: 'A claim by the politician, their office or campaign, including interviews republished by newspapers. Not independently confirmed by ctzn.' },
};

export const RECORDS_CHECKED = '2026-11-17';
const source = (publisher, url) => ({ publisher, url });
const ashimi = source('BusinessDay · interview, 15 March 2026', 'https://businessday.ng/life/article/strengthening-local-governments-key-to-nigerias-development-ashimi/');
const nass = source('National Assembly · member profile', 'https://nass.gov.ng/mps/single/157');
const lagos = source('Lagos State · governor biography', 'https://lagosstate.gov.ng/government/elected_officials/governor/view');

export const OFFICIAL_RECORDS = {
  pres: {
    background: [
      { kind: 'official', text: 'The State House biography lists work in accounting at Mobil and service as Lagos governor from 1999 to 2007.', source: source('State House · presidential biography', 'https://statehouse.gov.ng/team/bola-ahmed-tinubu/') },
      { kind: 'news', text: 'Tribune reports that his INEC filing lists a 1979 B.Sc. in Business Administration from Chicago State University. This describes the reported filing, not an independent audit of all schooling claims.', source: source('Nigerian Tribune · credentials reporting', 'https://tribuneonlineng.com/2027-inec-displays-tinubu-shettimas-credentials-ahead-of-general-election/amp/') },
    ],
    items: [{ id: 'tinubu-credentials', date: '2023-10-05', dateLabel: 'Reported', kind: 'news', title: 'Education-record dispute reported during election litigation', text: 'AP reported allegations by Atiku Abubakar over the diploma submitted to INEC. The report also describes university confirmation that Tinubu graduated in 1979. Allegations and a confirmed graduation are different questions; this entry does not establish forgery.', source: source('Associated Press', 'https://apnews.com/article/ba0fd3483678b84747bd38aba53d5bf9') }],
  },
  vp: {
    background: [{ kind: 'official', text: 'The State House lists degrees in Agricultural Economics from the University of Maiduguri and the University of Ibadan, a banking career, two terms as Borno governor (2011–2019), and service as Borno Central senator before becoming Vice President.', source: source('State House · vice-presidential biography', 'https://statehouse.gov.ng/team/kashim-shettima/') }],
    items: [],
  },
  sen: {
    background: [{ kind: 'self', text: 'His own biography lists an Economics degree from Lagos State University, professional accountancy qualifications and a banking career. These credentials have not been independently audited here.', source: source('Tokunbo Abiru · personal biography', 'https://tokunboabiru.org/about/') }],
    items: [
      { id: 'abiru-classrooms', date: '2024-10-22', dateLabel: 'Reported', kind: 'news', title: 'Wright Memorial School classroom project reported commissioned', text: 'Western Post reported the handover of 22 classrooms at Wright Memorial Nursery and Primary School, Somolu, facilitated through the office of the presidential adviser on SDGs. The article credits Abiru with facilitation, not personally building or funding the school.', context: 'News coverage of a commissioning is not a ctzn site inspection or a finding about the classrooms’ current condition.', stage: 'Commissioning reported', source: source('Western Post · Adekunle Okunade', 'https://www.westernpost.ng/abiru-delivers-22-classrooms-40-bed-phc-modern-medical-equipment-to-lagos-east-constituents/') },
      { id: 'abiru-bills', date: '2022-05-02', dateLabel: 'Speech date', kind: 'self', title: 'Reported 13 bills sponsored and three co-sponsored', text: 'In a constituency speech reproduced by The Impact, Abiru said he had sponsored 13 private member bills and co-sponsored three. This is his historical count from that speech, not a current independently verified total.', context: 'Sponsorship and first reading do not establish enactment or impact. The record here does not confirm how many became law.', stage: 'Self-reported legislative activity', source: source('The Impact · speech published 4 May 2022', 'https://www.theimpactnewspaper.com/2022/05/04/eid-el-fitr-senator-tokunbo-abiru-celebrates-with-leaders-presents-outstanding-achievements-in-16-months/') },
    ],
  },
  rep: {
    background: [{ kind: 'official', text: 'His National Assembly profile lists previous service as Somolu executive secretary and chairman, Lagos commissioner for local government and chieftaincy affairs, and a federal arbitrator at the Industrial Arbitration Panel. The profile does not give dates for these roles.', source: nass }],
    items: [{ id: 'kuye-fmc', date: '2023-07-11', dateLabel: 'Proceedings date', kind: 'official', title: 'Federal Medical Centre, Kosofe bill introduced', text: 'The Federal Ministry of Information’s plenary summary records the Federal Medical Centre, Kosofe, Lagos State (Establishment) Bill, 2023 (HB.54), sponsored by Ademorin Kuye, at first reading.', stage: 'First reading only', context: 'This source establishes introduction, not enactment, funding or the delivery of a hospital. Later progress has not been established in this record.', source: source('Federal Ministry of Information · plenary summary', 'https://fmino.gov.ng/summary-of-plenary-proceedings-of-the-house-of-representatives-for-tuesday-july-11th-2023/') }],
  },
  gov: {
    background: [{ kind: 'official', text: 'The Lagos State biography lists a Surveying and Geo-Informatics degree and an MBA from the University of Lagos, a private-sector career, commissioner appointments and leadership of the state property development corporation.', source: lagos }],
    items: [{ id: 'sanwo-lekki', date: '2020-10-20', dateLabel: 'Event date', kind: 'news', title: 'Lekki toll gate shooting during his governorship', text: 'Amnesty International’s investigation, published 28 October 2020, describes soldiers opening fire on EndSARS protesters at Lekki toll gate. This is a significant public-accountability event during Sanwo-Olu’s tenure.', context: 'The army is a federal institution. This entry does not establish that the governor ordered the shooting or determine individual legal responsibility.', source: source('Amnesty International · investigative timeline', 'https://www.amnesty.org/en/latest/news/2020/10/nigeria-authorities-must-stop-attempts-to-cover-up-lekki-toll-gate-massacre-new-investigative-timeline-2/') }],
  },
  lsha: {
    background: [{ kind: 'news', text: 'Ikeja Record’s 14 October 2024 profile describes an HND in electrical/electronics engineering from Yaba College of Technology, engineering work and chairmanship of the Assembly committee on youth, sports and social development. That committee description is dated, not a guarantee of the current assignment.', source: source('Ikeja Record · legislative profile', 'https://www.ikejarecord.com/p/legislative-profile-abiodun-orekoya') }],
    items: [],
  },
  chair: {
    background: [{ kind: 'news', text: 'BusinessDay identifies Lateef Ashimi as Somolu chairman and describes earlier service as education adviser under AbdulHamed Salawu and as Ward B councillor. Salawu is the predecessor, not the current chairman in this listing.', source: ashimi }],
    items: [{ id: 'ashimi-interview', date: '2026-03-15', dateLabel: 'Interview published', kind: 'self', title: 'Described road, lighting and welfare activity', text: 'Ashimi told BusinessDay that his administration had commissioned roads, begun Light Up Somolu and made repeated cash-palliative distributions. Those statements are his own account, even though published by a newspaper.', context: 'Project completion, beneficiary counts and spending have not been independently verified here.', source: ashimi }],
  },
  cllr: { background: [], items: [] },
};

export function validateOfficialSuggestion(entry, today = new Date(Date.now() + 3600000).toISOString().slice(0, 10)) {
  if (!Object.hasOwn(OFFICIAL_RECORDS, entry.officialId)) return 'Choose a listed elected official.';
  if (!entry.title?.trim() || entry.title.length > 160 || !entry.summary?.trim() || entry.summary.length > 1200) return 'Add a title and a short factual summary.';
  if (!Object.hasOwn(RECORD_SOURCE_TYPES, entry.claimedKind)) return 'Choose a source type.';
  try { const url = new URL(entry.url); if (url.protocol !== 'https:' || url.username || url.password) return 'Use a public HTTPS source link.'; } catch { return 'Enter a valid source link.'; }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(entry.date) || !Number.isFinite(Date.parse(entry.date)) || new Date(entry.date).toISOString().slice(0, 10) !== entry.date || entry.date > today) return 'Choose a valid source date that is not in the future.';
  return '';
}
