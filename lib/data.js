// Seed content for ctzn. Everything here is either sourced (see `source` fields)
// or clearly marked as sample data. Replace with database tables as they come online.

export const AREA = {
  lga: 'Shomolu',
  state: 'Lagos',
  ward: 'Ward F, Bajulaye / Fola Agoro',
  center: [6.5392, 3.3842],
};

export const NIGERIA_CENTER = [9.082, 8.6753];

// FAAC allocation to Shomolu LGA, 2026, in billions of naira.
export const ALLOCATION = {
  label: 'Allocated to Shomolu LGA, July 2026',
  latest: '₦2.47bn',
  total: '₦17.73bn from January to July 2026.',
  months: [
    { m: 'Jan', v: 2.391 }, { m: 'Feb', v: 3.8 }, { m: 'Mar', v: 2.01 }, { m: 'Apr', v: 1.887 },
    { m: 'May', v: 2.648 }, { m: 'Jun', v: 2.513 }, { m: 'Jul', v: 2.474 },
  ],
  source: 'Source: NBS FAAC reports, as compiled by The Guardian',
};

export const LOCAL_OFFICES = [
  { name: 'Somolu Local Government Secretariat', address: 'Durosinmi Street, off Oguntolu Street, Somolu', note: 'The Chairman and councillors sit here. Bring council matters here.' },
  { name: 'INEC Somolu LGA Office', address: '35 Salami Saibu Street (Pedro Road), Somolu', note: 'Voter registration and PVC issues.' },
];

const NOT_YET = 'Not yet added. Know it? Add it in the Play tab (+50 pts).';

// kind: boss (executive), law (legislator), min (minister)
export const CHAIN = [
  { tier: 'Federal level (Abuja)' },
  { id: 'pres', kind: 'boss', role: 'President', name: 'Bola Ahmed Tinubu', area: 'Federal Republic of Nigeria', verified: true,
    controls: 'Runs the Federal Government: federal highways, the military and police, and the national budget. He picks the ministers.',
    office: 'Presidential Villa (Aso Rock), Abuja', contact: 'statehouse.gov.ng', source: 'Source: State House' },
  { id: 'vp', kind: 'boss', role: 'Vice President', name: 'Kashim Shettima', area: 'Federal Republic of Nigeria', verified: true,
    controls: 'Deputy to the President and chairs the National Economic Council, where governors meet.',
    office: 'Presidential Villa (Aso Rock), Abuja', contact: 'statehouse.gov.ng', source: 'Source: State House' },
  { ministers: true },
  { id: 'sen', kind: 'law', role: 'Senator', name: 'Adetokunbo Abiru', area: 'Lagos East Senatorial District', verified: true,
    controls: 'Makes federal laws, votes on the federal budget and confirms federal appointments.',
    office: 'Main constituency office is in Ikorodu. There is a liaison office in Somolu, but its street address is not yet added.', contact: 'tokunboabiru.org', source: 'Source: INEC declaration, 2023' },
  { id: 'rep', kind: 'law', role: 'House of Representatives', name: 'Ademorin Kuye', area: 'Somolu Federal Constituency', verified: true,
    controls: 'Makes federal laws, votes on the federal budget and nominates constituency projects.',
    office: 'National Assembly Complex, Abuja. Somolu constituency office address not yet added.', contact: 'ademorinkuye.org and nass.gov.ng', source: 'Source: National Assembly profile' },
  { tier: 'State level (Alausa)' },
  { id: 'gov', kind: 'boss', role: 'Governor', name: 'Babajide Sanwo-Olu', area: 'Lagos State', verified: true,
    controls: 'Runs the state: state roads, state schools and hospitals, waste and water agencies, and the state budget.',
    office: 'The Secretariat, Obafemi Awolowo Way, Alausa, Ikeja', contact: 'info@lagosstate.gov.ng', source: 'Source: Lagos State Government' },
  { id: 'lsha', kind: 'law', role: 'State House of Assembly', name: 'Abiodun Orekoya', area: 'Somolu Constituency I', verified: true,
    controls: 'Makes Lagos State laws, approves the state budget and checks the governor.',
    office: 'Lagos State House of Assembly Complex, Alausa, Ikeja. Constituency office address not yet added.', contact: NOT_YET, source: 'Source: INEC declaration, 2023' },
  { tier: 'Local level (your area)' },
  { id: 'chair', kind: 'boss', role: 'Local Government Chairman', name: 'Lateef Ashimi', area: 'Shomolu Local Government', verified: true,
    controls: 'Runs the council: inner streets, gutters, markets, primary health centres and refuse at local level.',
    office: 'Somolu LG Secretariat, Durosinmi Street, off Oguntolu Street, Somolu', contact: 'Phone line ' + NOT_YET.toLowerCase(),
    source: 'Source: BusinessDay, 15 March 2026. Identifies Ashimi as chairman and AbdulHamed Salawu as his predecessor. Role listing checked 17 November 2026.', sourceUrl: 'https://businessday.ng/life/article/strengthening-local-governments-key-to-nigerias-development-ashimi/' },
  { id: 'cllr', kind: 'law', role: 'Councillor', name: 'Kehinde Jolaosho', area: 'Ward F, Bajulaye / Fola Agoro', verified: true,
    controls: 'Votes on council by-laws and the council budget. Your first contact for ward problems.',
    office: 'Legislative arm, Somolu LG Secretariat, Durosinmi Street, off Oguntolu Street, Somolu', contact: 'Phone line ' + NOT_YET.toLowerCase(),
    source: 'Source: LASIEC by-election result, 2026 (Peoples Gazette)' },
];

