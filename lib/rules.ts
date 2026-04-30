// PDR Matrix - USAA 2025
// Panels x Dent Count Ranges x Avg Size

export const PDR_MATRIX: Record<string, Record<string, Record<string, number | 'MCA'>>> = {
  Hood: {
    '1-5':    { Dime: 80,  NKL: 100, QTR: 125, Half: 150 },
    '6-15':   { Dime: 125, NKL: 175, QTR: 200, Half: 250 },
    '16-30':  { Dime: 200, NKL: 225, QTR: 275, Half: 350 },
    '31-50':  { Dime: 300, NKL: 350, QTR: 425, Half: 500 },
    '51-75':  { Dime: 375, NKL: 400, QTR: 500, Half: 625 },
    '76-100': { Dime: 450, NKL: 550, QTR: 650, Half: 750 },
    '101-150':{ Dime: 550, NKL: 650, QTR: 750, Half: 850 },
    '151-200':{ Dime: 650, NKL: 800, QTR: 950, Half: 'MCA' },
    '201-300':{ Dime: 725, NKL: 825, QTR: 'MCA', Half: 'MCA' },
    '301-400':{ Dime: 'MCA', NKL: 'MCA', QTR: 'MCA', Half: 'MCA' },
  },
  Roof: {
    '1-5':    { Dime: 100,  NKL: 125, QTR: 150,  Half: 200  },
    '6-15':   { Dime: 175,  NKL: 225, QTR: 250,  Half: 325  },
    '16-30':  { Dime: 250,  NKL: 300, QTR: 350,  Half: 425  },
    '31-50':  { Dime: 375,  NKL: 425, QTR: 525,  Half: 600  },
    '51-75':  { Dime: 475,  NKL: 550, QTR: 675,  Half: 800  },
    '76-100': { Dime: 575,  NKL: 675, QTR: 800,  Half: 900  },
    '101-150':{ Dime: 650,  NKL: 750, QTR: 950,  Half: 1100 },
    '151-200':{ Dime: 850,  NKL: 1000,QTR: 1250, Half: 1500 },
    '201-300':{ Dime: 1075, NKL: 1275,QTR: 1500, Half: 1775 },
    '301-400':{ Dime: 1225, NKL: 1625,QTR: 2025, Half: 'MCA'},
  },
  'Roof Rail': {
    '1-5':    { Dime: 85,  NKL: 100, QTR: 125, Half: 150 },
    '6-15':   { Dime: 125, NKL: 150, QTR: 175, Half: 225 },
    '16-30':  { Dime: 200, NKL: 250, QTR: 275, Half: 325 },
    '31-50':  { Dime: 300, NKL: 400, QTR: 500, Half: 575 },
    '51-75':  { Dime: 400, NKL: 500, QTR: 600, Half: 700 },
    '76-100': { Dime: 550, NKL: 650, QTR: 750, Half: 850 },
    '101-150':{ Dime: 625, NKL: 725, QTR: 825, Half: 'MCA'},
    '151-200':{ Dime: 'MCA', NKL: 'MCA', QTR: 'MCA', Half: 'MCA' },
    '201-300':{ Dime: 'MCA', NKL: 'MCA', QTR: 'MCA', Half: 'MCA' },
    '301-400':{ Dime: 'MCA', NKL: 'MCA', QTR: 'MCA', Half: 'MCA' },
  },
  'Deck Lid/Gate': {
    '1-5':    { Dime: 80,  NKL: 100, QTR: 125, Half: 150 },
    '6-15':   { Dime: 125, NKL: 150, QTR: 200, Half: 250 },
    '16-30':  { Dime: 175, NKL: 225, QTR: 275, Half: 300 },
    '31-50':  { Dime: 275, NKL: 325, QTR: 400, Half: 475 },
    '51-75':  { Dime: 400, NKL: 450, QTR: 500, Half: 600 },
    '76-100': { Dime: 450, NKL: 550, QTR: 650, Half: 750 },
    '101-150':{ Dime: 550, NKL: 650, QTR: 750, Half: 850 },
    '151-200':{ Dime: 650, NKL: 750, QTR: 850, Half: 'MCA'},
    '201-300':{ Dime: 725, NKL: 825, QTR: 'MCA', Half: 'MCA' },
    '301-400':{ Dime: 'MCA', NKL: 'MCA', QTR: 'MCA', Half: 'MCA' },
  },
  Quarter: {
    '1-5':    { Dime: 80,  NKL: 100, QTR: 125, Half: 150 },
    '6-15':   { Dime: 125, NKL: 150, QTR: 175, Half: 200 },
    '16-30':  { Dime: 175, NKL: 225, QTR: 250, Half: 300 },
    '31-50':  { Dime: 275, NKL: 325, QTR: 400, Half: 475 },
    '51-75':  { Dime: 325, NKL: 375, QTR: 450, Half: 525 },
    '76-100': { Dime: 400, NKL: 475, QTR: 500, Half: 625 },
    '101-150':{ Dime: 'MCA', NKL: 'MCA', QTR: 'MCA', Half: 'MCA' },
    '151-200':{ Dime: 'MCA', NKL: 'MCA', QTR: 'MCA', Half: 'MCA' },
    '201-300':{ Dime: 'MCA', NKL: 'MCA', QTR: 'MCA', Half: 'MCA' },
    '301-400':{ Dime: 'MCA', NKL: 'MCA', QTR: 'MCA', Half: 'MCA' },
  },
  Door: {
    '1-5':    { Dime: 80,  NKL: 100, QTR: 125, Half: 150 },
    '6-15':   { Dime: 125, NKL: 150, QTR: 175, Half: 200 },
    '16-30':  { Dime: 175, NKL: 225, QTR: 250, Half: 300 },
    '31-50':  { Dime: 275, NKL: 300, QTR: 350, Half: 375 },
    '51-75':  { Dime: 325, NKL: 375, QTR: 425, Half: 475 },
    '76-100': { Dime: 'MCA', NKL: 'MCA', QTR: 'MCA', Half: 'MCA' },
    '101-150':{ Dime: 'MCA', NKL: 'MCA', QTR: 'MCA', Half: 'MCA' },
    '151-200':{ Dime: 'MCA', NKL: 'MCA', QTR: 'MCA', Half: 'MCA' },
    '201-300':{ Dime: 'MCA', NKL: 'MCA', QTR: 'MCA', Half: 'MCA' },
    '301-400':{ Dime: 'MCA', NKL: 'MCA', QTR: 'MCA', Half: 'MCA' },
  },
  Fender: {
    '1-5':    { Dime: 80,  NKL: 100, QTR: 125, Half: 150 },
    '6-15':   { Dime: 125, NKL: 150, QTR: 175, Half: 200 },
    '16-30':  { Dime: 175, NKL: 225, QTR: 275, Half: 300 },
    '31-50':  { Dime: 275, NKL: 300, QTR: 350, Half: 375 },
    '51-75':  { Dime: 325, NKL: 375, QTR: 450, Half: 525 },
    '76-100': { Dime: 'MCA', NKL: 'MCA', QTR: 'MCA', Half: 'MCA' },
    '101-150':{ Dime: 'MCA', NKL: 'MCA', QTR: 'MCA', Half: 'MCA' },
    '151-200':{ Dime: 'MCA', NKL: 'MCA', QTR: 'MCA', Half: 'MCA' },
    '201-300':{ Dime: 'MCA', NKL: 'MCA', QTR: 'MCA', Half: 'MCA' },
    '301-400':{ Dime: 'MCA', NKL: 'MCA', QTR: 'MCA', Half: 'MCA' },
  },
  Cowl: {
    '1-5':    { Dime: 100, NKL: 125, QTR: 150, Half: 175 },
    '6-15':   { Dime: 150, NKL: 175, QTR: 200, Half: 225 },
    '16-30':  { Dime: 200, NKL: 225, QTR: 250, Half: 275 },
    '31-50':  { Dime: 'MCA', NKL: 'MCA', QTR: 'MCA', Half: 'MCA' },
    '51-75':  { Dime: 'MCA', NKL: 'MCA', QTR: 'MCA', Half: 'MCA' },
    '76-100': { Dime: 'MCA', NKL: 'MCA', QTR: 'MCA', Half: 'MCA' },
    '101-150':{ Dime: 'MCA', NKL: 'MCA', QTR: 'MCA', Half: 'MCA' },
    '151-200':{ Dime: 'MCA', NKL: 'MCA', QTR: 'MCA', Half: 'MCA' },
    '201-300':{ Dime: 'MCA', NKL: 'MCA', QTR: 'MCA', Half: 'MCA' },
    '301-400':{ Dime: 'MCA', NKL: 'MCA', QTR: 'MCA', Half: 'MCA' },
  },
  'Cab Corner': {
    '1-5':    { Dime: 80,  NKL: 100, QTR: 125, Half: 150 },
    '6-15':   { Dime: 125, NKL: 150, QTR: 175, Half: 200 },
    '16-30':  { Dime: 175, NKL: 225, QTR: 250, Half: 300 },
    '31-50':  { Dime: 225, NKL: 250, QTR: 300, Half: 375 },
    '51-75':  { Dime: 'MCA', NKL: 'MCA', QTR: 'MCA', Half: 'MCA' },
    '76-100': { Dime: 'MCA', NKL: 'MCA', QTR: 'MCA', Half: 'MCA' },
    '101-150':{ Dime: 'MCA', NKL: 'MCA', QTR: 'MCA', Half: 'MCA' },
    '151-200':{ Dime: 'MCA', NKL: 'MCA', QTR: 'MCA', Half: 'MCA' },
    '201-300':{ Dime: 'MCA', NKL: 'MCA', QTR: 'MCA', Half: 'MCA' },
    '301-400':{ Dime: 'MCA', NKL: 'MCA', QTR: 'MCA', Half: 'MCA' },
  },
};

