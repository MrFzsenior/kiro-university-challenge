/**
 * Pure domain logic for program registration capacity rules.
 * Extracted from the program-registration spec so it can be
 * property-tested without a database.
 */

export type ProgramStatus = 'upcoming' | 'ongoing' | 'full' | 'cancelled';

export interface CapacityState {
  capacity: number;
  registeredCount: number;
  status: ProgramStatus;
}

/** A program accepts registrations only when open and not yet full. */
export const canRegister = (state: CapacityState): boolean =>
  (state.status === 'upcoming' || state.status === 'ongoing') &&
  state.registeredCount < state.capacity;

/**
 * Apply a single successful registration to a capacity state.
 * Throws if the program cannot accept the registration.
 * Auto-flips status to 'full' when the last slot is taken.
 */
export const registerOne = (state: CapacityState): CapacityState => {
  if (!canRegister(state)) {
    throw new Error('Program cannot accept registration');
  }
  const registeredCount = state.registeredCount + 1;
  const status: ProgramStatus =
    registeredCount >= state.capacity ? 'full' : state.status;
  return { ...state, registeredCount, status };
};

/** Free one slot (e.g. member cancels a pending registration). */
export const cancelOne = (state: CapacityState): CapacityState => {
  const registeredCount = Math.max(0, state.registeredCount - 1);
  // Reopening a previously-full program returns it to 'ongoing'.
  const status: ProgramStatus =
    state.status === 'full' && registeredCount < state.capacity
      ? 'ongoing'
      : state.status;
  return { ...state, registeredCount, status };
};
