---
agent: agent
description: Standalone code, security, and regression review for a file, module, or ticket.
---
Review target: **$target** (file path, module name, or Jira ticket key)

If a ticket key is provided: fetch `$target` from Jira to understand the intended scope before reviewing.

---

## SECURITY (output PASS/FAIL + one-line reason if FAIL)

| Check | Result |
|---|---|
| No SQL string concatenation — parameterized queries only | |
| No hardcoded credentials, secrets, or API keys | |
| All inputs validated with express-validator before any DB or business logic call | |
| `authenticateToken` on every protected route | |
| `requireRole('Super')` on every admin-only route | |
| No sensitive data in API responses (no passwords, no raw tokens, no internal stack traces) | |
| bcrypt cost factor ≥ 12 for password hashing | |
| Refresh tokens stored as SHA-256 hash only | |

## CODE QUALITY (output PASS/FAIL + one-line reason if FAIL)

| Check | Result |
|---|---|
| Response shape matches copilot-instructions.md (success/data/pagination) | |
| `asyncWrapper` used on every async Express handler | |
| Errors thrown via `AppError` — not via inline `res.status().json()` | |
| No function exceeds 40 lines | |
| Single responsibility per function | |
| No dead code or unused imports | |

## REGRESSION (output PASS/FAIL + one-line reason if FAIL)

| Check | Result |
|---|---|
| Existing tests still pass: run `npm test -- --testPathPattern=<module> --forceExit` | |
| No behaviour changes in modules outside the ticket's declared scope | |
| Route registration correct — no duplicate or missing route mounts | |

---

**Summary (3 lines exactly):**
1. What is correct and well-implemented
2. What needs fixing (with specific file + approximate line number)
3. Recommended next action (e.g. "Fix SQL concat on line 34 of itemsController.js then re-run tests")
