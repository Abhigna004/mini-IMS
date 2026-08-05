---
applyTo: "backend/**/*.test.js"
---
## Test Setup

```js
import request from 'supertest';
import app from '../../src/app.js';
import { getToken } from '../helpers/auth.js'; // logs in, returns Bearer token string
```

## Pattern

```js
describe('POST /api/route', () => {
  it('TC_P2_001: descriptive name from testcases CSV', async () => {
    const token = await getToken('Super'); // or 'Staff'
    const res = await request(app)
      .post('/api/route')
      .set('Authorization', `Bearer ${token}`)
      .send({ field: 'value' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
  });
});
```

## Rules
- Test DB: use `process.env.DB_NAME_TEST` — seed in `beforeAll`, truncate test data in `afterAll`
- `it()` descriptions must match `Test_ID` from `testcases_phase2_phase3.csv`
- One test file per module: `auth.test.js` | `items.test.js` | `admins.test.js` | `transactions.test.js`
- Negative tests: assert `res.status` is the expected error code AND `res.body.success === false`
- Security tests: assert the response contains no password hashes, raw tokens, or internal stack traces
