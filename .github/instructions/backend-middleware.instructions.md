---
applyTo: "backend/src/middleware/**"
---
## Middleware Contracts

**`asyncWrapper(fn)`** — `utils/asyncWrapper.js`
```js
export const asyncWrapper = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
```

**`authenticateToken(req, res, next)`**
- Reads `Authorization: Bearer <token>`
- Verifies with `JWT_SECRET` from env via `jsonwebtoken.verify()`
- Attaches decoded payload to `req.user = { sub, email, role }`
- Throws `AppError('No token provided', 401)` if missing; `AppError('Invalid token', 401)` if invalid/expired

**`requireRole(role)`** — factory
- Returns `(req, res, next) =>` middleware
- Checks `req.user.role === role`; throws `AppError('Insufficient permissions', 403)` if mismatch
- Usage: `router.post('/items', authenticateToken, requireRole('Super'), handler)`

**`auditLog(entity)`** — factory
- Returns middleware applied at router level
- On UPDATE/DELETE: queries current state *before* `next()`; queries new state *after* response
- Inserts into `audit_log`: `{ admin_id: req.user.sub, action, entity, entity_id, old_values (JSON), new_values (JSON), timestamp }`

**`errorHandler(err, req, res, next)`** — final middleware in `app.js`
- `err instanceof AppError` → use `err.statusCode` and `err.message`
- Otherwise → 500 with generic message; log full error to console
