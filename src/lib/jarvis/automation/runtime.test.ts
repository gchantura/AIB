import { describe, expect, it } from 'vitest';
import { nextRun, calculateNextRun } from './runtime.js';

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

describe('calculateNextRun', () => {
  const base = new Date('2026-07-08T12:00:00.000Z');

  it('calculates preset intervals correctly', () => {
    expect(calculateNextRun(base, 'hourly').toISOString()).toBe('2026-07-08T13:00:00.000Z');
    expect(calculateNextRun(base, 'daily').toISOString()).toBe('2026-07-09T12:00:00.000Z');
    expect(calculateNextRun(base, 'weekly').toISOString()).toBe('2026-07-15T12:00:00.000Z');
  });

  it('calculates custom intervals correctly', () => {
    expect(calculateNextRun(base, 'custom_25_minutes').toISOString()).toBe('2026-07-08T12:25:00.000Z');
    expect(calculateNextRun(base, 'custom_3_hours').toISOString()).toBe('2026-07-08T15:00:00.000Z');
    expect(calculateNextRun(base, 'custom_4_days').toISOString()).toBe('2026-07-12T12:00:00.000Z');
    expect(calculateNextRun(base, 'custom_2_weeks').toISOString()).toBe('2026-07-22T12:00:00.000Z');
    expect(calculateNextRun(base, 'custom_3_months').toISOString()).toBe('2026-10-08T12:00:00.000Z');
  });
});


