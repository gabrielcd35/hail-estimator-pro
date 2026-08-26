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

type VehicleType = 'sedan' | 'suv' | 'truck';

function CarDiagram({ selectedIds, onSelect, vehicleType, counts, review, maxWidth = 212, heightVh }: {
  selectedIds: string[];
  onSelect: (id: string) => void;
  vehicleType: VehicleType;
  counts?: ScanCounts;
  review?: boolean;
  maxWidth?: number;
  heightVh?: number;
}) {
  const [hovered, setHovered] = useState<string | null>(null);

  const dataFor = (id: string) => counts?.[id];
  const hasData = (id: string) => {
    const c = counts?.[id];
    return !!c && !!(c.dentCountText || c.dentCount != null || c.oversize || (c.replacements && c.replacements.length));
  };

  const viewBox = '0 0 200 490';
  const svgStyle: React.CSSProperties = heightVh
    ? { height: `${heightVh}vh`, width: 'auto', maxWidth: '100%', display: 'block', margin: '0 auto' }
    : { width: '100%', maxWidth, height: 'auto', display: 'block', margin: '0 auto' };

  const fill = (id: string) => {
    if (review) return hasData(id) ? 'var(--panel-selected)' : 'var(--panel-default)';
    if (selectedIds.includes(id)) return 'var(--panel-selected)';
    if (hovered === id) return 'var(--panel-hover)';
    return 'var(--panel-default)';
  };

  const opCount = (id: string) => PANELS.find(p => p.id === id)?.operations.length ?? 0;

  const PanelRect = ({ p }: { p: DiagramPanel }) => {
    const isSel = review ? hasData(p.id) : selectedIds.includes(p.id);
    return (
      <rect
        x={p.x} y={p.y} width={p.w} height={p.h}
        fill={fill(p.id)}
        stroke={isSel ? 'var(--gold)' : 'var(--panel-stroke)'}
        strokeWidth={isSel ? 1.5 : 0.5}
        style={{ cursor: review ? 'default' : 'pointer', transition: 'fill 0.15s ease, stroke 0.15s ease' }}
        onClick={() => !review && onSelect(p.id)}
        onMouseEnter={() => !review && setHovered(p.id)}
        onMouseLeave={() => !review && setHovered(null)}
        role="button" aria-label={p.lbl}
      />
    );
  };

  const PanelLabel = ({ p }: { p: DiagramPanel }) => {
    const count = opCount(p.id);
    const sel = review ? hasData(p.id) : selectedIds.includes(p.id);

    // Review mode: show scanned dent count / O/S / replace flag on the panel
    if (review) {
      const c = dataFor(p.id);
      const has = hasData(p.id);
      const countStr = c ? (c.dentCountText || (c.dentCount != null ? String(c.dentCount) : '')) : '';
      const sizeStr = countStr && c?.dentSize ? `-${c.dentSize}` : '';
      const osStr = c?.oversize ? `${c.oversize} O/S` : '';
      const hasRepl = !!(c?.replacements && c.replacements.length);
      const nameFs = Math.max(4.5, p.fs - 1.5);
      return (
        <g style={{ pointerEvents: 'none', userSelect: 'none' }}>
          <text x={p.lx} y={has ? p.ly - 4 : p.ly} textAnchor="middle" fontSize={nameFs}
            fontFamily="'Public Sans', Arial, sans-serif" fontWeight={has ? 700 : 500}
            fill={has ? 'var(--panel-sel-text)' : 'var(--panel-lbl)'}
            transform={p.rot ? `rotate(-90,${p.lx},${p.ly - (has ? 4 : 0)})` : undefined}>
            {p.lbl}
          </text>
          {has && !p.rot && (
            <>
              {countStr && (
                <text x={p.lx} y={p.ly + 5} textAnchor="middle" fontSize={Math.max(6, p.fs)}
                  fontFamily="'IBM Plex Mono', monospace" fontWeight={700} fill="var(--panel-sel-text)">
                  {countStr}{sizeStr}
                </text>
              )}
              {osStr && (
                <text x={p.lx} y={p.ly + (countStr ? 12 : 6)} textAnchor="middle" fontSize={5}
                  fontFamily="'IBM Plex Mono', monospace" fontWeight={600} fill="var(--panel-sel-text)" opacity={0.8}>
                  {osStr}
                </text>
              )}
              {hasRepl && (
                <circle cx={p.lx + Math.ceil(p.lbl.length * nameFs * 0.29) + 5} cy={p.ly - 6} r={2.6} fill="#ef4444" />
              )}
            </>
          )}
        </g>
      );
    }

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
      <svg viewBox={viewBox} style={svgStyle}>
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
    <svg viewBox={viewBox} style={svgStyle}>
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
];

function PanelOps({ panel, vehicleType }: { panel: CarPanel; vehicleType: VehicleType | null }) {
  const availableTabs = REPAIR_TABS;

  const [activeType, setActiveType] = useState<RepairType>('pdr');
  const [activeOpId, setActiveOpId] = useState<string | null>(null);
  const [howToOpId, setHowToOpId] = useState<string | null>(null);

  // Vehicle-restricted ops only show once a vehicle type is chosen — otherwise
  // e.g. both the sedan/SUV and truck versions of "R&I Tail Lamps" would show
  // at once and look like a duplicate.
  const vehicleOps = panel.operations.filter(op => !op.vehicles || (!!vehicleType && op.vehicles.includes(vehicleType)));

  const selectTab = (t: RepairType) => {
    setActiveType(t);
    setActiveOpId(null);
  };

  const filteredOps = vehicleOps.filter(op => op.types.includes(activeType));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Type tabs with counts */}
      <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
        {availableTabs.map(tab => {
          const active = activeType === tab.type;
          const count = vehicleOps.filter(op => op.types.includes(tab.type)).length;
          const label = panel.tabLabelOverrides?.[tab.type] ?? tab.label;
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
              {label}&nbsp;&nbsp;·&nbsp;&nbsp;{count}
            </button>
          );
        })}
      </div>

      {/* Operations — notes expand inline */}
      {filteredOps.length === 0 && (
        <div style={{
          padding: '20px',
          background: 'var(--card)',
          border: '1px dashed var(--brd)',
          borderRadius: 10,
          color: 'var(--text3)',
          fontSize: 13,
          textAlign: 'center',
        }}>
          No operations yet for this repair type.
        </div>
      )}
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
                {op.howTo && (
                  <span
                    role="button"
                    onClick={e => { e.stopPropagation(); setHowToOpId(prev => (prev === op.id ? null : op.id)); }}
                    title="How to enter this in CCC ONE"
                    style={{
                      width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                      border: `1px solid ${howToOpId === op.id ? 'var(--gold)' : 'var(--brd-2)'}`,
                      background: howToOpId === op.id ? 'var(--gold-soft)' : 'transparent',
                      color: howToOpId === op.id ? 'var(--gold)' : (active ? 'var(--panel-sel-text)' : 'var(--text3)'),
                      fontFamily: "'Space Grotesk', sans-serif", fontSize: 10.5, fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all .15s', cursor: 'pointer',
                    }}
                  >
                    i
                  </span>
                )}
              </button>
              {active && howToOpId === op.id && op.howTo && (
                <div style={{
                  padding: '10px 14px',
                  background: 'var(--gold-soft)',
                  border: '1px solid var(--gold-brd)',
                  borderTop: 'none',
                  borderRadius: op.notes.length > 0 ? 0 : '0 0 9px 9px',
                  fontSize: 12, lineHeight: 1.6, color: 'var(--text2)', fontFamily: "'Public Sans', sans-serif",
                }}>
                  <strong style={{ color: 'var(--gold)' }}>How to add this in CCC ONE: </strong>
                  {op.howTo}
                </div>
              )}
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

function EmptyState({ vehicleType, onPickVehicle, onClearVehicle, onEveryEstimate, everyEstimateCount, everyEstimateSelected }: {
  vehicleType: VehicleType | null;
  onPickVehicle: (vt: VehicleType) => void;
  onClearVehicle: () => void;
  onEveryEstimate: () => void;
  everyEstimateCount: number;
  everyEstimateSelected: boolean;
}) {
  if (vehicleType === null) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        height: '100%', gap: 18, padding: 40, textAlign: 'center',
      }}>
        <div style={{
          fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, color: 'var(--text3)',
          textTransform: 'uppercase', letterSpacing: '2px',
        }}>
          Let&apos;s start with the vehicle
        </div>
        <div style={{
          fontSize: 18, fontWeight: 700, color: 'var(--text)',
          fontFamily: "'Space Grotesk', sans-serif",
        }}>
          What kind of vehicle is it?
        </div>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
          {([
            { vt: 'sedan', label: 'Sedan / Coupe', icon: '🚗' },
            { vt: 'suv',   label: 'SUV / Crossover', icon: '🚙' },
            { vt: 'truck', label: 'Pickup Truck', icon: '🛻' },
          ] as const).map(({ vt, label, icon }) => (
            <button
              key={vt}
              onClick={() => onPickVehicle(vt)}
              style={{
                width: 150, padding: '24px 14px', borderRadius: 14, cursor: 'pointer',
                background: 'var(--card)', border: '2px solid var(--brd)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                fontFamily: 'inherit', transition: 'border-color 0.15s, transform 0.1s',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--gold2)';
                (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.03)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--brd)';
                (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
              }}
            >
              <span style={{ fontSize: 32 }}>{icon}</span>
              <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text)' }}>{label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const vehLbl = vehicleType === 'sedan' ? 'Sedan / Coupe' : vehicleType === 'suv' ? 'SUV / Crossover' : 'Pickup Truck';

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      height: '100%', gap: 16, padding: 40, textAlign: 'center',
    }}>
      <button
        onClick={onEveryEstimate}
        style={{
          padding: '18px 30px', borderRadius: 14, cursor: 'pointer',
          background: everyEstimateSelected ? 'var(--panel-selected)' : 'var(--gold-soft)',
          color: everyEstimateSelected ? 'var(--panel-sel-text)' : 'var(--gold)',
          border: `2px solid ${everyEstimateSelected ? 'var(--gold2)' : 'var(--gold-brd)'}`,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
          fontFamily: 'inherit', transition: 'all 0.15s',
        }}
      >
        <span style={{ fontSize: 30 }}>⭐</span>
        <span style={{ fontSize: 16, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>
          Start with Every Estimate
        </span>
        {everyEstimateCount > 0 && (
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, opacity: 0.85 }}>
            {everyEstimateCount} required line items
          </span>
        )}
      </button>

      <div style={{ fontSize: 13, color: 'var(--text3)', maxWidth: 320, lineHeight: 1.65 }}>
        Or click any area on the car diagram, or use the search bar to find operations and copy notes into CCC ONE.
      </div>

      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: 'var(--text3)' }}>
        Vehicle: <strong style={{ color: 'var(--text2)' }}>{vehLbl}</strong>
        {' · '}
        <button
          onClick={onClearVehicle}
          style={{ background: 'none', border: 'none', padding: 0, color: 'var(--gold)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 11, textDecoration: 'underline' }}
        >
          change
        </button>
      </div>
    </div>
  );
}

// ─── Vehicle Value Modal ──────────────────────────────────────────────────────

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY','DC',
];

const VALUE_THRESHOLDS = [
  { pct: 0.55, label: 'Safe to write',      color: '#22c55e', bg: 'rgba(34,197,94,.12)',  brd: 'rgba(34,197,94,.28)' },
  { pct: 0.60, label: 'Approach with care', color: '#f59e0b', bg: 'rgba(245,158,11,.12)', brd: 'rgba(245,158,11,.28)' },
  { pct: 0.70, label: 'Likely to total',    color: '#ef4444', bg: 'rgba(239,68,68,.12)',  brd: 'rgba(239,68,68,.28)' },
];

function fmtUSD(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}
function parseDollar(s: string) { return parseFloat(s.replace(/[^0-9.]/g, '')) || 0; }

function estZone(pct: number) {
  if (pct <= 0) return null;
  if (pct < 0.60) return VALUE_THRESHOLDS[0];
  if (pct < 0.70) return VALUE_THRESHOLDS[1];
  return VALUE_THRESHOLDS[2];
}

interface VinInfo { year: string; make: string; model: string; bodyClass: string; isPickup: boolean; detectedVehicle: VehicleType; }