// Roof Rail aliases — the CCC often uses different names
export const ROOF_RAIL_ALIASES = [
  'roof rail', 'rock rail', 'rock pillar', 'drip rail', 'drip molding rail',
  'side rail', 'roof side rail', 'rocker rail upper', 'cant rail',
];

// Vehicle types that get +25% on Roof PDR
export const ROOF_25_VEHICLE_TYPES = [
  'suv', 'utv', 'van', 'minivan', 'mini van', 'wagon', 'truck', 'pickup',
  'odyssey', 'sienna', 'caravan', 'suburban', 'tahoe', 'yukon', 'explorer',
  'pilot', 'highlander', 'pathfinder', 'traverse', 'expedition', 'sequoia',
  'armada', 'durango', 'ascent', 'atlas', 'telluride', 'palisade', 'cx-9',
  'cx-5', '4runner', 'land cruiser', 'range rover', 'defender',
];

export function getDentRange(count: number): string {
  if (count <= 5) return '1-5';
  if (count <= 15) return '6-15';
  if (count <= 30) return '16-30';
  if (count <= 50) return '31-50';
  if (count <= 75) return '51-75';
  if (count <= 100) return '76-100';
  if (count <= 150) return '101-150';
  if (count <= 200) return '151-200';
  if (count <= 300) return '201-300';
  return '301-400';
}

