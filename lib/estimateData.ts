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
export type VehicleType = 'sedan' | 'suv' | 'truck';

export interface EstimateNote {
  id: string;
  text: string;
}

export interface EstimateOperation {
  id: string;
  name: string;
  types: RepairType[];
  vehicles?: VehicleType[]; // if omitted, applies to all vehicle types
  notes: EstimateNote[];
  howTo?: string; // optional CCC ONE how-to-enter tip, shown behind an (i) icon — never mixed into notes[].text
}

export interface CarPanel {
  id: string;
  label: string;
  onDiagram?: boolean;       // shown on sedan/SUV SVG diagram
  onTruckDiagram?: boolean;  // shown on pickup truck SVG diagram
  operations: EstimateOperation[];
  tabLabelOverrides?: Partial<Record<RepairType, string>>; // e.g. relabel the 'pdr' tab to 'R&I' for glass panels
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
        howTo: 'In CCC ONE, add under the "Front Bumper" group (also listed as "Bumper & Components" or "Bumper Cover" depending on the estimate template).',
        notes: [
          {
            id: 'nn-fb-1',
            text: 'Drop front bumper cover. Removal is required to safely access and disconnect the headlamp assemblies, as the mounting fasteners and wiring harness connectors are located behind the bumper cover on most vehicles.',
          },
        ],
      },
      {
        id: 'nn-grille',
        name: 'R&I Grille',
        types: ['pdr', 'repair', 'rr'],
        vehicles: ['truck'],
        howTo: 'In CCC ONE, add under the "Grille" or "Front Bumper" group depending on how the template lists it.',
        notes: [
          {
            id: 'nn-grille-1',
            text: 'The grille assembly must be removed to fully disassemble the front bumper cover. On most vehicles the grille is clipped or bolted to the bumper structure, and removing it prevents damage to the mounting tabs and retaining clips during bumper R&I. It also provides clear access to the upper bumper fasteners that are otherwise blocked by the grille frame.',
          },
        ],
      },
      {
        id: 'nn-headlamps',
        name: 'R&I Headlamps (LT + RT)',
        types: ['pdr', 'repair', 'rr'],
        howTo: 'In CCC ONE, add both LT and RT under the "Headlamps" group.',
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
        howTo: 'In CCC ONE, add under "Electrical" or "Battery" group, billed at the Mechanical Labor Rate rather than body/paint labor.',
        notes: [
          {
            id: 'nn-bat-1',
            text: 'Battery must be disconnected before any SRS component handling, as the backup capacitor retains deployment-level charge for up to 2 minutes. This is required by all OEM service procedures and I-CAR standards whenever airbag assemblies or headliner components are disturbed. Please add for Mechanical Labor Rate.',
          },
        ],
      },
      {
        id: 'nn-antenna',
        name: 'R&I Antenna',
        types: ['pdr', 'repair', 'rr'],
        howTo: 'In CCC ONE, add under the "Antenna" line (roof-mount) or the relevant trim group if integrated into a roof rail or shark-fin housing.',
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
        howTo: 'In CCC ONE, add both LT and RT under the "Restraint Systems" group, billed at the Mechanical Labor Rate.',
        notes: [
          {
            id: 'nn-ab-1',
            text: 'Head airbags must be removed when performing PDR because they are mounted behind the headliner, directly in the area where tools are inserted to access dents. Leaving them in place risks accidental deployment due to pressure or movement, which will damage the airbags and create a costly repair. Please add for Mechanical Labor Rate.',
          },
        ],
      },
      {
        id: 'nn-taillamps',
        name: 'R&I Tail Lamps (LT + RT)',
        types: ['pdr', 'repair', 'rr'],
        vehicles: ['sedan', 'suv'],
        howTo: 'In CCC ONE, add both LT and RT under the "Rear Lamps" group.',
        notes: [
          {
            id: 'nn-tl-1',
            text: 'Tail lamp assemblies must be removed to allow PDR tool access to the quarter panels.',
          },
        ],
      },
      {
        id: 'nn-taillamps-truck',
        name: 'R&I Tail Lamps (LT + RT)',
        types: ['pdr', 'repair', 'rr'],
        vehicles: ['truck'],
        howTo: 'In CCC ONE, add both LT and RT under the "Rear Lamps" group.',
        notes: [
          {
            id: 'nn-tl-truck-1',
            text: 'Tail lamp assemblies must be removed to allow PDR tool access to the pickup bed side.',
          },
        ],
      },
      {
        id: 'nn-high-mount-lamp',
        name: 'R&I High Mount Lamp',
        types: ['pdr', 'repair', 'rr'],
        vehicles: ['truck'],
        howTo: 'In CCC ONE, add under "Rear Lamps" or "CHMSL" if listed separately.',
        notes: [
          {
            id: 'nn-hml-1',
            text: 'The high mount stop lamp (CHMSL) is mounted at the top of the cab rear window or tailgate and must be removed to allow full PDR tool access to the upper cab corners and roof trailing edge. Leaving it in place obstructs tool insertion and risks cracking the lamp housing from vibration or incidental contact during repair.',
          },
        ],
      },
      {
        id: 'nn-rear-bumper',
        name: 'R&I Rear Bumper',
        types: ['pdr', 'repair', 'rr'],
        howTo: 'In CCC ONE, add under the "Rear Bumper" group (also listed as "Bumper & Components" or "Bumper Cover" depending on the estimate template).',
        notes: [
          {
            id: 'nn-rb-1',
            text: 'The bumper cover must be removed to remove the tail lamps because modern vehicle designs secure the tail lamps with fasteners that are hidden beneath or behind the bumper cover.',
          },
        ],
      },
      {
        id: 'nn-truck-backglass',
        name: 'Back Glass R&I',
        types: ['pdr'],
        vehicles: ['truck'],
        howTo: 'In CCC ONE, add under the "Back Glass" group.',
        notes: [
          {
            id: 'nn-truck-bg-1',
            text: 'The back glass must be removed on pickup trucks to access the roof panel from the rear. PDR access from the sides alone does not provide full visibility of roof damage — working blind increases the risk of over-pushing or missing dents. Removal also protects the glass from heat, vibration, and debris during the repair process.',
          },
        ],
      },
      {
        id: 'nn-truck-urethane',
        name: 'Urethane Glass Kit ($30)',
        types: ['pdr'],
        vehicles: ['truck'],
        howTo: 'Enter as a manual line item in CCC ONE, $30.',
        notes: [
          {
            id: 'nn-truck-ur-1',
            text: 'Replace Urethane Glass Kit ($30) — required whenever back glass is R&I or R&R. Enter as a manual line item in CCC ONE.',
          },
        ],
      },
      {
        id: 'nn-pre-scan',
        name: 'Pre-Scan',
        types: ['pdr'],
        howTo: 'In CCC ONE, add under "Diagnostics" as Pre-Scan, billed at the Mechanical Labor Rate.',
        notes: [
          {
            id: 'nn-scan-1',
            text: 'A pre-scan is required before PDR repairs to document any existing diagnostic trouble codes (DTCs) and verify the condition of all electronic and safety systems. Accessing dents often requires removal of components like the headliner, which can trigger faults in airbag, lighting, or sensor systems. Please add for Mechanical Labor Rate.',
          },
        ],
      },
      {
        id: 'nn-post-scan',
        name: 'Post-Scan',
        types: ['pdr'],
        howTo: 'In CCC ONE, add under "Diagnostics" as Post-Scan, billed at the Mechanical Labor Rate.',
        notes: [
          {
            id: 'nn-scan-2',
            text: 'A post-scan is required after PDR repairs to detect and clear any diagnostic trouble codes (DTCs) triggered during disassembly or reassembly, especially when components like the headliner and head airbags are removed. These systems are sensitive and will log faults if disconnected or disturbed. Please add for Mechanical Labor Rate.',
          },
        ],
      },
      {
        id: 'nn-misc',
        name: 'Miscellaneous Line Items',
        types: ['pdr', 'repair', 'rr'],
        howTo: 'Add each of these individually as a manual line item in CCC ONE.',
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
            text: 'Drop front bumper cover. Removal is required to safely access and disconnect the headlamp assemblies, as the mounting fasteners and wiring harness connectors are located behind the bumper cover on most vehicles.',
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
        id: 'ltf-liner',
        name: 'R&I Fender Liner',
        types: ['pdr'],
        howTo: 'In CCC ONE, add under the "Fender" group as R&I Fender Liner (Splash Shield).',
        notes: [
          {
            id: 'ltf-liner-1',
            text: 'Fender liner must be R&I on panels with more than 6 dents — it provides secondary tool access from behind the fender when the primary access point is not enough to reach every dent.',
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
    tabLabelOverrides: { pdr: 'R&I' },
    operations: [
      {
        id: 'ws-urethane',
        name: 'Windshield R&I or R&R → Urethane Kit',
        types: ['pdr', 'rr'],
        notes: [
          {
            id: 'ws-ur-1',
            text: 'Required whenever windshield is R&I or R&R.',
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
      {
        id: 'cg-wipers',
        name: 'Cowl Grille R&I or R&R → R&I Windshield Wipers',
        types: ['pdr', 'rr'],
        notes: [
          {
            id: 'cg-wipers-1',
            text: 'Windshield wipers must be removed to access and remove the cowl grille, as the wiper arms sit directly over the cowl panel and block its fasteners.',
          },
        ],
      },
      {
        id: 'cg-arms',
        name: 'Cowl Grille R&I or R&R → R&I Windshield Arms',
        types: ['pdr', 'rr'],
        notes: [
          {
            id: 'cg-arms-1',
            text: 'Windshield wiper arms must be removed to allow the cowl grille to be lifted free of the wiper pivots.',
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
        id: 'roof-pdr-overhead-console',
        name: 'PDR → R&I Overhead Console',
        types: ['pdr'],
        howTo: 'Overhead console can be found in CCC ONE under the "Console" group.',
        notes: [
          {
            id: 'roof-pdr-oc-1',
            text: 'Overhead console must be R&I to remove the headliner.',
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

  // ── PDR MAX ───────────────────────────────────────────────────────────────
  {
    id: 'pdr-max',
    label: 'PDR MAX',
    onDiagram: false,
    operations: [
      {
        id: 'pdrmax-cap',
        name: 'PDR MAX → Priced as Replace',
        types: ['pdr'],
        howTo: 'In CCC ONE, keep the operation set to PDR, but price the line at the panel\'s replacement (R&R) rate instead of per-dent PDR pricing.',
        notes: [
          {
            id: 'pdrmax-1',
            text: 'PDR damages exceed the PDR matrix. The repair method stays PDR, but it is priced as a replacement — the highest amount the matrix allows for panel repair.',
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
            text: 'Sail panel has no tool access, glue pull required. Add 25% markup for double panel.',
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
        id: 'ltcc-pdr-markup',
        name: 'PDR → 25% Markup (Double Panel)',
        types: ['pdr'],
        notes: [
          {
            id: 'ltcc-pdr-mk-1',
            text: 'Add 25% markup for double panel — cab corners are a double-panel structure with limited tool access.',
          },
        ],
      },
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
        id: 'rtcc-pdr-markup',
        name: 'PDR → 25% Markup (Double Panel)',
        types: ['pdr'],
        notes: [
          {
            id: 'rtcc-pdr-mk-1',
            text: 'Add 25% markup for double panel — cab corners are a double-panel structure with limited tool access.',
          },
        ],
      },
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
            text: 'Please add 25% markup for EXTENDED PANEL.',
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
      {
        id: 'ltb-upper-molding',
        name: 'R&I Upper Molding',
        types: ['pdr'],
        notes: [
          {
            id: 'ltb-um-1',
            text: 'The upper bed molding (bed rail cap) must be removed to allow PDR wand tool access to the top edge of the pickup bed side. Dents along the upper portion of the bed panel cannot be reached from inside the bed alone — removing the molding exposes the inner flange and provides the necessary clearance to work the metal from above without obstruction.',
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
            text: 'Please add 25% markup for EXTENDED PANEL.',
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
      {
        id: 'rtb-upper-molding',
        name: 'R&I Upper Molding',
        types: ['pdr'],
        notes: [
          {
            id: 'rtb-um-1',
            text: 'The upper bed molding (bed rail cap) must be removed to allow PDR wand tool access to the top edge of the pickup bed side. Dents along the upper portion of the bed panel cannot be reached from inside the bed alone — removing the molding exposes the inner flange and provides the necessary clearance to work the metal from above without obstruction.',
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
        id: 'ltr-pdr-markup',
        name: 'PDR → 25% Markup (Double Panel)',
        types: ['pdr'],
        notes: [
          {
            id: 'ltr-pdr-mk-1',
            text: 'Add 25% markup for double panel — roof rails are a double-panel structure with limited tool access.',
          },
        ],
      },
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
            text: 'Head airbags must be removed when performing PDR because they are mounted behind the headliner, directly in the area where tools are inserted to access dents. Leaving them in place risks accidental deployment due to pressure or movement, which will damage the airbags and create a costly repair. Please add for Mechanical Labor Rate.',
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
            text: 'The bumper cover must be removed to remove the tail lamps because modern vehicle designs secure the tail lamps with fasteners that are hidden beneath or behind the bumper cover.',
          },
        ],
      },
    ],
  },
];
