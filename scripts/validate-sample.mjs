import { validatePattern } from '../src/lib/validator.ts';

// Synthetic example, safe to use in demonstrations.
const result = validatePattern({
  name: 'Synthetic sample',
  rows: [
    { number: 1, stitches: ['sc', 'sc', 'sc'], declaredCount: 3 },
    { number: 3, stitches: ['hdc', 'hdc'], declaredCount: 3 }
  ]
});
console.log(JSON.stringify(result, null, 2));
