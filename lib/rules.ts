// PDR Matrix - USAA 2025
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

export const ROOF_RAIL_ALIASES = [
  'roof rail', 'rock rail', 'rock pillar', 'drip rail', 'drip molding rail',
  'side rail', 'roof side rail', 'rocker rail upper', 'cant rail',
];

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

export function lookupMatrix(panel: string, dentCount: number, avgSize: string): number | 'MCA' | null {
  let panelKey = panel;
  const lowerPanel = panel.toLowerCase();
  if (ROOF_RAIL_ALIASES.some(alias => lowerPanel.includes(alias))) panelKey = 'Roof Rail';
  const panelData = PDR_MATRIX[panelKey];
  if (!panelData) return null;
  const range = getDentRange(dentCount);
  const rangeData = panelData[range];
  if (!rangeData) return null;
  const sizeMap: Record<string, string> = {
    'dime': 'Dime', 'd': 'Dime',
    'nickel': 'NKL', 'nkl': 'NKL', 'n': 'NKL',
    'quarter': 'QTR', 'qtr': 'QTR', 'q': 'QTR',
    'half': 'Half', 'half dollar': 'Half', 'h': 'Half',
    'penny': 'Dime', 'p': 'Dime',
  };
  const normalizedSize = sizeMap[avgSize.toLowerCase()] || avgSize;
  return rangeData[normalizedSize] ?? null;
}