async function decodeVin(vin: string): Promise<VinInfo | null> {
  try {
    const res = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin.trim()}?format=json`);
    const data = await res.json();
    const get = (v: string) => data.Results?.find((r: { Variable: string; Value: string }) => r.Variable === v)?.Value || '';
    const bodyClass = get('Body Class');
    const bc = bodyClass.toLowerCase();
    const isPickup = bc.includes('pickup');
    const isSuv = bc.includes('sport utility') || bc.includes('suv') || bc.includes('multi-purpose');
    const detectedVehicle: VehicleType = isPickup ? 'truck' : isSuv ? 'suv' : 'sedan';
    return { year: get('Model Year'), make: get('Make'), model: get('Model'), bodyClass, isPickup, detectedVehicle };
  } catch { return null; }
}

function ValueModal({ onClose, onVehicleDetected }: {
  onClose: () => void;
  onVehicleDetected: (vt: VehicleType) => void;
}) {
  const [mode, setMode] = useState<'vin' | 'plate'>('vin');
  const [vin, setVin] = useState('');
  const [plate, setPlate] = useState('');
  const [state, setState] = useState('TX');
  const [vinInfo, setVinInfo] = useState<VinInfo | null>(null);
  const [vinLoading, setVinLoading] = useState(false);
  const [vinError, setVinError] = useState('');
  const [retailRaw, setRetailRaw] = useState('');
  const [estRaw, setEstRaw] = useState('');

  const retail = parseDollar(retailRaw);
  const est    = parseDollar(estRaw);
  const pct    = retail > 0 && est > 0 ? est / retail : 0;
  const zone   = estZone(pct);

  const handleDecode = async () => {
    if (vin.trim().length < 17) { setVinError('VIN must be 17 characters'); return; }
    setVinLoading(true); setVinError(''); setVinInfo(null);
    const info = await decodeVin(vin);
    setVinLoading(false);
    if (!info || !info.make) { setVinError('Could not decode VIN — check and try again'); return; }
    setVinInfo(info);
    onVehicleDetected(info.detectedVehicle);
  };

  const openCarfax = () => {
    const base = 'https://www.carfax.com/value/';
    if (mode === 'vin' && vin.trim()) window.open(`${base}#vin=${encodeURIComponent(vin.trim().toUpperCase())}`, '_blank');
    else if (mode === 'plate' && plate.trim()) window.open(`${base}#plate=${encodeURIComponent(plate.trim().toUpperCase())}&state=${state}`, '_blank');
    else window.open(base, '_blank');
  };

  const inputSt: React.CSSProperties = {
    width: '100%', padding: '10px 14px', fontSize: 14,
    fontFamily: "'Public Sans', sans-serif",
    background: 'var(--input-bg)', border: '1px solid var(--brd-2)',
    borderRadius: 8, color: 'var(--text)', outline: 'none',
    transition: 'border-color .15s',
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        background: 'rgba(0,0,0,.55)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto',
          background: 'var(--panel-bg)', borderRadius: 16,
          border: '1px solid var(--brd-2)',
          boxShadow: '0 24px 80px rgba(0,0,0,.6)',
          display: 'flex', flexDirection: 'column', gap: 0,
        }}
      >
        {/* Modal header */}
        <div style={{
          padding: '18px 24px', borderBottom: '1px solid var(--brd)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 17, color: 'var(--gold)' }}>
              Vehicle Value
            </div>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'var(--text3)', letterSpacing: 1.5, marginTop: 2 }}>
              THRESHOLD CALCULATOR
            </div>
          </div>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: 8, border: '1px solid var(--brd)',
            background: 'var(--input-bg)', color: 'var(--text2)', cursor: 'pointer',
            fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>×</button>
        </div>

        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* ── VIN / Plate section ── */}
          <div>
            <div style={{ fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: 'var(--text3)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 }}>
              Lookup
            </div>

            {/* Mode toggle */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
              {(['vin', 'plate'] as const).map(m => (
                <button key={m} onClick={() => { setMode(m); setVinInfo(null); setVinError(''); }} style={{
                  padding: '6px 16px', borderRadius: 7, fontSize: 12, fontWeight: 600,
                  fontFamily: "'Public Sans', sans-serif", cursor: 'pointer', transition: 'all .15s',
                  background: mode === m ? 'var(--gold2)' : 'var(--card)',
                  color: mode === m ? 'var(--on-gold)' : 'var(--text2)',
                  border: mode === m ? '1px solid var(--gold2)' : '1px solid var(--brd)',
                }}>
                  {m === 'vin' ? 'VIN' : 'License Plate'}
                </button>
              ))}
            </div>

            {mode === 'vin' ? (
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  style={{ ...inputSt, flex: 1, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: 1 }}
                  placeholder="17-character VIN"
                  value={vin}
                  onChange={e => { setVin(e.target.value.toUpperCase()); setVinInfo(null); setVinError(''); }}
                  maxLength={17}
                />
                <button
                  onClick={handleDecode}
                  disabled={vinLoading}
                  style={{
                    padding: '0 16px', borderRadius: 8, border: '1px solid var(--brd-2)',
                    background: 'var(--card)', color: 'var(--text2)', cursor: 'pointer',
                    fontFamily: "'Public Sans', sans-serif", fontWeight: 600, fontSize: 13,
                    whiteSpace: 'nowrap', transition: 'all .15s', flexShrink: 0,
                  }}
                >
                  {vinLoading ? '…' : 'Decode'}
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  style={{ ...inputSt, flex: 1 }}
                  placeholder="License plate"
                  value={plate}
                  onChange={e => setPlate(e.target.value.toUpperCase())}
                />
                <select
                  value={state}
                  onChange={e => setState(e.target.value)}
                  style={{
                    ...inputSt, width: 'auto', paddingRight: 30, cursor: 'pointer',
                    appearance: 'none',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center',
                  }}
                >
                  {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            )}

            {vinError && (
              <div style={{ marginTop: 8, fontSize: 12, color: '#ef4444', fontFamily: "'IBM Plex Mono', monospace" }}>
                {vinError}
              </div>
            )}

            {/* Decoded vehicle info */}
            {vinInfo && (
              <div style={{
                marginTop: 10, padding: '10px 14px', borderRadius: 9,
                background: 'var(--gold-soft)', border: '1px solid var(--gold-brd)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div>
                  <div style={{ fontFamily: "'Public Sans', sans-serif", fontWeight: 700, fontSize: 14, color: 'var(--gold)' }}>
                    {vinInfo.year} {vinInfo.make} {vinInfo.model}
                  </div>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'var(--text3)', marginTop: 2, letterSpacing: .5 }}>
                    {vinInfo.bodyClass} · set to {vinInfo.detectedVehicle === 'truck' ? 'Pickup Truck' : vinInfo.detectedVehicle === 'suv' ? 'SUV' : 'Sedan'}
                  </div>
                </div>
                <div style={{ fontSize: 20 }}>{vinInfo.detectedVehicle === 'truck' ? '🛻' : vinInfo.detectedVehicle === 'suv' ? '🚙' : '🚗'}</div>
              </div>
            )}

            <button
              onClick={openCarfax}
              style={{
                marginTop: 12, width: '100%', padding: '10px 0', borderRadius: 9,
                background: 'var(--gold2)', color: 'var(--on-gold)',
                border: 'none', cursor: 'pointer',
                fontFamily: "'Public Sans', sans-serif", fontWeight: 700, fontSize: 13,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                transition: 'opacity .15s',
              }}
            >
              Open on Carfax
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
            </button>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: 'var(--brd)' }} />

          {/* ── Retail value + thresholds ── */}
          <div>
            <div style={{ fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: 'var(--text3)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 }}>
              Retail Value
            </div>
            <div style={{ position: 'relative', marginBottom: 14 }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)', fontSize: 15, pointerEvents: 'none' }}>$</span>
              <input
                style={{ ...inputSt, paddingLeft: 26 }}
                placeholder="0"
                value={retailRaw}
                onChange={e => setRetailRaw(e.target.value)}
                inputMode="numeric"
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {VALUE_THRESHOLDS.map(t => {
                const amt = retail > 0 ? retail * t.pct : null;
                return (
                  <div key={t.pct} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '11px 14px', borderRadius: 9,
                    background: t.bg, border: `1px solid ${t.brd}`,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 9, height: 9, borderRadius: '50%', background: t.color, flexShrink: 0 }} />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13, color: t.color }}>{Math.round(t.pct * 100)}%</div>
                        <div style={{ fontSize: 10, color: 'var(--text3)', fontFamily: "'IBM Plex Mono', monospace", marginTop: 1 }}>{t.label}</div>
                      </div>
                    </div>
                    <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, fontSize: 15, color: amt ? t.color : 'var(--text3)' }}>
                      {amt ? fmtUSD(amt) : '—'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: 'var(--brd)' }} />

          {/* ── Estimate value ── */}
          <div>
            <div style={{ fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: 'var(--text3)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 }}>
              Estimate Total
            </div>
            <div style={{ position: 'relative', marginBottom: pct > 0 ? 12 : 0 }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)', fontSize: 15, pointerEvents: 'none' }}>$</span>
              <input
                style={{ ...inputSt, paddingLeft: 26 }}
                placeholder="0"
                value={estRaw}
                onChange={e => setEstRaw(e.target.value)}
                inputMode="numeric"
              />
            </div>

            {pct > 0 && (
              <div style={{
                padding: '13px 16px', borderRadius: 10,
                background: zone ? zone.bg : 'rgba(34,197,94,.08)',
                border: `1px solid ${zone ? zone.brd : 'rgba(34,197,94,.2)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div>
                  <div style={{ fontSize: 13, color: 'var(--text2)', fontFamily: "'Public Sans', sans-serif" }}>
                    Estimate is{' '}
                    <strong style={{ color: zone ? zone.color : '#22c55e' }}>
                      {(pct * 100).toFixed(1)}%
                    </strong>{' '}
                    of retail value
                  </div>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, fontSize: 12, color: zone ? zone.color : '#22c55e', marginTop: 3 }}>
                    {zone ? zone.label : 'Under 55% — well within safe range'}
                  </div>
                </div>
                <div style={{ fontSize: 26, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700, color: zone ? zone.color : '#22c55e' }}>
                  {(pct * 100).toFixed(1)}%
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

// ─── Scope Sheet Scanner Modal ────────────────────────────────────────────────

const SHEET_LABEL_TO_PANEL: Record<string, string> = {
  'LT FENDER': 'lt-fender',    'RT FENDER': 'rt-fender',
  'HOOD': 'hood',              'WINDSHIELD': 'windshield',
  'LF DOOR': 'lt-front-door',  'RF DOOR': 'rt-front-door',
  'LR DOOR': 'lt-rear-door',   'RR DOOR': 'rt-rear-door',
  'L RAIL': 'lt-roof-rail',    'R RAIL': 'rt-roof-rail',
  'ROOF': 'roof',
  'LT CAB': 'lt-cab-corner',   'RT CAB': 'rt-cab-corner',
  'LT QUARTER': 'lt-quarter',  'RT QUARTER': 'rt-quarter',
  'DECK LID': 'lift-gate',
  'LT BED': 'lt-bed',          'RT BED': 'rt-bed',
  'TAILGATE': 'tailgate',
  'FRONT BUMPER': 'front-bumper', 'REAR BUMPER': 'rear-bumper',
};

const DENT_SIZE_LABEL: Record<string, string> = {
  D: 'Dime', N: 'Nickel', Q: 'Quarter', H: 'Half Dollar',
};

// Display order for scan results (RT before LT, top of car to rear)
const SCAN_ORDER = [
  'HOOD',
  'RT FENDER', 'LT FENDER',
  'R RAIL', 'L RAIL',
  'ROOF',
  'RF DOOR', 'LF DOOR',
  'RR DOOR', 'LR DOOR',
  'RT QUARTER', 'LT QUARTER',
  'RT BED', 'LT BED',
  'RT CAB', 'LT CAB',
  'WINDSHIELD', 'DECK LID', 'TAILGATE', 'FRONT BUMPER', 'REAR BUMPER',
];

function scanOrderIdx(label: string) {
  const i = SCAN_ORDER.indexOf(label);
  return i === -1 ? 999 : i;
}

export interface ScanCounts {
  [panelId: string]: {
    dentCount: number | null; dentCountText?: string | null; dentSize: string | null; oversize: number | null;
    repairType?: 'pdr' | 'repair' | 'rr' | null;
    paintHours?: number | null;
    replacements?: string[];
  };
}

type PanelRepairType = 'pdr' | 'repair' | 'rr' | null;

interface ScopePanel {
  sheetLabel: string;
  repairType?: PanelRepairType;
  dentCount: number | null;
  dentCountText?: string | null;
  dentSize: string | null;
  oversize: number | null;
  paintHours?: number | null;
  replacements?: string[];
  notes: string;
}

const REPAIR_TYPE_LABEL: Record<Exclude<PanelRepairType, null>, string> = {
  pdr: 'PDR', repair: 'Repair', rr: 'Replace',
};

interface ScopeResult {
  vehicle: {
    year: string; make: string; model: string; color: string; vin: string;
    plate: string; plateState: string; claim: string; carrier: string;
    member: string; phone: string;
  };
  panels: ScopePanel[];
}

const TRUCK_MODELS = ['FRONTIER','TACOMA','TUNDRA','F-150','F150','F-250','F250','F-350','F350','SILVERADO','SIERRA','RAM','1500','2500','3500','COLORADO','CANYON','RANGER','TITAN','RIDGELINE','GLADIATOR','MAVERICK','SANTA CRUZ'];

function detectTruck(scope: ScopeResult): boolean {
  return (
    scope.panels.some(p => ['LT CAB', 'RT CAB', 'LT BED', 'RT BED', 'TAILGATE'].includes(p.sheetLabel)) ||
    TRUCK_MODELS.some(m => (scope.vehicle.model || '').toUpperCase().includes(m))
  );
}

// On trucks, quarter panels don't exist — the sheet's "quarter panel" is the pickup bed side
function resolveSheetLabel(label: string, isTruck: boolean): string {
  if (!isTruck) return label;
  if (label === 'LT QUARTER') return 'LT BED';
  if (label === 'RT QUARTER') return 'RT BED';
  if (label === 'DECK LID') return 'TAILGATE';
  return label;
}

interface ScanHistoryEntry {
  id: number;
  savedAt: string;
  scope: ScopeResult;
}

const SCAN_HISTORY_KEY = 'hep-scan-history';

function loadScanHistory(): ScanHistoryEntry[] {
  try {
    return JSON.parse(localStorage.getItem(SCAN_HISTORY_KEY) || '[]');
  } catch { return []; }
}

function saveScanToHistory(scope: ScopeResult): ScanHistoryEntry[] {
  const history = loadScanHistory();
  const entry: ScanHistoryEntry = { id: Date.now(), savedAt: new Date().toISOString(), scope };
  const next = [entry, ...history].slice(0, 30);
  try { localStorage.setItem(SCAN_HISTORY_KEY, JSON.stringify(next)); } catch { /* storage full */ }
  return next;
}

// ── Assisted estimates: confirmed (edited) estimates from the Estimate Assistant ──
interface AssistedEstimate {
  id: number;
  savedAt: string;
  isTruck: boolean;
  scope: ScopeResult; // panels hold the confirmed/edited rows
}

const ASSISTED_KEY = 'hep-assisted-estimates';

function loadAssisted(): AssistedEstimate[] {
  try { return JSON.parse(localStorage.getItem(ASSISTED_KEY) || '[]'); } catch { return []; }
}

function saveAssisted(scope: ScopeResult, isTruck: boolean): AssistedEstimate[] {
  const list = loadAssisted();
  const entry: AssistedEstimate = { id: Date.now(), savedAt: new Date().toISOString(), isTruck, scope };
  const next = [entry, ...list].slice(0, 50);
  try { localStorage.setItem(ASSISTED_KEY, JSON.stringify(next)); } catch { /* storage full */ }
  return next;
}

function ScopeModal({ onClose, onApply }: {
  onClose: () => void;
  onApply: (panelIds: string[], vt: VehicleType, counts: ScanCounts, scope: ScopeResult) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [scope, setScope] = useState<ScopeResult | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [history, setHistory] = useState<ScanHistoryEntry[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setHistory(loadScanHistory()); }, []);

  const handleFile = async (file: File) => {
    setError(''); setScope(null); setLoading(true);
    try {
      const reader = new FileReader();
      const dataUrl: string = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      setPreview(dataUrl);
      const [meta, base64] = dataUrl.split(',');
      const mediaType = meta.match(/data:(.*?);/)?.[1] || 'image/jpeg';
      const res = await fetch('/api/scope', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageData: base64, mediaType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to read scope sheet');
      setScope(data.scope);
      setHistory(saveScanToHistory(data.scope));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to read scope sheet');
    } finally {
      setLoading(false);
    }
  };

  const deleteHistoryEntry = (id: number) => {
    const next = history.filter(h => h.id !== id);
    setHistory(next);
    try { localStorage.setItem(SCAN_HISTORY_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  };

  const isTruck = !!scope && detectTruck(scope);
  const resolveLabel = (label: string) => resolveSheetLabel(label, isTruck);

  const sortedPanels = scope
    ? scope.panels
        .map(p => ({ ...p, sheetLabel: resolveLabel(p.sheetLabel) }))
        .sort((a, b) => scanOrderIdx(a.sheetLabel) - scanOrderIdx(b.sheetLabel))
    : [];

  const mappedIds = sortedPanels.map(p => SHEET_LABEL_TO_PANEL[p.sheetLabel]).filter(Boolean);

  const scanCounts: ScanCounts = {};
  for (const p of sortedPanels) {
    const id = SHEET_LABEL_TO_PANEL[p.sheetLabel];
    if (id) scanCounts[id] = {
      dentCount: p.dentCount, dentCountText: p.dentCountText, dentSize: p.dentSize, oversize: p.oversize,
      repairType: p.repairType, paintHours: p.paintHours, replacements: p.replacements,
    };
  }

  const totalDents = sortedPanels.reduce((s, p) => s + (p.dentCount || 0), 0);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        background: 'rgba(0,0,0,.55)',
        backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 620, maxHeight: '90vh', overflowY: 'auto',
          background: 'var(--panel-bg)', borderRadius: 16,
          border: '1px solid var(--brd-2)', boxShadow: '0 24px 80px rgba(0,0,0,.6)',
        }}
      >
        {/* Modal header */}
        <div style={{
          padding: '18px 24px', borderBottom: '1px solid var(--brd)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 17, color: 'var(--gold)' }}>
              Scope Sheet Scanner
            </div>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'var(--text3)', letterSpacing: 1.5, marginTop: 2 }}>
              AI-POWERED · PHOTO TO PANELS
            </div>
          </div>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: 8, border: '1px solid var(--brd)',
            background: 'var(--input-bg)', color: 'var(--text2)', cursor: 'pointer',
            fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>×</button>
        </div>

        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Upload area */}
          {!scope && (
            <button
              onClick={() => fileRef.current?.click()}
              disabled={loading}
              style={{
                border: '2px dashed var(--brd-2)', borderRadius: 12,
                background: 'var(--card)', color: 'var(--text2)',
                padding: '36px 20px', cursor: loading ? 'wait' : 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                fontFamily: "'Public Sans', sans-serif", transition: 'all .15s',
              }}
            >
              {loading ? (
                <>
                  <div style={{ fontSize: 26 }}>⏳</div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>Reading scope sheet…</div>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: 'var(--text3)' }}>
                    Extracting handwriting with AI — takes ~15 seconds
                  </div>
                </>
              ) : (
                <>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>Upload scope sheet</div>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: 'var(--text3)' }}>
                    Photo (JPG, PNG) or scanned PDF · reads handwritten PDR Linx sheets
                  </div>
                </>
              )}
            </button>
          )}
          <input
            ref={fileRef} type="file" accept="image/*,application/pdf,.pdf" style={{ display: 'none' }}
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }}
          />

          {/* Recent scans */}
          {!scope && !loading && history.length > 0 && (
            <div>
              <div style={{ fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: 'var(--text3)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 }}>
                Recent scans
              </div>
              <div style={{ border: '1px solid var(--brd)', borderRadius: 10, overflow: 'hidden' }}>
                {history.map((h, i) => {
                  const v = h.scope.vehicle;
                  const title = [v.year, v.make, v.model].filter(Boolean).join(' ') || 'Vehicle';
                  const d = new Date(h.savedAt);
                  const dateStr = `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
                  return (
                    <div key={h.id} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 14px',
                      borderBottom: i < history.length - 1 ? '1px solid var(--brd)' : 'none',
                    }}>
                      <button
                        onClick={() => setScope(h.scope)}
                        style={{
                          flex: 1, textAlign: 'left', background: 'none', border: 'none',
                          cursor: 'pointer', padding: 0, fontFamily: "'Public Sans', sans-serif",
                        }}
                      >
                        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>{title}</div>
                        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>
                          {dateStr}{v.claim ? ` · CLAIM ${v.claim}` : ''} · {h.scope.panels.length} panels
                        </div>
                      </button>
                      <button
                        onClick={() => deleteHistoryEntry(h.id)}
                        title="Delete"
                        style={{
                          width: 26, height: 26, borderRadius: 6, border: '1px solid var(--brd)',
                          background: 'none', color: 'var(--text3)', cursor: 'pointer',
                          fontSize: 14, lineHeight: 1, flexShrink: 0,
                        }}
                      >×</button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {error && (
            <div style={{
              padding: '12px 16px', borderRadius: 9, fontSize: 13,
              background: 'rgba(239,68,68,.12)', border: '1px solid rgba(239,68,68,.28)',
              color: '#ef4444', fontFamily: "'Public Sans', sans-serif",
            }}>
              {error}
            </div>
          )}

          {/* Results */}
          {scope && (
            <>
              {/* Vehicle info */}
              <div style={{
                padding: '12px 16px', borderRadius: 10,
                background: 'var(--gold-soft)', border: '1px solid var(--gold-brd)',
              }}>
                <div style={{ fontFamily: "'Public Sans', sans-serif", fontWeight: 700, fontSize: 15, color: 'var(--gold)' }}>
                  {[scope.vehicle.year, scope.vehicle.make, scope.vehicle.model].filter(Boolean).join(' ') || 'Vehicle'}
                  {scope.vehicle.color ? ` · ${scope.vehicle.color}` : ''}
                </div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, color: 'var(--text2)', marginTop: 4, display: 'flex', flexWrap: 'wrap', gap: '4px 16px' }}>
                  {scope.vehicle.vin && <span>VIN {scope.vehicle.vin}</span>}
                  {scope.vehicle.claim && <span>CLAIM {scope.vehicle.claim}</span>}
                  {scope.vehicle.carrier && <span>{scope.vehicle.carrier}</span>}
                  {scope.vehicle.plate && <span>{scope.vehicle.plate} {scope.vehicle.plateState}</span>}
                </div>
              </div>

              {/* Panels table */}
              <div style={{ border: '1px solid var(--brd)', borderRadius: 10, overflow: 'hidden' }}>
                <div style={{
                  display: 'grid', gridTemplateColumns: '1fr 62px 70px 90px 60px',
                  padding: '8px 14px', background: 'var(--card)',
                  fontFamily: "'IBM Plex Mono', monospace", fontSize: 9.5,
                  color: 'var(--text3)', letterSpacing: 1, textTransform: 'uppercase',
                  borderBottom: '1px solid var(--brd)',
                }}>
                  <span>Panel</span><span>Mode</span><span>Dents</span><span>Size</span><span>O/S</span>
                </div>
                {sortedPanels.map((p, i) => (
                  <div key={i} style={{
                    padding: '9px 14px',
                    borderBottom: i < scope.panels.length - 1 ? '1px solid var(--brd)' : 'none',
                  }}>
                    <div style={{
                      display: 'grid', gridTemplateColumns: '1fr 62px 70px 90px 60px',
                      fontSize: 13, fontFamily: "'Public Sans', sans-serif", color: 'var(--text)',
                      alignItems: 'center',
                    }}>
                      <span style={{ fontWeight: 600 }}>{p.sheetLabel}</span>
                      <span style={{
                        fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, fontWeight: 600,
                        color: p.repairType === 'rr' ? '#ef4444' : p.repairType === 'repair' ? '#f59e0b' : 'var(--gold)',
                      }}>
                        {p.repairType ? REPAIR_TYPE_LABEL[p.repairType] : '—'}
                      </span>
                      <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: 'var(--gold)' }}>{p.dentCountText || (p.dentCount ?? '—')}</span>
                      <span style={{ fontSize: 12, color: 'var(--text2)' }}>{p.dentSize ? DENT_SIZE_LABEL[p.dentSize] || p.dentSize : '—'}</span>
                      <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: p.oversize ? '#f59e0b' : 'var(--text3)' }}>{p.oversize ?? '—'}</span>
                    </div>
                    {((p.replacements && p.replacements.length > 0) || p.paintHours) && (
                      <div style={{
                        marginTop: 5, fontSize: 11.5, fontFamily: "'IBM Plex Mono', monospace",
                        color: '#ef4444', display: 'flex', flexWrap: 'wrap', gap: '3px 10px',
                      }}>
                        {p.paintHours ? <span style={{ color: '#f59e0b' }}>⏱ {p.paintHours}h paint</span> : null}
                        {p.replacements?.map((r, ri) => <span key={ri}>⚠ Replace: {r}</span>)}
                      </div>
                    )}
                  </div>
                ))}
                <div style={{
                  display: 'flex', justifyContent: 'space-between', padding: '9px 14px',
                  background: 'var(--card)', borderTop: '1px solid var(--brd)',
                  fontFamily: "'IBM Plex Mono', monospace", fontSize: 11.5, color: 'var(--text2)',
                }}>
                  <span>{scope.panels.length} panels · detected as {isTruck ? 'Pickup Truck' : 'Sedan / SUV'}</span>
                  <span style={{ color: 'var(--gold)', fontWeight: 600 }}>{totalDents} total dents</span>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => { onApply(mappedIds, isTruck ? 'truck' : 'sedan', scanCounts, scope); onClose(); }}
                  style={{
                    flex: 1, padding: '11px 0', borderRadius: 9,
                    background: 'var(--gold2)', color: 'var(--on-gold)', border: 'none',
                    cursor: 'pointer', fontFamily: "'Public Sans', sans-serif",
                    fontWeight: 700, fontSize: 13.5,
                  }}
                >
                  Select these panels on diagram
                </button>
                <button
                  onClick={() => { setScope(null); setPreview(null); setError(''); }}
                  style={{
                    padding: '11px 18px', borderRadius: 9,
                    background: 'var(--card)', color: 'var(--text2)',
                    border: '1px solid var(--brd)', cursor: 'pointer',
                    fontFamily: "'Public Sans', sans-serif", fontWeight: 600, fontSize: 13,
                  }}
                >
                  Scan another
                </button>
              </div>
            </>
          )}

          {/* Photo preview while loading */}
          {loading && preview && preview.startsWith('data:image') && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Scope sheet" style={{ width: '100%', borderRadius: 10, opacity: .5, border: '1px solid var(--brd)' }} />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Estimate Assistant (guided wizard) ───────────────────────────────────────

function EstimateAssistantModal({ onClose, onApply }: {
  onClose: () => void;
  onApply: (panelIds: string[], vt: VehicleType, counts: ScanCounts, scope: ScopeResult) => void;
}) {
  const [step, setStep] = useState<'upload' | 'confirm' | 'guide' | 'done'>('upload');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [scope, setScope] = useState<ScopeResult | null>(null);
  const [rows, setRows] = useState<ScopePanel[]>([]);
  const [guideIdx, setGuideIdx] = useState(0);
  const [showHowTo, setShowHowTo] = useState(false);
  const [enlarged, setEnlarged] = useState(false);
  const [saved, setSaved] = useState<AssistedEstimate[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setSaved(loadAssisted()); }, []);

  const nn = PANELS.find(p => p.id === 'non-negotiables');
  const guideVehicleType: VehicleType = scope && detectTruck(scope) ? 'truck' : 'sedan';
  const guideSteps = nn ? nn.operations.filter(op => !op.vehicles || op.vehicles.includes(guideVehicleType)) : [];

  const handleFile = async (file: File) => {
    setError(''); setLoading(true);
    try {
      const reader = new FileReader();
      const dataUrl: string = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const [meta, base64] = dataUrl.split(',');
      const mediaType = meta.match(/data:(.*?);/)?.[1] || 'image/jpeg';
      const res = await fetch('/api/scope', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageData: base64, mediaType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to read scope sheet');
      const scanned: ScopeResult = data.scope;
      saveScanToHistory(scanned);
      const truck = detectTruck(scanned);
      const sorted = scanned.panels
        .map(p => ({ ...p, sheetLabel: resolveSheetLabel(p.sheetLabel, truck) }))
        .sort((a, b) => scanOrderIdx(a.sheetLabel) - scanOrderIdx(b.sheetLabel));
      setScope(scanned);
      setRows(sorted);
      setStep('confirm');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to read scope sheet');
    } finally {
      setLoading(false);
    }
  };

  const updateRow = (i: number, patch: Partial<ScopePanel>) => {
    setRows(prev => prev.map((r, ri) => (ri === i ? { ...r, ...patch } : r)));
  };

  const confirmAndStart = () => {
    if (!scope) return;
    const isTruck = detectTruck(scope);
    const mappedIds = rows.map(r => SHEET_LABEL_TO_PANEL[r.sheetLabel]).filter(Boolean);
    const counts: ScanCounts = {};
    for (const r of rows) {
      const id = SHEET_LABEL_TO_PANEL[r.sheetLabel];
      if (id) counts[id] = {
        dentCount: r.dentCount, dentCountText: r.dentCountText, dentSize: r.dentSize, oversize: r.oversize,
        repairType: r.repairType, paintHours: r.paintHours, replacements: r.replacements,
      };
    }
    onApply(mappedIds, isTruck ? 'truck' : 'sedan', counts, { ...scope, panels: rows });
    setSaved(saveAssisted({ ...scope, panels: rows }, isTruck));
    setGuideIdx(0);
    setStep('guide');
  };

  const openSaved = (e: AssistedEstimate) => {
    const sorted = e.scope.panels
      .slice()
      .sort((a, b) => scanOrderIdx(a.sheetLabel) - scanOrderIdx(b.sheetLabel));
    setScope(e.scope);
    setRows(sorted);
    setStep('confirm');
  };

  const deleteSaved = (id: number) => {
    const next = saved.filter(s => s.id !== id);
    setSaved(next);
    try { localStorage.setItem(ASSISTED_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  };

  const inputSt: React.CSSProperties = {
    width: '100%', padding: '7px 10px', fontSize: 13,
    fontFamily: "'IBM Plex Mono', monospace",
    background: 'var(--input-bg)', border: '1px solid var(--brd-2)',
    borderRadius: 7, color: 'var(--text)', outline: 'none',
  };

  const current = guideSteps[guideIdx];

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        background: 'rgba(0,0,0,.55)',
        backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 620, maxHeight: '90vh', overflowY: 'auto',
          background: 'var(--panel-bg)', borderRadius: 16,
          border: '1px solid var(--brd-2)', boxShadow: '0 24px 80px rgba(0,0,0,.6)',
        }}
      >
        {/* Modal header */}
        <div style={{
          padding: '18px 24px', borderBottom: '1px solid var(--brd)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 17, color: 'var(--gold)' }}>
              Estimate Assistant
            </div>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'var(--text3)', letterSpacing: 1.5, marginTop: 2 }}>
              {step === 'upload' && 'STEP-BY-STEP GUIDE · UPLOAD SCOPE SHEET'}
              {step === 'confirm' && 'REVIEW & CONFIRM THE SCAN'}
              {step === 'guide' && `EVERY ESTIMATE · STEP ${guideIdx + 1} OF ${guideSteps.length}`}
              {step === 'done' && 'PART 1 COMPLETE'}
            </div>
          </div>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: 8, border: '1px solid var(--brd)',
            background: 'var(--input-bg)', color: 'var(--text2)', cursor: 'pointer',
            fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>×</button>
        </div>

        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* ── Step 1: upload ── */}
          {step === 'upload' && (
            <>
              <button
                onClick={() => fileRef.current?.click()}
                disabled={loading}
                style={{
                  border: '2px dashed var(--brd-2)', borderRadius: 12,
                  background: 'var(--card)', color: 'var(--text2)',
                  padding: '36px 20px', cursor: loading ? 'wait' : 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                  fontFamily: "'Public Sans', sans-serif", transition: 'all .15s',
                }}
              >
                {loading ? (
                  <>
                    <div style={{ fontSize: 26 }}>⏳</div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>Reading scope sheet…</div>
                    <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: 'var(--text3)' }}>
                      Extracting with AI — takes ~15 seconds
                    </div>
                  </>
                ) : (
                  <>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>Upload scope sheet to begin</div>
                    <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: 'var(--text3)' }}>
                      Photo (JPG, PNG) or scanned PDF — I&apos;ll guide you step by step after reading it
                    </div>
                  </>
                )}
              </button>
              <input
                ref={fileRef} type="file" accept="image/*,application/pdf,.pdf" style={{ display: 'none' }}
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }}
              />

              {/* Saved assisted estimates */}
              {saved.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: 'var(--text3)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 }}>
                    Saved estimates
                  </div>
                  <div style={{ border: '1px solid var(--brd)', borderRadius: 10, overflow: 'hidden' }}>
                    {saved.map((s, i) => {
                      const v = s.scope.vehicle;
                      const title = [v.year, v.make, v.model].filter(Boolean).join(' ') || 'Vehicle';
                      const d = new Date(s.savedAt);
                      const dateStr = `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
                      return (
                        <div key={s.id} style={{
                          display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                          borderBottom: i < saved.length - 1 ? '1px solid var(--brd)' : 'none',
                        }}>
                          <button
                            onClick={() => openSaved(s)}
                            style={{ flex: 1, textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: "'Public Sans', sans-serif" }}
                          >
                            <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>{title}</div>
                            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>
                              {dateStr}{v.claim ? ` · CLAIM ${v.claim}` : ''} · {s.scope.panels.length} panels
                            </div>
                          </button>
                          <button
                            onClick={() => deleteSaved(s.id)}
                            title="Delete"
                            style={{ width: 26, height: 26, borderRadius: 6, border: '1px solid var(--brd)', background: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 14, lineHeight: 1, flexShrink: 0 }}
                          >×</button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}

          {error && (
            <div style={{
              padding: '12px 16px', borderRadius: 9, fontSize: 13,
              background: 'rgba(239,68,68,.12)', border: '1px solid rgba(239,68,68,.28)',
              color: '#ef4444', fontFamily: "'Public Sans', sans-serif",
            }}>
              {error}
            </div>
          )}

          {/* ── Step 2: confirm summary ── */}
          {step === 'confirm' && scope && (
            <>
              <div style={{
                padding: '12px 16px', borderRadius: 10,
                background: 'var(--gold-soft)', border: '1px solid var(--gold-brd)',
              }}>
                <div style={{ fontFamily: "'Public Sans', sans-serif", fontWeight: 700, fontSize: 15, color: 'var(--gold)' }}>
                  {[scope.vehicle.year, scope.vehicle.make, scope.vehicle.model].filter(Boolean).join(' ') || 'Vehicle'}
                  {scope.vehicle.color ? ` · ${scope.vehicle.color}` : ''}
                </div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, color: 'var(--text2)', marginTop: 4, display: 'flex', flexWrap: 'wrap', gap: '4px 16px' }}>
                  {scope.vehicle.vin && <span>VIN {scope.vehicle.vin}</span>}
                  {scope.vehicle.claim && <span>CLAIM {scope.vehicle.claim}</span>}
                  {scope.vehicle.carrier && <span>{scope.vehicle.carrier}</span>}
                </div>
              </div>

              {/* Visual review diagram with dent counts */}
              {(() => {
                const isTruck = detectTruck(scope);
                const reviewCounts: ScanCounts = {};
                for (const r of rows) {
                  const id = SHEET_LABEL_TO_PANEL[r.sheetLabel];
                  if (id) reviewCounts[id] = {
                    dentCount: r.dentCount, dentCountText: r.dentCountText, dentSize: r.dentSize,
                    oversize: r.oversize, repairType: r.repairType, paintHours: r.paintHours, replacements: r.replacements,
                  };
                }
                return (
                  <div style={{ position: 'relative', background: 'var(--bg)', border: '1px solid var(--brd)', borderRadius: 12, padding: '16px 12px' }}>
                    <button
                      onClick={() => setEnlarged(true)}
                      title="Full view"
                      style={{
                        position: 'absolute', top: 8, right: 8, zIndex: 2,
                        width: 30, height: 30, borderRadius: 7, border: '1px solid var(--brd)',
                        background: 'var(--card)', color: 'var(--text2)', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
                        <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
                      </svg>
                    </button>
                    <CarDiagram selectedIds={[]} onSelect={() => {}} vehicleType={isTruck ? 'truck' : 'sedan'} counts={reviewCounts} review />
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 8, fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: 'var(--text3)' }}>
                      <span><span style={{ color: 'var(--gold)' }}>●</span> dent count</span>
                      <span><span style={{ color: '#f59e0b' }}>●</span> oversize</span>
                      <span><span style={{ color: '#ef4444' }}>●</span> replace</span>
                    </div>

                    {/* Enlarged full-view overlay */}
                    {enlarged && (
                      <div
                        onClick={() => setEnlarged(false)}
                        style={{
                          position: 'fixed', inset: 0, zIndex: 400,
                          background: 'rgba(0,0,0,.8)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, gap: 14,
                        }}
                      >
                        <div onClick={e => e.stopPropagation()} style={{
                          background: 'var(--panel-bg)', border: '1px solid var(--brd-2)', borderRadius: 16,
                          padding: '20px 24px', maxHeight: '94vh', maxWidth: 820, width: '100%', overflow: 'hidden',
                          boxShadow: '0 24px 80px rgba(0,0,0,.6)', position: 'relative',
                          display: 'flex', flexDirection: 'column',
                        }}>
                          <button
                            onClick={() => setEnlarged(false)}
                            style={{
                              position: 'absolute', top: 12, right: 12, zIndex: 2,
                              width: 32, height: 32, borderRadius: 8, border: '1px solid var(--brd)',
                              background: 'var(--input-bg)', color: 'var(--text2)', cursor: 'pointer',
                              fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}
                          >×</button>
                          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 15, color: 'var(--gold)', marginBottom: 4 }}>
                            {[scope.vehicle.year, scope.vehicle.make, scope.vehicle.model].filter(Boolean).join(' ') || 'Vehicle'}
                          </div>
                          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'var(--text3)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 14 }}>
                            Damage map
                          </div>
                          <div style={{ margin: '0 auto' }}>
                            <CarDiagram selectedIds={[]} onSelect={() => {}} vehicleType={isTruck ? 'truck' : 'sedan'} counts={reviewCounts} review heightVh={72} />
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'center', gap: 18, marginTop: 12, fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'var(--text3)' }}>
                            <span><span style={{ color: 'var(--gold)' }}>●</span> dent count</span>
                            <span><span style={{ color: '#f59e0b' }}>●</span> oversize</span>
                            <span><span style={{ color: '#ef4444' }}>●</span> replace</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              <div style={{ fontSize: 13, color: 'var(--text2)', fontFamily: "'Public Sans', sans-serif", lineHeight: 1.6 }}>
                Confirm each panel&apos;s repair mode, dent counts, and any parts marked for replacement. Fix anything the AI misread, remove panels that don&apos;t belong, then start the guide.
              </div>

              <div style={{ border: '1px solid var(--brd)', borderRadius: 10, overflow: 'hidden' }}>
                <div style={{
                  display: 'grid', gridTemplateColumns: '1fr 70px 66px 90px 58px 26px',
                  gap: 6, padding: '8px 14px', background: 'var(--card)',
                  fontFamily: "'IBM Plex Mono', monospace", fontSize: 9.5,
                  color: 'var(--text3)', letterSpacing: 1, textTransform: 'uppercase',
                  borderBottom: '1px solid var(--brd)', alignItems: 'center',
                }}>
                  <span>Panel</span><span>Mode</span><span>Dents</span><span>Size</span><span>O/S</span><span />
                </div>
                {rows.map((r, i) => (
                  <div key={i} style={{
                    padding: '8px 14px',
                    borderBottom: i < rows.length - 1 ? '1px solid var(--brd)' : 'none',
                  }}>
                    <div style={{
                      display: 'grid', gridTemplateColumns: '1fr 70px 66px 90px 58px 26px',
                      gap: 6, alignItems: 'center',
                    }}>
                      <span style={{ fontWeight: 600, fontSize: 13, fontFamily: "'Public Sans', sans-serif", color: 'var(--text)' }}>
                        {r.sheetLabel}
                      </span>
                      <select
                        style={{
                          ...inputSt, cursor: 'pointer', fontWeight: 600,
                          color: r.repairType === 'rr' ? '#ef4444' : r.repairType === 'repair' ? '#f59e0b' : 'var(--gold)',
                        }}
                        value={r.repairType ?? 'pdr'}
                        onChange={e => updateRow(i, { repairType: e.target.value as PanelRepairType })}
                      >
                        {(['pdr', 'repair', 'rr'] as const).map(rt => (
                          <option key={rt} value={rt}>{REPAIR_TYPE_LABEL[rt]}</option>
                        ))}
                      </select>
                      <input
                        style={inputSt} value={r.dentCountText ?? (r.dentCount != null ? String(r.dentCount) : '')}
                        placeholder="—"
                        onChange={e => {
                          const t = e.target.value;
                          const n = /^\d+$/.test(t.trim()) ? parseInt(t.trim(), 10) : null;
                          updateRow(i, { dentCountText: t, dentCount: n });
                        }}
                      />
                      <select
                        style={{ ...inputSt, cursor: 'pointer' }}
                        value={r.dentSize ?? ''}
                        onChange={e => updateRow(i, { dentSize: e.target.value || null })}
                      >
                        <option value="">—</option>
                        {Object.entries(DENT_SIZE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                      <input
                        style={inputSt} inputMode="numeric" value={r.oversize ?? ''}
                        placeholder="—"
                        onChange={e => updateRow(i, { oversize: parseInt(e.target.value.replace(/\D/g, ''), 10) || null })}
                      />
                      <button
                        onClick={() => setRows(prev => prev.filter((_, ri) => ri !== i))}
                        title="Remove panel"
                        style={{
                          width: 26, height: 26, borderRadius: 6, border: '1px solid var(--brd)',
                          background: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 14, lineHeight: 1,
                        }}
                      >×</button>
                    </div>

                    {/* Paint hours (repair mode) */}
                    {r.repairType === 'repair' && (
                      <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, color: '#f59e0b' }}>⏱ Paint hours:</span>
                        <input
                          style={{ ...inputSt, width: 70 }} inputMode="decimal" value={r.paintHours ?? ''}
                          placeholder="0"
                          onChange={e => updateRow(i, { paintHours: parseFloat(e.target.value.replace(/[^0-9.]/g, '')) || null })}
                        />
                      </div>
                    )}

                    {/* Part replacements — any panel can have marked parts to replace */}
                    <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, color: '#ef4444', flexShrink: 0 }}>⚠ Replace:</span>
                      {(r.replacements ?? []).map((part, pi) => (
                        <span key={pi} style={{
                          display: 'flex', alignItems: 'center', gap: 4,
                          padding: '2px 4px 2px 8px', borderRadius: 6,
                          background: 'rgba(239,68,68,.12)', border: '1px solid rgba(239,68,68,.28)',
                          fontSize: 11.5, color: '#ef4444', fontFamily: "'Public Sans', sans-serif",
                        }}>
                          {part}
                          <button
                            onClick={() => updateRow(i, { replacements: (r.replacements ?? []).filter((_, x) => x !== pi) })}
                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 12, lineHeight: 1, padding: 0 }}
                          >×</button>
                        </span>
                      ))}
                      <input
                        placeholder="+ add part"
                        style={{
                          background: 'none', border: '1px dashed var(--brd-2)', borderRadius: 6,
                          padding: '2px 8px', fontSize: 11.5, color: 'var(--text2)', width: 100,
                          fontFamily: "'Public Sans', sans-serif", outline: 'none',
                        }}
                        onKeyDown={e => {
                          const val = (e.target as HTMLInputElement).value.trim();
                          if (e.key === 'Enter' && val) {
                            updateRow(i, { replacements: [...(r.replacements ?? []), val] });
                            (e.target as HTMLInputElement).value = '';
                          }
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={confirmAndStart}
                  disabled={rows.length === 0}
                  style={{
                    flex: 1, padding: '11px 0', borderRadius: 9,
                    background: 'var(--gold2)', color: 'var(--on-gold)', border: 'none',
                    cursor: 'pointer', opacity: rows.length === 0 ? 0.5 : 1,
                    fontFamily: "'Public Sans', sans-serif", fontWeight: 700, fontSize: 13.5,
                  }}
                >
                  Confirm — Start the Guide
                </button>
                <button
                  onClick={() => { setScope(null); setRows([]); setStep('upload'); }}
                  style={{
                    padding: '11px 18px', borderRadius: 9,
                    background: 'var(--card)', color: 'var(--text2)',
                    border: '1px solid var(--brd)', cursor: 'pointer',
                    fontFamily: "'Public Sans', sans-serif", fontWeight: 600, fontSize: 13,
                  }}
                >
                  Rescan
                </button>
              </div>
            </>
          )}

          {/* ── Step 3: guided steps (Every Estimate) ── */}
          {step === 'guide' && current && (
            <div key={guideIdx} style={{ animation: 'hepFadeUp .35s ease', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Progress bar */}
              <div style={{ display: 'flex', gap: 4 }}>
                {guideSteps.map((_, i) => (
                  <div key={i} style={{
                    flex: 1, height: 3, borderRadius: 2,
                    background: i <= guideIdx ? 'var(--gold2)' : 'var(--brd)',
                    transition: 'background .3s',
                  }} />
                ))}
              </div>

              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'var(--text3)', letterSpacing: 1.5, textTransform: 'uppercase' }}>
                Every Estimate — add these on every hail claim
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 20, color: 'var(--gold)' }}>
                  {current.name}
                </div>
                <button
                  onClick={() => setShowHowTo(v => !v)}
                  title="How to enter this in CCC ONE"
                  style={{
                    width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                    border: `1px solid ${showHowTo ? 'var(--gold2)' : 'var(--brd-2)'}`,
                    background: showHowTo ? 'var(--gold-soft)' : 'var(--card)',
                    color: showHowTo ? 'var(--gold)' : 'var(--text3)',
                    cursor: 'pointer', fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: 11.5, fontWeight: 700, lineHeight: 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all .15s',
                  }}
                >
                  i
                </button>
              </div>

              {showHowTo && (
                <div style={{
                  padding: '11px 14px', borderRadius: 9,
                  background: 'var(--gold-soft)', border: '1px solid var(--gold-brd)',
                  fontSize: 12, lineHeight: 1.6, color: 'var(--text2)', fontFamily: "'Public Sans', sans-serif",
                }}>
                  <strong style={{ color: 'var(--gold)' }}>How to add this in CCC ONE: </strong>
                  {current.howTo || 'No CCC ONE tip added yet for this line item.'}
                </div>
              )}

              {current.notes.map(note => (
                <div key={note.id} style={{
                  padding: '14px 16px', borderRadius: 10,
                  background: 'var(--note-bg)', border: '1px solid var(--brd)',
                }}>
                  <p style={{
                    margin: 0, fontSize: 12.5, lineHeight: 1.7,
                    color: 'var(--note-text)',
                    fontFamily: "'IBM Plex Mono', ui-monospace, Menlo, monospace",
                    whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                  }}>
                    {note.text}
                  </p>
                  <CopyButton text={note.text} label="Copy note for CCC ONE" />
                </div>
              ))}

              <div style={{ fontSize: 12.5, color: 'var(--text3)', fontFamily: "'Public Sans', sans-serif" }}>
                {current.notes.length > 0
                  ? <>Add this line item in CCC ONE (paste the note above — tap the <strong>i</strong> for exactly where), then click Next.</>
                  : <>Add this line item in CCC ONE (tap the <strong>i</strong> for exactly where), then click Next.</>}
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => { setGuideIdx(i => Math.max(0, i - 1)); setShowHowTo(false); }}
                  disabled={guideIdx === 0}
                  style={{
                    padding: '11px 18px', borderRadius: 9,
                    background: 'var(--card)', color: 'var(--text2)',
                    border: '1px solid var(--brd)', cursor: 'pointer',
                    opacity: guideIdx === 0 ? 0.4 : 1,
                    fontFamily: "'Public Sans', sans-serif", fontWeight: 600, fontSize: 13,
                  }}
                >
                  ← Back
                </button>
                <button
                  onClick={() => {
                    if (guideIdx < guideSteps.length - 1) setGuideIdx(i => i + 1);
                    else setStep('done');
                    setShowHowTo(false);
                  }}
                  style={{
                    flex: 1, padding: '11px 0', borderRadius: 9,
                    background: 'var(--gold2)', color: 'var(--on-gold)', border: 'none',
                    cursor: 'pointer',
                    fontFamily: "'Public Sans', sans-serif", fontWeight: 700, fontSize: 13.5,
                  }}
                >
                  {guideIdx < guideSteps.length - 1 ? 'Next →' : 'Finish Every Estimate ✓'}
                </button>
              </div>
            </div>
          )}

          {/* ── Done (part 1) ── */}
          {step === 'done' && (
            <div style={{ animation: 'hepFadeUp .35s ease', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, padding: '20px 0', textAlign: 'center' }}>
              <div style={{ fontSize: 40 }}>✅</div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 19, color: 'var(--gold)' }}>
                Every Estimate complete!
              </div>
              <div style={{ fontSize: 13, color: 'var(--text2)', fontFamily: "'Public Sans', sans-serif", lineHeight: 1.7, maxWidth: 380 }}>
                All the mandatory line items are in. The damaged panels from the scan are already selected on the diagram — panel-by-panel guidance is coming in the next version.
              </div>
              <button
                onClick={onClose}
                style={{
                  padding: '11px 28px', borderRadius: 9,
                  background: 'var(--gold2)', color: 'var(--on-gold)', border: 'none',
                  cursor: 'pointer', fontFamily: "'Public Sans', sans-serif", fontWeight: 700, fontSize: 13.5,
                }}
              >
                Close — continue on the diagram
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Hail History Modal ───────────────────────────────────────────────────────

interface HailReport {
  time: string; sizeIn: number; location: string;
  county: string; state: string; distanceMi: number;
}

// ─── PDF → JPG Converter Modal ────────────────────────────────────────────────
// Fully client-side via pdfjs-dist — the file never leaves the browser.

interface ConvertedPage {
  pageNum: number;
  url: string;
  width: number;
  height: number;
  sizeKB: number;
}

function PdfToJpgModal({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');
  const [quality, setQuality] = useState<'standard' | 'high'>('high');
  const [pages, setPages] = useState<ConvertedPage[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    pages.forEach(p => URL.revokeObjectURL(p.url));
    setPages([]); setError(''); setFileName(''); setProgress({ done: 0, total: 0 });
  };

  const handleFile = async (file: File) => {
    reset();
    if (file.type !== 'application/pdf') { setError('Please choose a PDF file.'); return; }
    setLoading(true);
    setFileName(file.name.replace(/\.pdf$/i, ''));
    try {
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      setProgress({ done: 0, total: pdf.numPages });

      const scale = quality === 'high' ? 3 : 1.8;
      const jpegQuality = quality === 'high' ? 0.95 : 0.88;
      const results: ConvertedPage[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        const ctx = canvas.getContext('2d');
        if (!ctx) continue;
        // Flatten transparency onto white — JPEG has no alpha channel
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // pdfjs-dist v5+ requires canvas:null when rendering via canvasContext
        // directly — passing a canvas that already has a 2D context obtained
        // makes pdfjs try to transferControlToOffscreen() it internally, which
        // throws (context already exists) and hangs the render promise forever
        // instead of rejecting. Timeout guard below is a second safety net.
        const renderPromise = page.render({ canvas: null, canvasContext: ctx, viewport }).promise;
        await Promise.race([
          renderPromise,
          new Promise((_, reject) => setTimeout(() => reject(new Error(`Timed out rendering page ${i}`)), 20000)),
        ]);

        const blob: Blob | null = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', jpegQuality));
        if (blob) {
          results.push({
            pageNum: i,
            url: URL.createObjectURL(blob),
            width: canvas.width,
            height: canvas.height,
            sizeKB: Math.round(blob.size / 1024),
          });
        }
        setProgress({ done: i, total: pdf.numPages });
      }

      setPages(results);
    } catch (e) {
      setError(e instanceof Error ? `Could not convert this PDF — ${e.message}` : 'Could not convert this PDF.');
    } finally {
      setLoading(false);
    }
  };

  const downloadPage = (p: ConvertedPage) => {
    const a = document.createElement('a');
    a.href = p.url;
    a.download = pages.length > 1 ? `${fileName}-page-${p.pageNum}.jpg` : `${fileName}.jpg`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const downloadAll = async () => {
    for (const p of pages) {
      downloadPage(p);
      await new Promise(r => setTimeout(r, 300)); // let each download start before the next
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        background: 'rgba(0,0,0,.55)',
        backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 620, maxHeight: '90vh', overflowY: 'auto',
          background: 'var(--panel-bg)', borderRadius: 16,
          border: '1px solid var(--brd-2)', boxShadow: '0 24px 80px rgba(0,0,0,.6)',
        }}
      >
        {/* Modal header */}
        <div style={{
          padding: '18px 24px', borderBottom: '1px solid var(--brd)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 17, color: 'var(--gold)' }}>
              PDF → JPG
            </div>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'var(--text3)', letterSpacing: 1.5, marginTop: 2 }}>
              CONVERTS IN YOUR BROWSER · FILE NEVER UPLOADED
            </div>
          </div>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: 8, border: '1px solid var(--brd)',
            background: 'var(--input-bg)', color: 'var(--text2)', cursor: 'pointer',
            fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>×</button>
        </div>

        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {pages.length === 0 && (
            <>
              {/* Quality toggle */}
              <div>
                <div style={{ fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: 'var(--text3)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 }}>
                  Quality
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {(['high', 'standard'] as const).map(q => (
                    <button key={q} onClick={() => setQuality(q)} style={{
                      padding: '6px 16px', borderRadius: 7, fontSize: 12, fontWeight: 600,
                      fontFamily: "'Public Sans', sans-serif", cursor: 'pointer', transition: 'all .15s',
                      background: quality === q ? 'var(--gold2)' : 'var(--card)',
                      color: quality === q ? 'var(--on-gold)' : 'var(--text2)',
                      border: quality === q ? '1px solid var(--gold2)' : '1px solid var(--brd)',
                    }}>
                      {q === 'standard' ? 'Standard' : 'High Quality'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Upload area */}
              <button
                onClick={() => fileRef.current?.click()}
                disabled={loading}
                style={{
                  border: '2px dashed var(--brd-2)', borderRadius: 12,
                  background: 'var(--card)', color: 'var(--text2)',
                  padding: '36px 20px', cursor: loading ? 'wait' : 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                  fontFamily: "'Public Sans', sans-serif", transition: 'all .15s',
                }}
              >
                {loading ? (
                  <>
                    <div style={{ fontSize: 26 }}>⏳</div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>
                      Converting page {progress.done} of {progress.total}…
                    </div>
                    <div style={{ width: '100%', maxWidth: 240, height: 4, background: 'var(--brd)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{
                        width: progress.total ? `${(progress.done / progress.total) * 100}%` : '0%',
                        height: '100%', background: 'var(--gold2)', transition: 'width .2s',
                      }} />
                    </div>
                  </>
                ) : (
                  <>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                    </svg>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>Upload a PDF to convert</div>
                    <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: 'var(--text3)' }}>
                      Each page becomes its own JPG — nothing leaves your device
                    </div>
                  </>
                )}
              </button>
              <input
                ref={fileRef} type="file" accept="application/pdf,.pdf" style={{ display: 'none' }}
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }}
              />
            </>
          )}

          {error && (
            <div style={{
              padding: '12px 16px', borderRadius: 9, fontSize: 13,
              background: 'rgba(239,68,68,.12)', border: '1px solid rgba(239,68,68,.28)',
              color: '#ef4444', fontFamily: "'Public Sans', sans-serif",
            }}>
              {error}
            </div>
          )}

          {/* Results */}
          {pages.length > 0 && (
            <>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 16px', borderRadius: 10,
                background: 'rgba(34,197,94,.12)', border: '1px solid rgba(34,197,94,.28)',
              }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#22c55e', fontFamily: "'Public Sans', sans-serif" }}>
                  ✓ Converted {pages.length} page{pages.length !== 1 ? 's' : ''}
                </div>
                {pages.length > 1 && (
                  <button
                    onClick={downloadAll}
                    style={{
                      padding: '7px 14px', borderRadius: 8,
                      background: 'var(--gold2)', color: 'var(--on-gold)', border: 'none',
                      cursor: 'pointer', fontFamily: "'Public Sans', sans-serif", fontWeight: 700, fontSize: 12,
                    }}
                  >
                    Download All
                  </button>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
                {pages.map(p => (
                  <div key={p.pageNum} style={{
                    border: '1px solid var(--brd)', borderRadius: 10, overflow: 'hidden',
                    background: 'var(--card)', display: 'flex', flexDirection: 'column',
                  }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.url} alt={`Page ${p.pageNum}`} style={{ width: '100%', display: 'block', borderBottom: '1px solid var(--brd)' }} />
                    <div style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'var(--text3)' }}>
                        Page {p.pageNum} · {p.sizeKB} KB
                      </div>
                      <button
                        onClick={() => downloadPage(p)}
                        style={{
                          padding: '6px 0', borderRadius: 7, fontSize: 11.5, fontWeight: 700,
                          background: 'var(--card)', color: 'var(--gold)',
                          border: '1px solid var(--gold-brd)', cursor: 'pointer',
                          fontFamily: "'Public Sans', sans-serif",
                        }}
                      >
                        Download JPG
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={reset}
                style={{
                  padding: '10px 0', borderRadius: 9,
                  background: 'var(--card)', color: 'var(--text2)',
                  border: '1px solid var(--brd)', cursor: 'pointer',
                  fontFamily: "'Public Sans', sans-serif", fontWeight: 600, fontSize: 13,
                }}
              >
                Convert another PDF
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function HailModal({ onClose }: { onClose: () => void }) {
  const [mode, setMode] = useState<'date' | 'year' | 'live'>('date');
  const [zip, setZip] = useState('');
  const [date, setDate] = useState('');
  const [yearInput, setYearInput] = useState(String(new Date().getFullYear()));
  const [statesInput, setStatesInput] = useState('TX, MN');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ zipName: string; radiusMi?: number; reports: HailReport[]; note?: string } | null>(null);
  const [yearResult, setYearResult] = useState<{ zipName: string; year: number; radiusMi: number; days: HailDay[] } | null>(null);
  const [liveResult, setLiveResult] = useState<{ states: string[]; alerts: LiveAlert[]; checkedAt: string } | null>(null);

  const canSearch = mode === 'live'
    ? statesInput.trim().length >= 2
    : zip.length === 5 && (mode === 'date' ? !!date : yearInput.length === 4);

  const search = async () => {
    setError(''); setResult(null); setYearResult(null); setLiveResult(null); setLoading(true);
    try {
      const body = mode === 'date'
        ? { zip: zip.trim(), date }
        : mode === 'year'
          ? { zip: zip.trim(), year: yearInput }
          : { live: true, states: statesInput };
      const res = await fetch('/api/hail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Search failed');
      if (mode === 'date') setResult(data);
      else if (mode === 'year') setYearResult(data);
      else setLiveResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const inputSt: React.CSSProperties = {
    width: '100%', padding: '10px 14px', fontSize: 14,
    fontFamily: "'Public Sans', sans-serif",
    background: 'var(--input-bg)', border: '1px solid var(--brd-2)',
    borderRadius: 8, color: 'var(--text)', outline: 'none',
  };

  const largest = result && result.reports.length > 0
    ? result.reports.reduce((a, b) => (b.sizeIn > a.sizeIn ? b : a))
    : null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        background: 'rgba(0,0,0,.55)',
        backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto',
          background: 'var(--panel-bg)', borderRadius: 16,
          border: '1px solid var(--brd-2)', boxShadow: '0 24px 80px rgba(0,0,0,.6)',
        }}
      >
        {/* Modal header */}
        <div style={{
          padding: '18px 24px', borderBottom: '1px solid var(--brd)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 17, color: 'var(--gold)' }}>
              Hail History
            </div>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'var(--text3)', letterSpacing: 1.5, marginTop: 2 }}>
              NOAA STORM REPORTS · DATE OF LOSS VERIFICATION
            </div>
          </div>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: 8, border: '1px solid var(--brd)',
            background: 'var(--input-bg)', color: 'var(--text2)', cursor: 'pointer',
            fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>×</button>
        </div>

        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Mode toggle */}
          <div style={{ display: 'flex', gap: 6 }}>
            {([['date', 'Specific Date'], ['year', 'Whole Year'], ['live', 'Live Storms']] as const).map(([m, label]) => (
              <button key={m} onClick={() => { setMode(m); setError(''); }} style={{
                padding: '6px 16px', borderRadius: 7, fontSize: 12, fontWeight: 600,
                fontFamily: "'Public Sans', sans-serif", cursor: 'pointer', transition: 'all .15s',
                background: mode === m ? 'var(--gold2)' : 'var(--card)',
                color: mode === m ? 'var(--on-gold)' : 'var(--text2)',
                border: mode === m ? '1px solid var(--gold2)' : '1px solid var(--brd)',
              }}>
                {label}
              </button>
            ))}
          </div>

          {/* Inputs */}
          {mode === 'live' ? (
            <div>
              <label style={{ display: 'block', fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: 'var(--text3)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6 }}>
                States to watch
              </label>
              <input
                style={inputSt} placeholder="TX, MN" value={statesInput}
                onChange={e => setStatesInput(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && search()}
              />
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: 'var(--text3)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6 }}>
                  ZIP Code
                </label>
                <input
                  style={inputSt} placeholder="75201" value={zip}
                  onChange={e => setZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
                  inputMode="numeric"
                  onKeyDown={e => e.key === 'Enter' && search()}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: 'var(--text3)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6 }}>
                  {mode === 'date' ? 'Date of Loss' : 'Year'}
                </label>
                {mode === 'date' ? (
                  <input
                    style={{ ...inputSt, colorScheme: 'dark' }} type="date" value={date}
                    onChange={e => setDate(e.target.value)}
                  />
                ) : (
                  <input
                    style={inputSt} placeholder="2026" value={yearInput} inputMode="numeric"
                    onChange={e => setYearInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    onKeyDown={e => e.key === 'Enter' && search()}
                  />
                )}
              </div>
            </div>
          )}

          <button
            onClick={search}
            disabled={loading || !canSearch}
            style={{
              width: '100%', padding: '11px 0', borderRadius: 9,
              background: 'var(--gold2)', color: 'var(--on-gold)', border: 'none',
              cursor: loading ? 'wait' : 'pointer',
              opacity: canSearch ? 1 : 0.5,
              fontFamily: "'Public Sans', sans-serif", fontWeight: 700, fontSize: 13.5,
            }}
          >
            {loading
              ? (mode === 'year' ? 'Searching full year — takes a few seconds…' : mode === 'live' ? 'Checking active warnings…' : 'Searching NOAA reports…')
              : (mode === 'year' ? 'List Hail Days for the Year' : mode === 'live' ? 'Check Active Storm Warnings' : 'Verify Hail Activity')}
          </button>

          {error && (
            <div style={{
              padding: '12px 16px', borderRadius: 9, fontSize: 13,
              background: 'rgba(239,68,68,.12)', border: '1px solid rgba(239,68,68,.28)',
              color: '#ef4444', fontFamily: "'Public Sans', sans-serif",
            }}>
              {error}
            </div>
          )}

          {/* Results */}
          {result && (
            result.reports.length > 0 ? (
              <>
                <div style={{
                  padding: '13px 16px', borderRadius: 10,
                  background: 'rgba(34,197,94,.12)', border: '1px solid rgba(34,197,94,.28)',
                }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#22c55e', fontFamily: "'Public Sans', sans-serif" }}>
                    ✓ Hail confirmed near {result.zipName}
                  </div>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: 'var(--text2)', marginTop: 4 }}>
                    {result.reports.length} report{result.reports.length !== 1 ? 's' : ''} within {result.radiusMi} mi
                    {largest ? ` · largest ${largest.sizeIn.toFixed(2)}" (${largest.location}, ${largest.distanceMi} mi away)` : ''}
                  </div>
                </div>

                <div style={{ border: '1px solid var(--brd)', borderRadius: 10, overflow: 'hidden' }}>
                  <div style={{
                    display: 'grid', gridTemplateColumns: '70px 1fr 70px 70px',
                    padding: '8px 14px', background: 'var(--card)',
                    fontFamily: "'IBM Plex Mono', monospace", fontSize: 9.5,
                    color: 'var(--text3)', letterSpacing: 1, textTransform: 'uppercase',
                    borderBottom: '1px solid var(--brd)',
                  }}>
                    <span>Size</span><span>Location</span><span>Dist</span><span>UTC</span>
                  </div>
                  {result.reports.map((r, i) => (
                    <div key={i} style={{
                      display: 'grid', gridTemplateColumns: '70px 1fr 70px 70px',
                      padding: '9px 14px', fontSize: 12.5, alignItems: 'center',
                      fontFamily: "'Public Sans', sans-serif", color: 'var(--text)',
                      borderBottom: i < result.reports.length - 1 ? '1px solid var(--brd)' : 'none',
                    }}>
                      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, color: r.sizeIn >= 1 ? 'var(--gold)' : 'var(--text2)' }}>
                        {r.sizeIn.toFixed(2)}&quot;
                      </span>
                      <span>{r.location} <span style={{ color: 'var(--text3)', fontSize: 11 }}>· {r.county} Co, {r.state}</span></span>
                      <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: 'var(--text2)' }}>{r.distanceMi} mi</span>
                      <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: 'var(--text3)' }}>{r.time}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{
                padding: '13px 16px', borderRadius: 10, fontSize: 13,
                background: 'rgba(245,158,11,.12)', border: '1px solid rgba(245,158,11,.28)',
                color: '#f59e0b', fontFamily: "'Public Sans', sans-serif",
              }}>
                No hail reports found near {result.zipName} on this date.
                {result.note ? ` ${result.note}` : ' Reports cover officially observed hail — smaller local events may not appear.'}
              </div>
            )
          )}

          {/* Year results */}
          {yearResult && (
            yearResult.days.length > 0 ? (
              <>
                <div style={{
                  padding: '13px 16px', borderRadius: 10,
                  background: 'rgba(34,197,94,.12)', border: '1px solid rgba(34,197,94,.28)',
                }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#22c55e', fontFamily: "'Public Sans', sans-serif" }}>
                    {yearResult.days.length} hail day{yearResult.days.length !== 1 ? 's' : ''} near {yearResult.zipName} in {yearResult.year}
                  </div>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: 'var(--text2)', marginTop: 4 }}>
                    NWS ground-observed hail reports within {yearResult.radiusMi} mi
                  </div>
                </div>

                <div style={{ border: '1px solid var(--brd)', borderRadius: 10, overflow: 'hidden' }}>
                  <div style={{
                    display: 'grid', gridTemplateColumns: '1fr 90px 90px 90px',
                    padding: '8px 14px', background: 'var(--card)',
                    fontFamily: "'IBM Plex Mono', monospace", fontSize: 9.5,
                    color: 'var(--text3)', letterSpacing: 1, textTransform: 'uppercase',
                    borderBottom: '1px solid var(--brd)',
                  }}>
                    <span>Date</span><span>Max Size</span><span>Reports</span><span>Closest</span>
                  </div>
                  {yearResult.days.map((d, i) => (
                    <div key={d.date} style={{
                      display: 'grid', gridTemplateColumns: '1fr 90px 90px 90px',
                      padding: '9px 14px', fontSize: 12.5, alignItems: 'center',
                      fontFamily: "'Public Sans', sans-serif", color: 'var(--text)',
                      borderBottom: i < yearResult.days.length - 1 ? '1px solid var(--brd)' : 'none',
                    }}>
                      <span>
                        <span style={{ fontWeight: 600 }}>
                          {new Date(d.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        {d.maxCity && <span style={{ color: 'var(--text3)', fontSize: 11 }}> · {d.maxCity}</span>}
                      </span>
                      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, color: d.maxSize >= 1 ? 'var(--gold)' : 'var(--text2)' }}>
                        {d.maxSize > 0 ? `${d.maxSize.toFixed(2)}"` : '—'}
                      </span>
                      <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: 'var(--text2)' }}>{d.count}</span>
                      <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: 'var(--text3)' }}>{d.minDist} mi</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{
                padding: '13px 16px', borderRadius: 10, fontSize: 13,
                background: 'rgba(245,158,11,.12)', border: '1px solid rgba(245,158,11,.28)',
                color: '#f59e0b', fontFamily: "'Public Sans', sans-serif",
              }}>
                No hail reports found near {yearResult.zipName} in {yearResult.year}.
              </div>
            )
          )}

          {/* Live results */}
          {liveResult && (
            liveResult.alerts.length > 0 ? (
              <>
                <div style={{
                  padding: '13px 16px', borderRadius: 10,
                  background: 'rgba(239,68,68,.12)', border: '1px solid rgba(239,68,68,.28)',
                }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#ef4444', fontFamily: "'Public Sans', sans-serif" }}>
                    ⚡ {liveResult.alerts.length} active warning{liveResult.alerts.length !== 1 ? 's' : ''} in {liveResult.states.join(', ')}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {liveResult.alerts.map((a, i) => (
                    <div key={i} style={{
                      padding: '12px 14px', borderRadius: 10,
                      background: 'var(--card)', border: `1px solid ${a.hailSize >= 1 ? 'var(--gold-brd)' : 'var(--brd)'}`,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontWeight: 700, fontSize: 13, color: a.event === 'Tornado Warning' ? '#ef4444' : 'var(--text)', fontFamily: "'Public Sans', sans-serif" }}>
                          {a.event}
                        </span>
                        {a.hailSize > 0 && (
                          <span style={{
                            fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 600,
                            color: 'var(--gold)', background: 'var(--gold-soft)',
                            border: '1px solid var(--gold-brd)', borderRadius: 5, padding: '1px 7px',
                          }}>
                            {a.hailSize.toFixed(2)}&quot; hail
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 12.5, color: 'var(--text2)', fontFamily: "'Public Sans', sans-serif", lineHeight: 1.5 }}>
                        {a.areaDesc}
                      </div>
                      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'var(--text3)', marginTop: 4 }}>
                        {a.office} · until {new Date(a.expires).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{
                padding: '13px 16px', borderRadius: 10, fontSize: 13,
                background: 'rgba(34,197,94,.12)', border: '1px solid rgba(34,197,94,.28)',
                color: '#22c55e', fontFamily: "'Public Sans', sans-serif",
              }}>
                ✓ No active severe thunderstorm or tornado warnings in {liveResult.states.join(', ')} right now.
              </div>
            )
          )}

          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'var(--text3)', lineHeight: 1.6 }}>
            {mode === 'date'
              ? 'Source: NOAA Storm Prediction Center daily storm reports. Times are UTC.'
              : mode === 'year'
                ? 'Source: NWS Local Storm Reports archive (Iowa Environmental Mesonet). Ground-observed hail.'
                : 'Source: National Weather Service active alerts. Hail size is the storm’s forecast maximum.'}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Estimate checklist builder ───────────────────────────────────────────────

