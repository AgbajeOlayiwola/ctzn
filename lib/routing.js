import { CATEGORIES, OFFICES, ROAD_TYPES } from './data';

export function categoryById(id) {
  return CATEGORIES.find((c) => c.id === id) || CATEGORIES[0];
}

export function roadById(id) {
  return ROAD_TYPES.find((r) => r.id === id) || ROAD_TYPES[0];
}

// Which office most likely answers for this report.
export function officeKeyFor(catId, roadId) {
  const cat = categoryById(catId);
  if (cat.byRoad) return roadById(roadId).office;
  return cat.office || 'unknown';
}

export function officeFor(catId, roadId) {
  return OFFICES[officeKeyFor(catId, roadId)] || OFFICES.unknown;
}

// OpenStreetMap road class -> our three road types.
export function roadTypeFromOsm(osmType) {
  if (['motorway', 'motorway_link', 'trunk', 'trunk_link'].includes(osmType)) return 'federal';
  if (['primary', 'primary_link', 'secondary', 'secondary_link', 'tertiary', 'tertiary_link'].includes(osmType)) return 'major';
  return 'inner';
}

// Ask OpenStreetMap what road is at this point. Returns null if it cannot tell.
export async function lookupRoad(lat, lng) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=17&lat=${lat}&lon=${lng}`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) return null;
    const d = await res.json();
    const a = d.address || {};
    return {
      street: a.road || d.name || '',
      area: a.suburb || a.city_district || a.county || a.city || '',
      roadType: d.category === 'highway' ? roadTypeFromOsm(d.type) : null,
    };
  } catch (e) {
    return null;
  }
}

export function complaintText(catId, roadId, street, area) {
  const cat = categoryById(catId);
  const where = street ? `${street}${area ? ', ' + area : ''}` : area || 'my area';
  const on = cat.byRoad ? ` on ${roadById(roadId).place}` : '';
  return `I am reporting ${cat.noun}${on} at ${where}. Please inspect and fix it. This report is public on ctzn and is counting the days it stays open.`;
}
