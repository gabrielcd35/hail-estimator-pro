import { useState, useCallback, useRef, useEffect } from 'react';
import Head from 'next/head';

type Mode = 'estimate' | 'invoice';
type Status = 'idle' | 'loading' | 'done' | 'error';
type ItemType = 'missing' | 'incorrect' | 'note' | 'ok';

interface LineItem { type: ItemType; text: string; }
interface GroupResult { group: string; items: LineItem[]; hasIssues: boolean; }
interface AnalysisResult { raw: string; groups: GroupResult[]; usage?: { input_tokens: number; output_tokens: number }; }

const CCC_GROUPS = [
  'NON-NEGOTIABLES','INFORMATION LABELS','FRONT BUMPER','FRONT LAMPS','HOOD','FENDER',
  'ELECTRICAL','RESTRAINT SYSTEMS','WINDSHIELD','COWL','ROOF','ROOF RAIL',
  'PILLARS, ROCKER & FLOOR','FRONT DOOR','REAR DOOR','SIDE LOADING DOOR','SIDE PANEL',
  'QUARTER PANEL','PICK UP BOX','CAB CORNER','LIFT GATE','DECK LID','REAR LAMPS',
  'REAR BUMPER','VEHICLE DIAGNOSTICS','MECHANICAL LABOR','PDR MATRIX','MISCELLANEOUS',
  'ADDITIONAL ITEMS NEEDED',
];

function parseAnalysis(raw: string, usage?: { input_tokens: number; output_tokens: number }): AnalysisResult {
  const groups: GroupResult[] = [];
  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
  let currentGroup = 'GENERAL';
  let currentItems: LineItem[] = [];

  const flush = () => {
    if (currentItems.length > 0) {
      const hasIssues = currentItems.some(i => i.type === 'missing' || i.type === 'incorrect');
      groups.push({ group: currentGroup, items: [...currentItems], hasIssues });
    }
    currentItems = [];
  };

  const isHeader = (line: string): string | null => {
    if (/^#{1,4}\s+(.+)/.test(line)) return line.replace(/^#+\s*/, '').replace(/:$/, '').toUpperCase().trim();
    if (/^[A-Z][A-Z\s,&\/\-]+$/.test(line) && line.length < 50 && line.length > 3) return line.trim();
    const up = line.toUpperCase();
    for (const g of CCC_GROUPS) {
      if (up.startsWith(g) || up.includes('### ' + g) || up.includes('## ' + g)) return g;
    }
    return null;
  };

  const classifyLine = (line: string): LineItem | null => {
    if (!line || line.length < 3) return null;
    const lower = line.toLowerCase();
    const noPrefix = line.replace(/^(MISSING|CHECK|OK|NOTE|✅|⚠️|❌|📝)[:\-\s]*/i, '').trim();
    if (/^missing|^⚠|missing[-:\s]/i.test(line) || /\bmissing\b/.test(lower) || /\bneeds? to be added\b/.test(lower) || /\bnot (finded|present|included)\b/.test(lower) || /\bshould be added\b/.test(lower) || /\bflagged\b/.test(lower)) {
      return { type: 'missing', text: noPrefix || line };
    }
    if (/^check|^_Check|check[-:\s]/i.test(line) || /\b(incorrect|mismatch|wrong|verify|should be verified)\b/.test(lower)) {
      return { type: 'incorrect', text: noPrefix || line };
    }
    if (/^ok\b|^✅/i.test(line) || /^ok[-:\s]/i.test(line)) {
      return { type: 'ok', text: noPrefix || line };
    }
    if (/^note\b|^📝/i.test(line) || /^note[-:\s]/i.test(line)) {
      return { type: 'note', text: noPrefix || line };
    }
    return { type: 'note', text: line };
  };

  for (const line of lines) {
    const header = isHeader(line);
    if (header && header !== currentGroup) {
      flush();
      currentGroup = header;
      continue;
    }
    const item = classifyLine(line);
    if (item) currentItems.push(item);
  }
  flush();

  return { raw, groups, usage };
}

const TYPE_CFG = {
  missing: { label: 'MISSING', color: '#f59e0b', bg: 'rgba(245,158,11,0.07)', border: 'rgba(245,158,11,0.22)', icon: '❆' },
  incorrect: { label: 'CHECK', color: '#ef4444', bg: 'rgba(239,68,68,0.07)', border: 'rgba(239,68,68,0.22)', icon: '✕' },
  note: { label: 'NOTE', color: '#60a5fa', bg: 'rgba(96,165,250,0.05)', border: 'rgba(96,165,250,0.15)', icon: '→' },
  ok: { label: 'OK', color: '#4ade80', bg: 'rgba(74,222,128,0.05)', border: 'rgba(74,222,128,0.15)', icon: '✓' },
};