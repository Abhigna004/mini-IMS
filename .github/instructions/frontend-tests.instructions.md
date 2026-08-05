---
applyTo: "frontend/**/*.test.jsx"
---
## Setup

```jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthContext } from '../../context/AuthContext';
import { server } from '../mocks/server'; // msw mock server

// Shared wrapper — import this in every test file
export const renderWithProviders = (ui, { user = null } = {}) => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <AuthContext.Provider value={{ user, isLoading: false }}>
        {ui}
      </AuthContext.Provider>
    </QueryClientProvider>
  );
};
```

## Rules
- Mock API calls with `msw` handlers in `tests/mocks/handlers.js` — do not mock `axiosInstance` directly
- `it()` descriptions must match `Test_ID` from `testcases_phase2_phase3.csv` (Frontend rows)
- `beforeAll(() => server.listen())` | `afterEach(() => server.resetHandlers())` | `afterAll(() => server.close())`
- Test role-gated UI: pass `{ user: { role: 'Super' } }` or `{ user: { role: 'Staff' } }` to `renderWithProviders`
