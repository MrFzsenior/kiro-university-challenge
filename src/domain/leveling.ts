/**
 * Pure domain logic for the gamification leveling system.
 * No database or framework dependencies — safe for property-based testing.
 */

export const LEVEL_THRESHOLDS = {
  beginner: 0,
  amateur: 100,
  pro: 500,
  master: 1500,
} as const;

export type Level = keyof typeof LEVEL_THRESHOLDS;

/** Levels ordered from lowest to highest. */
export const LEVELS_ASCENDING: Level[] = ['beginner', 'amateur', 'pro', 'master'];

/**
 * Determine a member's level from their total points.
 * Points below zero are treated as zero (beginner).
 */
export const calculateLevel = (points: number): Level => {
  if (points >= LEVEL_THRESHOLDS.master) return 'master';
  if (points >= LEVEL_THRESHOLDS.pro) return 'pro';
  if (points >= LEVEL_THRESHOLDS.amateur) return 'amateur';
  return 'beginner';
};

/**
 * Add points to a running total. Points added must be non-negative;
 * the result never goes below the starting total.
 */
export const applyPoints = (current: number, delta: number): number => {
  if (delta < 0) throw new Error('Points delta must be non-negative');
  return current + delta;
};

/** Numeric rank of a level, useful for monotonicity checks. */
export const levelRank = (level: Level): number => LEVELS_ASCENDING.indexOf(level);