const MIN_OFFICE = 'Ministry headquarters, Abuja';
export const MINISTERS = [
  { id: 'm1', kind: 'min', role: 'Minister of Works', name: 'David Umahi', area: 'Federal roads and bridges', verified: true,
    controls: 'Builds and maintains federal highways. If the bad road is an expressway, it is this ministry.', office: 'Federal Ministry of Works headquarters, Abuja', contact: 'fmw.gov.ng', source: 'Source: Federal Ministry of Works, October 2026' },
  { id: 'm2', kind: 'min', role: 'Minister of Power', name: 'Joseph Tegbe', area: 'Electricity policy and the national grid', verified: true,
    controls: 'Sets federal electricity policy and oversees the grid. Your DisCo handles the supply on your street.', office: MIN_OFFICE, contact: NOT_YET, source: 'Source: State House, sworn in 8 June 2026' },
  { id: 'm3', kind: 'min', role: 'Minister of Finance', name: 'Taiwo Oyedele', area: 'Federal money and the economy', verified: true,
    controls: 'Oversees federal finances and the monthly sharing of Federation Account money.', office: MIN_OFFICE, contact: NOT_YET, source: 'Source: Channels TV, April 2026' },
  { id: 'm4', kind: 'min', role: 'Minister of Health', name: 'Muhammad Ali Pate', area: 'Health policy and federal hospitals', verified: true,
    controls: 'Sets national health policy and runs federal hospitals. Your primary health centre is under the council.', office: MIN_OFFICE, contact: NOT_YET, source: 'Source: federal cabinet list, 2026' },
  { id: 'm5', kind: 'min', role: 'Minister of Education', name: 'Tunji Alausa', area: 'Education policy and federal schools', verified: true,
    controls: 'Sets national education policy and runs federal schools and universities. Public primary schools are under state and council.', office: MIN_OFFICE, contact: NOT_YET, source: 'Source: federal cabinet list, 2026' },
  { id: 'm6', kind: 'min', role: 'Minister of Environment', name: 'Balarabe Abbas Lawal', area: 'Flooding, erosion and pollution', verified: true,
    controls: 'National policy on flooding, erosion and pollution.', office: MIN_OFFICE, contact: NOT_YET, source: 'Source: federal cabinet list, 2026' },
];

export const SENATE = {
  intro: 'Three senators for each state, one for the FCT. Senate President: Godswill Akpabio. Your senator: Adetokunbo Abiru (Lagos East).',
  items: [
    { id: 'n1', title: 'Your roads, light, schools: the budget', body: 'No federal money can be spent unless they approve it. On 31 March 2026 the Senate passed the 2026 budget of ₦68.3 trillion, up from the ₦58.47 trillion the President first asked for.', source: 'Source: NAN and Voice of Nigeria, March 2026' },
    { id: 'n2', title: 'Your vote: the election rules', body: 'They write the rules for 2027. In 2026 the Senate passed a new Electoral Act and rejected making electronic transmission of results compulsory.', source: 'Source: Peoples Gazette, 2026' },
    { id: 'n3', title: 'Your safety: state police', body: 'In 2026 the Senate passed the State Police constitution bill. It is not final: state assemblies must still agree before your state can have its own police.', source: 'Source: Voice of Nigeria and Arise News, 2026' },
    { id: 'n4', title: 'Your debt: loans', body: 'The President needs their approval before Nigeria borrows. In October 2026 he asked the National Assembly to approve $20.5 billion in external loans. You and your children pay it back.', source: 'Source: Premium Times via allAfrica, November 2026' },
    { id: 'n5', title: 'Your money apps: fintech rules', body: 'On 10 November 2026 the Senate passed a bill giving the Central Bank more power over big fintech companies, the apps many people use to send and save money.', source: 'Source: The Nigeria Lawyer, November 2026' },
    { id: 'n6', title: 'Who runs things: screening', body: 'Ministers, judges and service chiefs must pass Senate screening. In May 2026 the Senate cleared the new Minister of Power before he was sworn in.', source: 'Source: State House, June 2026' },
  ],
};

