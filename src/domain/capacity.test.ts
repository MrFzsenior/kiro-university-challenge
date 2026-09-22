import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { canRegister, registerOne, cancelOne, CapacityState, ProgramStatus } from './capacity';

const STATUSES: ProgramStatus[] = ['upcoming', 'ongoing', 'full', 'cancelled'];

const arbState = (): fc.Arbitrary<CapacityState> =>
  fc
    .record({
      capacity: fc.integer({ min: 1, max: 1000 }),
      registeredCount: fc.integer({ min: 0, max: 1000 }),
      status: fc.constantFrom(...STATUSES),
    })
    // Keep registeredCount within capacity for a valid starting state.
    .map((s) => ({ ...s, registeredCount: Math.min(s.registeredCount, s.capacity) }));

/**
 * Property-based tests for registration capacity — the core invariant
 * from the spec: a program never exceeds its capacity, and status stays
 * consistent with the registered count.
 */
describe('capacity — property-based', () => {
  // Property: registeredCount must never exceed capacity, ever.
  it('registerOne never lets registeredCount exceed capacity', () => {
    fc.assert(
      fc.property(arbState(), (state) => {
        if (canRegister(state)) {
          const next = registerOne(state);
          expect(next.registeredCount).toBeLessThanOrEqual(next.capacity);
        }
      })
    );
  });

  // Property: you cannot register on a closed or full program.
  it('registerOne throws when the program is not open', () => {
    fc.assert(
      fc.property(arbState(), (state) => {
        if (!canRegister(state)) {
          expect(() => registerOne(state)).toThrow();
        }
      })
    );
  });

  // Property: taking the last slot flips status to 'full'.
  it('reaching capacity flips status to full', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 1000 }), (capacity) => {
        const state: CapacityState = {
          capacity,
          registeredCount: capacity - 1,
          status: 'ongoing',
        };
        const next = registerOne(state);
        expect(next.registeredCount).toBe(capacity);
        expect(next.status).toBe('full');
      })
    );
  });

  // Property: register then cancel returns to the original count (round-trip).
  it('registerOne followed by cancelOne restores the count', () => {
    fc.assert(
      fc.property(arbState(), (state) => {
        if (canRegister(state)) {
          const after = cancelOne(registerOne(state));
          expect(after.registeredCount).toBe(state.registeredCount);
        }
      })
    );
  });

  // Property: cancelOne never produces a negative count.
  it('cancelOne never produces a negative count', () => {
    fc.assert(
      fc.property(arbState(), (state) => {
        expect(cancelOne(state).registeredCount).toBeGreaterThanOrEqual(0);
      })
    );
  });

  // Property: registering N times on an empty program fills exactly to capacity, no more.
  it('filling an empty program stops exactly at capacity', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 200 }), (capacity) => {
        let state: CapacityState = { capacity, registeredCount: 0, status: 'ongoing' };
        let successful = 0;
        for (let i = 0; i < capacity + 10; i++) {
          if (!canRegister(state)) break;
          state = registerOne(state);
          successful++;
        }
        expect(successful).toBe(capacity);
        expect(state.registeredCount).toBe(capacity);
        expect(state.status).toBe('full');
      })
    );
  });
});
