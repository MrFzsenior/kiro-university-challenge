# Implementation Tasks: Program Registration

## Phase 1 — Core Models & DB

- [ ] Create `src/models/program.model.ts` with Mongoose schema and TypeScript interface
- [ ] Create `src/models/registration.model.ts` with compound unique index `{ member, program }`
- [ ] Create `src/models/member.model.ts` with role, phone, OTP fields, and gamification points

## Phase 2 — Auth

- [ ] Create `src/services/auth.service.ts` — OTP generation, verification, JWT issue
- [ ] Create `src/middleware/auth.ts` — Bearer token validation, attach `req.user`
- [ ] Create `src/middleware/requireRole.ts` — role guard middleware
- [ ] Create `src/routes/auth.routes.ts` and `src/controllers/auth.controller.ts`

## Phase 3 — Programs

- [ ] Create `src/services/program.service.ts` with list and create methods
- [ ] Create `src/controllers/program.controller.ts`
- [ ] Create `src/routes/program.routes.ts`

## Phase 4 — Registrations

- [ ] Create `src/services/registration.service.ts` with atomic register, approve, reject, cancel
- [ ] Create `src/services/gamification.service.ts` with `addPoints()` and `getPoints()`
- [ ] Create `src/controllers/registration.controller.ts`
- [ ] Create `src/routes/registration.routes.ts`

## Phase 5 — Bootstrap & Middleware

- [ ] Create `src/middleware/errorHandler.ts` — global error handler
- [ ] Create `src/middleware/validate.ts` — express-validator result checker
- [ ] Create `src/index.ts` — connect DB, mount routes, attach error handler

## Phase 6 — Tests

- [ ] Write unit tests for `registration.service.ts` (capacity check, duplicate guard)
- [ ] Write unit tests for `gamification.service.ts` (point award logic)
