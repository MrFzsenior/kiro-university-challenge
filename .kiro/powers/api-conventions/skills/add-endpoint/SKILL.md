# Skill: Add a new API endpoint

Use this skill when adding a new endpoint to the Sports Club Management API. It encodes the project's layering rules so new code stays consistent with the existing codebase.

## When to use

Trigger this skill whenever the task involves adding or changing a route, controller, service, or Mongoose model.

## The layering rule

Every request flows through four layers, in this exact order:

```
route → controller → service → model
```

- **Route** (`src/routes/*.routes.ts`) — declares the path, attaches middleware (`authenticate`, `requireRole`, validators, `validate`), and points to a controller function.
- **Controller** (`src/controllers/*.controller.ts`) — parses `req`, calls one service function, sends the response. No business logic. No direct model access.
- **Service** (`src/services/*.service.ts`) — owns all business logic. Never imports `req`/`res`. Throws via `createError(message, statusCode)`.
- **Model** (`src/models/*.model.ts`) — Mongoose schema plus TypeScript interface.

## Steps to add an endpoint

1. **Model** — if a new resource, create `src/models/<name>.model.ts` exporting the interface and the model. Add indexes for any uniqueness or query needs.
2. **Service** — add a function in the matching `*.service.ts`. Pure domain logic that can be tested goes in `src/domain/`.
3. **Controller** — add a thin handler wrapped in try/catch that calls the service and forwards errors with `next(err)`.
4. **Route** — wire the path with validators and auth middleware.
5. **Verify** — run `npx tsc --noEmit` and `npm test`.

## Response envelope

Always respond with the standard shape:

```json
{ "success": true, "data": <payload>, "meta": { "total": 0, "page": 1, "limit": 20 } }
{ "success": false, "error": "message" }
```

## Reference

See `references/checklist.md` for a copy-paste checklist.
