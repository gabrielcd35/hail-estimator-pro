// ─────────────────────────────────────────────────────────────────────────────
// Estimate Assistant — Panel & Operations data
//
// HOW TO ADD NOTES:
//   1. Find the panel by its id below.
//   2. Find (or add) the operation inside it.
//   3. Add a new { id: 'unique-id', text: 'Note text here.' } to its notes array.
//   IDs must be unique across the whole file.
// ─────────────────────────────────────────────────────────────────────────────

export interface EstimateNote {
  id: string;
  text: string;
}

export interface EstimateOperation {
  id: string;
  name: string;
  notes: EstimateNote[];
}

export interface CarPanel {
  id: string;
  label: string;
  onDiagram?: boolean; // true = shown as clickable area in car SVG
  operations: EstimateOperation[];
}

export const PANELS: CarPanel[] = [
  // ── Every Estimate (Non-Negotiables) ─────────────────────────────────────
  {
    id: 'non-negotiables',
    label: 'Every Estimate',
    onDiagram: false,
    operations: [
      {
        id: 'nn-front-bumper',
        name: 'R&I Front Bumper',
        notes: [
          {
            id: 'nn-fb-1',
            text: 'R&I Front Bumper required on every estimate. Add under "Front Bumper" group in CCC ONE (also listed as "Bumper & Components" or "Bumper Cover"). Bumper cover must be R&I to remove headlamps — fasteners are hidden behind it.',
          },
        ],
      },
      {
        id: 'nn-headlamps',
        name: 'R&I Headlamps (LT + RT)',
        notes: [
          {
            id: 'nn-hl-1',
            text: 'R&I RT Front Lamp and R&I LT Front Lamp required on every estimate (also: "Head Lamp Components" / "Head Lamp"). Must be R&I for PDR access to fenders — dents near the top front edge require direct lamp-area access.',
          },
        ],
      },
      {
        id: 'nn-battery',
        name: 'R&I Battery',
        notes: [
          {
            id: 'nn-bat-1',
            text: 'R&I Battery required on every estimate — list under Electrical group in CCC ONE (may also be listed as a Mechanical operation).',
          },
        ],
      },
      {
        id: 'nn-antenna',
        name: 'R&I Antenna',
        notes: [
          {
            id: 'nn-ant-1',
            text: 'R&I Antenna required on every estimate — list under Electrical group in CCC ONE (may also be listed as a Mechanical operation).',
          },
        ],
      },
      {
        id: 'nn-airbags',
        name: 'R&I Head Airbags (LT + RT)',
        notes: [
          {
            id: 'nn-ab-1',
            text: 'R&I RT Head Airbag and R&I LT Head Airbag required on every estimate — add under Restraint Systems group in CCC ONE.',
          },
        ],
      },
      {
        id: 'nn-taillamps',
        name: 'R&I Tail Lamps (LT + RT)',
        notes: [
          {
            id: 'nn-tl-1',
            text: 'R&I RT Tail Lamp and R&I LT Tail Lamp required on every estimate — add under Rear Lamps group in CCC ONE. Required for quarter panel access. EXCEPTION for Pickup Trucks: add R&I High Mount Lamp instead (access to roof).',
          },
        ],
      },
      {
        id: 'nn-rear-bumper',
        name: 'R&I Rear Bumper',
        notes: [
          {
            id: 'nn-rb-1',
            text: 'R&I Rear Bumper required on every estimate (also listed as "Bumper Cover") — add under the Rear Bumper group in CCC ONE.',
          },
        ],
      },
      {
        id: 'nn-scans',
        name: 'Pre-Repair & Post-Repair Scan',
        notes: [
          {
            id: 'nn-scan-1',
            text: 'Pre-Repair Scan: "Repair" operation, 0.5 hrs Mechanical Labor — add under "Vehicle Diagnostics" group. Documents existing DTCs before work begins.',
          },
          {
            id: 'nn-scan-2',
            text: 'Post-Repair Scan: "Repair" operation, 0.5 hrs Mechanical Labor — add under "Vehicle Diagnostics" group. Clears DTCs after work. Especially critical when airbags are removed. NOTE: "M" must be UPPERCASE in CCC ONE to be classified as Mechanical Labor.',
          },
        ],
      },
      {
        id: 'nn-misc',
        name: 'Miscellaneous Line Items',
        notes: [
          { id: 'nn-misc-1', text: 'R&R Cover car/bag — add as misc line item.' },
          { id: 'nn-misc-2', text: 'R&R Hazardous Waste Removal — $10, add as misc line item.' },
          { id: 'nn-misc-3', text: 'Touch Up Bolts — $10, add as misc line item.' },
        ],
      },
    ],
  },

  // ── Front Bumper ──────────────────────────────────────────────────────────
  {
    id: 'front-bumper',
    label: 'Front Bumper',
    onDiagram: true,
    operations: [
      {
        id: 'fb-ri',
        name: 'R&I Front Bumper',
        notes: [
          {
            id: 'fb-ri-1',
            text: 'R&I Front Bumper required on every estimate. Add under "Front Bumper" group in CCC ONE (also listed as "Bumper & Components" or "Bumper Cover"). Bumper cover must be R&I to remove headlamps — fasteners are hidden behind it.',
          },
        ],
      },
      {
        id: 'fb-headlamps',
        name: 'R&I Headlamps (LT + RT)',
        notes: [
          {
            id: 'fb-hl-1',
            text: 'R&I RT Front Lamp and R&I LT Front Lamp — must be R&I for PDR access to fenders. Dents near the top front edge require direct lamp-area access.',
          },
        ],
      },
    ],
  },

  // ── Hood ──────────────────────────────────────────────────────────────────
  {
    id: 'hood',
    label: 'Hood',
    onDiagram: true,
    operations: [
      {
        id: 'hood-rr-labels',
        name: 'Hood R&R → Information Labels',
        notes: [
          {
            id: 'hood-rr-labels-1',
            text: 'When Hood is R&R: must replace Information Labels — add Emission Label + AC Label under the "Information Labels" group in CCC ONE.',
          },
        ],
      },
      {
        id: 'hood-rr-blend',
        name: 'Hood R&R → Blend LT + RT Fenders',
        notes: [
          {
            id: 'hood-rr-blend-1',
            text: 'When Hood is R&R: both fenders must be blended — add Blend for RT Fender and Blend for LT Fender under the Fenders group in CCC ONE.',
          },
        ],
      },
    ],
  },

  // ── Windshield ────────────────────────────────────────────────────────────
  {
    id: 'windshield',
    label: 'Windshield',
    onDiagram: false,
    operations: [
      {
        id: 'ws-urethane',
        name: 'Windshield R&I or R&R → Urethane Kit',
        notes: [
          {
            id: 'ws-ur-1',
            text: 'Add Replace Urethane Glass Kit ($30) — required whenever windshield is R&I or R&R. Enter as a manual line item in CCC ONE.',
          },
        ],
      },
      {
        id: 'ws-cowl',
        name: 'Windshield R&I or R&R → R&I Cowl Grille',
        notes: [
          {
            id: 'ws-cowl-1',
            text: 'R&I Cowl Grille — R&I needed to remove windshield & wipers.',
          },
        ],
      },
    ],
  },

  // ── Left Doors ────────────────────────────────────────────────────────────
  {
    id: 'left-doors',
    label: 'Left Doors',
    onDiagram: true,
    operations: [
      {
        id: 'ld-belt-mirror',
        name: 'R&I Belt Molding → Mirror Overlap',
        notes: [
          {
            id: 'ld-belt-1',
            text: 'Mirror overlap belt molding — R&I needed in order to remove moldings.',
          },
        ],
      },
      {
        id: 'ld-door-trim',
        name: 'R&I Interior Door Trim',
        notes: [
          {
            id: 'ld-trim-1',
            text: 'In order to remove the mirrors, door trim must be removed.',
          },
          {
            id: 'ld-trim-2',
            text: 'Door trim R&I required — door has 6 or more dents; interior trim removal is necessary for proper access and repair.',
          },
        ],
      },
    ],
  },

  // ── Roof ──────────────────────────────────────────────────────────────────
  {
    id: 'roof',
    label: 'Roof',
    onDiagram: true,
    operations: [
      {
        id: 'roof-pdr-markup',
        name: 'Roof PDR → 25% Markup (SUV/Truck/Van)',
        notes: [
          {
            id: 'roof-pdr-1',
            text: '25% Markup for Tall Roof/Extended Panel — required for SUV, UTV, Van, Mini Van, Wagon, Pickup Truck.',
          },
        ],
      },
      {
        id: 'roof-rr-windshield',
        name: 'Roof R&R → R&I Windshield',
        notes: [
          {
            id: 'roof-rr-ws-1',
            text: 'Windshield cannot remain in place during roof replacement — it is welded/bonded to the windshield header and must be R&I.',
          },
        ],
      },
      {
        id: 'roof-rr-backglass',
        name: 'Roof R&R → R&I Back Glass',
        notes: [
          {
            id: 'roof-rr-bg-1',
            text: 'Back glass is bonded to the rear header — heat and vibration from roof replacement create damage risk. Must be R&I.',
          },
        ],
      },
      {
        id: 'roof-rr-backseats',
        name: 'Roof R&R → R&I Back Seats',
        notes: [
          {
            id: 'roof-rr-bs-1',
            text: 'Rear seats must be R&I when removing back glass or replacing the roof — provides proper access and protects the interior.',
          },
        ],
      },
      {
        id: 'roof-rr-airbags',
        name: 'Roof R&R → R&I Head Airbags (LT + RT)',
        notes: [
          {
            id: 'roof-rr-ab-1',
            text: 'Head airbags are mounted along the roof rails — heat and sparks during roof replacement create accidental deployment risk. Must R&I RT Head Airbag and LT Head Airbag under Restraint Systems group.',
          },
        ],
      },
      {
        id: 'roof-rr-weld',
        name: 'Roof R&R → Weld Thru Zinc',
        notes: [
          {
            id: 'roof-rr-weld-1',
            text: 'Add Weld Thru Zinc ($30 each) — required for all roof replacement welds to prevent corrosion at weld points.',
          },
        ],
      },
      {
        id: 'roof-rr-seam',
        name: 'Roof R&R → Seam Sealer Kit',
        notes: [
          {
            id: 'roof-rr-seam-1',
            text: 'Add Seam Sealer Kit ($50 each) — required to properly seal all seams after roof panel installation.',
          },
        ],
      },
      {
        id: 'roof-rr-headers',
        name: 'Roof R&R → Repair Windshield & Rear Header',
        notes: [
          {
            id: 'roof-rr-hdr-1',
            text: 'Repair Windshield Header: 1.0 hr repair — roof is spot-welded/bonded to the header; cutting damages the metal and requires repair.',
          },
          {
            id: 'roof-rr-hdr-2',
            text: 'Repair Rear Header: 1.0 hr repair — roof is spot-welded/bonded to the rear header; same repair requirement applies.',
          },
        ],
      },
    ],
  },

  // ── Right Doors ───────────────────────────────────────────────────────────
  {
    id: 'right-doors',
    label: 'Right Doors',
    onDiagram: true,
    operations: [
      {
        id: 'rd-belt-mirror',
        name: 'R&I Belt Molding → Mirror Overlap',
        notes: [
          {
            id: 'rd-belt-1',
            text: 'Mirror overlap belt molding — R&I needed in order to remove moldings.',
          },
        ],
      },
      {
        id: 'rd-door-trim',
        name: 'R&I Interior Door Trim',
        notes: [
          {
            id: 'rd-trim-1',
            text: 'In order to remove the mirrors, door trim must be removed.',
          },
          {
            id: 'rd-trim-2',
            text: 'Door trim R&I required — door has 6 or more dents; interior trim removal is necessary for proper access and repair.',
          },
        ],
      },
    ],
  },

  // ── Back Glass ────────────────────────────────────────────────────────────
  {
    id: 'back-glass',
    label: 'Back Glass',
    onDiagram: false,
    operations: [
      {
        id: 'bg-backseats',
        name: 'Back Glass R&I or R&R → R&I Back Seats',
        notes: [
          {
            id: 'bg-bs-1',
            text: 'R&I Back Seats required whenever back glass is R&I or R&R — necessary for proper access and to protect the interior.',
          },
        ],
      },
    ],
  },

  // ── LT Quarter Panel ─────────────────────────────────────────────────────
  {
    id: 'lt-quarter',
    label: 'LT Quarter Panel',
    onDiagram: true,
    operations: [
      {
        id: 'ltq-markup',
        name: 'Quarter Panel PDR/R&R → 25% Markup',
        notes: [
          {
            id: 'ltq-markup-1',
            text: 'Sail panel has no tool access — glue pull required. Add 25% markup to the Quarter Panel PDR line item.',
          },
        ],
      },
      {
        id: 'ltq-taillamp',
        name: 'R&I LT Tail Lamp',
        notes: [
          {
            id: 'ltq-tl-1',
            text: 'R&I LT Tail Lamp required on every estimate under the Rear Lamps group — needed for LT quarter panel access.',
          },
        ],
      },
    ],
  },

  // ── Lift Gate ─────────────────────────────────────────────────────────────
  {
    id: 'lift-gate',
    label: 'Lift Gate',
    onDiagram: true,
    operations: [],
  },

  // ── RT Quarter Panel ─────────────────────────────────────────────────────
  {
    id: 'rt-quarter',
    label: 'RT Quarter Panel',
    onDiagram: true,
    operations: [
      {
        id: 'rtq-markup',
        name: 'Quarter Panel PDR/R&R → 25% Markup',
        notes: [
          {
            id: 'rtq-markup-1',
            text: 'Sail panel has no tool access — glue pull required. Add 25% markup to the Quarter Panel PDR line item.',
          },
        ],
      },
      {
        id: 'rtq-taillamp',
        name: 'R&I RT Tail Lamp',
        notes: [
          {
            id: 'rtq-tl-1',
            text: 'R&I RT Tail Lamp required on every estimate under the Rear Lamps group — needed for RT quarter panel access.',
          },
        ],
      },
    ],
  },

  // ── Rear Bumper ───────────────────────────────────────────────────────────
  {
    id: 'rear-bumper',
    label: 'Rear Bumper',
    onDiagram: true,
    operations: [
      {
        id: 'rb-ri',
        name: 'R&I Rear Bumper',
        notes: [
          {
            id: 'rb-ri-1',
            text: 'R&I Rear Bumper required on every estimate (also listed as "Bumper Cover") — add under the Rear Bumper group in CCC ONE.',
          },
        ],
      },
    ],
  },
];
