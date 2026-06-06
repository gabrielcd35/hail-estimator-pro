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
  onDiagram?: boolean;       // shown on sedan/SUV SVG diagram
  onTruckDiagram?: boolean;  // shown on pickup truck SVG diagram
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
    onTruckDiagram: true,
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
    onTruckDiagram: true,
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

  // ── LT Front Door ─────────────────────────────────────────────────────────
  {
    id: 'lt-front-door',
    label: 'LT Front Door',
    onDiagram: true,
    onTruckDiagram: true,
    operations: [
      {
        id: 'lfd-belt-mirror',
        name: 'R&I Belt Molding → Mirror Overlap',
        notes: [
          {
            id: 'lfd-belt-1',
            text: 'Mirror overlap belt molding on the front door — R&I needed in order to remove the mirror and moldings.',
          },
        ],
      },
      {
        id: 'lfd-door-trim',
        name: 'R&I Interior Door Trim',
        notes: [
          {
            id: 'lfd-trim-1',
            text: 'Door trim R&I required to remove the mirror — trim panel must come off to access mirror mounting bolts from the inside.',
          },
          {
            id: 'lfd-trim-2',
            text: 'Door trim R&I required — door has 6 or more dents; interior trim removal is necessary for proper access and repair.',
          },
        ],
      },
    ],
  },

  // ── LT Rear Door ──────────────────────────────────────────────────────────
  {
    id: 'lt-rear-door',
    label: 'LT Rear Door',
    onDiagram: true,
    onTruckDiagram: true,
    operations: [
      {
        id: 'lrd-belt',
        name: 'R&I Belt Molding',
        notes: [
          {
            id: 'lrd-belt-1',
            text: 'Belt molding R&I required on rear door — needed to access and remove door moldings for proper repair.',
          },
        ],
      },
      {
        id: 'lrd-door-trim',
        name: 'R&I Interior Door Trim',
        notes: [
          {
            id: 'lrd-trim-1',
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
    onTruckDiagram: true,
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

  // ── RT Front Door ─────────────────────────────────────────────────────────
  {
    id: 'rt-front-door',
    label: 'RT Front Door',
    onDiagram: true,
    onTruckDiagram: true,
    operations: [
      {
        id: 'rfd-belt-mirror',
        name: 'R&I Belt Molding → Mirror Overlap',
        notes: [
          {
            id: 'rfd-belt-1',
            text: 'Mirror overlap belt molding on the front door — R&I needed in order to remove the mirror and moldings.',
          },
        ],
      },
      {
        id: 'rfd-door-trim',
        name: 'R&I Interior Door Trim',
        notes: [
          {
            id: 'rfd-trim-1',
            text: 'Door trim R&I required to remove the mirror — trim panel must come off to access mirror mounting bolts from the inside.',
          },
          {
            id: 'rfd-trim-2',
            text: 'Door trim R&I required — door has 6 or more dents; interior trim removal is necessary for proper access and repair.',
          },
        ],
      },
    ],
  },

  // ── RT Rear Door ──────────────────────────────────────────────────────────
  {
    id: 'rt-rear-door',
    label: 'RT Rear Door',
    onDiagram: true,
    onTruckDiagram: true,
    operations: [
      {
        id: 'rrd-belt',
        name: 'R&I Belt Molding',
        notes: [
          {
            id: 'rrd-belt-1',
            text: 'Belt molding R&I required on rear door — needed to access and remove door moldings for proper repair.',
          },
        ],
      },
      {
        id: 'rrd-door-trim',
        name: 'R&I Interior Door Trim',
        notes: [
          {
            id: 'rrd-trim-1',
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

  // ── LT Cab Corner (Truck only) ────────────────────────────────────────────
  {
    id: 'lt-cab-corner',
    label: 'LT Cab Corner',
    onDiagram: false,
    onTruckDiagram: true,
    operations: [
      {
        id: 'ltcc-bed-setback',
        name: 'Cab Corner Repair/Blend → Set Back Pickup Bed',
        notes: [
          {
            id: 'ltcc-bed-1',
            text: 'When repairing or blending the cab corners on a pickup truck, the bed must be set back to ensure proper access and a seamless finish. The tight gap between the cab and bed makes it difficult to sand, paint, or blend without overspray or uneven coverage.',
          },
        ],
      },
      {
        id: 'ltcc-fuel',
        name: 'Cab Corner → R&I Fuel Filler Pipe',
        notes: [
          {
            id: 'ltcc-fuel-1',
            text: 'Fuel filler pipe must be R&I when setting back the pickup bed — connected between fuel tank and bed-mounted fuel door. Moving bed without disconnecting risks bending, cracking, or breaking the pipe.',
          },
        ],
      },
      {
        id: 'ltcc-rear-bumper',
        name: 'Cab Corner → R&I Rear Bumper',
        notes: [
          {
            id: 'ltcc-rb-1',
            text: 'Bumper must be R&I when setting back bed — mounted to frame, can obstruct bed movement.',
          },
        ],
      },
      {
        id: 'ltcc-spare',
        name: 'Cab Corner → R&I Spare Tire Carrier',
        notes: [
          {
            id: 'ltcc-spare-1',
            text: 'Spare tire carrier must be R&I when setting back bed — frame-mounted, can obstruct movement or cause misalignment.',
          },
        ],
      },
    ],
  },

  // ── RT Cab Corner (Truck only) ────────────────────────────────────────────
  {
    id: 'rt-cab-corner',
    label: 'RT Cab Corner',
    onDiagram: false,
    onTruckDiagram: true,
    operations: [
      {
        id: 'rtcc-bed-setback',
        name: 'Cab Corner Repair/Blend → Set Back Pickup Bed',
        notes: [
          {
            id: 'rtcc-bed-1',
            text: 'When repairing or blending the cab corners on a pickup truck, the bed must be set back to ensure proper access and a seamless finish. The tight gap between the cab and bed makes it difficult to sand, paint, or blend without overspray or uneven coverage.',
          },
        ],
      },
      {
        id: 'rtcc-fuel',
        name: 'Cab Corner → R&I Fuel Filler Pipe',
        notes: [
          {
            id: 'rtcc-fuel-1',
            text: 'Fuel filler pipe must be R&I when setting back the pickup bed — connected between fuel tank and bed-mounted fuel door. Moving bed without disconnecting risks bending, cracking, or breaking the pipe.',
          },
        ],
      },
      {
        id: 'rtcc-rear-bumper',
        name: 'Cab Corner → R&I Rear Bumper',
        notes: [
          {
            id: 'rtcc-rb-1',
            text: 'Bumper must be R&I when setting back bed — mounted to frame, can obstruct bed movement.',
          },
        ],
      },
      {
        id: 'rtcc-spare',
        name: 'Cab Corner → R&I Spare Tire Carrier',
        notes: [
          {
            id: 'rtcc-spare-1',
            text: 'Spare tire carrier must be R&I when setting back bed — frame-mounted, can obstruct movement or cause misalignment.',
          },
        ],
      },
    ],
  },

  // ── LT Bed Panel (Truck only) ─────────────────────────────────────────────
  {
    id: 'lt-bed',
    label: 'LT Bed Panel',
    onDiagram: false,
    onTruckDiagram: true,
    operations: [
      {
        id: 'ltb-markup',
        name: 'Bed Panel PDR → 25% Extended Panel Markup',
        notes: [
          {
            id: 'ltb-markup-1',
            text: 'For Pickup Trucks: add 25% markup on the Pick Up Box group — LT and RT bed panels marked as Extended Panel Markup.',
          },
        ],
      },
      {
        id: 'ltb-taillamp',
        name: 'R&I LT Tail Lamp',
        notes: [
          {
            id: 'ltb-tl-1',
            text: 'R&I LT Tail Lamp required on every estimate under the Rear Lamps group — needed for bed panel access.',
          },
        ],
      },
    ],
  },

  // ── RT Bed Panel (Truck only) ─────────────────────────────────────────────
  {
    id: 'rt-bed',
    label: 'RT Bed Panel',
    onDiagram: false,
    onTruckDiagram: true,
    operations: [
      {
        id: 'rtb-markup',
        name: 'Bed Panel PDR → 25% Extended Panel Markup',
        notes: [
          {
            id: 'rtb-markup-1',
            text: 'For Pickup Trucks: add 25% markup on the Pick Up Box group — LT and RT bed panels marked as Extended Panel Markup.',
          },
        ],
      },
      {
        id: 'rtb-taillamp',
        name: 'R&I RT Tail Lamp',
        notes: [
          {
            id: 'rtb-tl-1',
            text: 'R&I RT Tail Lamp required on every estimate under the Rear Lamps group — needed for bed panel access.',
          },
        ],
      },
    ],
  },

  // ── Tailgate (Truck only) ─────────────────────────────────────────────────
  {
    id: 'tailgate',
    label: 'Tailgate',
    onDiagram: false,
    onTruckDiagram: true,
    operations: [],
  },

  // ── LT Roof Rail ─────────────────────────────────────────────────────────
  {
    id: 'lt-roof-rail',
    label: 'LT Roof Rail',
    onDiagram: true,
    onTruckDiagram: true,
    operations: [
      {
        id: 'ltr-airbag',
        name: 'Roof Rail Repair/R&R → R&I LT Head Airbag',
        notes: [
          {
            id: 'ltr-ab-1',
            text: 'R&I LT Head Airbag required when repairing or replacing the LT roof rail — head airbags are mounted inside the roof rail channel. Heat, sparks, or vibration during repair creates accidental deployment risk. Add under Restraint Systems group in CCC ONE.',
          },
        ],
      },
    ],
  },

  // ── RT Roof Rail ─────────────────────────────────────────────────────────
  {
    id: 'rt-roof-rail',
    label: 'RT Roof Rail',
    onDiagram: true,
    onTruckDiagram: true,
    operations: [
      {
        id: 'rtr-airbag',
        name: 'Roof Rail Repair/R&R → R&I RT Head Airbag',
        notes: [
          {
            id: 'rtr-ab-1',
            text: 'R&I RT Head Airbag required when repairing or replacing the RT roof rail — head airbags are mounted inside the roof rail channel. Heat, sparks, or vibration during repair creates accidental deployment risk. Add under Restraint Systems group in CCC ONE.',
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