export const CATEGORIES = [
  { id: 'road', label: 'Bad road / pothole', sub: 'Damaged road surface', noun: 'a bad road with potholes', byRoad: true, group: 'road' },
  { id: 'drain', label: 'Blocked drain', sub: 'Drain not flowing', noun: 'a blocked drainage channel', byRoad: true, group: 'drain' },
  { id: 'flood', label: 'Flooding', sub: 'Standing water', noun: 'recurring flooding', byRoad: true, group: 'drain' },
  { id: 'dump', label: 'Refuse dump', sub: 'Waste piling up', noun: 'an illegal refuse dump', office: 'lawma', group: 'waste' },
  { id: 'power', label: 'Power outage / faulty transformer', sub: 'Long outage', noun: 'a faulty transformer and long power outage', office: 'disco', group: 'power' },
  { id: 'light', label: 'Streetlight', sub: 'Dark street at night', noun: 'broken streetlights', byRoad: true, group: 'power' },
  { id: 'water', label: 'No water / burst pipe', sub: 'No public water', noun: 'a burst pipe and no public water supply', office: 'water', group: 'other' },
  { id: 'phc', label: 'Health centre', sub: 'No drugs or staff', noun: 'a primary health centre without staff or drugs', office: 'lg', group: 'other' },
  { id: 'school', label: 'Public school', sub: 'Damaged classrooms', noun: 'a damaged public school building', office: 'subeb', group: 'other' },
  { id: 'project', label: 'Abandoned project', sub: 'Started, never finished', noun: 'an abandoned public project', office: 'unknown', group: 'other' },
];

export const ROAD_TYPES = [
  { id: 'inner', label: 'Inner street or close', place: 'an inner street', office: 'lg' },
  { id: 'major', label: 'Major road with bus routes', place: 'a major road', office: 'works' },
  { id: 'federal', label: 'Federal highway / expressway', place: 'a federal highway', office: 'ferma' },
];

// Who answers for what. `openId` links to a person in CHAIN / MINISTERS.
export const OFFICES = {
  lg: { name: 'Shomolu Local Government', who: 'Chairman, Shomolu Local Government: Lateef Ashimi', where: 'Somolu LG Secretariat, Durosinmi Street, off Oguntolu Street, Somolu', reach: 'Phone line not yet added. Visit the secretariat in person.', openId: 'chair' },
  works: { name: 'Lagos State public works', who: 'Lagos State Government (public works), under Governor Babajide Sanwo-Olu', where: 'The Secretariat, Obafemi Awolowo Way, Alausa, Ikeja', reach: 'info@lagosstate.gov.ng', openId: 'gov' },
  ferma: { name: 'FERMA (federal roads)', who: 'Federal Ministry of Works, under Minister David Umahi', where: 'Ministry headquarters, Abuja', reach: 'fmw.gov.ng', openId: 'm1' },
  lawma: { name: 'LAWMA (waste)', who: 'LAWMA, the Lagos State waste authority', where: 'Office address not yet added', reach: NOT_YET, openId: 'gov' },
  disco: { name: 'Your DisCo (electricity)', who: 'Your electricity distribution company first. If they ignore you, the regulator (NERC).', where: 'Your DisCo customer office, then the NERC Forum Office', reach: 'Get a complaint ticket number from the DisCo before you escalate.', openId: '' },
  water: { name: 'Lagos State water corporation', who: 'Lagos State water corporation', where: 'Office address not yet added', reach: NOT_YET, openId: 'gov' },
  subeb: { name: 'Lagos SUBEB (basic education)', who: 'Lagos State basic education board (SUBEB)', where: 'Office address not yet added', reach: NOT_YET, openId: 'gov' },
  unknown: { name: 'To be confirmed', who: 'Depends on who awarded the contract. ctzn checks the budget line.', where: 'Office address not yet added', reach: NOT_YET, openId: '' },
};

