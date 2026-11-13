/**
 * PatternProof Cloud | early deterministic JSON checker.
 * This is a limited consistency check, not proof that a crochet pattern works.
 * All examples must be synthetic; authentication/persistence are not implemented.
 */
export type PatternRow = {
  number: number;
  stitches: string[];
  declaredCount: number;
};

export type PatternInput = {
  name: string;
  rows: PatternRow[];
};

export type Issue = {
  code: 'INVALID_INPUT' | 'MISSING_ROW' | 'DUPLICATE_ROW' | 'COUNT_MISMATCH' | 'UNSUPPORTED_STITCH';
  row?: number;
  message: string;
};

export type ValidationReport = {
  patternName: string;
  checkedRows: number;
  issues: Issue[];
  status: 'pass' | 'needs-review';
};

// Each listed token is treated as one stitch for this early demonstration only.
const ALLOWED = new Set(['sc', 'hdc', 'dc', 'tr', 'slst']);

export function validatePattern(payload: unknown): ValidationReport {
  const invalid = (message: string): ValidationReport => ({
    patternName: 'Untitled pattern', checkedRows: 0,
    issues: [{ code: 'INVALID_INPUT', message }], status: 'needs-review'
  });

  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return invalid('Expected a JSON object with name and rows.');
  }
  const p = payload as Record<string, unknown>;
  if (typeof p.name !== 'string' || p.name.trim().length === 0 || p.name.length > 120) {
    return invalid('Pattern name must be 1–120 characters.');
  }
  if (!Array.isArray(p.rows) || p.rows.length === 0 || p.rows.length > 50) {
    return invalid('Rows must contain between 1 and 50 entries.');
  }
  for (const raw of p.rows) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
      return invalid('Each row must be an object.');
    }
    const row = raw as Record<string, unknown>;
    if (!Number.isInteger(row.number) || (row.number as number) < 1 || (row.number as number) > 1000 ||
        !Number.isInteger(row.declaredCount) || (row.declaredCount as number) < 0 || (row.declaredCount as number) > 500 ||
        !Array.isArray(row.stitches) || row.stitches.length > 500 ||
        !row.stitches.every((s: unknown) => typeof s === 'string' && s.length > 0 && s.length <= 20)) {
      return invalid('Each row requires a positive row number, a nonnegative declaredCount, and up to 500 short stitch tokens.');
    }
  }

  const rows = p.rows as PatternRow[];
  const issues: Issue[] = [];
  const seen = new Set<number>();
  let maxRow = 0;
  for (const row of rows) {
    if (seen.has(row.number)) {
      issues.push({ code: 'DUPLICATE_ROW', row: row.number, message: `Row ${row.number} appears more than once.` });
    }
    seen.add(row.number);
    maxRow = Math.max(maxRow, row.number);
    const unknown = [...new Set(row.stitches.filter((stitch) => !ALLOWED.has(stitch)))];
    if (unknown.length) {
      issues.push({ code: 'UNSUPPORTED_STITCH', row: row.number,
        message: `Row ${row.number} uses unsupported tokens: ${unknown.join(', ')}. Count cannot be verified for this row.` });
    } else if (row.stitches.length !== row.declaredCount) {
      issues.push({ code: 'COUNT_MISMATCH', row: row.number,
        message: `Row ${row.number} declares ${row.declaredCount} stitches but lists ${row.stitches.length}.` });
    }
  }
  // Limit the reporting range; rows greater than 50 are valid but this example warns about skipped rows up to max.
  for (let n = 1; n <= maxRow; n++) {
    if (!seen.has(n)) {
      issues.push({ code: 'MISSING_ROW', row: n, message: `Row ${n} is missing.` });
    }
  }
  return {
    patternName: p.name.trim(),
    checkedRows: rows.length,
    issues,
    status: issues.length ? 'needs-review' : 'pass'
  };
}