function buildChecklist(
  scanScope: ScopeResult,
  panelIds: string[],
  counts: ScanCounts,
  vt: VehicleType | null,
): string {
  const v = scanScope.vehicle;
  const lines: string[] = [];

  const title = [v.year, v.make, v.model].filter(Boolean).join(' ') || 'Vehicle';
  lines.push(`ESTIMATE CHECKLIST — ${title}${v.color ? ` · ${v.color}` : ''}`);
  const meta = [
    v.vin ? `VIN ${v.vin}` : '',
    v.claim ? `Claim ${v.claim}` : '',
    v.carrier || '',
    vt === 'truck' ? 'Pickup Truck' : vt === 'suv' ? 'SUV' : vt === 'sedan' ? 'Sedan' : '',
  ].filter(Boolean).join(' · ');
  if (meta) lines.push(meta);
  lines.push('');

  // Every Estimate items
  const nn = PANELS.find(p => p.id === 'non-negotiables');
  if (nn) {
    lines.push('EVERY ESTIMATE');
    for (const op of nn.operations) lines.push(`[ ] ${op.name}`);
    lines.push('');
  }

  // Per damaged panel
  for (const id of panelIds) {
    const panel = PANELS.find(p => p.id === id);
    if (!panel || panel.id === 'non-negotiables') continue;
    // RT panels have no ops of their own — borrow the LT mirror's operations
    let ops = panel.operations;
    if (ops.length === 0 && id.startsWith('rt-')) {
      ops = PANELS.find(q => q.id === id.replace(/^rt-/, 'lt-'))?.operations ?? [];
    }
    const c = counts[id];
    const repairType = c?.repairType || 'pdr';
    const countStr = c?.dentCountText || (c?.dentCount != null ? String(c.dentCount) : '');
    const dents = countStr
      ? ` — ${countStr}${c?.dentSize ? `-${c.dentSize}` : ''}${c?.oversize ? ` + ${c.oversize} O/S` : ''}`
      : (c?.oversize ? ` — ${c.oversize} O/S` : '');
    lines.push(`${panel.label.toUpperCase()}${dents}`);

    if (repairType === 'rr') {
      lines.push(`[ ] R&R ${panel.label} (full panel replacement)`);
      for (const op of ops.filter(o => o.types.includes('rr'))) lines.push(`[ ] ${op.name}`);
    } else if (repairType === 'repair') {
      lines.push(`[ ] Repair ${panel.label}${c?.paintHours ? ` — ${c.paintHours}h paint` : ''}`);
      for (const op of ops.filter(o => o.types.includes('repair'))) lines.push(`[ ] ${op.name}`);
    } else {
      const pdrLabel = panel.tabLabelOverrides?.pdr ?? 'PDR';
      lines.push(`[ ] ${pdrLabel} ${panel.label}`);
      for (const op of ops.filter(o => o.types.includes('pdr'))) lines.push(`[ ] ${op.name}`);
    }

    if (c?.replacements && c.replacements.length > 0) {
      for (const part of c.replacements) lines.push(`[ ] R&R ${part}`);
    }
    lines.push('');
  }

  return lines.join('\n').trim();
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function Home() {
  const [vehicleType, setVehicleType] = useState<VehicleType | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [narrow, setNarrow] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showValueModal, setShowValueModal] = useState(false);
  const [showScopeModal, setShowScopeModal] = useState(false);
  const [showHailModal, setShowHailModal] = useState(false);
  const [showAssistModal, setShowAssistModal] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [scanCounts, setScanCounts] = useState<ScanCounts>({});
  const [lastScan, setLastScan] = useState<ScopeResult | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const hits = doSearch(query);
  const selectedPanels = selectedIds
    .map(id => PANELS.find(p => p.id === id))
    .filter((p): p is CarPanel => !!p);

  const labelWithDents = (p: CarPanel) => {
    const c = scanCounts[p.id];
    if (!c) return p.label;
    const repl = c.replacements && c.replacements.length > 0 ? ` ⚠ Replace: ${c.replacements.join(', ')}` : '';
    const countStr = c.dentCountText || (c.dentCount != null ? String(c.dentCount) : '');
    const os = c.oversize ? `${countStr ? ' + ' : ''}${c.oversize} O/S` : '';
    if (!countStr && !os) return `${p.label}${repl}`;
    return `${p.label} · ${countStr}${countStr && c.dentSize ? `-${c.dentSize}` : ''}${os}${repl}`;
  };
  const allNotesText = selectedPanels
    .flatMap(p => p.operations.flatMap(op => op.notes.map(n => n.text)))
    .join('\n\n');

  const vehLabel = vehicleType === 'sedan' ? 'Sedan' : vehicleType === 'suv' ? 'SUV' : vehicleType === 'truck' ? 'Pickup Truck' : '';

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
      if (e.key === 'Escape') { setShowValueModal(false); setShowScopeModal(false); setShowHailModal(false); setShowAssistModal(false); setShowPdfModal(false); }
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
    setScanCounts({});
    setLastScan(null);
  };

  const clearVehicle = () => {
    setVehicleType(null);
    setSelectedIds([]);
    setScanCounts({});
    setLastScan(null);
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
          @keyframes hepFadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
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

          {/* Estimate Assistant (guided) button */}
          <button
            onClick={() => setShowAssistModal(true)}
            style={{
              marginLeft: 'auto', flexShrink: 0,
              fontFamily: "'IBM Plex Mono', monospace", fontSize: 11,
              color: 'var(--on-gold)', background: 'var(--gold2)', letterSpacing: 0.5,
              padding: '6px 12px', border: '1px solid var(--gold2)', borderRadius: 8,
              cursor: 'pointer', transition: 'all .15s', whiteSpace: 'nowrap', fontWeight: 600,
            }}
          >
            Estimate Assistant
          </button>

          {/* Scope Sheet button */}
          <button
            onClick={() => setShowScopeModal(true)}
            style={{
              flexShrink: 0,
              fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: 'var(--text2)',
              background: 'none', letterSpacing: 0.5,
              padding: '6px 12px', border: '1px solid var(--brd)', borderRadius: 8,
              cursor: 'pointer', transition: 'all .15s', whiteSpace: 'nowrap',
            }}
          >
            Scan Scope Sheet
          </button>

          {/* Hail History button */}
          <button
            onClick={() => setShowHailModal(true)}
            style={{
              flexShrink: 0,
              fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: 'var(--text2)',
              background: 'none', letterSpacing: 0.5,
              padding: '6px 12px', border: '1px solid var(--brd)', borderRadius: 8,
              cursor: 'pointer', transition: 'all .15s', whiteSpace: 'nowrap',
            }}
          >
            Hail History
          </button>

          {/* PDF to JPG button */}
          <button
            onClick={() => setShowPdfModal(true)}
            style={{
              flexShrink: 0,
              fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: 'var(--text2)',
              background: 'none', letterSpacing: 0.5,
              padding: '6px 12px', border: '1px solid var(--brd)', borderRadius: 8,
              cursor: 'pointer', transition: 'all .15s', whiteSpace: 'nowrap',
            }}
          >
            PDF → JPG
          </button>

          {/* Vehicle Value button */}
          <button
            onClick={() => setShowValueModal(true)}
            style={{
              flexShrink: 0,
              fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: 'var(--text2)',
              background: 'none', letterSpacing: 0.5,
              padding: '6px 12px', border: '1px solid var(--brd)', borderRadius: 8,
              cursor: 'pointer', transition: 'all .15s', whiteSpace: 'nowrap',
            }}
          >
            Vehicle Value
          </button>

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

        {/* ── Sub-bar: Other Panels chips ── */}
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
          {PANELS.filter(p => !p.onDiagram && !p.onTruckDiagram && p.id !== 'non-negotiables').map(p => {
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
              {/* Vehicle type question */}
              <div style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 9.5, color: 'var(--text3)',
                textTransform: 'uppercase', letterSpacing: '1.5px',
                textAlign: 'center', marginBottom: 8,
              }}>What kind of vehicle?</div>
              <div style={{ display: 'flex', gap: 5, marginBottom: 14 }}>
                {([['sedan', 'Sedan'], ['suv', 'SUV'], ['truck', 'Truck']] as const).map(([vt, label]) => (
                  <button
                    key={vt}
                    onClick={() => switchVehicle(vt)}
                    style={{
                      flex: 1, padding: '7px 4px',
                      borderRadius: 8, fontSize: 11.5, cursor: 'pointer',
                      background: vehicleType === vt ? 'var(--gold2)' : 'var(--card)',
                      color: vehicleType === vt ? 'var(--on-gold)' : 'var(--text2)',
                      border: `1px solid ${vehicleType === vt ? 'var(--gold2)' : 'var(--brd)'}`,
                      fontWeight: vehicleType === vt ? 700 : 600,
                      fontFamily: 'inherit', transition: 'all 0.15s',
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Every Estimate */}
              {(() => {
                const nn = PANELS.find(p => p.id === 'non-negotiables');
                if (!nn) return null;
                const sel = selectedIds.includes(nn.id);
                return (
                  <button
                    onClick={() => handleSelect(nn.id)}
                    style={{
                      width: '100%', padding: '9px 12px', marginBottom: 16,
                      borderRadius: 9, fontSize: 13, cursor: 'pointer',
                      background: sel ? 'var(--panel-selected)' : 'var(--card)',
                      color: sel ? 'var(--panel-sel-text)' : 'var(--text)',
                      border: `1px solid ${sel ? 'var(--gold2)' : 'var(--brd)'}`,
                      fontWeight: 700, fontFamily: 'inherit', transition: 'all 0.15s',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
                    }}
                  >
                    <span>⭐ Every Estimate</span>
                    {nn.operations.length > 0 && (
                      <span style={{
                        background: sel ? 'var(--gold)' : 'var(--badge-bg)',
                        color: sel ? '#000' : '#fff',
                        borderRadius: 10, fontSize: 10.5,
                        padding: '1px 7px', lineHeight: '16px', fontWeight: 700,
                      }}>
                        {nn.operations.length}
                      </span>
                    )}
                  </button>
                );
              })()}

              <div style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 9.5, color: 'var(--text3)',
                textTransform: 'uppercase', letterSpacing: '1.5px',
                textAlign: 'center', marginBottom: 12,
              }}>Click a panel</div>
              <CarDiagram selectedIds={selectedIds} onSelect={handleSelect} vehicleType={vehicleType ?? 'sedan'} />
            </div>
          </aside>

          {/* Right: operations + notes */}
          <main style={{ flex: 1, overflowY: 'auto', padding: '26px 30px', background: 'var(--bg)', minWidth: 0 }}>
            {selectedPanels.length === 0 ? (
              <EmptyState
                vehicleType={vehicleType}
                onPickVehicle={switchVehicle}
                onClearVehicle={clearVehicle}
                onEveryEstimate={() => handleSelect('non-negotiables')}
                everyEstimateCount={PANELS.find(p => p.id === 'non-negotiables')?.operations.length ?? 0}
                everyEstimateSelected={selectedIds.includes('non-negotiables')}
              />
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
                      {selectedPanels.map(p => labelWithDents(p)).join('  &  ')}
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
                    {lastScan && Object.keys(scanCounts).length > 0 && (
                      <CopyButton
                        text={buildChecklist(lastScan, selectedIds, scanCounts, vehicleType)}
                        label="Copy estimate checklist"
                      />
                    )}
                  </div>
                </div>

                {(() => {
                  // Build render sections: LT/RT mirror pairs share ops, so render one
                  // section per pair with a combined header instead of duplicating notes.
                  const selectedIdSet = new Set(selectedIds);
                  const sections: { panel: CarPanel; header: string }[] = [];
                  for (const p of selectedPanels) {
                    // Skip RT if its LT mirror is also selected — covered by the LT section
                    if (p.id.startsWith('rt-') && selectedIdSet.has(p.id.replace(/^rt-/, 'lt-'))) continue;

                    // RT panels have no ops of their own — borrow the LT mirror's operations
                    let panel = p;
                    if (panel.operations.length === 0 && panel.id.startsWith('rt-')) {
                      const mirror = PANELS.find(q => q.id === panel.id.replace(/^rt-/, 'lt-'));
                      if (mirror && mirror.operations.length > 0) panel = { ...panel, operations: mirror.operations };
                    }

                    // Combined header when both sides are selected
                    let header = labelWithDents(p);
                    if (p.id.startsWith('lt-')) {
                      const rtId = p.id.replace(/^lt-/, 'rt-');
                      if (selectedIdSet.has(rtId)) {
                        const rt = PANELS.find(q => q.id === rtId);
                        if (rt) header = `${labelWithDents(p)}  &  ${labelWithDents(rt)}`;
                      }
                    }
                    sections.push({ panel, header });
                  }
                  const withOps = sections.filter(s => s.panel.operations.length > 0);
                  const toRender = withOps.length > 0 ? withOps : sections.slice(0, 1);
                  return toRender.map((s, idx) => (
                    <div key={s.panel.id} style={{ marginBottom: idx < toRender.length - 1 ? 28 : 0 }}>
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
                          {s.header}
                        </div>
                      )}
                      <PanelOps key={s.panel.id} panel={s.panel} vehicleType={vehicleType} />
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
          <span>developed by Gabriel Diniz (gabrielcd35@gmail.com)</span>
        </footer>

        {/* ── Vehicle Value Modal ── */}
        {showValueModal && (
          <ValueModal
            onClose={() => setShowValueModal(false)}
            onVehicleDetected={vt => { switchVehicle(vt); }}
          />
        )}

        {/* ── PDF to JPG Modal ── */}
        {showPdfModal && <PdfToJpgModal onClose={() => setShowPdfModal(false)} />}

        {/* ── Scope Sheet Modal ── */}
        {/* ── Hail History Modal ── */}
        {showHailModal && <HailModal onClose={() => setShowHailModal(false)} />}

        {/* ── Estimate Assistant Modal ── */}
        {showAssistModal && (
          <EstimateAssistantModal
            onClose={() => setShowAssistModal(false)}
            onApply={(panelIds, vt, counts, scanScope) => {
              setVehicleType(vt);
              setSelectedIds(panelIds);
              setScanCounts(counts);
              setLastScan(scanScope);
            }}
          />
        )}

        {showScopeModal && (
          <ScopeModal
            onClose={() => setShowScopeModal(false)}
            onApply={(panelIds, vt, counts, scanScope) => {
              setVehicleType(vt);
              setSelectedIds(panelIds);
              setScanCounts(counts);
              setLastScan(scanScope);
            }}
          />
        )}
      </div>
    </>
  );
}
