---
applyTo: "backend/src/**"
---
## Schema quirks (from 1410inventory.sql — MI-15 analysis)
- `admin.account_status`, `admin.deleted`, `transactions.cancelled`, `transactions.transType` are `char(1)` — use string `'0'`/`'1'`, never integers
- `transactions.ref` is `varchar(10)` — max 10 chars. Use format `T` + 9 alphanumeric chars (e.g. `TK7M3P9XZ`)
- `admin.id` is `int(3)` — FK columns in new tables must be `INT NOT NULL`
- `event_log.admin_id` is nullable (FAILED_LOGIN events have no admin)
- `items.name` has UNIQUE constraint; `items.code` has UNIQUE constraint
- All datetime comparisons: use `DATE(transDate) = CURDATE()` not string comparisons

- Pool: `import pool from '../db/pool.js'` (adjust relative depth per file)
- Validation: `express-validator` — call `validationResult(req)` at top of every handler before any DB call
- Single queries: `pool.execute(sql, [params])`
- Multi-step atomic operations: `pool.getConnection()` → `conn.beginTransaction()` → queries → `conn.commit()` / `conn.rollback()` → `conn.release()`
- Stock ops: `import { decrementStock, incrementStock } from '../utils/stockUtils.js'` — pass `conn` (not pool) when inside a transaction
- Audit logging: applied at router level via `auditLog(entityName)` factory middleware — never inside individual handlers
- Route registration: every new router file must be mounted in `backend/src/app.js`
- Secrets: read exclusively from `process.env` — never hardcode