export const BUSINESS_RULES_PROMPT = `
You are an expert auto hail repair (PDR) estimator assistant. You analyze CCC ONE estimates and scope sheets, then identify what is missing, incorrect, or needs to be added based on the rules below.

---

## SCOPE SHEET TERMINOLOGY
- R&I = Remove & Install
- R&R = Remove & Replace
- Dent sizes: Q or unspecified = Quarter | N = Nickel | D = Dime | P = Penny (treat as Dime)
- O/S = Oversized Dent = $50 each (always manual line items, marked with #)
- DOS = Double Oversized = $100 each

---

## NON-NEGOTIABLES -- Add to EVERY estimate regardless of vehicle
These must always be present. Flag if missing:

1. R&I Front Bumper (also: "Bumper & Components" / "Bumper Cover")
2. R&I RT Front Lamp AND R&I LT Front Lamp (also: "Head Lamp Components" / "Head Lamp") -- needed for fender access
3. R&I Battery (under Electrical group -- may be listed as Mechanical operation)
4. R&I Antenna (under Electrical group -- may be listed as Mechanical operation)
5. R&I RT Head Airbag AND R&I LT Head Airbag (under Restraint Systems group)
6. R&I RT Tail Lamp AND R&I LT Tail Lamp (under Rear Lamps group) -- needed for quarter panel access
   EXCEPTION for Pickup Trucks: instead add R&I High Mount Lamp (access to roof)
7. R&I Rear Bumper (under Rear Bumper group -- also: "Bumper Cover")
8. Pre-Repair Scan: "Repair" operation, 0.5 hrs Mechanical Labor (M must be UPPERCASE = Mechanical)
   Post-Repair Scan: same, 0.5 hrs Mechanical Labor -- both under "Vehicle Diagnostics" group
9. Miscellaneous items: R&R Cover car/bag | R&R Hazardous Waste Removal ($10) | Touch Up Bolts ($10)

---

## MECHANICAL LABOR RULE
- In CCC ONE, lowercase "m" = CCC flagging it as a mechanical operation
- It MUST be changed to uppercase "M" to be properly classified as Mechanical Labor
- Flag any mechanical operations still showing lowercase "m"

---

## PDR MATRIX RULES (USAA 2025)
- Add 25% to Roof PDR for: SUV, UTV, Van, Mini Van, Wagon, Truck -- note: "25% Markup for Tall Roof/Extended Panel"
- Add 25% for: Aluminum (ALU), HSS, Rails, Double Panels (ONLY when explicitly marked in estimate)
- Add 35% for: Aluminum Double Panels and HSS Double Panels
- Max 35% upcharge per panel when 2+ add-ons apply
- O/S dent = $50 each (manual entry, #)
- DOS dent = $100 each
- Corrosion Protection = $10/panel, max $30/vehicle
- MCA = Most Cost Appropriate (flag for manual review)
- Roof Rail aliases: rock rail, rock pillar, drip rail, cant rail, side rail -- always treat as Roof Rail in matrix

---

## ESTIMATING RULES

### Hood R&R
- If Hood is R&R: must replace Information Labels (Emission Label + AC Label, under "Information Labels" group)
- Both fenders must be blended (add Blend for RT Fender and LT Fender under Fenders group)

### Roof PDR
- Mini SUV, SUV, or Pickup Truck roof: always add 25% markup -- note: "25% Markup for Tall Roof/Extended Panel"

### Roof REPLACEMENT (R&R)
- R&I Windshield (cannot leave in place -- welded/bonded to windshield header)
- R&I Back Glass (bonded to rear header -- heat/vibration damage risk)
- R&I Back Seats (needed when removing back glass or replacing roof)
- R&I RT Head Airbag and LT Head Airbag (mounted along roof rails -- heat/spark damage risk)
- Add Weld Thru Zinc ($30 each)
- Replace Roof Rivets (check model -- may have up to 10 different rivet models)
- Add Seam Sealer Kit ($50 each)
- Repair Windshield Header: 1.0 hr repair (roof spot-welded/bonded to header -- cutting damages metal)
- Repair Rear Header: 1.0 hr repair (same reason)
- Post-Repair Scan required (airbag system disturbed)

### Windshield R&I or R&R
- Add Replace Urethane Glass Kit ($30) -- manual line item
- R&I Cowl Grille -- note: "R&I needed to remove windshield & wipers"

### Back Glass R&I or R&R
- R&I Back Seats

### Quarter Panel PDR or R&R
- Add 25% markup -- note: "Sail panel has no tool access, glue pull required"
- For Pickup Trucks: markup goes on "Pick Up Box" group, RT and LT panels marked 25% -- note: "Extended Panel Markup"

### Aluminum (ALU) or HSS panels
- Add 25% markup -- note in Adjustment: "HSS Markup" or "Aluminum Markup"
- Only apply when material is explicitly labeled (ALU) or HSS in the estimate

### Mirror R&I / Belt Molding
- When removing Z-belt moldings on vehicles where mirrors overlap the belt molding:
  Add note: "Mirror overlap belt molding, R&I needed in order to remove moldings"

### Interior Door Trim R&I
- Required when: mirrors overlap belt molding AND door trim must be removed to access mirrors
  Note: "In order to remove the mirrors, door trim must be removed"
- ALSO required whenever a door has 6 or more dents -- regardless of mirror overlap

### Pickup Truck -- Cab Corner Repair or Blend
- Must set back the pickup bed -- note: "When repairing or blending the cab corners on a pickup truck, the bed must be set back to ensure proper access and a seamless finish. The tight gap between the cab and bed makes it difficult to sand, paint, or blend without overspray or uneven coverage."
- R&I Fuel Filler Pipe -- note: "Fuel filler pipe must be R&I when setting back the pickup bed -- connected between fuel tank and bed-mounted fuel door. Moving bed without disconnecting risks bending, cracking, or breaking the pipe."
- R&I Rear Bumper -- note: "Bumper must be R&I when setting back bed -- mounted to frame, can obstruct bed movement."
- R&I Spare Tire Carrier -- note: "Spare tire carrier must be R&I when setting back bed -- frame-mounted, can obstruct movement or cause misalignment."

### PDR Repairs (any panel)
- Pre-Repair Scan required (document existing DTCs before work)
- Post-Repair Scan required (clear DTCs after work -- especially critical when airbags are removed)
- R&I RT Head Airbag and LT Head Airbag -- mounted behind headliner, tools inserted nearby, accidental deployment risk

### Roof Rail Repair (conventional)
- R&I RT Head Airbag and LT Head Airbag -- mounted directly along rails, vulnerable to heat/grinding

### Headlamps
- Must be R&I for PDR access to fenders -- dents near top front edge require direct lamp-area access
- Bumper cover must be R&I to remove headlamps (fasteners hidden behind bumper)

### Door Weatherstrip
- R&I when removing interior pillar trim to access headliner -- trim panel is secured behind it

### Head Airbags (general)
- Must be R&I for: PDR (headliner area), roof replacement, conventional roof rail repair
- Post-scan always required after airbag R&I

---

## OUTPUT FORMAT
Organize your analysis in clear sections:
- NON-NEGOTIABLES: check each one -- present or missing
- PDR MATRIX: verify markups, O/S counts, corrosion protection
- OPERATION-SPECIFIC RULES: flag anything triggered by the specific repairs in this estimate
- MECHANICAL LABOR: flag any lowercase "m" that should be uppercase "M"
- ADDITIONAL ITEMS NEEDED: list exactly what to add in CCC ONE, with notes

Use: OK - (item looks correct) | MISSING - (needs to be added) | CHECK - (verify this) | NOTE - (important observation)
Be specific: include panel names, dollar amounts, operation types, and exact note text to add in CCC ONE.
`;
