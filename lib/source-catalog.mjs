export const NIGERIA_SCOPES = ['Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'Federal Capital Territory', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'];

export const SOURCE_DIRECTORY = [
  { name: 'INEC', type: 'Official record', url: 'https://www.inecnigeria.org/', purpose: 'Election information; confirm constituencies and declarations.' },
  { name: 'National Assembly', type: 'Official record', url: 'https://nass.gov.ng/', purpose: 'Member profiles, bills and proceedings.' },
  { name: 'Federal Ministry of Information', type: 'Official record', url: 'https://fmino.gov.ng/', purpose: 'Government announcements and records; distinguish statements from independently verified outcomes.' },
  { name: 'Bureau of Public Procurement', type: 'Official record', url: 'https://www.bpp.gov.ng/', purpose: 'Federal procurement information.' },
  { name: 'National Bureau of Statistics', type: 'Official record', url: 'https://www.nigerianstat.gov.ng/', purpose: 'Published statistics; check the period and methodology.' },
  { name: 'DUBAWA', type: 'Fact-checker', url: 'https://dubawa.org/', purpose: 'Published claim checks. Coverage and ratings belong to the publisher.' },
  { name: 'The FactCheckHub', type: 'Fact-checker', url: 'https://factcheckhub.com/', purpose: 'Published claim checks. Missing structured ratings remain unverified in ctzn.' },
  { name: 'Africa Check · Nigeria', type: 'Fact-checker', url: 'https://africacheck.org/fact-checks?field_country_value=NG', purpose: 'Nigeria checks and explainers; reference directory, not automatically scraped.' },
  { name: 'GST', type: 'News and video', url: 'https://www.wearegst.com/', purpose: 'Video reporting can be submitted with its original link, date and timestamp. No automated video transcription is configured.' },
];

export const CRAWL_SOURCES = [
  { id: 'channels', name: 'Channels Television', kind: 'news', url: 'https://www.channelstv.com/feed/', scope: 'National' },
  { id: 'premiumtimes', name: 'Premium Times', kind: 'news', url: 'https://www.premiumtimesng.com/feed/', scope: 'National' },
  { id: 'fmino', name: 'Federal Ministry of Information', kind: 'official', url: 'https://fmino.gov.ng/feed/', scope: 'National' },
  { id: 'dubawa', name: 'DUBAWA', kind: 'factcheck', url: 'https://dubawa.org/feed/', scope: 'National' },
  { id: 'factcheckhub', name: 'The FactCheckHub', kind: 'factcheck', url: 'https://factcheckhub.com/feed/', scope: 'National' },
  ...NIGERIA_SCOPES.map((state) => ({
    id: `state-${state.toLowerCase().replaceAll(' ', '-')}`, name: `Bing News RSS · ${state}`, kind: 'search', scope: state,
    url: `https://www.bing.com/news/search?${new URLSearchParams({ q: `Nigeria "${state === 'Federal Capital Territory' ? 'Abuja' : state}" (government OR roads OR education OR health OR policy)`, format: 'rss', setlang: 'en' })}`,
  })),
];
