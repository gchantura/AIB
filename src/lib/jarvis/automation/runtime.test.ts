import { describe, expect, it } from 'vitest';
import { nextRun } from './runtime.js';

describe('nextRun', () => {
  const from = new Date('2026-07-08T10:30:00.000Z');

  it('supports interval, hourly, daily, and future ISO schedules', () => {
    expect(nextRun('every 15 minutes', from)).toBe('2026-07-08T10:45:00.000Z');
    expect(nextRun('hourly', from)).toBe('2026-07-08T11:00:00.000Z');
    expect(nextRun('daily', from)).toBe('2026-07-09T06:00:00.000Z');
    expect(nextRun('2026-07-09T12:00:00.000Z', from)).toBe('2026-07-09T12:00:00.000Z');
  });

  it('rejects invalid and past schedules', () => {
    expect(() => nextRun('sometimes', from)).toThrow(/Schedule must be/);
    expect(() => nextRun('2026-01-01T00:00:00.000Z', from)).toThrow(/Schedule must be/);
  });
});
