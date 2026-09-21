# API Patterns & Response Conventions

## Route Naming

All routes are prefixed with `/api/v1/`.

| Resource | Prefix |
|----------|--------|
| Auth | `/api/v1/auth` |
| Members | `/api/v1/members` |
| Programs | `/api/v1/programs` |
| Registrations | `/api/v1/registrations` |
| Gamification | `/api/v1/gamification` |

## Standard Response Envelope

Every response, success or error, uses this envelope:

```typescript
// Success
{
  "success": true,
  "data": <payload>,
  "meta": {              // optional, for paginated lists
    "total": 42,
    "page": 1,
    "limit": 20
  }
}

// Error
{
  "success": false,
  "error": "Human-readable message",
  "details": [...]       // optional, for validation errors
}
```

## Pagination

List endpoints accept `?page=1&limit=20`. Default: page 1, limit 20, max 100.

```typescript
// In service:
const skip = (page - 1) * limit;
const [items, total] = await Promise.all([
  Model.find(query).skip(skip).limit(limit),
  Model.countDocuments(query),
]);
```

## Validation Pattern

Use express-validator chains in a dedicated `validators/` file, then `validationResult` in the controller or a shared `validate` middleware.

```typescript
// middleware/validate.ts
export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, error: 'Validation failed', details: errors.array() });
  }
  next();
};
```

## Auth Middleware

```typescript
// middleware/auth.ts
// Attaches req.user = { id, role } after verifying Bearer JWT.
// Usage: router.get('/protected', authenticate, handler)
// Admin only: router.post('/admin-only', authenticate, requireRole('admin'), handler)
```

## Mongoose Query Patterns

- Always select only needed fields: `.select('name phone level')`
- Lean queries for read-only responses: `.lean()`
- Use `.session(session)` for multi-document writes that must be atomic.
