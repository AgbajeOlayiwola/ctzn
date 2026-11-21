// Wikimedia Commons file pages contain the original source and reuse terms.
const portrait = (file, name, author) => ({
  name,
  author,
  src: `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}`,
  source: `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(file.replaceAll(' ', '_'))}`,
});

export const PORTRAITS = {
  pres: portrait('Bola A Tinubu presidential portrait 2023.jpg', 'Bola Ahmed Tinubu', 'Nosa Asemota'),
  vp: portrait('Kashim Shettima office portrait.jpg', 'Kashim Shettima', 'Nosa23'),
  gov: portrait('Babajide sanwo olu official portrait.jpg', 'Babajide Sanwo-Olu', 'Ademola Olaniran'),
  sen: portrait('Tokunbo Abiru.jpg', 'Adetokunbo Abiru', 'Nnamdiabana'),
};