export function lookupMatrix(
  panel: string,
  dentCount: number,
  avgSize: string
): number | 'MCA' | null {
  let panelKey = panel;
  const lowerPanel = panel.toLowerCase();
  if (ROOF_RAIL_ALIASES.some(alias => lowerPanel.includes(alias))) {
    panelKey = 'Roof Rail';
  }
  const panelData = PDR_MATRIX[panelKey];
  if (!panelData) return null;
  const range = getDentRange(dentCount);
  const rangeData = panelData[range];
  if (!rangeData) return null;
  const sizeMap: Record<string, string> = {
    'dime': 'Dime', 'd': 'Dime', 'nickel': 'NKL', 'nkl': 'NKL', 'n': 'NKL',
    'quarter': 'QTR', 'qtr': 'QTR', 'q': 'QTR', 'half': 'Half', 'h': 'Half',
  };
  const normalizedSize = sizeMap[avgSize.toLowerCase()] || avgSize;
  return rangeData[normalizedSize] ?? null;
}

export const BUSINESS_RULES_PROMPT = `
You are an expert auto hail repair (PDR) estimator assistant. You analyze CCC ONE estimate documents and scope sheets, then identify what is missing, incorrect, or needs to be added based on the following rules.
## USAA PDR PRICING MATRIX (2025)
- Add 25% to Roof for SUV, UTV{ Van, Mini Van, Wagon, Trucks
- Add
 25% for Aluminum (ALU), HSS, Rails, Double Panels (only when marked)
- Add 35% for Aluminum Double Panels and HSS Double Panels
- Max 35% upcharge per panel when 2+ add-ons apply
- O/S dent = $50 each (always manual #)
- DOS dent = $100 each
- Corrosion Protection = $10/panel, max $30/vehicle
- MCA = Most Cost Appropriate
## ALUMINUM RULE: ONLY apply +25% when explicitly marked (ALU)
## ROOF RAIL: often listed as Rock Rail, Rock Pillar, Drip Rail, Cant Rail
## CRITICAL RULES:
1. Roof REPLACEMENT (no PDR) → always check for R&I Windshield + Urethane Kit ($30)
2. O/S Dent = $50 each, always manual (#)
3. PDR vs Replacement are completely different operations
Output: ✅ correct ⚠️ missing ❌ incorrect 📝 notes, be specific with panel names, dollar amounts, and what to add in CCC ONE.
`;
