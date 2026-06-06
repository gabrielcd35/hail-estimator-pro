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

// Sedan — viewBox "0 0 200 480"
const CAR_PATH =
  'M 68,8 C 50,8 22,28 18,58 L 16,155 L 16,310 L 20,400 C 26,432 54,455 100,455 C 146,455 174,432 180,400 L 184,310 L 184,155 L 182,58 C 178,28 150,8 132,8 Z';

// Truck — viewBox "0 0 200 480"
// Two separate silhouettes: cab (top) + bed (bottom, with gap)
const TRUCK_CAB_PATH =
  'M 65,8 C 48,8 20,22 18,52 L 16,148 L 16,275 L 184,275 L 184,148 L 182,52 C 180,22 152,8 135,8 Z';
const TRUCK_BED_PATH =
  'M 20,295 L 20,452 C 20,460 28,465 36,465 L 164,465 C 172,465 180,460 180,452 L 180,295 Z';

interface DiagramPanel {
  id: string;
  lbl: string;
  x: number; y: number; w: number; h: number;
  lx: number; ly: number; fs: number;
}

// ── Sedan panels ──────────────────────────────────────────────────────────────
const DIAGRAM_PANELS: DiagramPanel[] = [
  { id: 'front-bumper', lbl: 'Front Bumper', x: 0,   y: 0,   w: 200, h: 48,  lx: 100, ly: 28,  fs: 7   },
  { id: 'hood',         lbl: 'Hood',         x: 0,   y: 48,  w: 200, h: 107, lx: 100, ly: 104, fs: 11  },
  { id: 'left-doors',   lbl: 'L Doors',      x: 0,   y: 182, w: 62,  h: 126, lx: 31,  ly: 248, fs: 7.5 },
  { id: 'roof',         lbl: 'Roof',         x: 62,  y: 182, w: 76,  h: 126, lx: 100, ly: 248, fs: 10  },
  { id: 'right-doors',  lbl: 'R Doors',      x: 138, y: 182, w: 62,  h: 126, lx: 169, ly: 248, fs: 7.5 },
  { id: 'lt-quarter',   lbl: 'LT QP',        x: 0,   y: 332, w: 62,  h: 90,  lx: 31,  ly: 382, fs: 7.5 },
  { id: 'lift-gate',    lbl: 'Lift Gate',    x: 62,  y: 332, w: 76,  h: 90,  lx: 100, ly: 382, fs: 8   },
  { id: 'rt-quarter',   lbl: 'RT QP',        x: 138, y: 332, w: 62,  h: 90,  lx: 169, ly: 382, fs: 7.5 },
  { id: 'rear-bumper',  lbl: 'Rear Bumper',  x: 0,   y: 422, w: 200, h: 33,  lx: 100, ly: 441, fs: 7   },
];

// ── Truck panels (cab) ────────────────────────────────────────────────────────
const DIAGRAM_PANELS_TRUCK_CAB: DiagramPanel[] = [
  { id: 'front-bumper',  lbl: 'Front Bumper',  x: 0,   y: 0,   w: 200, h: 45,  lx: 100, ly: 27,  fs: 7   },
  { id: 'hood',          lbl: 'Hood',           x: 0,   y: 45,  w: 200, h: 103, lx: 100, ly: 98,  fs: 11  },
  { id: 'left-doors',    lbl: 'L Doors',        x: 0,   y: 168, w: 62,  h: 80,  lx: 31,  ly: 210, fs: 7.5 },
  { id: 'roof',          lbl: 'Roof',           x: 62,  y: 168, w: 76,  h: 80,  lx: 100, ly: 210, fs: 9   },
  { id: 'right-doors',   lbl: 'R Doors',        x: 138, y: 168, w: 62,  h: 80,  lx: 169, ly: 210, fs: 7.5 },
  { id: 'lt-cab-corner', lbl: 'LT Cab Corner',  x: 0,   y: 248, w: 62,  h: 27,  lx: 31,  ly: 264, fs: 5.5 },
  { id: 'rt-cab-corner', lbl: 'RT Cab Corner',  x: 138, y: 248, w: 62,  h: 27,  lx: 169, ly: 264, fs: 5.5 },
];

