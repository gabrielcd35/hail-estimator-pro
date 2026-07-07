import React, { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import { PANELS } from '../lib/estimateData';
import type { CarPanel, RepairType } from '../lib/estimateData';

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

const CAR_PATH =
  'M 78,8 C 60,8 28,22 20,54 L 16,112 C 13,125 13,138 16,150 L 16,322 C 13,335 13,348 16,360 L 22,432 C 28,460 62,476 100,476 C 138,476 172,460 178,432 L 184,360 C 187,348 187,335 184,322 L 184,150 C 187,138 187,125 184,112 L 180,54 C 172,22 140,8 122,8 Z';

const TRUCK_CAB_PATH =
  'M 70,8 C 52,8 22,22 18,52 L 16,108 C 13,120 13,132 16,142 L 16,278 L 184,278 L 184,142 C 187,132 187,120 184,108 L 182,52 C 178,22 148,8 130,8 Z';

const TRUCK_BED_PATH =
  'M 18,295 L 18,462 C 18,470 26,474 36,474 L 164,474 C 174,474 182,470 182,462 L 182,295 Z';

interface DiagramPanel {
  id: string;
  lbl: string;
  x: number; y: number; w: number; h: number;
  lx: number; ly: number; fs: number;
  rot?: boolean;
}

const DIAGRAM_PANELS: DiagramPanel[] = [
  { id: 'front-bumper',  lbl: 'Front Bumper', x: 0,   y: 0,   w: 200, h: 54,  lx: 100, ly: 32,  fs: 7   },
  { id: 'lt-fender',     lbl: 'LT Fender',    x: 0,   y: 54,  w: 58,  h: 96,  lx: 37,  ly: 104, fs: 6.5 },
  { id: 'hood',          lbl: 'Hood',          x: 58,  y: 54,  w: 84,  h: 96,  lx: 100, ly: 104, fs: 11  },
  { id: 'rt-fender',     lbl: 'RT Fender',     x: 142, y: 54,  w: 58,  h: 96,  lx: 163, ly: 104, fs: 6.5 },
  { id: 'lt-front-door', lbl: 'LT Front',      x: 0,   y: 186, w: 58,  h: 68,  lx: 37,  ly: 221, fs: 6   },
  { id: 'lt-rear-door',  lbl: 'LT Rear',       x: 0,   y: 254, w: 58,  h: 68,  lx: 37,  ly: 289, fs: 6   },
  { id: 'lt-roof-rail',  lbl: 'LT Rail',       x: 58,  y: 186, w: 8,   h: 136, lx: 62,  ly: 254, fs: 5, rot: true },
  { id: 'roof',          lbl: 'Roof',          x: 66,  y: 186, w: 68,  h: 136, lx: 100, ly: 254, fs: 10  },
  { id: 'rt-roof-rail',  lbl: 'RT Rail',       x: 134, y: 186, w: 8,   h: 136, lx: 138, ly: 254, fs: 5, rot: true },
  { id: 'rt-front-door', lbl: 'RT Front',      x: 142, y: 186, w: 58,  h: 68,  lx: 163, ly: 221, fs: 6   },
  { id: 'rt-rear-door',  lbl: 'RT Rear',       x: 142, y: 254, w: 58,  h: 68,  lx: 163, ly: 289, fs: 6   },
  { id: 'lt-quarter',    lbl: 'LT QP',         x: 0,   y: 358, w: 58,  h: 106, lx: 37,  ly: 411, fs: 7.5 },
  { id: 'lift-gate',     lbl: 'Lift Gate',     x: 58,  y: 358, w: 84,  h: 106, lx: 100, ly: 411, fs: 8   },
  { id: 'rt-quarter',    lbl: 'RT QP',         x: 142, y: 358, w: 58,  h: 106, lx: 163, ly: 411, fs: 7.5 },
  { id: 'rear-bumper',   lbl: 'Rear Bumper',   x: 0,   y: 464, w: 200, h: 26,  lx: 100, ly: 478, fs: 7   },
];

const DIAGRAM_PANELS_TRUCK_CAB: DiagramPanel[] = [
  { id: 'front-bumper',  lbl: 'Front Bumper',  x: 0,   y: 0,   w: 200, h: 45,  lx: 100, ly: 27,  fs: 7   },
  { id: 'lt-fender',     lbl: 'LT Fender',     x: 0,   y: 45,  w: 62,  h: 97,  lx: 37,  ly: 95,  fs: 6.5 },
  { id: 'hood',          lbl: 'Hood',           x: 62,  y: 45,  w: 74,  h: 97,  lx: 99,  ly: 95,  fs: 11  },
  { id: 'rt-fender',     lbl: 'RT Fender',      x: 136, y: 45,  w: 64,  h: 97,  lx: 168, ly: 95,  fs: 6.5 },
  { id: 'lt-front-door', lbl: 'LT Front',       x: 0,   y: 168, w: 62,  h: 45,  lx: 37,  ly: 193, fs: 5.5 },
  { id: 'lt-rear-door',  lbl: 'LT Rear',        x: 0,   y: 213, w: 62,  h: 45,  lx: 37,  ly: 238, fs: 5.5 },
  { id: 'lt-roof-rail',  lbl: 'LT Rail',        x: 62,  y: 168, w: 8,   h: 90,  lx: 66,  ly: 213, fs: 5, rot: true },
  { id: 'roof',          lbl: 'Roof',           x: 70,  y: 168, w: 58,  h: 90,  lx: 99,  ly: 213, fs: 9  },
  { id: 'rt-roof-rail',  lbl: 'RT Rail',        x: 128, y: 168, w: 8,   h: 90,  lx: 132, ly: 213, fs: 5, rot: true },
  { id: 'rt-front-door', lbl: 'RT Front',       x: 136, y: 168, w: 64,  h: 45,  lx: 163, ly: 193, fs: 5.5 },
  { id: 'rt-rear-door',  lbl: 'RT Rear',        x: 136, y: 213, w: 64,  h: 45,  lx: 163, ly: 238, fs: 5.5 },
  { id: 'lt-cab-corner', lbl: 'LT Cab Cor',     x: 0,   y: 258, w: 62,  h: 20,  lx: 37,  ly: 270, fs: 5.5 },
  { id: 'rt-cab-corner', lbl: 'RT Cab Cor',     x: 138, y: 258, w: 62,  h: 20,  lx: 163, ly: 270, fs: 5.5 },
];

const DIAGRAM_PANELS_TRUCK_BED: DiagramPanel[] = [
  { id: 'lt-bed',   lbl: 'LT Bed',   x: 0,   y: 295, w: 72,  h: 155, lx: 45,  ly: 370, fs: 7.5 },
  { id: 'rt-bed',   lbl: 'RT Bed',   x: 128, y: 295, w: 72,  h: 155, lx: 155, ly: 370, fs: 7.5 },
  { id: 'tailgate', lbl: 'Tailgate', x: 0,   y: 450, w: 200, h: 24,  lx: 100, ly: 463, fs: 7   },
];

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

  const PanelRect = ({ p }: { p: DiagramPanel }) => {
    const isSel = selectedIds.includes(p.id);
    return (
      <rect
        x={p.x} y={p.y} width={p.w} height={p.h}
        fill={fill(p.id)}
        stroke={isSel ? 'var(--gold)' : 'var(--panel-stroke)'}
        strokeWidth={isSel ? 1.5 : 0.5}
        style={{ cursor: 'pointer', transition: 'fill 0.15s ease, stroke 0.15s ease' }}
        onClick={() => onSelect(p.id)}
        onMouseEnter={() => setHovered(p.id)}
        onMouseLeave={() => setHovered(null)}
        role="button" aria-label={p.lbl}
      />
    );
  };

  const PanelLabel = ({ p }: { p: DiagramPanel }) => {
    const count = opCount(p.id);
    const sel = selectedIds.includes(p.id);
    const bx = p.rot ? p.lx : p.lx + Math.ceil(p.lbl.length * p.fs * 0.29) + 5;
    const by = p.rot ? p.y + 8 : p.ly - p.fs;
    return (
      <g style={{ pointerEvents: 'none', userSelect: 'none' }}>
        <text x={p.lx} y={p.ly} textAnchor="middle" fontSize={p.fs}
          fontFamily="'Public Sans', Arial, sans-serif"
          fontWeight={sel ? 700 : 500}
          fill={sel ? 'var(--panel-sel-text)' : 'var(--panel-lbl)'}
          transform={p.rot ? `rotate(-90,${p.lx},${p.ly})` : undefined}>
          {p.lbl}
        </text>
        {count > 0 && (
          <>
            <circle cx={bx} cy={by} r={4.5} fill={sel ? 'var(--gold)' : 'var(--badge-bg)'} />
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
      <svg viewBox="0 0 200 490" style={{ width: '100%', maxWidth: 212, height: 'auto', display: 'block', margin: '0 auto' }}>
        <defs>
          <clipPath id="truck-cab-clip"><path d={TRUCK_CAB_PATH} /></clipPath>
          <clipPath id="truck-bed-clip"><path d={TRUCK_BED_PATH} /></clipPath>
        </defs>
        {([{x:0,y:104,w:18,h:42},{x:182,y:104,w:18,h:42}] as const).map((t,i) => (
          <g key={i} style={{ pointerEvents: 'none' }}>
            <rect x={t.x} y={t.y} width={t.w} height={t.h} rx={5} fill="var(--tire)" />
            <rect x={t.x+3} y={t.y+6} width={t.w-6} height={t.h-12} rx={3} fill="var(--tire-inner)" opacity={0.6} />
          </g>
        ))}
        <path d={TRUCK_CAB_PATH} fill="var(--car-body)" stroke="var(--car-stroke)" strokeWidth="1.5" />
        <g clipPath="url(#truck-cab-clip)">
          {DIAGRAM_PANELS_TRUCK_CAB.map(p => <PanelRect key={p.id} p={p} />)}
          <path d="M 34,142 L 30,168 L 170,168 L 166,142 Z" fill="var(--glass)" style={{ pointerEvents: 'none' }} />
          <rect x={18} y={174} width={37} height={33} rx={2} fill="var(--window-g)" style={{ pointerEvents: 'none' }} />
          <rect x={145} y={174} width={37} height={33} rx={2} fill="var(--window-g)" style={{ pointerEvents: 'none' }} />
          <rect x={18} y={219} width={37} height={32} rx={2} fill="var(--window-g)" style={{ pointerEvents: 'none' }} />
          <rect x={145} y={219} width={37} height={32} rx={2} fill="var(--window-g)" style={{ pointerEvents: 'none' }} />
          <line x1={70} y1={168} x2={70} y2={258} stroke="var(--rail-hl)" strokeWidth={0.6} style={{ pointerEvents: 'none' }} />
          <line x1={128} y1={168} x2={128} y2={258} stroke="var(--rail-hl)" strokeWidth={0.6} style={{ pointerEvents: 'none' }} />
          <line x1={62} y1={45} x2={62} y2={142} stroke="var(--detail)" strokeWidth={0.8} opacity={0.7} style={{ pointerEvents: 'none' }} />
          <line x1={136} y1={45} x2={136} y2={142} stroke="var(--detail)" strokeWidth={0.8} opacity={0.7} style={{ pointerEvents: 'none' }} />
        </g>
        <line x1={22} y1={142} x2={30} y2={168} stroke="var(--pillar)" strokeWidth={1.2} style={{ pointerEvents: 'none' }} />
        <line x1={178} y1={142} x2={170} y2={168} stroke="var(--pillar)" strokeWidth={1.2} style={{ pointerEvents: 'none' }} />
        <line x1={62} y1={168} x2={62} y2={258} stroke="var(--detail)" strokeWidth={1} style={{ pointerEvents: 'none' }} />
        <line x1={136} y1={168} x2={136} y2={258} stroke="var(--detail)" strokeWidth={1} style={{ pointerEvents: 'none' }} />
        <line x1={18} y1={213} x2={62} y2={213} stroke="var(--detail)" strokeWidth={0.8} style={{ pointerEvents: 'none' }} />
        <line x1={136} y1={213} x2={182} y2={213} stroke="var(--detail)" strokeWidth={0.8} style={{ pointerEvents: 'none' }} />
        <line x1={100} y1={45} x2={100} y2={142} stroke="var(--detail)" strokeWidth={0.8} opacity={0.7} style={{ pointerEvents: 'none' }} />
        <path d="M 12,144 C 5,147 4,157 8,162 L 15,160 L 14,144 Z" fill="var(--mirror)" stroke="var(--pillar)" strokeWidth={0.6} style={{ pointerEvents: 'none' }} />
        <path d="M 188,144 C 195,147 196,157 192,162 L 185,160 L 186,144 Z" fill="var(--mirror)" stroke="var(--pillar)" strokeWidth={0.6} style={{ pointerEvents: 'none' }} />
        {DIAGRAM_PANELS_TRUCK_CAB.map(p => <PanelLabel key={`l-${p.id}`} p={p} />)}
        <text x={100} y={287} textAnchor="middle" fontSize={5} fill="var(--gap-txt)"
          fontFamily="'IBM Plex Mono', monospace" style={{ userSelect: 'none' as const, pointerEvents: 'none' as const }}>
          ── CAB / BED GAP ──
        </text>
        <path d={TRUCK_BED_PATH} fill="var(--car-body)" stroke="var(--car-stroke)" strokeWidth="1.5" />
        <g clipPath="url(#truck-bed-clip)">
          {DIAGRAM_PANELS_TRUCK_BED.map(p => <PanelRect key={p.id} p={p} />)}
          <rect x={72} y={295} width={56} height={155} fill="var(--bed-floor)" style={{ pointerEvents: 'none' }} />
          <line x1={20} y1={338} x2={180} y2={338} stroke="var(--bed-line)" strokeWidth={0.8} style={{ pointerEvents: 'none' }} />
          <line x1={20} y1={381} x2={180} y2={381} stroke="var(--bed-line)" strokeWidth={0.8} style={{ pointerEvents: 'none' }} />
          <line x1={20} y1={424} x2={180} y2={424} stroke="var(--bed-line)" strokeWidth={0.8} style={{ pointerEvents: 'none' }} />
          <line x1={72} y1={295} x2={72} y2={450} stroke="var(--bed-line)" strokeWidth={0.8} style={{ pointerEvents: 'none' }} />
          <line x1={128} y1={295} x2={128} y2={450} stroke="var(--bed-line)" strokeWidth={0.8} style={{ pointerEvents: 'none' }} />
        </g>
        {DIAGRAM_PANELS_TRUCK_BED.map(p => <PanelLabel key={`l-${p.id}`} p={p} />)}
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 200 490" style={{ width: '100%', maxWidth: 212, height: 'auto', display: 'block', margin: '0 auto' }}>
      <defs>
        <clipPath id="car-clip"><path d={CAR_PATH} /></clipPath>
      </defs>
      {([
        {x:0,   y:108, w:18, h:46},
        {x:182, y:108, w:18, h:46},
        {x:0,   y:318, w:18, h:46},
        {x:182, y:318, w:18, h:46},
      ] as const).map((t, i) => (
        <g key={i} style={{ pointerEvents: 'none' }}>
          <rect x={t.x} y={t.y} width={t.w} height={t.h} rx={5} fill="var(--tire)" />
          <rect x={t.x+3} y={t.y+6} width={t.w-6} height={t.h-12} rx={3} fill="var(--tire-inner)" opacity={0.6} />
        </g>
      ))}
      <path d={CAR_PATH} fill="var(--car-body)" stroke="var(--car-stroke)" strokeWidth="1.5" />
      <g clipPath="url(#car-clip)">
        {DIAGRAM_PANELS.map(p => <PanelRect key={p.id} p={p} />)}
        <path d="M 34,150 L 30,186 L 170,186 L 166,150 Z" fill="var(--glass)" style={{ pointerEvents: 'none' }} />
        <path d="M 30,322 L 34,358 L 166,358 L 170,322 Z" fill="var(--glass)" style={{ pointerEvents: 'none' }} />
        <rect x={18} y={193} width={37} height={52} rx={2} fill="var(--window-g)" style={{ pointerEvents: 'none' }} />
        <rect x={145} y={193} width={37} height={52} rx={2} fill="var(--window-g)" style={{ pointerEvents: 'none' }} />
        <rect x={18} y={258} width={37} height={55} rx={2} fill="var(--window-g)" style={{ pointerEvents: 'none' }} />
        <rect x={145} y={258} width={37} height={55} rx={2} fill="var(--window-g)" style={{ pointerEvents: 'none' }} />
        <line x1={66} y1={186} x2={66} y2={322} stroke="var(--rail-hl)" strokeWidth={0.6} style={{ pointerEvents: 'none' }} />
        <line x1={134} y1={186} x2={134} y2={322} stroke="var(--rail-hl)" strokeWidth={0.6} style={{ pointerEvents: 'none' }} />
        <line x1={58} y1={54} x2={58} y2={150} stroke="var(--detail)" strokeWidth={0.8} opacity={0.7} style={{ pointerEvents: 'none' }} />
        <line x1={142} y1={54} x2={142} y2={150} stroke="var(--detail)" strokeWidth={0.8} opacity={0.7} style={{ pointerEvents: 'none' }} />
      </g>
      <line x1={22} y1={150} x2={30} y2={186} stroke="var(--pillar)" strokeWidth={1.2} style={{ pointerEvents: 'none' }} />
      <line x1={178} y1={150} x2={170} y2={186} stroke="var(--pillar)" strokeWidth={1.2} style={{ pointerEvents: 'none' }} />
      <line x1={22} y1={360} x2={30} y2={322} stroke="var(--pillar)" strokeWidth={1.2} style={{ pointerEvents: 'none' }} />
      <line x1={178} y1={360} x2={170} y2={322} stroke="var(--pillar)" strokeWidth={1.2} style={{ pointerEvents: 'none' }} />
      <line x1={58} y1={186} x2={58} y2={322} stroke="var(--detail)" strokeWidth={1} style={{ pointerEvents: 'none' }} />
      <line x1={142} y1={186} x2={142} y2={322} stroke="var(--detail)" strokeWidth={1} style={{ pointerEvents: 'none' }} />
      <line x1={16} y1={254} x2={58} y2={254} stroke="var(--detail)" strokeWidth={0.8} style={{ pointerEvents: 'none' }} />
      <line x1={142} y1={254} x2={184} y2={254} stroke="var(--detail)" strokeWidth={0.8} style={{ pointerEvents: 'none' }} />
      <line x1={100} y1={54} x2={100} y2={150} stroke="var(--detail)" strokeWidth={0.8} opacity={0.7} style={{ pointerEvents: 'none' }} />
      <path d="M 12,152 C 5,155 4,165 8,170 L 15,168 L 14,152 Z" fill="var(--mirror)" stroke="var(--pillar)" strokeWidth={0.6} style={{ pointerEvents: 'none' }} />
      <path d="M 188,152 C 195,155 196,165 192,170 L 185,168 L 186,152 Z" fill="var(--mirror)" stroke="var(--pillar)" strokeWidth={0.6} style={{ pointerEvents: 'none' }} />
      {DIAGRAM_PANELS.map(p => <PanelLabel key={`l-${p.id}`} p={p} />)}
    </svg>
  );
}

// ─── Copy button ──────────────────────────────────────────────────────────────

function CopyButton({ text, label = 'Copy note' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      onClick={copy}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        marginTop: 9,
        padding: '6px 13px',
        background: copied ? 'var(--gold-soft)' : 'var(--card)',
        color: copied ? 'var(--gold)' : 'var(--text2)',
        border: `1px solid ${copied ? 'var(--gold-brd)' : 'var(--brd)'}`,
        borderRadius: 7,
        fontSize: 12,
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.15s',
        fontFamily: 'inherit',
      }}
    >
      {copied ? `✓  Copied` : label}
    </button>
  );
}

// ─── Operations panel ─────────────────────────────────────────────────────────

const REPAIR_TABS: { type: RepairType; label: string }[] = [
  { type: 'pdr',    label: 'PDR' },
  { type: 'repair', label: 'Repair' },
  { type: 'rr',     label: 'R&R' },
  { type: 'ri',     label: 'R&I' },
];

function PanelOps({ panel }: { panel: CarPanel }) {
  const availableTabs = REPAIR_TABS.filter(tab =>
    panel.operations.some(op => op.types.includes(tab.type))
  );

  const [activeType, setActiveType] = useState<RepairType | null>(
    availableTabs.length > 0 ? availableTabs[0].type : null
  );
  const [activeOpId, setActiveOpId] = useState<string | null>(null);

  const selectTab = (t: RepairType) => {
    setActiveType(t);
    setActiveOpId(null);
  };

  const filteredOps = activeType
    ? panel.operations.filter(op => op.types.includes(activeType))
    : [];

  if (panel.operations.length === 0 || availableTabs.length === 0) {
    return (
      <div style={{
        padding: '20px',
        background: 'var(--card)',
        border: '1px dashed var(--brd)',
        borderRadius: 10,
        color: 'var(--text3)',
        fontSize: 13,
        textAlign: 'center',
      }}>
        No operations yet for this panel.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Type tabs with counts */}
      <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
        {availableTabs.map(tab => {
          const active = activeType === tab.type;
          const count = panel.operations.filter(op => op.types.includes(tab.type)).length;
          return (
            <button
              key={tab.type}
              onClick={() => selectTab(tab.type)}
              style={{
                padding: '6px 16px',
                borderRadius: 8,
                background: active ? 'var(--gold2)' : 'var(--card)',
                color: active ? 'var(--on-gold)' : 'var(--text2)',
                border: `1px solid ${active ? 'var(--gold2)' : 'var(--brd)'}`,
                fontWeight: active ? 700 : 600,
                fontSize: 12.5,
                cursor: 'pointer',
                fontFamily: 'inherit',
                letterSpacing: '0.3px',
                whiteSpace: 'nowrap' as const,
                transition: 'all 0.15s ease',
              }}
            >
              {tab.label}&nbsp;&nbsp;·&nbsp;&nbsp;{count}
            </button>
          );
        })}
      </div>

      {/* Operations — notes expand inline */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {filteredOps.map(op => {
          const active = activeOpId === op.id;
          return (
            <div key={op.id}>
              <button
                onClick={() => setActiveOpId(prev => (prev === op.id ? null : op.id))}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '11px 15px',
                  width: '100%',
                  background: active ? 'var(--panel-selected)' : 'var(--card)',
                  border: `1px solid ${active ? 'var(--gold2)' : 'var(--brd)'}`,
                  borderRadius: active && op.notes.length > 0 ? '9px 9px 0 0' : 9,
                  cursor: 'pointer',
                  color: active ? 'var(--panel-sel-text)' : 'var(--text2)',
                  fontFamily: 'inherit',
                  fontSize: 13,
                  fontWeight: active ? 700 : 500,
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                }}
              >
                <span style={{
                  width: 14, height: 14, borderRadius: '50%', flexShrink: 0,
                  border: `2px solid ${active ? 'var(--gold)' : 'var(--brd-2)'}`,
                  background: active ? 'var(--gold)' : 'transparent',
                  display: 'block',
                }} />
                <span style={{ flex: 1 }}>{op.name}</span>
              </button>
              {active && op.notes.length > 0 && (
                <div style={{
                  border: `1px solid var(--gold2)`,
                  borderTop: 'none',
                  borderRadius: '0 0 9px 9px',
                  overflow: 'hidden',
                }}>
                  {op.notes.map((note, ni) => (
                    <div key={note.id} style={{
                      padding: '12px 16px',
                      borderTop: ni > 0 ? '1px solid var(--brd)' : 'none',
                      background: 'var(--note-bg)',
                    }}>
                      <p style={{
                        margin: 0,
                        fontSize: 12.5,
                        lineHeight: 1.7,
                        color: 'var(--note-text)',
                        fontFamily: "'IBM Plex Mono', ui-monospace, Menlo, monospace",
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
        })}
      </div>
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
      gap: 16,
      padding: 40,
      textAlign: 'center',
    }}>
      <svg width="66" height="66" viewBox="0 0 72 72" fill="none" style={{ opacity: 0.22 }}>
        <ellipse cx="36" cy="36" rx="23" ry="29" stroke="var(--text2)" strokeWidth="2.5" />
        <rect x="19" y="26" width="34" height="20" rx="2" stroke="var(--text2)" strokeWidth="1.5" />
        <line x1="19" y1="36" x2="53" y2="36" stroke="var(--text2)" strokeWidth="1.5" />
      </svg>
      <div style={{
        fontSize: 16, fontWeight: 700, color: 'var(--text2)',
        fontFamily: "'Space Grotesk', sans-serif",
      }}>
        Select a panel to see operations
      </div>
      <div style={{ fontSize: 13, color: 'var(--text3)', maxWidth: 300, lineHeight: 1.65 }}>
        Click any area on the car diagram, or use the search bar to find operations and copy notes into CCC ONE.
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
  const [narrow, setNarrow] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const hits = doSearch(query);
  const selectedPanels = PANELS.filter(p => selectedIds.includes(p.id));
  const allNotesText = selectedPanels
    .flatMap(p => p.operations.flatMap(op => op.notes.map(n => n.text)))
    .join('\n\n');

  const isOnCurrentDiagram = (p: { onDiagram?: boolean; onTruckDiagram?: boolean }) =>
    vehicleType === 'sedan' ? !!p.onDiagram : !!p.onTruckDiagram;

  const vehLabel = vehicleType === 'sedan' ? 'Sedan / SUV' : 'Pickup Truck';

  useEffect(() => {
    const saved = localStorage.getItem('hep-theme') as 'dark' | 'light' | null;
    if (saved) setTheme(saved);
  }, []);

  useEffect(() => {
    const onResize = () => {
      const n = window.innerWidth < 900;
      setNarrow(n);
      if (!n) setSidebarOpen(false);
    };
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
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

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        const el = document.getElementById('hep-search-input');
        if (el) (el as HTMLInputElement).focus();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const handleSelect = (id: string) => {
    const group = PANEL_GROUPS[id] || [id];
    setSelectedIds(prev => {
      const allSelected = group.every(gid => prev.includes(gid));
      return allSelected ? [] : group;
    });
    if (narrow) setSidebarOpen(false);
  };

  const switchVehicle = (vt: VehicleType) => {
    setVehicleType(vt);
    setSelectedIds([]);
  };

  const selectFromSearch = (hit: SearchHit) => {
    const group = PANEL_GROUPS[hit.panelId] || [hit.panelId];
    setSelectedIds(group);
    setQuery('');
    setShowDropdown(false);
    if (narrow) setSidebarOpen(false);
  };

  const kindTag = (t: SearchHit['type']) =>
    t === 'panel' ? 'PANEL' : t === 'op' ? 'OP' : 'NOTE';

  return (
    <>
      <Head>
        <title>Hail Estimator Pro</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Public+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
        <style>{`
          * { box-sizing: border-box; }
          html, body { margin: 0; height: 100%; }

          /* ── Dark theme (default) ── */
          :root {
            --bg: #0a1526;
            --panel-bg: #0c1727;
            --header-bg: #081120;
            --card: rgba(255,255,255,.04);
            --brd: rgba(255,255,255,.10);
            --brd-2: rgba(255,255,255,.17);
            --text: #e8ecf4;
            --text2: rgba(255,255,255,.62);
            --text3: rgba(255,255,255,.42);
            --note-text: rgba(232,236,244,.80);
            --input-bg: rgba(255,255,255,.05);
            --dropdown-bg: #101f34;
            --note-bg: #0a1727;
            --gold: #e0b64a;
            --gold2: #c8971a;
            --gold-soft: rgba(200,151,26,.16);
            --gold-brd: rgba(200,151,26,.34);
            --on-gold: #1a1205;
            --panel-default: #14243a;
            --panel-hover: #1d3350;
            --panel-selected: #7c3d00;
            --panel-sel-text: #fcd34d;
            --panel-stroke: #0f1c2e;
            --panel-lbl: #4d6a84;
            --badge-bg: #1e3a5f;
            --car-body: #0d1a2b;
            --car-stroke: #2d4a6a;
            --glass: #06101c;
            --window-g: #07111e;
            --tire: #060d18;
            --tire-inner: #0d1a2e;
            --mirror: #162233;
            --pillar: #2a3f58;
            --detail: #1a2d42;
            --rail-hl: #243a54;
            --bed-floor: #0b1826;
            --bed-line: #1a2d45;
            --gap-txt: #1e3a5f;
          }

          /* ── Light theme ── */
          [data-theme="light"] {
            --bg: #eef2f7;
            --panel-bg: #e6edf5;
            --header-bg: #ffffff;
            --card: #ffffff;
            --brd: rgba(15,34,64,.14);
            --brd-2: rgba(15,34,64,.22);
            --text: #141b2b;
            --text2: #43506a;
            --text3: #7386a0;
            --note-text: #2d3a4f;
            --input-bg: #ffffff;
            --dropdown-bg: #ffffff;
            --note-bg: #f4f8fc;
            --gold: #a06d0a;
            --gold2: #c8971a;
            --gold-soft: rgba(160,109,10,.14);
            --gold-brd: rgba(160,109,10,.4);
            --on-gold: #1a1205;
            --panel-default: #c8d8e8;
            --panel-hover: #b4c8da;
            --panel-selected: #c8971a;
            --panel-sel-text: #3a1e08;
            --panel-stroke: #9ab4c8;
            --panel-lbl: #4a6a84;
            --badge-bg: #5a7898;
            --car-body: #9ab8cc;
            --car-stroke: #5a7898;
            --glass: #527a96;
            --window-g: #6a8faa;
            --tire: #1e3048;
            --tire-inner: #2d4a62;
            --mirror: #3a5a76;
            --pillar: #4a7090;
            --detail: #6a8aaa;
            --rail-hl: #5a7898;
            --bed-floor: #88a8c0;
            --bed-line: #7090aa;
            --gap-txt: #88a8c4;
          }

          ::-webkit-scrollbar { width: 8px; height: 8px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { background: rgba(255,255,255,.14); border-radius: 4px; }
          [data-theme="light"] ::-webkit-scrollbar-thumb { background: rgba(15,34,64,.2); }
          input::placeholder { color: var(--text3); }
          input:focus { outline: none; border-color: var(--gold2) !important; box-shadow: 0 0 0 3px var(--gold-soft); }
        `}</style>
      </Head>

      <div data-theme={theme} style={{
        minHeight: '100vh',
        maxHeight: '100vh',
        background: 'var(--bg)',
        color: 'var(--text)',
        fontFamily: "'Public Sans', system-ui, sans-serif",
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>

        {/* ── Header ── */}
        <header style={{
          borderBottom: '2px solid var(--gold2)',
          padding: '12px 22px',
          display: 'flex',
          alignItems: 'center',
          gap: 22,
          background: 'var(--header-bg)',
          flexShrink: 0,
          zIndex: 10,
        }}>
          {/* Hamburger — narrow only */}
          {narrow && (
            <button
              onClick={() => setSidebarOpen(o => !o)}
              title="Show panels"
              style={{
                flexShrink: 0, width: 34, height: 34, borderRadius: 8,
                border: '1px solid var(--brd)', background: 'var(--input-bg)',
                color: 'var(--text2)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          )}

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 9,
              background: 'var(--gold2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 4px 16px var(--gold-soft)',
            }}>
              <div style={{ width: 15, height: 15, background: 'var(--on-gold)', transform: 'rotate(45deg)', borderRadius: 2 }} />
            </div>
            <div>
              <div style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700, fontSize: 15,
                color: 'var(--text)',
                letterSpacing: '.3px', lineHeight: 1.05,
                display: 'flex', alignItems: 'baseline', gap: 3,
              }}>
                Hail Estimator
                <span style={{
                  color: 'var(--gold)',
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 8.5, fontWeight: 600,
                  letterSpacing: '1px',
                  transform: 'translateY(-6px)',
                  display: 'inline-block',
                }}>PRO</span>
              </div>
              <div style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 9.5, color: 'var(--text3)',
                letterSpacing: '2px', textTransform: 'uppercase', marginTop: 2,
              }}>
                Estimate Assistant
              </div>
            </div>
          </div>

          {/* Search */}
          <div ref={searchRef} id="hep-search" style={{ flex: 1, maxWidth: 440, position: 'relative' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                style={{ position: 'absolute', left: 13, pointerEvents: 'none' }}>
                <circle cx="10.5" cy="10.5" r="7" stroke="var(--text3)" strokeWidth="2" />
                <line x1="16" y1="16" x2="21" y2="21" stroke="var(--text3)" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <input
                id="hep-search-input"
                value={query}
                onChange={e => { setQuery(e.target.value); setShowDropdown(true); }}
                onFocus={() => query && setShowDropdown(true)}
                onKeyDown={e => e.key === 'Escape' && setShowDropdown(false)}
                placeholder="Search panels, operations, notes…"
                style={{
                  width: '100%',
                  background: 'var(--input-bg)',
                  border: '1px solid var(--brd)',
                  borderRadius: 9,
                  padding: '9px 54px 9px 36px',
                  color: 'var(--text)',
                  fontSize: 13.5,
                  fontFamily: 'inherit',
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                }}
              />
              {query ? (
                <button
                  onClick={() => { setQuery(''); setShowDropdown(false); }}
                  style={{ position: 'absolute', right: 10, background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 19, lineHeight: 1, padding: 2 }}
                >×</button>
              ) : (
                <span style={{
                  position: 'absolute', right: 10, pointerEvents: 'none',
                  fontFamily: "'IBM Plex Mono', monospace", fontSize: 10,
                  color: 'var(--text3)', border: '1px solid var(--brd)',
                  borderRadius: 5, padding: '2px 6px', lineHeight: 1,
                }}>⌘K</span>
              )}
            </div>

            {showDropdown && hits.length > 0 && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
                background: 'var(--dropdown-bg)', border: '1px solid var(--brd-2)',
                borderRadius: 10, boxShadow: '0 16px 50px rgba(0,0,0,.4)',
                zIndex: 200, overflow: 'hidden',
              }}>
                {hits.map((hit, i) => (
                  <button
                    key={i}
                    onClick={() => selectFromSearch(hit)}
                    style={{
                      display: 'block', width: '100%', textAlign: 'left',
                      padding: '10px 14px', background: 'none', border: 'none',
                      borderBottom: i < hits.length - 1 ? '1px solid var(--brd)' : 'none',
                      cursor: 'pointer', color: 'var(--text)', fontFamily: 'inherit',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--card)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                  >
                    <div style={{ fontSize: 11.5, color: 'var(--text3)', marginBottom: hit.snippet ? 2 : 0 }}>
                      <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: 'var(--gold)', fontSize: 9, letterSpacing: '.5px' }}>
                        {kindTag(hit.type)}
                      </span>
                      &nbsp;&nbsp;
                      <span style={{ color: 'var(--text2)', fontWeight: 600 }}>{hit.panelLabel}</span>
                      {hit.opName && <span style={{ color: 'var(--text3)' }}>  →  {hit.opName}</span>}
                    </div>
                    {hit.snippet && (
                      <div style={{ fontSize: 11.5, color: 'var(--text3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {hit.snippet}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Vehicle Value link */}
          <a
            href="/value"
            style={{
              marginLeft: 'auto', flexShrink: 0,
              fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: 'var(--text2)',
              textDecoration: 'none', letterSpacing: 0.5,
              padding: '6px 12px', border: '1px solid var(--brd)', borderRadius: 8,
              transition: 'all .15s', whiteSpace: 'nowrap',
            }}
          >
            Vehicle Value
          </a>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            style={{
              flexShrink: 0,
              width: 36, height: 36, borderRadius: 9,
              border: '1px solid var(--brd)', background: 'var(--input-bg)',
              color: 'var(--text2)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s',
            }}
          >
            {theme === 'dark' ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4" />
                {['M12 2v2','M12 20v2','M2 12h2','M20 12h2','M4.9 4.9l1.4 1.4','M17.7 17.7l1.4 1.4','M4.9 19.1l1.4-1.4','M17.7 6.3l1.4-1.4'].map((d, i) => <path key={i} d={d} />)}
              </svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
        </header>

        {/* ── Sub-bar: vehicle toggle + Other Panels chips ── */}
        <div style={{
          borderBottom: '1px solid var(--brd)',
          background: 'var(--header-bg)',
          padding: '8px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          flexShrink: 0,
          overflowX: 'auto',
        }}>
          {(['sedan', 'truck'] as const).map(vt => (
            <button
              key={vt}
              onClick={() => switchVehicle(vt)}
              style={{
                padding: '5px 14px',
                borderRadius: 8, fontSize: 12, cursor: 'pointer', flexShrink: 0,
                background: vehicleType === vt ? 'var(--gold2)' : 'var(--card)',
                color: vehicleType === vt ? 'var(--on-gold)' : 'var(--text2)',
                border: `1px solid ${vehicleType === vt ? 'var(--gold2)' : 'var(--brd)'}`,
                fontWeight: vehicleType === vt ? 700 : 600,
                fontFamily: 'inherit', transition: 'all 0.15s',
              }}
            >
              {vt === 'sedan' ? 'Sedan / SUV' : 'Pickup Truck'}
            </button>
          ))}

          <div style={{ width: 1, height: 20, background: 'var(--brd)', flexShrink: 0, margin: '0 4px' }} />

          {PANELS.filter(p => !isOnCurrentDiagram(p)).map(p => {
            const sel = selectedIds.includes(p.id);
            const count = p.operations.length;
            return (
              <button
                key={p.id}
                onClick={() => handleSelect(p.id)}
                style={{
                  padding: '5px 11px', borderRadius: 20, fontSize: 11.5,
                  cursor: 'pointer', flexShrink: 0,
                  background: sel ? 'var(--panel-selected)' : 'var(--card)',
                  color: sel ? 'var(--panel-sel-text)' : 'var(--text2)',
                  border: `1px solid ${sel ? 'var(--gold2)' : 'var(--brd)'}`,
                  transition: 'all 0.15s', fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', gap: 5,
                }}
              >
                {p.label}
                {count > 0 && (
                  <span style={{
                    background: sel ? 'var(--gold)' : 'var(--badge-bg)',
                    color: sel ? '#000' : '#fff',
                    borderRadius: 10, fontSize: 9,
                    padding: '0 5px', lineHeight: '15px', fontWeight: 700,
                  }}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Body ── */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0, position: 'relative' }}>

          {/* Backdrop — narrow mode */}
          {narrow && sidebarOpen && (
            <div
              onClick={() => setSidebarOpen(false)}
              style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 40 }}
            />
          )}

          {/* Left: car diagram */}
          <aside style={{
            width: 288,
            flexShrink: 0,
            borderRight: '1px solid var(--brd)',
            background: 'var(--panel-bg)',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            ...(narrow ? {
              position: 'absolute', top: 0, bottom: 0, left: 0, zIndex: 50,
              transform: `translateX(${sidebarOpen ? '0' : '-100%'})`,
              transition: 'transform .22s ease',
              boxShadow: '6px 0 40px rgba(0,0,0,.35)',
            } : {}),
          }}>
            <div style={{ padding: '18px 16px' }}>
              <div style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 9.5, color: 'var(--text3)',
                textTransform: 'uppercase', letterSpacing: '1.5px',
                textAlign: 'center', marginBottom: 12,
              }}>Click a panel</div>
              <CarDiagram selectedIds={selectedIds} onSelect={handleSelect} vehicleType={vehicleType} />
            </div>
          </aside>

          {/* Right: operations + notes */}
          <main style={{ flex: 1, overflowY: 'auto', padding: '26px 30px', background: 'var(--bg)', minWidth: 0 }}>
            {selectedPanels.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                <div style={{ marginBottom: 22, paddingBottom: 15, borderBottom: '1px solid var(--brd-2)' }}>
                  <div style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 10.5, color: 'var(--text3)',
                    letterSpacing: '.5px', marginBottom: 9,
                  }}>
                    {vehLabel}  ›  {selectedPanels.map(p => p.label).join('  &  ')}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 13 }}>
                    <h2 style={{
                      margin: 0,
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: 22, fontWeight: 700,
                      color: 'var(--gold)', letterSpacing: '-.3px',
                    }}>
                      {selectedPanels.map(p => p.label).join('  &  ')}
                    </h2>
                    <span style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 11.5, color: 'var(--text3)',
                    }}>
                      {(() => {
                        const total = selectedPanels.reduce((s, p) => s + p.operations.length, 0);
                        return `${total} operation${total !== 1 ? 's' : ''}`;
                      })()}
                    </span>
                    {allNotesText.length > 0 && (
                      <CopyButton text={allNotesText} label="Copy all notes" />
                    )}
                  </div>
                </div>

                {(() => {
                  const panelsWithOps = selectedPanels.filter(p => p.operations.length > 0);
                  const toRender = panelsWithOps.length > 0 ? panelsWithOps : selectedPanels.slice(0, 1);
                  return toRender.map((panel, idx) => (
                    <div key={panel.id} style={{ marginBottom: idx < toRender.length - 1 ? 28 : 0 }}>
                      {toRender.length > 1 && (
                        <div style={{
                          fontFamily: "'IBM Plex Mono', monospace",
                          fontSize: 10.5, fontWeight: 600,
                          color: 'var(--text3)',
                          textTransform: 'uppercase', letterSpacing: '1.2px',
                          marginBottom: 12,
                          paddingTop: idx > 0 ? 20 : 0,
                          borderTop: idx > 0 ? '1px solid var(--brd)' : 'none',
                        }}>
                          {panel.label}
                        </div>
                      )}
                      <PanelOps key={panel.id} panel={panel} />
                    </div>
                  ));
                })()}
              </>
            )}
          </main>
        </div>

        {/* ── Footer ── */}
        <footer style={{
          flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '7px 22px',
          background: 'var(--header-bg)',
          borderTop: '1px solid var(--brd)',
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 10, color: 'var(--text3)', letterSpacing: '.5px',
        }}>
          <span>Hail Estimator PRO · Estimate Assistant</span>
          <span>v1.0 · Dent Mechanic Group</span>
        </footer>
      </div>
    </>
  );
}