// Sample scoreboard starting points. Real scores come from verified fixes.
export const OFFICE_SCORES = [
  { key: 'lawma', pts: 1240, fixes: 21, days: 6 },
  { key: 'works', pts: 980, fixes: 15, days: 19 },
  { key: 'lg', pts: 860, fixes: 14, days: 16 },
  { key: 'disco', pts: 610, fixes: 10, days: 11 },
  { key: 'ferma', pts: 540, fixes: 8, days: 31 },
];

// Sample reports so the map is not empty. Coordinates are approximate.
export const SAMPLE_REPORTS = [
  { id: 's1', cat: 'road', street: 'Bajulaye Road', area: 'Shomolu', lat: 6.5375, lng: 3.383, days: 41, seen: 18, status: 'open', office: 'lg', sample: true },
  { id: 's2', cat: 'drain', street: 'Fola Agoro Street', area: 'Shomolu', lat: 6.533, lng: 3.38, days: 12, seen: 7, status: 'open', office: 'lg', sample: true },
  { id: 's3', cat: 'dump', street: 'Apata Street', area: 'Shomolu', lat: 6.536, lng: 3.387, days: 6, seen: 11, status: 'fixed', office: 'lawma', sample: true },
  { id: 's4', cat: 'power', street: 'Shipeolu Street', area: 'Shomolu', lat: 6.541, lng: 3.379, days: 19, seen: 23, status: 'open', office: 'disco', sample: true },
  { id: 'k1', cat: 'flood', street: 'Ogudu Road', area: 'Kosofe', lat: 6.5745, lng: 3.391, days: 27, seen: 14, status: 'open', office: 'works', sample: true },
  { id: 'u1', cat: 'road', street: 'Ogunlana Drive', area: 'Surulere', lat: 6.502, lng: 3.352, days: 22, seen: 12, status: 'open', office: 'works', sample: true },
  { id: 'i1', cat: 'drain', street: 'Toyin Street', area: 'Ikeja', lat: 6.5965, lng: 3.354, days: 17, seen: 10, status: 'open', office: 'lg', sample: true },
];

export const FILTERS = [
  { id: 'all', label: 'All' }, { id: 'road', label: 'Roads' }, { id: 'drain', label: 'Drains' },
  { id: 'waste', label: 'Waste' }, { id: 'power', label: 'Power' },
];

export const NEWS = [
  { id: 'w1', when: 'News · 10 November 2026', verdict: 'true', headline: 'Senate passes bill giving CBN more power over big fintech companies',
    what: 'The Senate passed the bill for third reading on Tuesday, 10 November 2026, after going through it clause by clause.',
    why: 'The passage is on record and was reported by legal and national news outlets. It still needs the House of Representatives and the President before it becomes law.', source: 'Source: The Nigeria Lawyer, November 2026' },
  { id: 'w2', when: 'Viral video · July 2026', verdict: 'false', headline: 'Video of armed men said to be behind insecurity in Nigeria',
    what: 'A Facebook post shared a video of armed men and claimed they are behind insecurity in Nigeria. Many people believed it and shared it.',
    why: 'Fact-checkers at DUBAWA traced the footage to Sudan and found no evidence linking it to Nigeria. Old or foreign videos with a new caption are one of the most common tricks.', source: 'Source: DUBAWA fact check, 26 July 2026' },
  { id: 'w3', when: 'News · 2026', verdict: 'partial', headline: 'Senate passes State Police bill',
    what: 'The Senate passed the constitution alteration bill to allow states to have their own police.',
    why: 'Passing the Senate is not the end. A constitution change must also pass the House of Representatives and be approved by state Houses of Assembly. So no state police yet.', source: 'Source: Voice of Nigeria and Arise News, 2026; 1999 Constitution, Section 9' },
];

export const CLAIMS = [
  { id: 'f1', truth: false, claim: 'Every local government now collects its money directly from Abuja.', why: 'Not yet. The Supreme Court ordered direct payment in July 2024, but two years later it is still not fully working nationwide and states still control council money in most places.', source: 'Source: The Guardian, 2026' },
  { id: 'f2', truth: true, claim: 'Lagos councils get more federal allocation than councils in other states.', why: 'Correct. In the first six months of 2026, the ten councils with the highest federal allocation in Nigeria were all in Lagos.', source: 'Source: The Guardian, from NBS FAAC data, 2026' },
  { id: 'f3', truth: false, claim: 'Your senator is supposed to fix the gutter on your street.', why: 'No. Senators make laws and can nominate constituency projects, but gutters and inner streets are the job of your local government council.', source: 'Source: 1999 Constitution, Fourth Schedule' },
  { id: 'f4', truth: true, claim: 'Nigeria got a new Minister of Power this year.', why: 'Correct. Adebayo Adelabu resigned in April 2026 and Joseph Tegbe was sworn in on 8 June 2026.', source: 'Source: State House, June 2026' },
];

