// ─────────────────────────────────────────────────────────────────────────────
// Estimate Assistant — Panel & Operations data
//
// HOW TO ADD NOTES:
//   1. Find the panel by its id below.
//   2. Find (or add) the operation inside it.
//   3. Add a new { id: 'unique-id', text: 'Note text here.' } to its notes array.
//   IDs must be unique across the whole file.
// ─────────────────────────────────────────────────────────────────────────────

export type RepairType = 'pdr' | 'repair' | 'rr';

export interface EstimateNote {
  id: string;
  text: string;
}

export interface EstimateOperation {
  id: string;
  name: string;
  types: RepairType[];
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
        types: ['pdr', 'repair', 'rr'],
        notes: [
          {
            id: 'nn-fb-1',
            text: 'Drop front bumper cover. Removal is required to safely access and disconnect the headlamp assemblies, as the mounting fasteners and wiring harness connectors are located behind the bumper cover on most vehicles.',
          },
        ],
      },
      {
        id: 'nn-headlamps',
        name: 'R&I Headlamps (LT + RT)',
        types: ['pdr', 'repair', 'rr'],
        notes: [
          {
            id: 'nn-hl-1',
            text: 'Headlamp assemblies must be removed as they are the primary access point for PDR tooling on the front fenders.',
          },
        ],
      },
      {
        id: 'nn-battery',
        name: 'R&I Battery',
        types: ['pdr', 'repair', 'rr'],
        notes: [
          {
            id: 'nn-bat-1',
            text: 'Battery must be disconnected before any SRS component handling, as the backup capacitor retains deployment-level charge for up to 2 minutes. This is required by all OEM service procedures and I-CAR standards whenever airbag assemblies or headliner components are disturbed.',
          },
        ],
      },
      {
        id: 'nn-antenna',
        name: 'R&I Antenna',
        types: ['pdr', 'repair', 'rr'],
        notes: [
          {
            id: 'nn-ant-1',
            text: 'Antenna must be removed to allow full PDR access to the roof panel. The antenna base and mounting hardware obstruct tool access to the surrounding roof area.',
          },
          {
            id: 'nn-ant-2',
            text: 'Antenna must be removed to allow full paint coverage of the roof panel without overspray contamination on the antenna base or surrounding area.',
          },
          {
            id: 'nn-ant-3',
            text: 'Antenna must be transferred from the damaged roof to the replacement panel.',
          },
        ],
      },
      {
        id: 'nn-airbags',
        name: 'R&I Head Airbags (LT + RT)',
        types: ['pdr', 'repair', 'rr'],
        notes: [
          {
            id: 'nn-ab-1',
            text: 'Head airbags must be removed when performing PDR because they are mounted behind the headliner, directly in the area where tools are inserted to access dents. Leaving them in place risks accidental deployment due to pressure or movement, which will damage the airbags and create a costly repair.',
          },
        ],
      },
      {
        id: 'nn-taillamps',
        name: 'R&I Tail Lamps (LT + RT)',
        types: ['pdr', 'repair', 'rr'],
        notes: [
          {
            id: 'nn-tl-1',
            text: 'Tail lamp assemblies must be removed to allow PDR tool access to the quarter panels.',
          },
        ],
      },
      {
        id: 'nn-rear-bumper',
        name: 'R&I Rear Bumper',
        types: ['pdr', 'repair', 'rr'],
        notes: [
          {
            id: 'nn-rb-1',
            text: 'R&I Rear Bumper required on every estimate (also listed as "Bumper Cover") — add under the Rear Bumper group in CCC ONE.',
          },
        ],
      },
      {
        id: 'nn-pre-scan',
        name: 'Pre-Scan',
        types: ['pdr'],
        notes: [
          {
            id: 'nn-scan-1',
            text: 'A pre-scan is required before PDR repairs to document any existing diagnostic trouble codes (DTCs) and verify the condition of all electronic and safety systems. Accessing dents often requires removal of components like the headliner, which can trigger faults in airbag, lighting, or sensor systems.',
          },
        ],
      },
      {
        id: 'nn-post-scan',
        name: 'Post-Scan',
        types: ['pdr'],
        notes: [
          {
            id: 'nn-scan-2',
            text: 'A post-scan is required after PDR repairs to detect and clear any diagnostic trouble codes (DTCs) triggered during disassembly or reassembly, especially when components like the headliner and head airbags are removed. These systems are sensitive and will log faults if disconnected or disturbed.',
          },
        ],
      },
      {
        id: 'nn-misc',
        name: 'Miscellaneous Line Items',
        types: ['pdr', 'repair', 'rr'],
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
        types: ['pdr', 'repair', 'rr'],
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
        types: ['pdr', 'repair', 'rr'],
        notes: [
          {
            id: 'fb-hl-1',
            text: 'Front lamps must be R&I for PDR access to the fenders. Dents near the top front edge require direct lamp-area access.',
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
        id: 'hood-pdr-insulator',
        name: 'PDR → R&I Insulator',
        types: ['pdr'],
        notes: [
          {
            id: 'hood-pdr-ins-1',
            text: 'Hood insulator must be removed to allow PDR tool access to the underside of the hood panel.',
          },
        ],
      },
      {
        id: 'hood-pdr-clips',
        name: 'PDR → R/R Hood Clips',
        types: ['pdr'],
        notes: [
          {
            id: 'hood-pdr-clips-1',
            text: 'Hood insulator retaining clips are single-use fasteners — they break during insulator removal and must be replaced.',
          },
        ],
      },
      {
        id: 'hood-rr-labels',
        name: 'Hood R&R → Information Labels',
        types: ['rr'],
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
        types: ['rr'],
        notes: [
          {
            id: 'hood-rr-blend-1',
            text: 'Blend needed due replacement of Hood.',
          },
        ],
      },
    ],
  },

  // ── LT Fender ────────────────────────────────────────────────────────────
  {
    id: 'lt-fender',
    label: 'LT Fender',
    onDiagram: true,
    onTruckDiagram: true,
    operations: [
      {
        id: 'ltf-headlamp',
        name: 'R&I LT Headlamp',
        types: ['pdr', 'repair'],
        notes: [
          {
            id: 'ltf-hl-1',
            text: 'R&I Front Lamp required for fender access — the headlamp assembly must be removed to reach the top inner edge of the fender for PDR tools or repair work.',
          },
        ],
      },
      {
        id: 'ltf-blend',
        name: 'Blend LT Fender',
        types: ['rr'],
        notes: [
          {
            id: 'ltf-bl-1',
            text: 'Blend needed due replacement of Hood.',
          },
        ],
      },
    ],
  },

  // ── RT Fender ────────────────────────────────────────────────────────────
  {
    id: 'rt-fender',
    label: 'RT Fender',
    onDiagram: true,
    onTruckDiagram: true,
    operations: [],
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
        types: ['pdr', 'rr'],
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
        types: ['pdr', 'rr'],
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
        id: 'lfd-belt',
        name: 'R&I Belt Molding',
        types: ['pdr', 'repair', 'rr'],
        notes: [
          {
            id: 'lfd-beltm-1',
            text: 'Belt molding R&I required on front door — needed to access and remove door moldings for proper repair.',
          },
        ],
      },
      {
        id: 'lfd-belt-mirror',
        name: 'R&I Belt Molding → Mirror Overlap',
        types: ['pdr', 'repair', 'rr'],
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
        types: ['pdr', 'repair', 'rr'],
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
        types: ['pdr', 'repair', 'rr'],
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
        types: ['pdr', 'repair', 'rr'],
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
        id: 'roof-pdr-headliner',
        name: 'PDR → R&I Headliner',
        types: ['pdr'],
        notes: [
          {
            id: 'roof-pdr-hl-1',
            text: 'Headliner must be removed to allow PDR tool access to the underside of the roof panel for dent repair.',
          },
        ],
      },
      {
        id: 'roof-pdr-markup',
        name: 'Roof PDR → 25% Markup (SUV/Truck/Van)',
        types: ['pdr'],
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
        types: ['rr'],
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
        types: ['rr'],
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
        types: ['rr'],
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
        types: ['rr'],
        notes: [
          {
            id: 'roof-rr-ab-1',
            text: 'Head airbags are mounted along the roof rails — heat and sparks during roof replacement create accidental deployment risk. Head airbags must be R&I under the Restraint Systems group.',
          },
        ],
      },
      {
        id: 'roof-rr-weld',
        name: 'Roof R&R → Weld Thru Zinc',
        types: ['rr'],
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
        types: ['rr'],
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
        types: ['rr'],
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
    operations: [],
  },

  // ── RT Rear Door ──────────────────────────────────────────────────────────
  {
    id: 'rt-rear-door',
    label: 'RT Rear Door',
    onDiagram: true,
    onTruckDiagram: true,
    operations: [],
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
        types: ['pdr', 'rr'],
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
        name: 'Quarter Panel → 25% Markup',
        types: ['pdr', 'rr'],
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
        types: ['pdr', 'repair', 'rr'],
        notes: [
          {
            id: 'ltq-tl-1',
            text: 'R&I Tail Lamp required on every estimate under the Rear Lamps group — needed for quarter panel access.',
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
    operations: [
      {
        id: 'lg-pdr-liftgate',
        name: 'PDR → R&I Lift Gate',
        types: ['pdr'],
        notes: [
          {
            id: 'lg-pdr-lg-1',
            text: 'Lift gate must be removed to allow proper PDR tool access and leverage across the panel.',
          },
        ],
      },
      {
        id: 'lg-pdr-lower-trim',
        name: 'PDR → R&I Interior Lower Trim',
        types: ['pdr'],
        notes: [
          {
            id: 'lg-pdr-lt-1',
            text: 'Interior lower trim must be removed to expose the inner structure and allow PDR tool access to the lower section of the lift gate.',
          },
        ],
      },
      {
        id: 'lg-pdr-upper-trim',
        name: 'PDR → R&I Upper Interior Trim',
        types: ['pdr'],
        notes: [
          {
            id: 'lg-pdr-ut-1',
            text: 'Upper interior trim must be removed to expose the inner structure and allow PDR tool access to the upper section of the lift gate.',
          },
        ],
      },
    ],
  },

  // ── RT Quarter Panel ─────────────────────────────────────────────────────
  {
    id: 'rt-quarter',
    label: 'RT Quarter Panel',
    onDiagram: true,
    operations: [],
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
        name: 'Cab Corner → Set Back Pickup Bed',
        types: ['repair', 'rr'],
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
        types: ['repair', 'rr'],
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
        types: ['repair', 'rr'],
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
        types: ['repair', 'rr'],
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
        name: 'Cab Corner → Set Back Pickup Bed',
        types: ['repair', 'rr'],
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
        types: ['repair', 'rr'],
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
        types: ['repair', 'rr'],
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
        types: ['repair', 'rr'],
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
        types: ['pdr'],
        notes: [
          {
            id: 'ltb-markup-1',
            text: 'For Pickup Trucks: add 25% markup on the Pick Up Box group — bed panels marked as Extended Panel Markup.',
          },
        ],
      },
      {
        id: 'ltb-taillamp',
        name: 'R&I LT Tail Lamp',
        types: ['pdr', 'repair', 'rr'],
        notes: [
          {
            id: 'ltb-tl-1',
            text: 'R&I Tail Lamp required on every estimate under the Rear Lamps group — needed for bed panel access.',
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
        types: ['pdr'],
        notes: [
          {
            id: 'rtb-markup-1',
            text: 'For Pickup Trucks: add 25% markup on the Pick Up Box group — bed panels marked as Extended Panel Markup.',
          },
        ],
      },
      {
        id: 'rtb-taillamp',
        name: 'R&I RT Tail Lamp',
        types: ['pdr', 'repair', 'rr'],
        notes: [
          {
            id: 'rtb-tl-1',
            text: 'R&I Tail Lamp required on every estimate under the Rear Lamps group — needed for bed panel access.',
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
        id: 'ltr-replace',
        name: 'Roof Replacement → R&I Head Airbag',
        types: ['rr'],
        notes: [
          {
            id: 'ltr-rep-1',
            text: 'Head airbags must be removed when replacing a roof because they are mounted along the roof rails and pillars, directly in the work area. Leaving them in place will expose them to heat, sparks, or damage from cutting, grinding, and welding.',
          },
        ],
      },
      {
        id: 'ltr-repair',
        name: 'Conventional Repair → R&I Head Airbag',
        types: ['repair'],
        notes: [
          {
            id: 'ltr-rep-2',
            text: 'Head airbags must be removed when conventionally repairing roof rails because they are mounted directly along the rails, making them vulnerable to heat, grinding, and impact damage. Leaving them in place will expose them to sparks, debris, and potential distortion, which can compromise their function and lead to deployment failure or unnecessary replacement.',
          },
        ],
      },
      {
        id: 'ltr-pdr',
        name: 'PDR → R&I Head Airbag',
        types: ['pdr'],
        notes: [
          {
            id: 'ltr-pdr-1',
            text: 'Head airbags must be removed when performing PDR because they are mounted behind the headliner, directly in the area where tools are inserted to access dents. Leaving them in place risks accidental deployment due to pressure or movement, which will damage the airbags and create a costly repair.',
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
    operations: [],
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
        types: ['pdr', 'repair', 'rr'],
        notes: [
          {
            id: 'rb-ri-1',
            text: 'The bumper cover must be removed to remove the headlamps because modern vehicle designs secure the headlamps with fasteners that are hidden beneath or behind the bumper cover.',
          },
        ],
      },
    ],
  },
];
