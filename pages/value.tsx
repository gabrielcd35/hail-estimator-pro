import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

const GOOGLE_FONTS =
  'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=Public+Sans:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap';

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY','DC',
];

function fmt(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

function parseDollar(s: string): number {
  return parseFloat(s.replace(/[^0-9.]/g, '')) || 0;
}

interface Threshold { pct: number; label: string; color: string; bg: string; brd: string; }

const THRESHOLDS: Threshold[] = [
  { pct: 0.55, label: 'Safe to write',       color: '#22c55e', bg: 'rgba(34,197,94,.12)',  brd: 'rgba(34,197,94,.28)' },
  { pct: 0.60, label: 'Approach with care',  color: '#f59e0b', bg: 'rgba(245,158,11,.12)', brd: 'rgba(245,158,11,.28)' },
  { pct: 0.70, label: 'Likely to total',     color: '#ef4444', bg: 'rgba(239,68,68,.12)',  brd: 'rgba(239,68,68,.28)' },
];

function zone(pct: number): Threshold | null {
  if (pct <= 0) return null;
  if (pct < 0.55) return THRESHOLDS[0];
  if (pct < 0.60) return THRESHOLDS[0];
  if (pct < 0.70) return THRESHOLDS[1];
  return THRESHOLDS[2];
}

export default function ValuePage() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [mode, setMode] = useState<'vin' | 'plate'>('vin');
  const [vin, setVin] = useState('');
  const [plate, setPlate] = useState('');
  const [state, setState] = useState('TX');
  const [retailRaw, setRetailRaw] = useState('');
  const [estRaw, setEstRaw] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('hep-theme');
    if (stored === 'light' || stored === 'dark') setTheme(stored);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('hep-theme', next);
  };

  const retail = parseDollar(retailRaw);
  const est    = parseDollar(estRaw);
  const estPct = retail > 0 && est > 0 ? est / retail : 0;
  const estZone = zone(estPct);

  function openCarfax() {
    const base = 'https://www.carfax.com/value/';
    if (mode === 'vin' && vin.trim()) {
      window.open(`${base}#vin=${encodeURIComponent(vin.trim().toUpperCase())}`, '_blank');
    } else if (mode === 'plate' && plate.trim()) {
      window.open(`${base}#plate=${encodeURIComponent(plate.trim().toUpperCase())}&state=${state}`, '_blank');
    } else {
      window.open(base, '_blank');
    }
  }

  const dark = theme === 'dark';

  const css = `
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Public Sans', system-ui, sans-serif; background: var(--bg); color: var(--text); }
    :root {
      ${dark ? `
      --bg: #0a1526;
      --header-bg: #081120;
      --card: rgba(255,255,255,.04);
      --brd: rgba(255,255,255,.10);
      --brd-2: rgba(255,255,255,.17);
      --text: #e8ecf4;
      --text2: rgba(255,255,255,.62);
      --text3: rgba(255,255,255,.42);
      --input-bg: rgba(255,255,255,.05);
      --gold: #e0b64a;
      --gold2: #c8971a;
      --gold-soft: rgba(200,151,26,.16);
      --gold-brd: rgba(200,151,26,.34);
      --on-gold: #1a1205;
      ` : `
      --bg: #eef2f7;
      --header-bg: #ffffff;
      --card: #ffffff;
      --brd: rgba(15,34,64,.14);
      --brd-2: rgba(15,34,64,.22);
      --text: #141b2b;
      --text2: #43506a;
      --text3: #7386a0;
      --input-bg: #ffffff;
      --gold: #a06d0a;
      --gold2: #c8971a;
      --gold-soft: rgba(160,109,10,.14);
      --gold-brd: rgba(160,109,10,.4);
      --on-gold: #1a1205;
      `}
    }
    input, select { font-family: 'Public Sans', sans-serif; }
  `;

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', fontSize: 15, fontFamily: "'Public Sans', sans-serif",
    background: 'var(--input-bg)', border: '1px solid var(--brd-2)', borderRadius: 8, color: 'var(--text)',
    outline: 'none', transition: 'border-color .15s',
  };

  const cardStyle: React.CSSProperties = {
    background: 'var(--card)', border: '1px solid var(--brd)', borderRadius: 14, padding: '24px 28px',
  };

  return (
    <>
      <Head>
        <title>Vehicle Value — Hail Estimator PRO</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href={GOOGLE_FONTS} rel="stylesheet" />
        <style>{css}</style>
      </Head>

      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

        {/* ── Header ── */}
        <header style={{
          background: 'var(--header-bg)', borderBottom: '2px solid var(--gold)',
          padding: '0 24px', height: 60, display: 'flex', alignItems: 'center',
          gap: 16, flexShrink: 0,
        }}>
          {/* Logo */}
          <div style={{
            width: 38, height: 38, borderRadius: 9, background: 'var(--gold)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            boxShadow: '0 4px 16px var(--gold-soft)',
          }}>
            <div style={{
              width: 15, height: 15, background: 'var(--on-gold)',
              transform: 'rotate(45deg)', borderRadius: 2,
            }} />
          </div>

          {/* Wordmark */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 15, color: 'var(--text)', letterSpacing: '-0.2px' }}>
                Hail Estimator
              </span>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, fontSize: 8.5, color: 'var(--gold)', letterSpacing: 1, transform: 'translateY(-6px)' }}>
                PRO
              </span>
            </div>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9.5, color: 'var(--text3)', letterSpacing: 2, textTransform: 'uppercase' }}>
              Vehicle Value
            </span>
          </div>

          <div style={{ flex: 1 }} />

          {/* Nav link back */}
          <Link href="/" style={{
            fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: 'var(--text2)',
            textDecoration: 'none', letterSpacing: 0.5,
            padding: '6px 12px', border: '1px solid var(--brd)', borderRadius: 8,
            transition: 'all .15s',
          }}>
            ← Estimate Assistant
          </Link>

          {/* Theme toggle */}
          <button onClick={toggleTheme} style={{
            width: 36, height: 36, borderRadius: 9, border: '1px solid var(--brd)',
            background: 'var(--input-bg)', cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center', color: 'var(--text2)', flexShrink: 0,
          }}>
            {dark ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/>
                <line x1="4.22" y1="4.22" x2="7.05" y2="7.05"/><line x1="16.95" y1="16.95" x2="19.78" y2="19.78"/>
                <line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/>
                <line x1="4.22" y1="19.78" x2="7.05" y2="16.95"/><line x1="16.95" y1="7.05" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>
        </header>

        {/* ── Body ── */}
        <main style={{ flex: 1, padding: '32px 24px', maxWidth: 680, width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* ── VIN / Plate lookup card ── */}
          <div style={cardStyle}>
            <div style={{ marginBottom: 16 }}>
              <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 18, color: 'var(--gold)', marginBottom: 4 }}>
                Carfax Value Lookup
              </h2>
              <p style={{ fontSize: 13, color: 'var(--text3)', fontFamily: "'IBM Plex Mono', monospace" }}>
                Enter VIN or plate — opens Carfax in a new tab
              </p>
            </div>

            {/* Mode toggle */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              {(['vin', 'plate'] as const).map(m => (
                <button key={m} onClick={() => setMode(m)} style={{
                  padding: '7px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600,
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
              <input
                style={inputStyle}
                placeholder="Enter VIN (e.g. 1HGCM82633A004352)"
                value={vin}
                onChange={e => setVin(e.target.value.toUpperCase())}
                maxLength={17}
              />
            ) : (
              <div style={{ display: 'flex', gap: 10 }}>
                <input
                  style={{ ...inputStyle, flex: 1 }}
                  placeholder="License plate"
                  value={plate}
                  onChange={e => setPlate(e.target.value.toUpperCase())}
                />
                <select
                  value={state}
                  onChange={e => setState(e.target.value)}
                  style={{
                    ...inputStyle, width: 'auto', paddingRight: 32,
                    cursor: 'pointer', appearance: 'none',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center',
                  }}
                >
                  {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            )}

            <button
              onClick={openCarfax}
              style={{
                marginTop: 14, width: '100%', padding: '11px 0', borderRadius: 9,
                background: 'var(--gold2)', color: 'var(--on-gold)',
                border: 'none', cursor: 'pointer', fontFamily: "'Public Sans', sans-serif",
                fontWeight: 700, fontSize: 14, letterSpacing: 0.3, transition: 'opacity .15s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              Open on Carfax
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
            </button>
          </div>

          {/* ── Retail value + thresholds card ── */}
          <div style={cardStyle}>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 18, color: 'var(--gold)', marginBottom: 4 }}>
              Threshold Calculator
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text3)', fontFamily: "'IBM Plex Mono', monospace", marginBottom: 20 }}>
              Enter the retail value from Carfax
            </p>

            {/* Retail value input */}
            <label style={{ display: 'block', fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: 'var(--text3)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 }}>
              Retail Value
            </label>
            <div style={{ position: 'relative', marginBottom: 24 }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)', fontSize: 15, fontFamily: "'Public Sans', sans-serif", pointerEvents: 'none' }}>$</span>
              <input
                style={{ ...inputStyle, paddingLeft: 26 }}
                placeholder="0"
                value={retailRaw}
                onChange={e => setRetailRaw(e.target.value)}
                inputMode="numeric"
              />
            </div>

            {/* Threshold rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {THRESHOLDS.map(t => {
                const amt = retail > 0 ? retail * t.pct : null;
                return (
                  <div key={t.pct} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '13px 16px', borderRadius: 10,
                    background: t.bg, border: `1px solid ${t.brd}`,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: t.color, flexShrink: 0 }} />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14, color: t.color }}>{Math.round(t.pct * 100)}%</div>
                        <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: "'IBM Plex Mono', monospace", marginTop: 1 }}>{t.label}</div>
                      </div>
                    </div>
                    <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, fontSize: 16, color: amt ? t.color : 'var(--text3)' }}>
                      {amt ? fmt(amt) : '—'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Estimate value card ── */}
          <div style={cardStyle}>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 18, color: 'var(--gold)', marginBottom: 4 }}>
              Estimate Value
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text3)', fontFamily: "'IBM Plex Mono', monospace", marginBottom: 20 }}>
              How does your estimate compare?
            </p>

            <label style={{ display: 'block', fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: 'var(--text3)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 }}>
              Estimate Total
            </label>
            <div style={{ position: 'relative', marginBottom: 20 }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)', fontSize: 15, pointerEvents: 'none' }}>$</span>
              <input
                style={{ ...inputStyle, paddingLeft: 26 }}
                placeholder="0"
                value={estRaw}
                onChange={e => setEstRaw(e.target.value)}
                inputMode="numeric"
              />
            </div>

            {estPct > 0 && estZone && (
              <div style={{
                padding: '16px 20px', borderRadius: 12,
                background: estZone.bg, border: `1px solid ${estZone.brd}`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div>
                  <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 4, fontFamily: "'Public Sans', sans-serif" }}>
                    Estimate is <strong style={{ color: estZone.color }}>{(estPct * 100).toFixed(1)}%</strong> of retail value
                  </div>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, fontSize: 13, color: estZone.color }}>
                    {estZone.label}
                  </div>
                </div>
                <div style={{ fontSize: 28, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700, color: estZone.color }}>
                  {(estPct * 100).toFixed(1)}%
                </div>
              </div>
            )}

            {estPct > 0 && !estZone && (
              <div style={{ padding: '16px 20px', borderRadius: 12, background: 'rgba(34,197,94,.08)', border: '1px solid rgba(34,197,94,.2)', color: '#22c55e', fontFamily: "'IBM Plex Mono', monospace", fontSize: 13 }}>
                Under 55% — well within safe range
              </div>
            )}

            {retail <= 0 && estRaw && (
              <div style={{ fontSize: 12, color: 'var(--text3)', fontFamily: "'IBM Plex Mono', monospace" }}>
                Enter the retail value above to see the percentage
              </div>
            )}
          </div>

        </main>

        {/* ── Footer ── */}
        <footer style={{
          background: 'var(--header-bg)', borderTop: '1px solid var(--brd)',
          padding: '10px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'var(--text3)', flexShrink: 0,
        }}>
          <span>Hail Estimator PRO · Vehicle Value</span>
          <span>v1.0 · Dent Mechanic Group</span>
        </footer>
      </div>
    </>
  );
}
