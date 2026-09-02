import { describe, expect, it } from 'vitest';
import {
  formatTrackingDate,
  generateTrackingCode,
  isValidTrackingCodeFormat,
} from './tracking-code.generator.js';

describe('generateTrackingCode', () => {
  it('generates a code with ENV- prefix, YYYYMMDD date and 4-char uppercase suffix', () => {
    const date = new Date(2026, 8, 2);
    const code = generateTrackingCode(date);

    expect(code.startsWith('ENV-')).toBe(true);
    expect(code).toContain(`ENV-${formatTrackingDate(date)}-`);
    expect(isValidTrackingCodeFormat(code)).toBe(true);
  });
});
