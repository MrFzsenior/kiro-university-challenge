import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  calculateLevel,
  applyPoints,
  levelRank,
  LEVEL_THRESHOLDS,
  LEVELS_ASCENDING,
} from './leveling';

/**
 * Property-based tests for the gamification leveling system.
 *
 * Each test encodes a general rule extracted from the spec requirements,
 * then fast-check throws hundreds of generated inputs at it to find any
 * input that breaks the rule.
 */
describe('leveling — property-based', () => {
  // Property: every non-negative point total maps to a valid, known level.
  it('always returns one of the defined levels', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 1_000_000 }), (points) => {
        expect(LEVELS_ASCENDING).toContain(calculateLevel(points));
      })
    );
  });

  // Property: leveling is monotonic — more points can never lower your level.
  it('is monotonic: more points never produces a lower level', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 1_000_000 }),
        fc.integer({ min: 0, max: 1_000_000 }),
        (a, b) => {
          const lower = Math.min(a, b);
          const higher = Math.max(a, b);
          expect(levelRank(calculateLevel(higher))).toBeGreaterThanOrEqual(
            levelRank(calculateLevel(lower))
          );
        }
      )
    );
  });

  // Property: any points at or above a threshold rank at least that level.
  it('respects every threshold boundary', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...LEVELS_ASCENDING),
        fc.integer({ min: 0, max: 500_000 }),
        (level, extra) => {
          const points = LEVEL_THRESHOLDS[level] + extra;
          expect(levelRank(calculateLevel(points))).toBeGreaterThanOrEqual(
            levelRank(level)
          );
        }
      )
    );
  });

  // Property: adding non-negative points never decreases the total (no free loss).
  it('applyPoints never decreases the total', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 1_000_000 }),
        fc.integer({ min: 0, max: 1_000_000 }),
        (current, delta) => {
          expect(applyPoints(current, delta)).toBeGreaterThanOrEqual(current);
        }
      )
    );
  });

  // Property: applyPoints is exactly additive.
  it('applyPoints adds the delta exactly', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 1_000_000 }),
        fc.integer({ min: 0, max: 1_000_000 }),
        (current, delta) => {
          expect(applyPoints(current, delta)).toBe(current + delta);
        }
      )
    );
  });

  // Property: applyPoints rejects negative deltas (points can't be silently removed).
  it('applyPoints rejects negative deltas', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 1_000_000 }), fc.integer({ max: -1 }), (current, delta) => {
        expect(() => applyPoints(current, delta)).toThrow();
      })
    );
  });

  // Property: order of point awards does not change the final level (commutative).
  it('final level is independent of the order points are awarded', () => {
    fc.assert(
      fc.property(fc.array(fc.integer({ min: 0, max: 10_000 }), { maxLength: 20 }), (awards) => {
        const forward = awards.reduce((sum, x) => applyPoints(sum, x), 0);
        const reversed = [...awards].reverse().reduce((sum, x) => applyPoints(sum, x), 0);
        expect(calculateLevel(forward)).toBe(calculateLevel(reversed));
      })
    );
  });
});
