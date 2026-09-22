# Design: Program Registration

## Data Models

### Program

```typescript
interface IProgram {
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  startDate: Date;
  endDate: Date;
  capacity: number;
  registeredCount: number;      // incremented atomically on registration
  pointsOnCompletion: number;   // awarded when admin approves
  price: number;
  status: 'upcoming' | 'ongoing' | 'full' | 'cancelled';
  createdBy: ObjectId;          // ref: Member (admin)
  createdAt: Date;
  updatedAt: Date;
}
```

### Registration

```typescript
interface IRegistration {
  member: ObjectId;             // ref: Member
  program: ObjectId;            // ref: Program
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  rejectionReason?: string;
  pointsAwarded: number;        // 0 until approved
  registeredAt: Date;
  updatedAt: Date;
}

// Unique index: { member, program } — prevents duplicates at DB level
```

---

## Service Layer

### `ProgramService`

- `listPrograms(filters, pagination)` — query with optional status filter
- `getProgramById(id)` — single program or throw 404
- `createProgram(dto, adminId)` — admin only
- `updateProgramStatus(id, status)` — admin only

### `RegistrationService`

- `register(memberId, programId)` — atomic: check capacity → insert registration → increment `registeredCount` using a MongoDB session
- `confirmRegistration(registrationId, adminId)` — approve: set status, award points via `GamificationService.addPoints()`
- `rejectRegistration(registrationId, adminId, reason)` — set status + reason
- `cancelRegistration(registrationId, memberId)` — member can cancel `pending` only
- `getMyRegistrations(memberId, pagination)` — populate program fields

---

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/programs` | member | List programs |
| GET | `/api/v1/programs/:id` | member | Get single program |
| POST | `/api/v1/programs` | admin | Create program |
| POST | `/api/v1/registrations` | member | Register for program |
| GET | `/api/v1/registrations/me` | member | My registrations |
| PATCH | `/api/v1/registrations/:id/cancel` | member | Cancel registration |
| PATCH | `/api/v1/registrations/:id/approve` | admin | Approve registration |
| PATCH | `/api/v1/registrations/:id/reject` | admin | Reject registration |

---

## Key Implementation Notes

- Use `mongoose.startSession()` + `session.withTransaction()` in `register()` to avoid race conditions on `registeredCount`.
- The `{ member, program }` unique index on `Registration` is the safety net against double registration.
- `GamificationService.addPoints()` is called inside the same transaction as registration approval so points are never awarded for a failed save.

---

## Property-Based Tests

The following invariants are extracted from the requirements and enforced with fast-check (see `src/domain/*.test.ts`). Pure domain logic lives in `src/domain/` so it can be tested without a database.

### Capacity invariants (`capacity.ts`)

- `registeredCount` never exceeds `capacity` after any registration.
- Registration throws when a program is `cancelled`, `full`, or already at capacity.
- Taking the last slot flips status to `full`.
- Register then cancel is a round-trip: the count returns to its original value.
- Filling an empty program stops exactly at capacity — never one more.

### Leveling invariants (`leveling.ts`)

- Every non-negative point total maps to a known level.
- Leveling is monotonic: more points never lowers a member's level.
- Point awards are additive and commutative — order does not change the final level.
- Negative point deltas are rejected (points can't be silently removed).