// ── Truck panels (bed) ────────────────────────────────────────────────────────
const DIAGRAM_PANELS_TRUCK_BED: DiagramPanel[] = [
  { id: 'lt-bed',   lbl: 'LT Bed',   x: 0,   y: 295, w: 72,  h: 140, lx: 36,  ly: 368, fs: 7.5 },
  { id: 'rt-bed',   lbl: 'RT Bed',   x: 128, y: 295, w: 72,  h: 140, lx: 164, ly: 368, fs: 7.5 },
  { id: 'tailgate', lbl: 'Tailgate', x: 0,   y: 435, w: 200, h: 30,  lx: 100, ly: 452, fs: 7   },
];

// ─── Car/Truck SVG diagram ────────────────────────────────────────────────────

type VehicleType = 'sedan' | 'truck';

function CarDiagram({ selected, onSelect, vehicleType }: {
  selected: string | null;
  onSelect: (id: string) => void;
  vehicleType: VehicleType;
}) {
  const [hovered, setHovered] = useState<string | null>(null);

  const fill = (id: string) => {
    if (selected === id) return '#7c3d00';
    if (hovered === id) return '#1e3048';
    return '#172032';
  };

  const opCount = (id: string) => PANELS.find(p => p.id === id)?.operations.length ?? 0;

  const PanelRect = ({ p }: { p: DiagramPanel }) => (
    <rect
      x={p.x} y={p.y} width={p.w} height={p.h}
      fill={fill(p.id)}
      stroke="#1a2535" strokeWidth="0.5"
      style={{ cursor: 'pointer', transition: 'fill 0.12s ease' }}
      onClick={() => onSelect(p.id)}
      onMouseEnter={() => setHovered(p.id)}
      onMouseLeave={() => setHovered(null)}
      role="button" aria-label={p.lbl}
    />
  );

  const PanelLabel = ({ p }: { p: DiagramPanel }) => {
    const count = opCount(p.id);
    const sel = selected === p.id;
    const bx = p.lx + Math.ceil(p.lbl.length * p.fs * 0.29) + 5;
    const by = p.ly - p.fs;
    return (
      <g style={{ pointerEvents: 'none', userSelect: 'none' }}>
        <text x={p.lx} y={p.ly} textAnchor="middle" fontSize={p.fs}
          fontFamily="Arial, Helvetica, sans-serif"
          fontWeight={sel ? 700 : 400}
          fill={sel ? '#fcd34d' : '#3d5a78'}>
          {p.lbl}
        </text>
        {count > 0 && (
          <>
            <circle cx={bx} cy={by} r={4.5} fill={sel ? '#f59e0b' : '#1e3a5f'} />
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
      <svg viewBox="0 0 200 480" style={{ width: '100%', maxWidth: 210, height: 'auto', display: 'block', margin: '0 auto' }}>
        <defs>
          <clipPath id="truck-cab-clip"><path d={TRUCK_CAB_PATH} /></clipPath>
          <clipPath id="truck-bed-clip"><path d={TRUCK_BED_PATH} /></clipPath>
        </defs>

        {/* Cab */}
        <path d={TRUCK_CAB_PATH} fill="#101c2c" stroke="#2d4a6a" strokeWidth="1.5" />
        <g clipPath="url(#truck-cab-clip)">
          {DIAGRAM_PANELS_TRUCK_CAB.map(p => <PanelRect key={p.id} p={p} />)}
          {/* Windshield */}
          <rect x={0} y={148} width={200} height={20} fill="#06101c" style={{ pointerEvents: 'none' }} />
          {/* Door windows */}
          <rect x={20}  y={173} width={37} height={62} rx={2} fill="#06101c" style={{ pointerEvents: 'none' }} />
          <rect x={143} y={173} width={37} height={62} rx={2} fill="#06101c" style={{ pointerEvents: 'none' }} />
        </g>
        {DIAGRAM_PANELS_TRUCK_CAB.map(p => <PanelLabel key={`l-${p.id}`} p={p} />)}

        {/* Gap label */}
        <text x={100} y={287} textAnchor="middle" fontSize={5} fill="#1e3a5f"
          fontFamily="Arial" style={{ userSelect: 'none' as const, pointerEvents: 'none' as const }}>
          ── CAB / BED GAP ──
        </text>

        {/* Bed */}
        <path d={TRUCK_BED_PATH} fill="#101c2c" stroke="#2d4a6a" strokeWidth="1.5" />
        <g clipPath="url(#truck-bed-clip)">
          {DIAGRAM_PANELS_TRUCK_BED.map(p => <PanelRect key={p.id} p={p} />)}
          {/* Bed floor (visual — not a panel) */}
          <rect x={72} y={295} width={56} height={140} fill="#0b1826" style={{ pointerEvents: 'none' }} />
          {/* Bed rail lines */}
          <line x1={72} y1={295} x2={72} y2={435} stroke="#1a2d45" strokeWidth={0.8} style={{ pointerEvents: 'none' }} />
          <line x1={128} y1={295} x2={128} y2={435} stroke="#1a2d45" strokeWidth={0.8} style={{ pointerEvents: 'none' }} />
        </g>
        {DIAGRAM_PANELS_TRUCK_BED.map(p => <PanelLabel key={`l-${p.id}`} p={p} />)}
      </svg>
    );
  }

  // ── Sedan ──────────────────────────────────────────────────────────────────
  return (
    <svg viewBox="0 0 200 480" style={{ width: '100%', maxWidth: 210, height: 'auto', display: 'block', margin: '0 auto' }}>
      <defs>
        <clipPath id="car-clip"><path d={CAR_PATH} /></clipPath>
      </defs>
      <path d={CAR_PATH} fill="#101c2c" stroke="#2d4a6a" strokeWidth="1.5" />
      <g clipPath="url(#car-clip)">
        {DIAGRAM_PANELS.map(p => <PanelRect key={p.id} p={p} />)}
        <rect x={0}   y={155} width={200} height={27} fill="#06101c" style={{ pointerEvents: 'none' }} />
        <rect x={0}   y={308} width={200} height={24} fill="#06101c" style={{ pointerEvents: 'none' }} />
        <rect x={20}  y={192} width={37}  height={48} rx={2} fill="#06101c" style={{ pointerEvents: 'none' }} />
        <rect x={143} y={192} width={37}  height={48} rx={2} fill="#06101c" style={{ pointerEvents: 'none' }} />
        <rect x={20}  y={256} width={37}  height={38} rx={2} fill="#06101c" style={{ pointerEvents: 'none' }} />
        <rect x={143} y={256} width={37}  height={38} rx={2} fill="#06101c" style={{ pointerEvents: 'none' }} />
      </g>
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
        background: copied ? '#052e16' : '#0f172a',
        color: copied ? '#4ade80' : '#64748b',
        border: `1px solid ${copied ? '#16a34a' : '#1e293b'}`,
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
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {panel.operations.length === 0 ? (
        <div style={{
          padding: '20px',
          background: '#172032',
          border: '1px dashed #2d4a6a',
          borderRadius: 10,
          color: '#4d6a84',
          fontSize: 13,
          textAlign: 'center',
        }}>
          No operations yet for this panel.<br />
          <span style={{ fontSize: 12, color: '#3d5470' }}>
            Add entries in <code style={{ color: '#f59e0b' }}>lib/estimateData.ts</code>
          </span>
        </div>
      ) : (
        panel.operations.map(op => (
          <div
            key={op.id}
            style={{
              background: '#172032',
              border: '1px solid #243e5c',
              borderRadius: 10,
              padding: '14px 18px',
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: op.notes.length ? 12 : 0,
              fontSize: 13,
              fontWeight: 700,
              color: '#f59e0b',
              letterSpacing: '0.2px',
            }}>
              <span style={{ opacity: 0.8 }}>⚙</span>
              {op.name}
            </div>

            {op.notes.map((note, ni) => (
              <div
                key={note.id}
                style={{
                  marginTop: ni > 0 ? 10 : 0,
                  paddingTop: ni > 0 ? 10 : 0,
                  borderTop: ni > 0 ? '1px solid #1a2d40' : 'none',
                }}
              >
                <p style={{
                  margin: 0,
                  padding: '10px 14px',
                  background: '#0f1c2e',
                  border: '1px solid #1e3450',
                  borderRadius: 6,
                  fontSize: 12.5,
                  lineHeight: 1.65,
                  color: '#b0c4d8',
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
        ))
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
      <svg width="72" height="72" viewBox="0 0 72 72" fill="none" style={{ opacity: 0.12 }}>
        <ellipse cx="36" cy="36" rx="24" ry="30" stroke="#60a5fa" strokeWidth="2.5" />
        <rect x="18" y="26" width="36" height="20" rx="2" stroke="#60a5fa" strokeWidth="1.5" />
        <line x1="18" y1="36" x2="54" y2="36" stroke="#60a5fa" strokeWidth="1.5" />
      </svg>
      <div style={{ fontSize: 15, fontWeight: 600, color: '#1e3a5f', textAlign: 'center' }}>
        Select a panel to see operations
      </div>
      <div style={{ fontSize: 13, color: '#0f2236', textAlign: 'center', maxWidth: 280, lineHeight: 1.6 }}>
        Click any area on the car diagram, or use the search bar to find specific operations and copy notes into CCC ONE.
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function Home() {
  const [vehicleType, setVehicleType] = useState<VehicleType>('sedan');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const hits = doSearch(query);
  const selectedPanel = PANELS.find(p => p.id === selectedId) ?? null;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (id: string) => setSelectedId(prev => (prev === id ? null : id));

  const switchVehicle = (vt: VehicleType) => {
    setVehicleType(vt);
    setSelectedId(null);
  };

  const isOnCurrentDiagram = (p: { onDiagram?: boolean; onTruckDiagram?: boolean }) =>
    vehicleType === 'sedan' ? !!p.onDiagram : !!p.onTruckDiagram;

  const selectFromSearch = (hit: SearchHit) => {
    setSelectedId(hit.panelId);
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
          body { margin: 0; background: #131e2d; }
          ::-webkit-scrollbar { width: 6px; }
          ::-webkit-scrollbar-track { background: #1a2535; }
          ::-webkit-scrollbar-thumb { background: #2d4258; border-radius: 3px; }
          input::placeholder { color: #3d5470; }
          input:focus { outline: none; border-color: #f59e0b !important; box-shadow: 0 0 0 2px rgba(245,158,11,0.2); }
        `}</style>
      </Head>

      <div style={{
        minHeight: '100vh',
        maxHeight: '100vh',
        background: '#131e2d',
        color: '#e2e8f0',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif",
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>

        {/* ── Header ── */}
        <header style={{
          borderBottom: '2px solid #f59e0b',
          padding: '10px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          background: '#0d1623',
          flexShrink: 0,
          zIndex: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
            {/* Yellow/black college badge */}
            <div style={{
              width: 42, height: 42,
              background: '#f59e0b',
              borderRadius: 6,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22,
              boxShadow: '0 2px 8px rgba(245,158,11,0.35)',
              flexShrink: 0,
            }}>⛏️</div>
            <div>
              <div style={{
                fontWeight: 900,
                fontSize: 17,
                color: '#f59e0b',
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                fontFamily: "Georgia, 'Times New Roman', serif",
                lineHeight: 1.1,
                textShadow: '0 1px 6px rgba(245,158,11,0.3)',
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
              <span style={{ position: 'absolute', left: 11, fontSize: 14, color: '#2d4258', pointerEvents: 'none', lineHeight: 1 }}>🔍</span>
              <input
                value={query}
                onChange={e => { setQuery(e.target.value); setShowDropdown(true); }}
                onFocus={() => query && setShowDropdown(true)}
                onKeyDown={e => e.key === 'Escape' && setShowDropdown(false)}
                placeholder="Search panels, operations, notes..."
                style={{
                  width: '100%',
                  background: '#172032',
                  border: '1px solid #2d4a6a',
                  borderRadius: 8,
                  padding: '8px 34px 8px 33px',
                  color: '#e2e8f0',
                  fontSize: 13.5,
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                }}
              />
              {query && (
                <button
                  onClick={() => { setQuery(''); setShowDropdown(false); }}
                  style={{ position: 'absolute', right: 10, background: 'none', border: 'none', color: '#2d4258', cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: 2 }}
                >×</button>
              )}
            </div>

            {showDropdown && hits.length > 0 && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
                background: '#172032', border: '1px solid #2d4a6a',
                borderRadius: 8, boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
                zIndex: 200, overflow: 'hidden',
              }}>
                {hits.map((hit, i) => (
                  <button
                    key={i}
                    onClick={() => selectFromSearch(hit)}
                    style={{
                      display: 'block', width: '100%', textAlign: 'left',
                      padding: '10px 14px', background: 'none', border: 'none',
                      borderBottom: i < hits.length - 1 ? '1px solid #0f1e30' : 'none',
                      cursor: 'pointer', color: '#e2e8f0', transition: 'background 0.1s', fontFamily: 'inherit',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#1e3248')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                  >
                    <div style={{ fontSize: 12, color: '#3d5470', marginBottom: hit.snippet ? 2 : 0 }}>
                      {typeIcon(hit.type)}&nbsp;
                      <span style={{ color: '#64748b' }}>{hit.panelLabel}</span>
                      {hit.opName && <span style={{ color: '#3d5470' }}> → {hit.opName}</span>}
                    </div>
                    {hit.snippet && (
                      <div style={{ fontSize: 12, color: '#334155', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {hit.snippet}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </header>

        {/* ── Body ── */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

          {/* Left: car diagram + chips */}
          <aside style={{
            width: 264,
            flexShrink: 0,
            borderRight: '1px solid #1e3a5f',
            background: '#0f1a2a',
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
                      background: vehicleType === vt ? '#f59e0b' : '#172032',
                      color: vehicleType === vt ? '#000' : '#4d6a84',
                      border: `1px solid ${vehicleType === vt ? '#f59e0b' : '#2d4a6a'}`,
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
                fontSize: 10, color: '#1e3a5f', textTransform: 'uppercase',
                letterSpacing: '1.2px', textAlign: 'center', marginBottom: 10,
              }}>Click a panel</div>
              <CarDiagram selected={selectedId} onSelect={handleSelect} vehicleType={vehicleType} />
            </div>

            {/* Chips for off-diagram panels */}
            <div style={{ padding: '16px 14px 20px' }}>
              <div style={{ fontSize: 10, color: '#1a2d42', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8, paddingLeft: 2 }}>
                Other panels
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {PANELS.filter(p => !isOnCurrentDiagram(p)).map(p => {
                  const sel = selectedId === p.id;
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
                        background: sel ? '#7c3d00' : '#172032',
                        color: sel ? '#fcd34d' : '#4d6a84',
                        border: `1px solid ${sel ? '#f59e0b' : '#2d4a6a'}`,
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
                          background: sel ? '#f59e0b' : '#1e3448',
                          color: sel ? '#000' : '#4d6a84',
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
          <main style={{ flex: 1, overflowY: 'auto', padding: '24px 28px', background: '#131e2d' }}>
            {!selectedPanel ? (
              <EmptyState />
            ) : (
              <>
                <div style={{
                  display: 'flex', alignItems: 'baseline', gap: 12,
                  marginBottom: 20, paddingBottom: 16,
                  borderBottom: '2px solid #1e3a5f',
                }}>
                  <h2 style={{
                    margin: 0, fontSize: 20, fontWeight: 900, color: '#f59e0b',
                    textTransform: 'uppercase', letterSpacing: '1px',
                    fontFamily: "Georgia, 'Times New Roman', serif",
                  }}>
                    {selectedPanel.label}
                  </h2>
                  <span style={{ fontSize: 12, color: '#3d5a78' }}>
                    {selectedPanel.operations.length} operation{selectedPanel.operations.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <PanelOps panel={selectedPanel} />
              </>
            )}
          </main>
        </div>
      </div>
    </>
  );
}