export const QUIZ = {
  question: 'How much was allocated to Shomolu LGA in July 2026?',
  options: [{ id: 'a', label: '₦247 million' }, { id: 'b', label: '₦2.47 billion' }, { id: 'c', label: '₦24.7 billion' }],
  answer: 'b',
  reveal: 'It was ₦2.47bn.',
};

export const TASKS = [
  { id: 'chair-correction-2026', pts: 20, title: 'Read the Shomolu chairman correction', detail: 'Lateef Ashimi is listed as chairman. AbdulHamed Salawu is his predecessor. Read the dated report before recording that you reviewed the correction.', sourceUrl: 'https://businessday.ng/life/article/strengthening-local-governments-key-to-nigerias-development-ashimi/', cta: 'I reviewed the correction (+20 pts)', thanks: 'Correction reviewed. Points record your learning, not a vote to verify the official.' },
  { id: 't2', pts: 50, title: 'Somolu Constituency II: assembly member not yet mapped', detail: 'Be the first to add the name with a link to your source.', cta: 'Add entry (+50 pts)', thanks: 'Submitted. It goes live once someone else verifies it.' },
];

export const LEADERBOARD = [
  { name: 'Kosofe', pts: 4120 }, { name: 'Surulere', pts: 3980 }, { name: 'Shomolu', pts: 3890 }, { name: 'Ikeja', pts: 3610 },
];

export const SECTORS = [
  { id: 'bank', label: 'Bank or fintech', first: 'Complain to the bank or app in writing and ask for a tracking number. They are expected to resolve it within 2 weeks.', regTitle: 'Escalate to the Central Bank (CBN)', regBody: 'If the bank does not resolve it in time, write to the CBN Consumer Protection Department with your tracking number and evidence.', regContact: 'cpd@cbn.gov.ng' },
  { id: 'telecom', label: 'Telecom, airtime or data', first: 'Complain to the network first and collect a ticket number. You will need it for the next step.', regTitle: 'Escalate to the NCC', regBody: 'If the network does not fix it, the Nigerian Communications Commission takes it up as a second-level complaint.', regContact: 'Call 622 (toll-free). Lagos office: 9A Bankole Oki Street, Ikoyi' },
  { id: 'power', label: 'Electricity bill or meter', first: 'Complain to your DisCo customer care unit in writing and keep the ticket number. Billing and metering are the most common disputes.', regTitle: 'Escalate to NERC', regBody: 'If the DisCo does not resolve it, take it to the NERC Forum Office for your area. You can ask NERC to review a decision you disagree with.', regContact: 'NERC Forum Office contact not yet added' },
  { id: 'food', label: 'Food, drugs or cosmetics', first: 'Keep the product, the pack and the receipt. Complain to the seller or maker in writing.', regTitle: 'Report to NAFDAC', regBody: 'Fake, expired or unsafe food, drugs and cosmetics are for NAFDAC, which works with FCCPC on these cases.', regContact: 'NAFDAC complaint contact not yet added' },
  { id: 'shop', label: 'Online shopping or delivery', first: 'Message the seller in writing (email or in-app chat, not only a call). Screenshot the listing, the payment and the chat.', regTitle: 'No special regulator', regBody: 'There is no separate regulator for most shopping disputes, so go straight to FCCPC in the next step.', regContact: '' },
  { id: 'other', label: 'Something else', first: 'Complain to the business in writing first and give them a clear deadline. Keep receipts, photos and messages.', regTitle: 'Check for a sector regulator', regBody: 'Some sectors have their own regulator (airlines, insurance, pensions). If you are not sure, go straight to FCCPC in the next step.', regContact: '' },
];

export const LEGAL_HELP = [
  { name: 'Legal Aid Council of Nigeria', what: 'Federal body that gives free legal help to people who cannot afford a lawyer.', contact: '10 Okotie Eboh Road, South West Ikoyi · info@legalaidcouncil.gov.ng' },
  { name: 'Lagos Office of the Public Defender', what: 'Free legal advice and court representation for Lagos residents who cannot afford a lawyer.', contact: 'Contact not yet added' },
  { name: 'Lagos Citizens Mediation Centre', what: 'Free mediation to settle disputes without going to court.', contact: 'Contact not yet added' },
  { name: 'University law clinics and FIDA', what: 'Law faculty clinics and the women lawyers federation offer free advice in many cases.', contact: 'Contact not yet added' },
];
