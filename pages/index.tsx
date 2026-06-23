import React, { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import { PANELS } from '../lib/estimateData';
import type { CarPanel } from '../lib/estimateData';

// ─── Search ───────────────────────────────────────────────────────────────────

interface SearchHit {
  panelId: string;
  panelLabel: string;
  opId?: string;
  opName?: string;
  type: 'panel' | 'op' | 'note';
  snippet?: string;
}

function doSearch(q: string): SearchHit[] {
  if (!q.trim()) return [];
  const lq = q.toLowerCase();
  const hits: SearchHit[] = [];
  const seen = new Set<string>();

  for (const panel of PANELS) {
    if (panel.label.toLowerCase().includes(lq)) {
      const key = panel.id;
      if (!seen.has(key)) { seen.add(key); hits.push({ panelId: panel.id, panelLabel: panel.label, type: 'panel' }); }
    }
    for (const op of panel.operations) {
      if (op.name.toLowerCase().includes(lq)) {
        const key = `${panel.id}:${op.id}`;
        if (!seen.has(key)) { seen.add(key); hits.push({ panelId: panel.id, panelLabel: panel.label, opId: op.id, opName: op.name, type: 'op' }); }
      }
      for (const note of op.notes) {
        if (note.text.toLowerCase().includes(lq)) {
          const key = `${panel.id}:${op.id}:${note.id}`;
          if (!seen.has(key)) {
            seen.add(key);
            const idx = note.text.toLowerCase().indexOf(lq);
            const s = Math.max(0, idx - 20);
            const e = Math.min(note.text.length, idx + 70);
            hits.push({
              panelId: panel.id, panelLabel: panel.label,
              opId: op.id, opName: op.name,
              type: 'note',
              snippet: (s > 0 ? '…' : '') + note.text.slice(s, e) + (e < note.text.length ? '…' : ''),
            });
          }
        }
      }
    }
  }
  return hits.slice(0, 8);
}

// ─── SVG paths & panel layouts ───────────────────────────────────────────────

// Sedan — viewBox "0 0 200 490"
// Wheel arches: front at y=112–150 (bows to x≈13), rear at y=322–360
const CAR_PATH =
  'M 78,8 C 60,8 28,22 20,54 L 16,112 C 13,125 13,138 16,150 L 16,322 C 13,335 13,348 16,360 L 22,432 C 28,460 62,476 100,476 C 138,476 172,460 178,432 L 184,360 C 187,348 187,335 184,322 L 184,150 C 187,138 187,125 184,112 L 180,54 C 172,22 140,8 122,8 Z';

// Truck cab — viewBox "0 0 200 490"
// Front wheel arches at y=108–142
const TRUCK_CAB_PATH =
  'M 70,8 C 52,8 22,22 18,52 L 16,108 C 13,120 13,132 16,142 L 16,278 L 184,278 L 184,142 C 187,132 187,120 184,108 L 182,52 C 178,22 148,8 130,8 Z';

// Truck bed — viewBox "0 0 200 490"
const TRUCK_BED_PATH =
  'M 18,295 L 18,462 C 18,470 26,474 36,474 L 164,474 C 174,474 182,470 182,462 L 182,295 Z';

interface DiagramPanel {
  id: string;
  lbl: string;
  x: number; y: number; w: number; h: number;
  lx: number; ly: number; fs: number;
  rot?: boolean; // rotate label 90° for narrow vertical panels (e.g. roof rails)
}

// ── Sedan panels (viewBox "0 0 200 490") ─────────────────────────────────────
// Glass bands (windshield y=150–186, rear glass y=322–358) are visual-only, not panels
// Door area y=186–322 split at y=254 (B-pillar gap): front doors above, rear below
const DIAGRAM_PANELS: DiagramPanel[] = [
  { id: 'front-bumper',  lbl: 'Front Bumper', x: 0,   y: 0,   w: 200, h: 54,  lx: 100, ly: 32,  fs: 7   },
  { id: 'lt-fender',     lbl: 'LT Fender',    x: 0,   y: 54,  w: 58,  h: 96,  lx: 37,  ly: 104, fs: 6.5 },
  { id: 'hood',          lbl: 'Hood',          x: 58,  y: 54,  w: 84,  h: 96,  lx: 100, ly: 104, fs: 11  },
  { id: 'rt-fender',     lbl: 'RT Fender',     x: 142, y: 54,  w: 58,  h: 96,  lx: 163, ly: 104, fs: 6.5 },
  { id: 'lt-front-door', lbl: 'LT Front',     x: 0,   y: 186, w: 58,  h: 68,  lx: 37,  ly: 221, fs: 6        },
  { id: 'lt-rear-door',  lbl: 'LT Rear',      x: 0,   y: 254, w: 58,  h: 68,  lx: 37,  ly: 289, fs: 6        },
  { id: 'lt-roof-rail',  lbl: 'LT Rail',      x: 58,  y: 186, w: 8,   h: 136, lx: 62,  ly: 254, fs: 5, rot: true },
  { id: 'roof',          lbl: 'Roof',         x: 66,  y: 186, w: 68,  h: 136, lx: 100, ly: 254, fs: 10       },
  { id: 'rt-roof-rail',  lbl: 'RT Rail',      x: 134, y: 186, w: 8,   h: 136, lx: 138, ly: 254, fs: 5, rot: true },
  { id: 'rt-front-door', lbl: 'RT Front',     x: 142, y: 186, w: 58,  h: 68,  lx: 163, ly: 221, fs: 6        },
  { id: 'rt-rear-door',  lbl: 'RT Rear',      x: 142, y: 254, w: 58,  h: 68,  lx: 163, ly: 289, fs: 6        },
  { id: 'lt-quarter',    lbl: 'LT QP',        x: 0,   y: 358, w: 58,  h: 106, lx: 37,  ly: 411, fs: 7.5 },
  { id: 'lift-gate',     lbl: 'Lift Gate',    x: 58,  y: 358, w: 84,  h: 106, lx: 100, ly: 411, fs: 8   },
  { id: 'rt-quarter',    lbl: 'RT QP',        x: 142, y: 358, w: 58,  h: 106, lx: 163, ly: 411, fs: 7.5 },
  { id: 'rear-bumper',   lbl: 'Rear Bumper',  x: 0,   y: 464, w: 200, h: 26,  lx: 100, ly: 478, fs: 7   },
];

// ── Truck panels (cab) ────────────────────────────────────────────────────────
// Windshield visual band y=142–168; door area y=168–258 split at y=213 (front/rear)
const DIAGRAM_PANELS_TRUCK_CAB: DiagramPanel[] = [
  { id: 'front-bumper',  lbl: 'Front Bumper',  x: 0,   y: 0,   w: 200, h: 45,  lx: 100, ly: 27,  fs: 7   },
  { id: 'lt-fender',     lbl: 'LT Fender',     x: 0,   y: 45,  w: 62,  h: 97,  lx: 37,  ly: 95,  fs: 6.5 },
  { id: 'hood',          lbl: 'Hood',           x: 62,  y: 45,  w: 74,  h: 97,  lx: 99,  ly: 95,  fs: 11  },
  { id: 'rt-fender',     lbl: 'RT Fender',      x: 136, y: 45,  w: 64,  h: 97,  lx: 168, ly: 95,  fs: 6.5 },
  { id: 'lt-front-door', lbl: 'LT Front',       x: 0,   y: 168, w: 62,  h: 45,  lx: 37,  ly: 193, fs: 5.5           },
  { id: 'lt-rear-door',  lbl: 'LT Rear',        x: 0,   y: 213, w: 62,  h: 45,  lx: 37,  ly: 238, fs: 5.5           },
  { id: 'lt-roof-rail',  lbl: 'LT Rail',        x: 62,  y: 168, w: 8,   h: 90,  lx: 66,  ly: 213, fs: 5, rot: true  },
  { id: 'roof',          lbl: 'Roof',           x: 70,  y: 168, w: 58,  h: 90,  lx: 99,  ly: 213, fs: 9             },
  { id: 'rt-roof-rail',  lbl: 'RT Rail',        x: 128, y: 168, w: 8,   h: 90,  lx: 132, ly: 213, fs: 5, rot: true  },
  { id: 'rt-front-door', lbl: 'RT Front',       x: 136, y: 168, w: 64,  h: 45,  lx: 163, ly: 193, fs: 5.5           },
  { id: 'rt-rear-door',  lbl: 'RT Rear',        x: 136, y: 213, w: 64,  h: 45,  lx: 163, ly: 238, fs: 5.5           },
  { id: 'lt-cab-corner', lbl: 'LT Cab Cor',     x: 0,   y: 258, w: 62,  h: 20,  lx: 37,  ly: 270, fs: 5.5 },
  { id: 'rt-cab-corner', lbl: 'RT Cab Cor',     x: 138, y: 258, w: 62,  h: 20,  lx: 163, ly: 270, fs: 5.5 },
];

// ── Truck panels (bed) ────────────────────────────────────────────────────────
// Bed path y=295–474; center floor (x=72–128) is visual-only
const DIAGRAM_PANELS_TRUCK_BED: DiagramPanel[] = [
  { id: 'lt-bed',   lbl: 'LT Bed',   x: 0,   y: 295, w: 72,  h: 155, lx: 45,  ly: 370, fs: 7.5 },
  { id: 'rt-bed',   lbl: 'RT Bed',   x: 128, y: 295, w: 72,  h: 155, lx: 155, ly: 370, fs: 7.5 },
  { id: 'tailgate', lbl: 'Tailgate', x: 0,   y: 450, w: 200, h: 24,  lx: 100, ly: 463, fs: 7   },
];

// ─── Panel groups (clicking one selects both) ─────────────────────────────────

const PANEL_GROUPS: Record<string, string[]> = {
  'lt-roof-rail':  ['lt-roof-rail',  'rt-roof-rail'],
  'rt-roof-rail':  ['lt-roof-rail',  'rt-roof-rail'],
  'lt-fender':     ['lt-fender',     'rt-fender'],
  'rt-fender':     ['lt-fender',     'rt-fender'],
  'lt-front-door': ['lt-front-door', 'rt-front-door'],
  'rt-front-door': ['lt-front-door', 'rt-front-door'],
  'lt-rear-door':  ['lt-rear-door',  'rt-rear-door'],
  'rt-rear-door':  ['lt-rear-door',  'rt-rear-door'],
  'lt-quarter':    ['lt-quarter',    'rt-quarter'],
  'rt-quarter':    ['lt-quarter',    'rt-quarter'],
};

// ─── Car/Truck SVG diagram ────────────────────────────────────────────────────

type VehicleType = 'sedan' | 'truck';

function CarDiagram({ selectedIds, onSelect, vehicleType }: {
  selectedIds: string[];
  onSelect: (id: string) => void;
  vehicleType: VehicleType;
}) {
  const [hovered, setHovered] = useState<string | null>(null);

  const fill = (id: string) => {
    if (selectedIds.includes(id)) return 'var(--panel-selected)';
    if (hovered === id) return 'var(--panel-hover)';
    return 'var(--panel-default)';
  };

  const opCount = (id: string) => PANELS.find(p => p.id === id)?.operations.length ?? 0;

  const PanelRect = ({ p }: { p: DiagramPanel }) => (
    <rect
      x={p.x} y={p.y} width={p.w} height={p.h}
      fill={fill(p.id)}
      stroke="var(--panel-stroke)" strokeWidth="0.5"
      style={{ cursor: 'pointer', transition: 'fill 0.12s ease' }}
      onClick={() => onSelect(p.id)}
      onMouseEnter={() => setHovered(p.id)}
      onMouseLeave={() => setHovered(null)}
      role="button" aria-label={p.lbl}
    />
  );

  const PanelLabel = ({ p }: { p: DiagramPanel }) => {
    const count = opCount(p.id);
    const sel = selectedIds.includes(p.id);
    // For rotated (rail) panels, put badge near top-centre of strip
    const bx = p.rot ? p.lx                                          : p.lx + Math.ceil(p.lbl.length * p.fs * 0.29) + 5;
    const by = p.rot ? p.y + 8                                       : p.ly - p.fs;
    return (
      <g style={{ pointerEvents: 'none', userSelect: 'none' }}>
        <text x={p.lx} y={p.ly} textAnchor="middle" fontSize={p.fs}
          fontFamily="Arial, Helvetica, sans-serif"
          fontWeight={sel ? 700 : 400}
          fill={sel ? 'var(--panel-sel-text)' : 'var(--panel-lbl)'}
          transform={p.rot ? `rotate(-90,${p.lx},${p.ly})` : undefined}>
          {p.lbl}
        </text>
        {count > 0 && (
          <>
            <circle cx={bx} cy={by} r={4.5} fill={sel ? 'var(--amber)' : 'var(--badge-bg)'} />
            <text x={bx} y={by + 3} textAnchor="middle" fontSize={5}
              fontFamily="Arial" fill={sel ? '#000' : 'white'} fontWeight={700}>
              {count}
            </text>
          </>
        )}
      </g>
    );
  };

  if (vehicleType === 'truck') {
    return (
      <svg viewBox="0 0 200 490" style={{ width: '100%', maxWidth: 210, height: 'auto', display: 'block', margin: '0 auto' }}>
        <defs>
          <clipPath id="truck-cab-clip"><path d={TRUCK_CAB_PATH} /></clipPath>
          <clipPath id="truck-bed-clip"><path d={TRUCK_BED_PATH} /></clipPath>
        </defs>

        {/* Cab tires (drawn before body so body clips over → wheel arch effect) */}
        {([{x:0,y:104,w:18,h:42},{x:182,y:104,w:18,h:42}] as const).map((t,i) => (
          <g key={i} style={{ pointerEvents: 'none' }}>
            <rect x={t.x} y={t.y} width={t.w} height={t.h} rx={5} fill="var(--tire)" />
            <rect x={t.x+3} y={t.y+6} width={t.w-6} height={t.h-12} rx={3} fill="var(--tire-inner)" opacity={0.6} />
          </g>
        ))}

        {/* Cab body */}
        <path d={TRUCK_CAB_PATH} fill="var(--car-body)" stroke="var(--car-stroke)" strokeWidth="1.5" />
        <g clipPath="url(#truck-cab-clip)">
          {DIAGRAM_PANELS_TRUCK_CAB.map(p => <PanelRect key={p.id} p={p} />)}
          {/* Windshield glass (trapezoidal) */}
          <path d="M 34,142 L 30,168 L 170,168 L 166,142 Z" fill="var(--glass)" style={{ pointerEvents: 'none' }} />
          {/* Front door windows */}
          <rect x={18} y={174} width={37} height={33} rx={2} fill="var(--window-g)" style={{ pointerEvents: 'none' }} />
          <rect x={145} y={174} width={37} height={33} rx={2} fill="var(--window-g)" style={{ pointerEvents: 'none' }} />
          {/* Rear door windows */}
          <rect x={18} y={219} width={37} height={32} rx={2} fill="var(--window-g)" style={{ pointerEvents: 'none' }} />
          <rect x={145} y={219} width={37} height={32} rx={2} fill="var(--window-g)" style={{ pointerEvents: 'none' }} />
            {/* Rail inner edge highlight */}
          <line x1={70} y1={168} x2={70} y2={258} stroke="var(--rail-hl)" strokeWidth={0.6} style={{ pointerEvents: 'none' }} />
          <line x1={128} y1={168} x2={128} y2={258} stroke="var(--rail-hl)" strokeWidth={0.6} style={{ pointerEvents: 'none' }} />
          {/* Fender divider lines */}
          <line x1={62} y1={45} x2={62} y2={142} stroke="var(--detail)" strokeWidth={0.8} opacity={0.7} style={{ pointerEvents: 'none' }} />
          <line x1={136} y1={45} x2={136} y2={142} stroke="var(--detail)" strokeWidth={0.8} opacity={0.7} style={{ pointerEvents: 'none' }} />
        </g>

        {/* Cab detail lines */}
        {/* A-pillars */}
        <line x1={22} y1={142} x2={30} y2={168} stroke="var(--pillar)" strokeWidth={1.2} style={{ pointerEvents: 'none' }} />
        <line x1={178} y1={142} x2={170} y2={168} stroke="var(--pillar)" strokeWidth={1.2} style={{ pointerEvents: 'none' }} />
        {/* Outer B-pillar edge (left side of LT rail, right side of RT rail) */}
        <line x1={62} y1={168} x2={62} y2={258} stroke="var(--detail)" strokeWidth={1} style={{ pointerEvents: 'none' }} />
        <line x1={136} y1={168} x2={136} y2={258} stroke="var(--detail)" strokeWidth={1} style={{ pointerEvents: 'none' }} />
        {/* Front/rear door divider */}
        <line x1={18} y1={213} x2={62} y2={213} stroke="var(--detail)" strokeWidth={0.8} style={{ pointerEvents: 'none' }} />
        <line x1={136} y1={213} x2={182} y2={213} stroke="var(--detail)" strokeWidth={0.8} style={{ pointerEvents: 'none' }} />
        {/* Hood crease */}
        <line x1={100} y1={45} x2={100} y2={142} stroke="var(--detail)" strokeWidth={0.8} opacity={0.7} style={{ pointerEvents: 'none' }} />
        {/* Side mirrors */}
        <path d="M 12,144 C 5,147 4,157 8,162 L 15,160 L 14,144 Z" fill="var(--mirror)" stroke="var(--pillar)" strokeWidth={0.6} style={{ pointerEvents: 'none' }} />
        <path d="M 188,144 C 195,147 196,157 192,162 L 185,160 L 186,144 Z" fill="var(--mirror)" stroke="var(--pillar)" strokeWidth={0.6} style={{ pointerEvents: 'none' }} />

        {DIAGRAM_PANELS_TRUCK_CAB.map(p => <PanelLabel key={`l-${p.id}`} p={p} />)}

        {/* Gap label */}
        <text x={100} y={287} textAnchor="middle" fontSize={5} fill="var(--gap-txt)"
          fontFamily="Arial" style={{ userSelect: 'none' as const, pointerEvents: 'none' as const }}>
          ── CAB / BED GAP ──
        </text>

        {/* Bed body */}
        <path d={TRUCK_BED_PATH} fill="var(--car-body)" stroke="var(--car-stroke)" strokeWidth="1.5" />
        <g clipPath="url(#truck-bed-clip)">
          {DIAGRAM_PANELS_TRUCK_BED.map(p => <PanelRect key={p.id} p={p} />)}
          {/* Center floor (darker strip between bed sides) */}
          <rect x={72} y={295} width={56} height={155} fill="var(--bed-floor)" style={{ pointerEvents: 'none' }} />
          {/* Bed rib lines */}
          <line x1={20} y1={338} x2={180} y2={338} stroke="var(--bed-line)" strokeWidth={0.8} style={{ pointerEvents: 'none' }} />
          <line x1={20} y1={381} x2={180} y2={381} stroke="var(--bed-line)" strokeWidth={0.8} style={{ pointerEvents: 'none' }} />
          <line x1={20} y1={424} x2={180} y2={424} stroke="var(--bed-line)" strokeWidth={0.8} style={{ pointerEvents: 'none' }} />
          {/* Bed rail lines */}
          <line x1={72} y1={295} x2={72} y2={450} stroke="var(--bed-line)" strokeWidth={0.8} style={{ pointerEvents: 'none' }} />
          <line x1={128} y1={295} x2={128} y2={450} stroke="var(--bed-line)" strokeWidth={0.8} style={{ pointerEvents: 'none' }} />
        </g>
        {DIAGRAM_PANELS_TRUCK_BED.map(p => <PanelLabel key={`l-${p.id}`} p={p} />)}
      </svg>
    );
  }

  // ── Sedan ──────────────────────────────────────────────────────────────────
  return (
    <svg viewBox="0 0 200 490" style={{ width: '100%', maxWidth: 210, height: 'auto', display: 'block', margin: '0 auto' }}>
      <defs>
        <clipPath id="car-clip"><path d={CAR_PATH} /></clipPath>
      </defs>

      {/* Tires (drawn before car body so body clips over → wheel arch effect) */}
      {([
        {x:0,   y:108, w:18, h:46},  // FL
        {x:182, y:108, w:18, h:46},  // FR
        {x:0,   y:318, w:18, h:46},  // RL
        {x:182, y:318, w:18, h:46},  // RR
      ] as const).map((t, i) => (
        <g key={i} style={{ pointerEvents: 'none' }}>
          <rect x={t.x} y={t.y} width={t.w} height={t.h} rx={5} fill="var(--tire)" />
          <rect x={t.x+3} y={t.y+6} width={t.w-6} height={t.h-12} rx={3} fill="var(--tire-inner)" opacity={0.6} />
        </g>
      ))}

      {/* Car body */}
      <path d={CAR_PATH} fill="var(--car-body)" stroke="var(--car-stroke)" strokeWidth="1.5" />

      {/* Panels + glass overlays (clipped to car silhouette) */}
      <g clipPath="url(#car-clip)">
        {DIAGRAM_PANELS.map(p => <PanelRect key={p.id} p={p} />)}
        {/* Windshield glass (trapezoidal A-pillar taper) */}
        <path d="M 34,150 L 30,186 L 170,186 L 166,150 Z" fill="var(--glass)" style={{ pointerEvents: 'none' }} />
        {/* Rear glass */}
        <path d="M 30,322 L 34,358 L 166,358 L 170,322 Z" fill="var(--glass)" style={{ pointerEvents: 'none' }} />
        {/* Front door windows */}
        <rect x={18} y={193} width={37} height={52} rx={2} fill="var(--window-g)" style={{ pointerEvents: 'none' }} />
        <rect x={145} y={193} width={37} height={52} rx={2} fill="var(--window-g)" style={{ pointerEvents: 'none' }} />
        {/* Rear door windows */}
        <rect x={18} y={258} width={37} height={55} rx={2} fill="var(--window-g)" style={{ pointerEvents: 'none' }} />
        <rect x={145} y={258} width={37} height={55} rx={2} fill="var(--window-g)" style={{ pointerEvents: 'none' }} />
        {/* Rail inner edge highlight */}
        <line x1={66} y1={186} x2={66} y2={322} stroke="var(--rail-hl)" strokeWidth={0.6} style={{ pointerEvents: 'none' }} />
        <line x1={134} y1={186} x2={134} y2={322} stroke="var(--rail-hl)" strokeWidth={0.6} style={{ pointerEvents: 'none' }} />
        {/* Fender divider lines */}
        <line x1={58} y1={54} x2={58} y2={150} stroke="var(--detail)" strokeWidth={0.8} opacity={0.7} style={{ pointerEvents: 'none' }} />
        <line x1={142} y1={54} x2={142} y2={150} stroke="var(--detail)" strokeWidth={0.8} opacity={0.7} style={{ pointerEvents: 'none' }} />
      </g>

      {/* Structural detail lines (rendered on top of body) */}
      {/* A-pillars */}
      <line x1={22} y1={150} x2={30} y2={186} stroke="var(--pillar)" strokeWidth={1.2} style={{ pointerEvents: 'none' }} />
      <line x1={178} y1={150} x2={170} y2={186} stroke="var(--pillar)" strokeWidth={1.2} style={{ pointerEvents: 'none' }} />
      {/* C-pillars */}
      <line x1={22} y1={360} x2={30} y2={322} stroke="var(--pillar)" strokeWidth={1.2} style={{ pointerEvents: 'none' }} />
      <line x1={178} y1={360} x2={170} y2={322} stroke="var(--pillar)" strokeWidth={1.2} style={{ pointerEvents: 'none' }} />
      {/* B-pillar outer edge (left of LT rail strip, right of RT rail strip) */}
      <line x1={58} y1={186} x2={58} y2={322} stroke="var(--detail)" strokeWidth={1} style={{ pointerEvents: 'none' }} />
      <line x1={142} y1={186} x2={142} y2={322} stroke="var(--detail)" strokeWidth={1} style={{ pointerEvents: 'none' }} />
      {/* Front/rear door divider (horizontal, at B-pillar gap y=254) */}
      <line x1={16} y1={254} x2={58} y2={254} stroke="var(--detail)" strokeWidth={0.8} style={{ pointerEvents: 'none' }} />
      <line x1={142} y1={254} x2={184} y2={254} stroke="var(--detail)" strokeWidth={0.8} style={{ pointerEvents: 'none' }} />
      {/* Hood center crease */}
      <line x1={100} y1={54} x2={100} y2={150} stroke="var(--detail)" strokeWidth={0.8} opacity={0.7} style={{ pointerEvents: 'none' }} />
      {/* Side mirrors */}
      <path d="M 12,152 C 5,155 4,165 8,170 L 15,168 L 14,152 Z" fill="var(--mirror)" stroke="var(--pillar)" strokeWidth={0.6} style={{ pointerEvents: 'none' }} />
      <path d="M 188,152 C 195,155 196,165 192,170 L 185,168 L 186,152 Z" fill="var(--mirror)" stroke="var(--pillar)" strokeWidth={0.6} style={{ pointerEvents: 'none' }} />

      {DIAGRAM_PANELS.map(p => <PanelLabel key={`l-${p.id}`} p={p} />)}
    </svg>
  );
}

// ─── Copy button ──────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  };
  return (
    <button
      onClick={copy}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        marginTop: 8,
        padding: '5px 12px',
        background: copied ? 'var(--copy-ok-bg)' : 'var(--copy-bg)',
        color: copied ? 'var(--copy-ok-color)' : 'var(--copy-color)',
        border: `1px solid ${copied ? 'var(--copy-ok-border)' : 'var(--copy-border)'}`,
        borderRadius: 6,
        fontSize: 12,
        cursor: 'pointer',
        transition: 'all 0.15s',
        fontFamily: 'inherit',
      }}
    >
      <span style={{ fontSize: 13 }}>{copied ? '✓' : '⎘'}</span>
      {copied ? 'Copied!' : 'Copy note'}
    </button>
  );
}

