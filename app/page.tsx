'use client';
import { useState } from 'react';
import type { ValidationReport } from '@/lib/validator';

const example = JSON.stringify({
  name: 'Synthetic sample',
  rows: [
    { number: 1, stitches: ['sc', 'sc', 'sc'], declaredCount: 3 },
    { number: 3, stitches: ['hdc', 'hdc'], declaredCount: 3 }
  ]
}, null, 2);

export default function Home() {
  const [input, setInput] = useState(example);
  const [result, setResult] = useState<ValidationReport | null>(null);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  async function check() {
    setPending(true); setError(''); setResult(null);
    try {
      const response = await fetch('/api/validate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: input
      });
      const json = await response.json();
      if (!response.ok && !json.issues) throw new Error(json.error || 'Validation failed.');
      setResult(json);
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to check sample.'); }
    finally { setPending(false); }
  }

  return <main className="shell">
    <div className="tag">PatternProof Cloud · Week 3 prototype</div>
    <h1>Check a structured crochet pattern sample.</h1>
    <p>Paste a JSON pattern to check row numbering and declared stitch totals. This early checker supports only simple stitch tokens and does not prove that a real pattern will work.</p>
    <section className="panel">
      <label htmlFor="pattern"><strong>Sample pattern (JSON)</strong></label>
      <p className="small">Allowed one-stitch tokens: sc, hdc, dc, tr, slst. Do not submit real customer files.</p>
      <textarea id="pattern" value={input} onChange={(e)=>setInput(e.target.value)} spellCheck={false} />
      <button onClick={check} disabled={pending}>{pending ? 'Checking…' : 'Validate sample'}</button>
    </section>
    {error && <section className="panel error" role="alert">{error}</section>}
    {result && <section className="panel" aria-live="polite">
      <strong className={result.status === 'pass' ? 'pass' : undefined}>Result: {result.status === 'pass' ? 'No listed issues' : 'Needs review'}</strong>
      <p>{result.patternName} · {result.checkedRows} rows checked · {result.issues.length} issues</p>
      {result.issues.map((issue, index) => <div className="issue" key={`${issue.code}-${index}`}><strong>{issue.code}</strong>: {issue.message}</div>)}
    </section>}
  </main>;
}
