import { NextApiRequest, NextApiResponse } from 'next';

// Verifies hail activity near a ZIP code on a given date using two free public sources:
// - zippopotam.us to geocode the ZIP
// - NOAA Storm Prediction Center daily storm reports CSV (no API key required)

const SEARCH_RADIUS_MI = 75;

async function geocodeZip(zip: string) {
  const zipRes = await fetch(`https://api.zippopotam.us/us/${zip}`);
  if (!zipRes.ok) return null;
  const zipData = await zipRes.json();
  const place = zipData.places?.[0];
  if (!place) return null;
  return {
    lat: parseFloat(place.latitude),
    lon: parseFloat(place.longitude),
    state: place['state abbreviation'] as string,
    name: `${place['place name']}, ${place['state abbreviation']}`,
  };
}

// Year mode: NWS Local Storm Reports archive (Iowa Environmental Mesonet),
// fetched per quarter for the ZIP's state, filtered to hail within radius.
async function yearSearch(res: NextApiResponse, zip: string, year: number) {
  const geo = await geocodeZip(zip);
  if (!geo) return res.status(400).json({ error: 'ZIP code not found' });

  const quarters = [
    [`${year}-01-01`, `${year}-04-01`],
    [`${year}-04-01`, `${year}-07-01`],
    [`${year}-07-01`, `${year}-10-01`],
    [`${year}-10-01`, `${year + 1}-01-01`],
  ];

  interface LsrFeature {
    properties: {
      type: string; magf: number | null; city: string; county: string;
      valid: string; lon: number; lat: number;
    };
  }

  const results = await Promise.all(quarters.map(async ([sts, ets]) => {
    const url = `https://mesonet.agron.iastate.edu/geojson/lsr.geojson?sts=${sts}T00:00Z&ets=${ets}T00:00Z&states=${geo.state}`;
    try {
      const r = await fetch(url);
      if (!r.ok) return [] as LsrFeature[];
      const data = await r.json();
      return (Array.isArray(data.features) ? data.features : []) as LsrFeature[];
    } catch { return [] as LsrFeature[]; }
  }));

  interface DayAgg { date: string; count: number; maxSize: number; minDist: number; maxCity: string; }
  const days = new Map<string, DayAgg>();

  for (const f of results.flat()) {
    const p = f.properties;
    if (p.type !== 'H') continue;
    if (typeof p.lat !== 'number' || typeof p.lon !== 'number') continue;
    const dist = haversineMiles(geo.lat, geo.lon, p.lat, p.lon);
    if (dist > YEAR_RADIUS_MI) continue;
    const date = String(p.valid || '').slice(0, 10);
    if (!date) continue;
    const size = Math.max(0, p.magf || 0);
    const agg = days.get(date) || { date, count: 0, maxSize: 0, minDist: 9999, maxCity: '' };
    agg.count += 1;
    if (size >= agg.maxSize) { agg.maxSize = size; agg.maxCity = p.city || ''; }
    agg.minDist = Math.min(agg.minDist, Math.round(dist));
    days.set(date, agg);
  }

  const sorted = [...days.values()].sort((a, b) => b.date.localeCompare(a.date));
  return res.status(200).json({
    zipName: geo.name, year, radiusMi: YEAR_RADIUS_MI, days: sorted,
  });
}

function haversineMiles(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 3958.8;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const YEAR_RADIUS_MI = 50;

export const config = { maxDuration: 60 };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { zip, date, year } = req.body as { zip?: string; date?: string; year?: string };
    if (!zip || !/^\d{5}$/.test(zip)) return res.status(400).json({ error: 'Enter a valid 5-digit ZIP code' });
    if (year) {
      const yr = parseInt(year, 10);
      if (isNaN(yr) || yr < 1995 || yr > 2100) return res.status(400).json({ error: 'Enter a valid year' });
      return yearSearch(res, zip, yr);
    }
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return res.status(400).json({ error: 'Enter a valid date' });

    // 1. Geocode ZIP
    const zipRes = await fetch(`https://api.zippopotam.us/us/${zip}`);
    if (!zipRes.ok) return res.status(400).json({ error: 'ZIP code not found' });
    const zipData = await zipRes.json();
    const place = zipData.places?.[0];
    if (!place) return res.status(400).json({ error: 'ZIP code not found' });
    const zipLat = parseFloat(place.latitude);
    const zipLon = parseFloat(place.longitude);
    const zipName = `${place['place name']}, ${place['state abbreviation']}`;

    // 2. Fetch SPC hail reports for that date (yymmdd)
    const [y, m, d] = date.split('-');
    const yymmdd = `${y.slice(2)}${m}${d}`;
    const csvRes = await fetch(`https://www.spc.noaa.gov/climo/reports/${yymmdd}_rpts_hail.csv`);
    if (!csvRes.ok) {
      return res.status(200).json({
        zipName, reports: [],
        note: 'No SPC report file for this date — reports exist for roughly 2004 onward.',
      });
    }
    const csv = await csvRes.text();
    const lines = csv.trim().split('\n').slice(1); // skip header

    const reports = lines
      .map(line => {
        const parts = line.split(',');
        if (parts.length < 7) return null;
        const [time, size, location, county, state, latS, lonS] = parts;
        const lat = parseFloat(latS);
        const lon = parseFloat(lonS);
        if (isNaN(lat) || isNaN(lon)) return null;
        const distanceMi = haversineMiles(zipLat, zipLon, lat, lon);
        if (distanceMi > SEARCH_RADIUS_MI) return null;
        return {
          time,                                   // UTC HHMM
          sizeIn: (parseInt(size, 10) || 0) / 100, // size is hundredths of an inch
          location, county, state,
          distanceMi: Math.round(distanceMi),
        };
      })
      .filter((r): r is NonNullable<typeof r> => r !== null)
      .sort((a, b) => a.distanceMi - b.distanceMi)
      .slice(0, 25);

    return res.status(200).json({ zipName, radiusMi: SEARCH_RADIUS_MI, reports });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
}
