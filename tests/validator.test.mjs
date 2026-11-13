import test from 'node:test';
import assert from 'node:assert/strict';
import { validatePattern } from '../src/lib/validator.ts';

const row = (number, stitches, declaredCount) => ({number, stitches, declaredCount});
test('accepts a consistent structured sample', () => {
  const r = validatePattern({name:'Sample',rows:[row(1,['sc','hdc'],2),row(2,['dc'],1)]});
  assert.equal(r.status,'pass');
  assert.equal(r.issues.length,0);
});
test('reports missing row numbers', () => {
  const r = validatePattern({name:'Sample',rows:[row(1,['sc'],1),row(3,['sc'],1)]});
  assert.ok(r.issues.some(i=>i.code==='MISSING_ROW' && i.row===2));
});
test('reports declared stitch-count mismatch', () => {
  const r = validatePattern({name:'Sample',rows:[row(1,['sc','sc'],3)]});
  assert.ok(r.issues.some(i=>i.code==='COUNT_MISMATCH'));
});
test('rejects invalid input without throwing', () => {
  const r = validatePattern({name:'',rows:[]});
  assert.equal(r.issues[0].code,'INVALID_INPUT');
});
test('flags unsupported stitch tokens without pretending to count them', () => {
  const r = validatePattern({name:'Sample',rows:[row(1,['sc','inc'],2)]});
  assert.ok(r.issues.some(i=>i.code==='UNSUPPORTED_STITCH'));
  assert.equal(r.issues.some(i=>i.code==='COUNT_MISMATCH'),false);
});
test('flags duplicate rows', () => {
  const r = validatePattern({name:'Sample',rows:[row(1,['sc'],1),row(1,['sc'],1)]});
  assert.ok(r.issues.some(i=>i.code==='DUPLICATE_ROW'));
});
