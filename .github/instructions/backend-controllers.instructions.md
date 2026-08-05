---
applyTo: "backend/src/controllers/**"
---
## Exact Pattern — replicate for every handler

```js
export const listItems = asyncWrapper(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) throw new AppError(errors.array()[0].msg, 400);

  const { page = 1, limit = 10, orderBy = 'id', orderFormat = 'ASC' } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  const [[{ total }]] = await pool.execute('SELECT COUNT(*) AS total FROM table WHERE deleted=0', []);
  const [rows] = await pool.execute(
    `SELECT ... FROM table WHERE deleted=0 ORDER BY ${orderBy} ${orderFormat} LIMIT ? OFFSET ?`,
    [Number(limit), offset]
  );

  res.json({
    success: true,
    data: rows,
    pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) }
  });
});
```

## Rules
- Named exports only — no default exports, no class syntax
- `orderBy`/`orderFormat` in SQL: whitelist-validated before interpolation. Allowed fields defined per controller.
- `cumulativeTotal` (items only): add `SELECT SUM(unitPrice * quantity) AS cumulativeTotal FROM items` as a second query
- 201 for POST (created), 200 for GET/PUT/PATCH/DELETE
- Soft-delete check: `WHERE deleted = 0` on all list/get queries for `admin` table
- `req.user.sub` = the authenticated admin's ID (from JWT payload)
