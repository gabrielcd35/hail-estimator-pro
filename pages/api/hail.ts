import { NextApiRequest, NextApiResponse } from 'next';

// Verifies hail activity near a ZIP code on a given date using two free public sources:
// - zippopotam.us to geocode the ZIP
// - NOAA Storm Prediction Center daily storm reports CSV (no API key required)

const SEARCH_RADIUS_MI = 75;

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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { zip, date } = req.body as { zip?: string; date?: string };
    if (!zip || !/^\d{5}$/.test(zip)) return res.status(400).json({ error: 'Enter a valid 5-digit ZIP code' });
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
