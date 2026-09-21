# Sports Club Management API — Project Steering

## What This Project Is

A RESTful API for managing sports club operations: member registration, program scheduling, OTP-based authentication, and a gamification layer (points, levels, badges). Built with Node.js, TypeScript, Express, and MongoDB.

## Tech Stack & Libraries

- **Runtime:** Node.js 20+
- **Language:** TypeScript (strict mode, no `any`)
- **Framework:** Express 4
- **ODM:** Mongoose 8
- **Auth:** JWT (jsonwebtoken) + OTP (6-digit, 5-min TTL)
- **Validation:** express-validator
- **Testing:** Vitest
- **Dev server:** tsx watch

Never introduce new dependencies without checking `package.json` first.

## Project Structure

```
src/
├── controllers/    # One file per resource. Only HTTP in/out — no business logic.
├── models/         # Mongoose schemas and TypeScript interfaces.
├── routes/         # Express routers. Mount in src/index.ts.
├── services/       # All business logic lives here. Controllers call services.
├── middleware/      # auth.ts, validate.ts, errorHandler.ts
└── index.ts        # App bootstrap: DB connect, middleware, routes, error handler.
```

## Code Conventions

- **Controllers** are thin: parse request → call service → send response.
- **Services** own all logic. Never import `req`/`res` in a service.
- **Models** export both the Mongoose document interface and the model.
- All async route handlers must be wrapped in try/catch or use an async wrapper.
- Use `next(error)` to forward errors to the global error handler.
- HTTP status codes: 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 409 Conflict, 500 Internal Server Error.
- All responses follow this shape:
  ```json
  { "success": true, "data": { ... } }
  { "success": false, "error": "message" }
  ```

## Naming Conventions

- Files: `kebab-case.ts`
- Classes/Interfaces: `PascalCase`
- Functions/variables: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- MongoDB collections: plural, lowercase (e.g. `members`, `programs`)

## Environment Variables

All config comes from `.env` via `dotenv`. Never hardcode secrets. Required vars:
- `PORT`, `NODE_ENV`, `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `OTP_EXPIRES_MINUTES`

## Authentication

- OTP flow: `POST /api/auth/otp/request` → `POST /api/auth/otp/verify` → JWT
- Protect routes with `src/middleware/auth.ts` which validates the Bearer token.
- Two roles: `member` and `admin`. Role check happens in middleware, not controllers.

## Error Handling

- Global error handler in `src/middleware/errorHandler.ts` catches everything.
- Mongoose validation errors → 400. Duplicate key errors → 409. JWT errors → 401.
- Never leak stack traces in production (`NODE_ENV === 'production'`).

## Testing

- Test files live next to source: `src/services/member.service.test.ts`
- Run with `npm test` (vitest --run, no watch mode)
- Test business logic in services, not controllers.