// ─── Operations panel ─────────────────────────────────────────────────────────

function PanelOps({ panel }: { panel: CarPanel }) {
  const [activeOpId, setActiveOpId] = useState<string | null>(
    panel.operations.length === 1 ? panel.operations[0].id : null
  );

  const select = (opId: string) =>
    setActiveOpId(prev => (prev === opId ? null : opId));

  const activeOp = panel.operations.find(op => op.id === activeOpId) ?? null;

  if (panel.operations.length === 0) {
    return (
      <div style={{
        padding: '20px',
        background: 'var(--bg-card)',
        border: '1px dashed var(--border-input)',
        borderRadius: 10,
        color: 'var(--text-muted)',
        fontSize: 13,
        textAlign: 'center',
      }}>
        No operations yet for this panel.<br />
        <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>
          Add entries in <code style={{ color: 'var(--amber)' }}>lib/estimateData.ts</code>
        </span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Operation selector buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {panel.operations.map(op => {
          const active = activeOpId === op.id;
          return (
            <button
              key={op.id}
              onClick={() => select(op.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '11px 16px',
                background: active ? 'var(--panel-selected)' : 'var(--bg-card)',
                border: `1px solid ${active ? 'var(--amber)' : 'var(--border-card)'}`,
                borderRadius: 8,
                cursor: 'pointer',
                color: active ? 'var(--amber)' : 'var(--text-secondary)',
                fontFamily: 'inherit',
                fontSize: 13,
                fontWeight: active ? 700 : 500,
                textAlign: 'left',
                transition: 'all 0.12s ease',
              }}
            >
              <span style={{
                width: 14, height: 14, borderRadius: '50%', flexShrink: 0,
                border: `2px solid ${active ? 'var(--amber)' : 'var(--border-input)'}`,
                background: active ? 'var(--amber)' : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {active && <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#000', display: 'block' }} />}
              </span>
              <span style={{ flex: 1 }}>{op.name}</span>
            </button>
          );
        })}
      </div>

      {/* Note for selected operation */}
      {activeOp && activeOp.notes.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {activeOp.notes.map((note, ni) => (
            <div key={note.id} style={{
              paddingTop: ni > 0 ? 10 : 0,
              borderTop: ni > 0 ? '1px solid var(--border-note)' : 'none',
            }}>
              <p style={{
                margin: 0,
                padding: '12px 16px',
                background: 'var(--bg-note)',
                border: '1px solid var(--border-note)',
                borderRadius: 8,
                fontSize: 12.5,
                lineHeight: 1.7,
                color: 'var(--text-note)',
                fontFamily: "ui-monospace, 'Cascadia Code', 'Fira Code', Menlo, monospace",
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}>
                {note.text}
              </p>
              <CopyButton text={note.text} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      gap: 14,
      padding: 40,
    }}>
      <svg width="72" height="72" viewBox="0 0 72 72" fill="none" style={{ opacity: 0.2 }}>
        <ellipse cx="36" cy="36" rx="24" ry="30" stroke="var(--border-main)" strokeWidth="2.5" />
        <rect x="18" y="26" width="36" height="20" rx="2" stroke="var(--border-main)" strokeWidth="1.5" />
        <line x1="18" y1="36" x2="54" y2="36" stroke="var(--border-main)" strokeWidth="1.5" />
      </svg>
      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-muted)', textAlign: 'center' }}>
        Select a panel to see operations
      </div>
      <div style={{ fontSize: 13, color: 'var(--text-dim)', textAlign: 'center', maxWidth: 280, lineHeight: 1.6 }}>
        Click any area on the car diagram, or use the search bar to find specific operations and copy notes into CCC ONE.
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function Home() {
  const [vehicleType, setVehicleType] = useState<VehicleType>('sedan');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const searchRef = useRef<HTMLDivElement>(null);

  const hits = doSearch(query);
  const selectedPanels = PANELS.filter(p => selectedIds.includes(p.id));

  useEffect(() => {
    const saved = localStorage.getItem('hep-theme') as 'dark' | 'light' | null;
    if (saved) setTheme(saved);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('hep-theme', next);
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (id: string) => {
    const group = PANEL_GROUPS[id] || [id];
    setSelectedIds(prev => {
      const allSelected = group.every(gid => prev.includes(gid));
      return allSelected ? [] : group;
    });
  };

  const switchVehicle = (vt: VehicleType) => {
    setVehicleType(vt);
    setSelectedIds([]);
  };

  const isOnCurrentDiagram = (p: { onDiagram?: boolean; onTruckDiagram?: boolean }) =>
    vehicleType === 'sedan' ? !!p.onDiagram : !!p.onTruckDiagram;

  const selectFromSearch = (hit: SearchHit) => {
    const group = PANEL_GROUPS[hit.panelId] || [hit.panelId];
    setSelectedIds(group);
    setQuery('');
    setShowDropdown(false);
  };

  const typeIcon = (t: SearchHit['type']) =>
    t === 'panel' ? '📍' : t === 'op' ? '⚙️' : '📝';

  return (
    <>
      <Head>
        <title>Hail Estimator Pro</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          * { box-sizing: border-box; }
          body { margin: 0; }

          /* ── Dark theme (default) ── */
          :root {
            --bg-main:#131e2d; --bg-sidebar:#0f1a2a; --bg-card:#172032;
            --bg-note:#0f1c2e; --bg-input:#172032; --bg-dropdown:#172032;
            --border-main:#1e3a5f; --border-card:#243e5c; --border-note:#1e3450;
            --border-input:#2d4a6a; --border-sep:#0f1e30;
            --text-primary:#e2e8f0; --text-secondary:#64748b;
            --text-muted:#4d6a84; --text-dim:#3d5470; --text-note:#b0c4d8;
            --amber:#f59e0b; --amber-text:#fcd34d;
            --panel-default:#172032; --panel-hover:#1e3048; --panel-selected:#7c3d00;
            --panel-sel-text:#fcd34d; --panel-lbl:#3d5a78; --panel-stroke:#1a2535;
            --badge-bg:#1e3a5f; --car-body:#101c2c; --car-stroke:#2d4a6a;
            --glass:#06101c; --window-g:#07111e; --tire:#060d18; --tire-inner:#0d1a2e;
            --mirror:#162233; --pillar:#2a3f58; --detail:#1a2d42; --rail-hl:#243a54;
            --bed-floor:#0b1826; --bed-line:#1a2d45; --gap-txt:#1e3a5f;
            --copy-bg:#0f172a; --copy-border:#1e293b; --copy-color:#64748b;
            --copy-ok-bg:#052e16; --copy-ok-border:#16a34a; --copy-ok-color:#4ade80;
            --scroll-track:#1a2535; --scroll-thumb:#2d4258; --ph-color:#3d5470;
            --hit-hover:#1e3248; --snippet-color:#334155;
            --other-lbl:#1a2d42; --click-hint:#1e3a5f;
          }

          /* ── Light theme ── */
          [data-theme="light"] {
            --bg-main:#eef2f7; --bg-sidebar:#dce4ef; --bg-card:#e2ecf5;
            --bg-note:#f4f8fc; --bg-input:#e2ecf5; --bg-dropdown:#e8f0f8;
            --border-main:#9ab4cc; --border-card:#a8c0d4; --border-note:#b0c8dc;
            --border-input:#88a8c4; --border-sep:#c8d8e8;
            --text-primary:#1a2535; --text-secondary:#4a6280;
            --text-muted:#5a7898; --text-dim:#7090aa; --text-note:#2d4258;
            --amber:#d97706; --amber-text:#92400e;
            --panel-default:#c8d8e8; --panel-hover:#b4c8da; --panel-selected:#f59e0b;
            --panel-sel-text:#7c2d12; --panel-lbl:#4a6a84; --panel-stroke:#9ab4c8;
            --badge-bg:#5a7898; --car-body:#9ab8cc; --car-stroke:#5a7898;
            --glass:#527a96; --window-g:#6a8faa; --tire:#1e3048; --tire-inner:#2d4a62;
            --mirror:#3a5a76; --pillar:#4a7090; --detail:#6a8aaa; --rail-hl:#5a7898;
            --bed-floor:#88a8c0; --bed-line:#7090aa; --gap-txt:#88a8c4;
            --copy-bg:#e2ecf5; --copy-border:#c0d4e4; --copy-color:#4a6280;
            --copy-ok-bg:#d1fae5; --copy-ok-border:#34d399; --copy-ok-color:#065f46;
            --scroll-track:#d0dce8; --scroll-thumb:#9ab4c8; --ph-color:#7090aa;
            --hit-hover:#ccd8e6; --snippet-color:#4a6280;
            --other-lbl:#7090aa; --click-hint:#8aaac0;
          }

          ::-webkit-scrollbar { width: 6px; }
          ::-webkit-scrollbar-track { background: var(--scroll-track); }
          ::-webkit-scrollbar-thumb { background: var(--scroll-thumb); border-radius: 3px; }
          input::placeholder { color: var(--ph-color); }
          input:focus { outline: none; border-color: var(--amber) !important; box-shadow: 0 0 0 2px rgba(245,158,11,0.2); }
        `}</style>
      </Head>

      <div data-theme={theme} style={{
        minHeight: '100vh',
        maxHeight: '100vh',
        background: 'var(--bg-main)',
        color: 'var(--text-primary)',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif",
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>

        {/* ── Header ── */}
        <header style={{
          borderBottom: '2px solid var(--amber)',
          padding: '10px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          background: '#0d1623',
          flexShrink: 0,
          zIndex: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
            <div style={{
              width: 42, height: 42,
              background: 'var(--amber)',
              borderRadius: 6,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22,
              boxShadow: '0 2px 8px rgba(245,158,11,0.35)',
              flexShrink: 0,
            }}>⛏️</div>
            <div>
              <div style={{
                fontWeight: 900, fontSize: 17, color: 'var(--amber)',
                letterSpacing: '1.5px', textTransform: 'uppercase',
                fontFamily: "Georgia, 'Times New Roman', serif",
                lineHeight: 1.1, textShadow: '0 1px 6px rgba(245,158,11,0.3)',
              }}>
                Hail Estimator Pro
              </div>
              <div style={{ fontSize: 10, color: '#4d6a84', letterSpacing: '2px', textTransform: 'uppercase', marginTop: 1 }}>
                Estimate Assistant
              </div>
            </div>
          </div>

          {/* Search */}
          <div ref={searchRef} style={{ flex: 1, maxWidth: 420, position: 'relative' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span style={{ position: 'absolute', left: 11, fontSize: 14, color: 'var(--text-dim)', pointerEvents: 'none', lineHeight: 1 }}>🔍</span>
              <input
                value={query}
                onChange={e => { setQuery(e.target.value); setShowDropdown(true); }}
                onFocus={() => query && setShowDropdown(true)}
                onKeyDown={e => e.key === 'Escape' && setShowDropdown(false)}
                placeholder="Search panels, operations, notes..."
                style={{
                  width: '100%',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-input)',
                  borderRadius: 8,
                  padding: '8px 34px 8px 33px',
                  color: 'var(--text-primary)',
                  fontSize: 13.5,
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                }}
              />
              {query && (
                <button
                  onClick={() => { setQuery(''); setShowDropdown(false); }}
                  style={{ position: 'absolute', right: 10, background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: 2 }}
                >×</button>
              )}
            </div>

            {showDropdown && hits.length > 0 && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
                background: 'var(--bg-dropdown)', border: '1px solid var(--border-input)',
                borderRadius: 8, boxShadow: '0 12px 40px rgba(0,0,0,0.35)',
                zIndex: 200, overflow: 'hidden',
              }}>
                {hits.map((hit, i) => (
                  <button
                    key={i}
                    onClick={() => selectFromSearch(hit)}
                    style={{
                      display: 'block', width: '100%', textAlign: 'left',
                      padding: '10px 14px', background: 'none', border: 'none',
                      borderBottom: i < hits.length - 1 ? '1px solid var(--border-sep)' : 'none',
                      cursor: 'pointer', color: 'var(--text-primary)', transition: 'background 0.1s', fontFamily: 'inherit',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--hit-hover)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                  >
                    <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: hit.snippet ? 2 : 0 }}>
                      {typeIcon(hit.type)}&nbsp;
                      <span style={{ color: 'var(--text-secondary)' }}>{hit.panelLabel}</span>
                      {hit.opName && <span style={{ color: 'var(--text-dim)' }}> → {hit.opName}</span>}
                    </div>
                    {hit.snippet && (
                      <div style={{ fontSize: 12, color: 'var(--snippet-color)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {hit.snippet}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            style={{
              marginLeft: 'auto',
              flexShrink: 0,
              width: 34, height: 34,
              borderRadius: 8,
              border: '1px solid var(--border-input)',
              background: 'var(--bg-input)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s',
            }}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </header>

        {/* ── Body ── */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

          {/* Left: car diagram + chips */}
          <aside style={{
            width: 264,
            flexShrink: 0,
            borderRight: '1px solid var(--border-main)',
            background: 'var(--bg-sidebar)',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
          }}>
            <div style={{ padding: '16px 14px 0' }}>
              {/* Vehicle type toggle */}
              <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
                {(['sedan', 'truck'] as const).map(vt => (
                  <button
                    key={vt}
                    onClick={() => switchVehicle(vt)}
                    style={{
                      flex: 1,
                      padding: '6px 0',
                      borderRadius: 7,
                      fontSize: 11.5,
                      cursor: 'pointer',
                      background: vehicleType === vt ? 'var(--amber)' : 'var(--bg-card)',
                      color: vehicleType === vt ? '#000' : 'var(--text-muted)',
                      border: `1px solid ${vehicleType === vt ? 'var(--amber)' : 'var(--border-input)'}`,
                      fontWeight: vehicleType === vt ? 700 : 400,
                      fontFamily: 'inherit',
                      transition: 'all 0.15s',
                      letterSpacing: '0.3px',
                    }}
                  >
                    {vt === 'sedan' ? '🚗 Sedan / SUV' : '🛻 Pickup Truck'}
                  </button>
                ))}
              </div>

              <div style={{
                fontSize: 10, color: 'var(--click-hint)', textTransform: 'uppercase',
                letterSpacing: '1.2px', textAlign: 'center', marginBottom: 10,
              }}>Click a panel</div>
              <CarDiagram selectedIds={selectedIds} onSelect={handleSelect} vehicleType={vehicleType} />
            </div>

            {/* Chips for off-diagram panels */}
            <div style={{ padding: '16px 14px 20px' }}>
              <div style={{ fontSize: 10, color: 'var(--other-lbl)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8, paddingLeft: 2 }}>
                Other panels
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {PANELS.filter(p => !isOnCurrentDiagram(p)).map(p => {
                  const sel = selectedIds.includes(p.id);
                  const count = p.operations.length;
                  return (
                    <button
                      key={p.id}
                      onClick={() => handleSelect(p.id)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 20,
                        fontSize: 11.5,
                        cursor: 'pointer',
                        background: sel ? 'var(--panel-selected)' : 'var(--bg-card)',
                        color: sel ? 'var(--panel-sel-text)' : 'var(--text-muted)',
                        border: `1px solid ${sel ? 'var(--amber)' : 'var(--border-input)'}`,
                        transition: 'all 0.12s',
                        fontFamily: 'inherit',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      {p.label}
                      {count > 0 && (
                        <span style={{
                          background: sel ? 'var(--amber)' : 'var(--badge-bg)',
                          color: sel ? '#000' : 'white',
                          borderRadius: 10, fontSize: 9,
                          padding: '0 4px', lineHeight: '14px', fontWeight: 700,
                        }}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Right: operations + notes */}
          <main style={{ flex: 1, overflowY: 'auto', padding: '24px 28px', background: 'var(--bg-main)' }}>
            {selectedPanels.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                <div style={{
                  display: 'flex', alignItems: 'baseline', gap: 12,
                  marginBottom: 20, paddingBottom: 16,
                  borderBottom: '2px solid var(--border-main)',
                }}>
                  <h2 style={{
                    margin: 0, fontSize: 20, fontWeight: 900, color: 'var(--amber)',
                    textTransform: 'uppercase', letterSpacing: '1px',
                    fontFamily: "Georgia, 'Times New Roman', serif",
                  }}>
                    {selectedPanels.map(p => p.label).join(' & ')}
                  </h2>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {(() => {
                      const total = selectedPanels.reduce((s, p) => s + p.operations.length, 0);
                      return `${total} operation${total !== 1 ? 's' : ''}`;
                    })()}
                  </span>
                </div>
                {selectedPanels.map((panel, idx) => (
                  <div key={panel.id} style={{ marginBottom: idx < selectedPanels.length - 1 ? 28 : 0 }}>
                    {selectedPanels.length > 1 && (
                      <div style={{
                        fontSize: 10.5,
                        fontWeight: 700,
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '1.2px',
                        marginBottom: 12,
                        paddingTop: idx > 0 ? 20 : 0,
                        borderTop: idx > 0 ? '1px solid var(--border-main)' : 'none',
                      }}>
                        {panel.label}
                      </div>
                    )}
                    <PanelOps key={panel.id} panel={panel} />
                  </div>
                ))}
              </>
            )}
          </main>
        </div>
      </div>
    </>
  );
}
