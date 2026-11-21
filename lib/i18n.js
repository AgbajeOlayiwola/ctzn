// Interface strings. English is complete. Pidgin covers the main labels.
// Yoruba, Hausa and Igbo are DRAFTS and must be reviewed by native speakers before launch.

export const LANGS = [
  { id: 'en', label: 'English' },
  { id: 'pcm', label: 'Pidgin' },
  { id: 'yo', label: 'Yorùbá' },
  { id: 'ha', label: 'Hausa' },
  { id: 'ig', label: 'Igbo' },
];

const en = {
  nav_power: 'Leaders', nav_report: 'Report', nav_map: 'Map', nav_fact: 'Fact check', nav_play: 'Play',
  t_power: 'Who is in charge of your area', t_report: 'Report a problem', t_heat: 'Where the problems are',
  t_fact: 'True or false?', t_play: 'Play and earn',
  b_snap: 'Take or choose a photo', b_true: 'True', b_false: 'False', b_seen: 'I see it too +10',
  b_post: 'Post to the public map (+25 pts)', l_level: 'Level',
  levels: ['Newcomer', 'Street Smart', 'Area Champion', 'Legend'], note: '',
};

const DRAFT = (name) => `Draft ${name} for the main labels only. Needs review by a native speaker before launch.`;

export const T = {
  en,
  pcm: { ...en, nav_power: 'My Ogas', nav_report: 'Report am', nav_fact: 'Na true?', t_power: 'Who dey in charge of your area', t_report: 'Report am', t_heat: 'Where wahala plenty', t_fact: 'Na true or na lie?', b_snap: 'Snap or choose photo', b_true: 'Na true', b_false: 'Na lie', b_seen: 'I see am too +10', b_post: 'Post am for everybody to see (+25 pts)', levels: ['JJC', 'Street Sabi', 'Area Champion', 'Odogwu'], note: 'Pidgin dey cover the main labels for now. The rest still dey English.' },
  yo: { ...en, nav_power: 'Àwọn Olórí', nav_report: 'Fẹjọ́ sùn', nav_map: 'Máàpù', nav_fact: 'Òótọ́ ni?', nav_play: 'Ṣeré', t_power: 'Ta ló ń ṣàkóso àdúgbò rẹ', t_report: 'Fi ìṣòro tó wa létí', t_heat: 'Ibi tí ìṣòro pọ̀ sí', t_fact: 'Òótọ́ ni tàbí irọ́?', t_play: 'Ṣeré kí o sì jèrè', b_snap: 'Ya fọ́tò tàbí yan ọ̀kan', b_true: 'Òótọ́', b_false: 'Irọ́', b_seen: 'Èmi náà rí i +10', b_post: 'Fi sí máàpù gbogbo ènìyàn (+25)', l_level: 'Ìpele', note: DRAFT('Yorùbá') },
  ha: { ...en, nav_power: 'Shugabanni', nav_report: 'Kai rahoto', nav_map: 'Taswira', nav_fact: 'Gaskiya ne?', nav_play: 'Wasa', t_power: 'Wa ke kula da yankinka', t_report: 'Kai rahoton matsala', t_heat: 'Inda matsaloli suka fi yawa', t_fact: 'Gaskiya ko ƙarya?', t_play: 'Yi wasa ka samu maki', b_snap: 'ɗauki hoto ko zaɓi ɗaya', b_true: 'Gaskiya', b_false: 'Ƙarya', b_seen: 'Ni ma na gani +10', b_post: "Saka a taswirar jama'a (+25)", l_level: 'Mataki', note: DRAFT('Hausa') },
  ig: { ...en, nav_power: 'Ndị Ndú', nav_report: 'Kọọ akụkọ', nav_map: 'Maapụ', nav_fact: 'Ọ bụ eziokwu?', nav_play: 'Egwu', t_power: 'Onye na-achị mpaghara gị', t_report: 'Kọọ nsogbu', t_heat: 'Ebe nsogbu kacha', t_fact: 'Eziokwu ka ọ bụ ụgha?', t_play: 'Gwuo egwu nweta akara', b_snap: 'Se foto ma ọ bụ họrọ otu', b_true: 'Eziokwu', b_false: 'Ụgha', b_seen: 'Ahụkwara m ya +10', b_post: 'Tinye na maapụ ọha (+25)', l_level: 'Ọkwa', note: DRAFT('Igbo') },
};

export function strings(lang) {
  return T[lang] || T.en;
}
