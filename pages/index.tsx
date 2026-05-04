import { useState, useCallback, useRef, useEffect } from 'react';
import Head from 'next/head';

type Mode = 'estimate' | 'invoice' | 'header';
type Status = 'idle' | 'loading' | 'done' | 'error';

interface AnalysisResult {
  analysis: string;
  usage?: { input_tokens: number; output_tokens: number };
}

function parseAnalysis(text: string) {
  const sections: { type: 'correct' | 'missing' | 'incorrect' | 'note' | 'text'; content: string }[] = [];
  for (const line of text.split('\n')) {
    const t = line.trim();
    if (!t) continue;
    if (t.startsWith('✅')) sections.push({ type: 'correct', content: t.replace('✅', '').trim() });
    else if (t.startsWith('⚠')) sections.push({ type: 'missing', content: t.replace(/⚠️?/, '').trim() });
    else if (t.startsWith('❌')) sections.push({ type: 'incorrect', content: t.replace('❌', '').trim() });
    else if (t.startsWith('📝')) sections.push({ type: 'note', content: t.replace('📝', '').trim() });
    else sections.push({ type: 'text', content: t });
  }
  return sections;
}

function readFileBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve((e.target?.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function Home() {
  const [dark, setDark] = useState(true);
  const [mode, setMode] = useState<Mode>('estimate');
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Header tab state
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [businessName, setBusinessName] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [businessPhone, setBusinessPhone] = useState('');
  const [headerPdf, setHeaderPdf] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('hail-theme');
    if (saved) setDark(saved === 'dark');
  }, []);

  const toggleTheme = () => {
    setDark(prev => {
      localStorage.setItem('hail-theme', !prev ? 'dark' : 'light');
      return !prev;
    });
  };

  const handleFile = (f: File) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowed.includes(f.type)) { setError('Upload a PDF or image (JPG, PNG).'); return; }
    setFile(f); setResult(null); setError(''); setHeaderPdf(null);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, []);

  const switchMode = (m: Mode) => {
    setMode(m); setStatus('idle'); setError(''); setResult(null); setHeaderPdf(null);
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setStatus('loading'); setError(''); setResult(null);
    try {
      const base64 = await readFileBase64(file);
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileData: base64, fileType: file.type === 'application/pdf' ? 'pdf' : 'image', fileName: file.name, mode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Analysis failed');
      setResult(data); setStatus('done');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setStatus('error');
    }
  };

  const handleHeaderProcess = async () => {
    if (!file || !logoFile) return;
    setStatus('loading'); setError(''); setHeaderPdf(null);
    try {
      // Load pdfjs — dynamically imported so it only runs in the browser
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

      // Render page 1 to canvas (pdfjs is the reference renderer — always correct)
      const pdfBytes = new Uint8Array(await file.arrayBuffer());
      const pdfJsDoc = await pdfjsLib.getDocument({ data: pdfBytes }).promise;
      const totalPages = pdfJsDoc.numPages;
      const page1 = await pdfJsDoc.getPage(1);

      const SCALE = 2.0; // 2× for print-quality output
      const viewport = page1.getViewport({ scale: SCALE });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d')!;
      await page1.render({ canvasContext: ctx as unknown as CanvasRenderingContext2D, viewport }).promise;

      // ── 1. Erase original shop header (top 160 PDF points) ──
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, 160 * SCALE);

      // ── 2. Draw logo centered in the cleared header band ──
      const logoUrl = URL.createObjectURL(logoFile);
      const logoImg = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Failed to load logo'));
        img.src = logoUrl;
      });
      URL.revokeObjectURL(logoUrl);

      const hasText = !!(businessName || businessAddress || businessPhone);
      const maxLogoW = 420 * SCALE;
      const maxLogoH = (hasText ? 85 : 130) * SCALE;
      const logoFit = Math.min(maxLogoW / logoImg.naturalWidth, maxLogoH / logoImg.naturalHeight);
      const lw = logoImg.naturalWidth * logoFit;
      const lh = logoImg.naturalHeight * logoFit;
      const padTop = 8 * SCALE;
      ctx.drawImage(logoImg, (canvas.width - lw) / 2, padTop, lw, lh);

      // ── 3. Business info text centered below logo ──
      if (hasText) {
        const fontSize = 8 * SCALE;
        const lineH = 11 * SCALE;
        let ty = padTop + lh + fontSize + 10 * SCALE; // ty = baseline of first line

        const drawCentered = (text: string, bold: boolean) => {
          ctx.font = `${bold ? '700 ' : ''}${fontSize}px Arial, Helvetica, sans-serif`;
          ctx.fillStyle = '#000000';
          const tw = ctx.measureText(text).width;
          ctx.fillText(text, (canvas.width - tw) / 2, ty);
          ty += lineH;
        };

        if (businessName) drawCentered(businessName, true);
        if (businessAddress) drawCentered(businessAddress, false);
        if (businessPhone) drawCentered(businessPhone, false);
      }

      // ── 4. Erase Inspection Location content ──
      // PDF coords: x=190, y=360 from bottom, w=195, h=175 (PAGE_H=792)
      // Canvas coords (y=0 at top): inspY = (792-360-175)*SCALE = 257*SCALE
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(190 * SCALE, 257 * SCALE, 195 * SCALE, 175 * SCALE);

      // ── 5. Canvas → PNG → embed in new PDF ──
      const pngDataUrl = canvas.toDataURL('image/png');
      const pngBase64 = pngDataUrl.split(',')[1];
      let binary = '';
      const pngBytesArr = Uint8Array.from(atob(pngBase64), c => c.charCodeAt(0));
      for (let i = 0; i < pngBytesArr.length; i++) binary += String.fromCharCode(pngBytesArr[i]);

      const { PDFDocument } = await import('pdf-lib');
      const outPdf = await PDFDocument.create();
      const pngImage = await outPdf.embedPng(pngBytesArr);
      const p1 = outPdf.addPage([612, 792]);
      p1.drawImage(pngImage, { x: 0, y: 0, width: 612, height: 792 });

      // Copy remaining pages unchanged
      if (totalPages > 1) {
        const origPdfLib = await PDFDocument.load(pdfBytes);
        const indices = Array.from({ length: totalPages - 1 }, (_, i) => i + 1);
        const copied = await outPdf.copyPages(origPdfLib, indices);
        copied.forEach(pg => outPdf.addPage(pg));
      }

      const outputBytes = await outPdf.save();
      let outBinary = '';
      for (let i = 0; i < outputBytes.length; i++) outBinary += String.fromCharCode(outputBytes[i]);
      setHeaderPdf(btoa(outBinary));
      setStatus('done');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setStatus('error');
    }
  };

  const downloadHeaderPdf = () => {
    if (!headerPdf) return;
    const bytes = atob(headerPdf);
    const arr = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
    const url = URL.createObjectURL(new Blob([arr], { type: 'application/pdf' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = (file?.name || 'estimate').replace(/\.pdf$/i, '') + '_branded.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const parsed = result ? parseAnalysis(result.analysis) : [];

  return (
    <>
      <Head>
        <title>Hail Estimator Pro</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Sora:wght@300;400;600;700&display=swap" rel="stylesheet" />
      </Head>
      <div className={dark ? 'app dark' : 'app light'}>
        <header>
          <div className="header-inner">
            <div className="logo">
              <span className="logo-icon">H</span>
              <div>
                <div className="logo-title">HAIL ESTIMATOR PRO</div>
                <div className="logo-sub">PDR - USAA Matrix 2025</div>
              </div>
            </div>
            <div className="header-right">
              <button className="theme-toggle" onClick={toggleTheme}>{dark ? 'Light' : 'Dark'}</button>
              <div className="header-badge">BETA</div>
            </div>
          </div>
        </header>

        <main>
          <div className="mode-toggle">
            <button className={'mode-btn' + (mode === 'estimate' ? ' active' : '')} onClick={() => switchMode('estimate')}>
              <div><div className="mode-label">Scope / Estimate</div><div className="mode-desc">Audit CCC ONE estimate</div></div>
            </button>
            <button className={'mode-btn' + (mode === 'invoice' ? ' active' : '')} onClick={() => switchMode('invoice')}>
              <div><div className="mode-label">Invoice / Parts</div><div className="mode-desc">Extract line items</div></div>
            </button>
            <button className={'mode-btn' + (mode === 'header' ? ' active' : '')} onClick={() => switchMode('header')}>
              <div><div className="mode-label">Estimate Header</div><div className="mode-desc">Rebrand CCC estimate</div></div>
            </button>
          </div>

          {mode === 'header' ? (
            <>
              <div className="section-label">CCC Estimate PDF</div>
              <div
                className={'upload-zone' + (dragOver ? ' drag-over' : '') + (file ? ' has-file' : '')}
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
              >
                <input ref={fileInputRef} type="file" accept=".pdf" style={{ display: 'none' }}
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
                {file ? (
                  <div className="file-selected">
                    <div className="file-name">{file.name}</div>
                    <div className="file-size">{(file.size / 1024).toFixed(1)} KB</div>
                    <div className="file-change">Click to change</div>
                  </div>
                ) : (
                  <div className="upload-prompt">
                    <div className="upload-title">Drop CCC estimate here or click to upload</div>
                    <div className="upload-sub">PDF only</div>
                  </div>
                )}
              </div>

              <div className="section-label">Logo</div>
              <div
                className={'upload-zone' + (logoFile ? ' has-file' : '')}
                onClick={() => logoInputRef.current?.click()}
              >
                <input ref={logoInputRef} type="file" accept="image/png,image/jpeg,image/jpg" style={{ display: 'none' }}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) { setLogoFile(f); setError(''); setHeaderPdf(null); }
                  }} />
                {logoFile ? (
                  <div className="file-selected">
                    <div className="file-name">{logoFile.name}</div>
                    <div className="file-size">{(logoFile.size / 1024).toFixed(1)} KB</div>
                    <div className="file-change">Click to change</div>
                  </div>
                ) : (
                  <div className="upload-prompt">
                    <div className="upload-title">Drop logo here or click to upload</div>
                    <div className="upload-sub">PNG or JPG</div>
                  </div>
                )}
              </div>

              <div className="section-label">Business Info</div>
              <div className="form-card">
                <input className="form-input" placeholder="Business name" value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)} />
                <input className="form-input" placeholder="Address" value={businessAddress}
                  onChange={(e) => setBusinessAddress(e.target.value)} />
                <input className="form-input" placeholder="Phone" value={businessPhone}
                  onChange={(e) => setBusinessPhone(e.target.value)} />
              </div>

              <button
                className={'analyze-btn' + (status === 'loading' ? ' loading' : '')}
                onClick={handleHeaderProcess}
                disabled={!file || !logoFile || status === 'loading'}
              >
                {status === 'loading' ? 'Processing...' : 'Generate Branded Estimate'}
              </button>

              {error && <div className="error-box">{error}</div>}

              {status === 'done' && headerPdf && (
                <div className="results">
                  <div className="results-header">
                    <div className="results-title">Estimate branded successfully</div>
                  </div>
                  <div style={{ padding: '20px' }}>
                    <button className="download-btn" onClick={downloadHeaderPdf}>
                      Download Branded PDF
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <div
                className={'upload-zone' + (dragOver ? ' drag-over' : '') + (file ? ' has-file' : '')}
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
              >
                <input ref={fileInputRef} type="file" accept=".pdf,image/jpeg,image/png" style={{ display: 'none' }}
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
                {file ? (
                  <div className="file-selected">
                    <div className="file-name">{file.name}</div>
                    <div className="file-size">{(file.size / 1024).toFixed(1)} KB</div>
                    <div className="file-change">Click to change</div>
                  </div>
                ) : (
                  <div className="upload-prompt">
                    <div className="upload-title">Drop file here or click to upload</div>
                    <div className="upload-sub">PDF - JPG - PNG</div>
                  </div>
                )}
              </div>

              <button
                className={'analyze-btn' + (status === 'loading' ? ' loading' : '')}
                onClick={handleAnalyze}
                disabled={!file || status === 'loading'}
              >
                {status === 'loading' ? 'Analyzing...' : (mode === 'estimate' ? 'Audit Estimate' : 'Extract Invoice Items')}
              </button>

              {error && <div className="error-box">{error}</div>}

              {status === 'done' && result && (
                <div className="results">
                  <div className="results-header">
                    <div className="results-title">Analysis Complete</div>
                    {result.usage && <div className="results-usage">{result.usage.input_tokens + result.usage.output_tokens} tokens</div>}
                  </div>
                  <div className="results-body">
                    {parsed.map((item, i) => (
                      <div key={i} className={'result-item result-' + item.type}>
                        <span className="result-content">{item.content}</span>
                      </div>
                    ))}
                  </div>
                  <button className="copy-btn" onClick={() => navigator.clipboard.writeText(result.analysis)}>Copy Full Analysis</button>
                </div>
              )}

              <div className="rules-card">
                <div className="rules-title">Active Rules</div>
                <div className="rules-list">
                  <div className="rule-item"><span className="rule-dot" />Roof replacement - R&amp;I Windshield + Urethane Kit ($30)</div>
                  <div className="rule-item"><span className="rule-dot" />O/S Dent = $50 each (manual entries only)</div>
                  <div className="rule-item"><span className="rule-dot" />Aluminum +25% only when explicitly marked (ALU)</div>
                  <div className="rule-item"><span className="rule-dot" />Roof Rail ID: rock pillar, drip rail, cant rail</div>
                  <div className="rule-item"><span className="rule-dot" />+25% Roof for SUV/Van/Truck/Wagon</div>
                  <div className="rule-item"><span className="rule-dot" />USAA Matrix 2025 - full panel x dent count x size</div>
                </div>
              </div>
            </>
          )}
        </main>

        <style jsx global>{`
          *{box-sizing:border-box;margin:0;padding:0}
          body{font-family:'Sora',sans-serif;min-height:100vh}
          .app.dark{--bg:#0a0b0f;--surface:#0d0e14;--surface2:#11121a;--border:#1e2028;--border2:#2e3040;--text:#e8e6e0;--text2:#6a6d7c;--text3:#4a4d5c;--accent:#e8a020;--accent-hover:#f0b030;--accent-bg:#161408;--correct-bg:#0a1a0d;--correct-border:#1a3d20;--missing-bg:#1a1500;--missing-border:#3d3000;--incorrect-bg:#1a0d0d;--incorrect-border:#3d1515;--note-bg:#0d1020;--note-border:#1e2540;--error-bg:#1a0d0d;--error-border:#3d1515;--error-text:#e06060}
          .app.light{--bg:#f5f4f0;--surface:#fff;--surface2:#f0eeea;--border:#ddd9d0;--border2:#c4bfb5;--text:#1a1810;--text2:#6a6458;--text3:#9a9488;--accent:#c47a10;--accent-hover:#d98a18;--accent-bg:#fdf5e6;--correct-bg:#eef7f0;--correct-border:#b8dfc0;--missing-bg:#fdf8e6;--missing-border:#e0cc80;--incorrect-bg:#fdf0f0;--incorrect-border:#e0b0b0;--note-bg:#eef2fd;--note-border:#b8c8e8;--error-bg:#fdf0f0;--error-border:#e0b0b0;--error-text:#c04040}
          .app{min-height:100vh;background:var(--bg);color:var(--text);transition:background .2s,color .2s}
          header{border-bottom:1px solid var(--border);background:var(--surface)}
          .header-inner{max-width:720px;margin:0 auto;padding:20px 24px;display:flex;align-items:center;justify-content:space-between}
          .logo{display:flex;align-items:center;gap:14px}
          .logo-icon{font-size:28px;color:var(--accent);font-weight:700}
          .logo-title{font-family:'DM Mono',monospace;font-size:13px;font-weight:500;letter-spacing:.12em;color:var(--text)}
          .logo-sub{font-family:'DM Mono',monospace;font-size:10px;color:var(--text3);letter-spacing:.08em;margin-top:2px}
          .header-right{display:flex;align-items:center;gap:10px}
          .theme-toggle{background:none;border:1px solid var(--border);border-radius:6px;padding:5px 10px;font-size:12px;cursor:pointer;color:var(--text2);transition:border-color .15s}
          .theme-toggle:hover{border-color:var(--border2)}
          .header-badge{font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.15em;background:var(--accent);color:#0a0b0f;padding:3px 8px;border-radius:3px;font-weight:500}
          main{max-width:720px;margin:0 auto;padding:40px 24px 80px;display:flex;flex-direction:column;gap:20px}
          .mode-toggle{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px}
          .mode-btn{display:flex;align-items:center;padding:16px 16px;background:var(--surface);border:1px solid var(--border);border-radius:10px;cursor:pointer;transition:all .15s;text-align:left;color:var(--text)}
          .mode-btn:hover{border-color:var(--border2);background:var(--surface2)}
          .mode-btn.active{border-color:var(--accent);background:var(--accent-bg)}
          .mode-label{font-size:12px;font-weight:600;color:var(--text)}
          .mode-desc{font-size:10px;color:var(--text3);margin-top:2px}
          .section-label{font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.12em;color:var(--text3);text-transform:uppercase;margin-bottom:-10px}
          .upload-zone{border:1.5px dashed var(--border);border-radius:12px;padding:40px 24px;text-align:center;cursor:pointer;transition:all .15s;background:var(--surface)}
          .upload-zone:hover,.upload-zone.drag-over{border-color:var(--accent);background:var(--accent-bg)}
          .upload-zone.has-file{border-style:solid;border-color:var(--border2);padding:24px}
          .upload-title{font-size:14px;color:var(--text2);margin-bottom:6px}
          .upload-sub{font-family:'DM Mono',monospace;font-size:11px;color:var(--text3);letter-spacing:.1em}
          .file-selected{display:flex;flex-direction:column;align-items:center;gap:6px}
          .file-name{font-size:14px;font-weight:600;color:var(--text)}
          .file-size{font-family:'DM Mono',monospace;font-size:11px;color:var(--text3)}
          .file-change{font-size:11px;color:var(--accent);margin-top:4px}
          .form-card{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:20px;display:flex;flex-direction:column;gap:12px}
          .form-input{width:100%;padding:12px 14px;background:var(--surface2);border:1px solid var(--border);border-radius:8px;color:var(--text);font-family:'Sora',sans-serif;font-size:13px;outline:none;transition:border-color .15s}
          .form-input:focus{border-color:var(--accent)}
          .form-input::placeholder{color:var(--text3)}
          .analyze-btn{display:flex;align-items:center;justify-content:center;width:100%;padding:16px;background:var(--accent);color:#0a0b0f;border:none;border-radius:10px;font-family:'Sora',sans-serif;font-size:14px;font-weight:700;cursor:pointer;transition:all .15s}
          .analyze-btn:hover:not(:disabled){background:var(--accent-hover);transform:translateY(-1px)}
          .analyze-btn:disabled{opacity:.4;cursor:not-allowed}
          .error-box{background:var(--error-bg);border:1px solid var(--error-border);border-radius:8px;padding:14px 16px;font-size:13px;color:var(--error-text)}
          .results{background:var(--surface);border:1px solid var(--border);border-radius:12px;overflow:hidden}
          .results-header{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid var(--border);background:var(--surface2)}
          .results-title{font-size:13px;font-weight:700;letter-spacing:.05em;color:var(--accent)}
          .results-usage{font-family:'DM Mono',monospace;font-size:10px;color:var(--text3)}
          .results-body{padding:20px;display:flex;flex-direction:column;gap:10px}
          .result-item{padding:12px 14px;border-radius:8px;font-size:13px;line-height:1.5}
          .result-correct{background:var(--correct-bg);border:1px solid var(--correct-border)}
          .result-missing{background:var(--missing-bg);border:1px solid var(--missing-border)}
          .result-incorrect{background:var(--incorrect-bg);border:1px solid var(--incorrect-border)}
          .result-note{background:var(--note-bg);border:1px solid var(--note-border)}
          .result-text{background:transparent;border:none;color:var(--text2);font-size:12px}
          .result-content{color:var(--text)}
          .copy-btn{display:block;width:calc(100% - 40px);margin:0 20px 20px;padding:12px;background:transparent;border:1px solid var(--border);border-radius:8px;color:var(--text2);font-family:'Sora',sans-serif;font-size:12px;cursor:pointer;transition:all .15s}
          .copy-btn:hover{border-color:var(--border2);color:var(--text)}
          .download-btn{width:100%;padding:14px;background:var(--accent);color:#0a0b0f;border:none;border-radius:8px;font-family:'Sora',sans-serif;font-size:14px;font-weight:700;cursor:pointer;transition:all .15s}
          .download-btn:hover{background:var(--accent-hover)}
          .rules-card{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:20px}
          .rules-title{font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.15em;color:var(--text3);margin-bottom:14px;text-transform:uppercase}
          .rules-list{display:flex;flex-direction:column;gap:10px}
          .rule-item{display:flex;align-items:center;gap:10px;font-size:12px;color:var(--text2)}
          .rule-dot{width:5px;height:5px;border-radius:50%;background:var(--accent);flex-shrink:0}
        `}</style>
      </div>
    </>
  );
}
