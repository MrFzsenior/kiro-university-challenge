# Feature Spec: Program Registration

## Overview

Members can browse available sports programs and register for them. Registration enforces capacity limits, prevents duplicate sign-ups, and triggers gamification point awards on confirmation.

---

## Requirements

### Functional Requirements

1. **Browse programs**
   - Any authenticated user can list programs filtered by status (`upcoming`, `ongoing`, `full`, `cancelled`).
   - Each program exposes: title, description, difficulty, start date, capacity, registered count, price, and status.

2. **Register for a program**
   - A member can submit a registration for a program that is `upcoming` or `ongoing`.
   - The system must reject registration if the program is at full capacity.
   - The system must reject duplicate registrations (same member, same program).
   - Registration starts in `pending` status and must be confirmed by an admin.

3. **Admin confirmation**
   - An admin can approve or reject a registration.
   - On approval, the system awards points to the member (value defined per program).
   - On rejection, the registration status becomes `rejected` with an optional reason.

4. **Cancellation**
   - A member can cancel their own registration if status is `pending`.
   - Cancellation of an `approved` registration requires admin action.

5. **My registrations**
   - A member can list all their own registrations with status and program details.

### Non-Functional Requirements

- Registration creation must be atomic: capacity check and record insert in one MongoDB session to prevent race conditions.
- All list endpoints must be paginated.
- Response times under 300ms for list endpoints (no heavy aggregations in the request path).

---

## Out of Scope (for this spec)

- Payment processing
- Waiting list
- Email/SMS notifications (can be added as a hook later)
