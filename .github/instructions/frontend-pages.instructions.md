---
applyTo: "frontend/src/pages/**"
---
## Page Pattern

```jsx
export default function ModulePage() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey: ['module', page],
    queryFn: () => moduleApi.getAll({ page, limit: 10 })
  });

  const mutation = useMutation({
    mutationFn: moduleApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['module'] })
  });

  if (isLoading) return <Spinner />;  // reusable component from components/
  if (error)     return <ErrorAlert message={error.message} />;

  return ( /* JSX */ );
}
```

## Rules
- Table serial numbers: `(page - 1) * limit + index + 1`
- Modals: local `useState(false)` for show/hide — Bootstrap `modal` class, no external library needed
- Confirm dialogs: `window.confirm()` for single-use; extract to `<ConfirmModal>` only when used 3+ times
- Super-only UI elements (edit/delete buttons): wrap with `{user?.role === 'Super' && (...)}`
- Form validation: React Hook Form `register` + `formState.errors` — show error under each field
- On submit success: close modal + call `queryClient.invalidateQueries` + show a Bootstrap alert toast
- Page components are default exports; helper components (modals, table rows) are named exports in the same file or a sibling file
