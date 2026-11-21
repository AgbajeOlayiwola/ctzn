export const STATES = ['Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'Federal Capital Territory', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'];

export function areaCoverage(area) {
  const lagos = area?.state === 'Lagos';
  const somolu = lagos && /^(shomolu|somolu)$/i.test(area?.lga?.trim() || '');
  return { lagos, somolu, ward: somolu && area?.ward === 'F' };
}

export function representativeMatches(person, area) {
  const coverage = areaCoverage(area);
  if (['pres', 'vp'].includes(person.id) || person.kind === 'min') return true;
  if (person.id === 'gov') return coverage.lagos;
  if (person.id === 'cllr') return coverage.ward;
  // Somolu has two assembly constituencies; Ward F is in the mapped constituency.
  if (person.id === 'lsha') return coverage.ward;
  return coverage.somolu;
}
