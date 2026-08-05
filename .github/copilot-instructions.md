# Mini-IMS
Stack: Node.js 20 + Express + mysql2/promise | React 18 + Vite + TanStack Query + React Hook Form + Bootstrap 5
Jira: taopractice2004.atlassian.net | project key: MI | Confluence space: MiniIMScon

## API Response Shape (ALL endpoints)
Success: `{ success: true, data: {}, pagination?: { total, page, limit, totalPages }, message?: "" }`
Error:   `{ success: false, error: "message" }`
HTTP codes: 400 validation | 401 unauth | 403 forbidden | 404 not found | 409 conflict | 500 server

## Backend Non-Negotiables
- SQL: `pool.execute(sql, [params])` ONLY — never string concatenation
- Async handlers: wrap with `asyncWrapper()` from `utils/asyncWrapper.js`
- Errors: `throw new AppError('msg', statusCode)` — caught by central `errorHandler`
- Auth: `authenticateToken` on all protected routes + `requireRole('Super')` on admin-only routes
- Transactions: fetch unit prices from DB — never trust client-submitted prices
- Refresh tokens: store SHA-256 hash only — never raw token value
- LIKE queries: always parameterized (`WHERE col LIKE ?` with `['%value%']`)

## Frontend Non-Negotiables
- HTTP: `import api from '../api/axiosInstance'` — never raw axios
- Auth state: `const { user } = useAuth()` from `../hooks/useAuth`
- Role guard: `{user?.role === 'Super' && <Component />}`
- All API call functions live in `frontend/src/api/<module>Api.js`
