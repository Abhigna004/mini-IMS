---
agent: agent
description: Full SDLC cycle for a single Jira ticket — context fetch → implement (sub-agent) → review (sub-agent) → test (sub-agent) → Jira update.
---
Execute ticket: **$ticketKey**

---

## STEP 1 — FETCH & VALIDATE CONTEXT
> Main agent only. Do NOT write code.

1. Fetch Jira ticket `$ticketKey` → read: summary, description, acceptance criteria, linked issue keys.
2. From remote links on the ticket: extract Confluence page IDs. For each page fetch ONLY the relevant section:
   - Backend ticket → "Endpoints" + "Business Logic" sections
   - Frontend ticket → "Frontend Components" + "UI Behaviour" sections
   - DB ticket → "Schema" + "Migration Notes" sections
3. Check linked blocker tickets. If any blocker is not "Done" → **STOP**: `Blocked by: MI-XX (status)`. Do not proceed.

---

## STEP 2 — DECLARE SCOPE
Output this block in full before any delegation:
```
SCOPE:           <one sentence — what this ticket implements>
TICKET TYPE:     backend | frontend | fullstack | db
MODULE:          <auth | items | transactions | admins | analytics | frontend-auth | frontend-items | ...>
FILES TO CREATE: <list or none>
FILES TO MODIFY: <list or none>
```

---

## STEP 3 — IMPLEMENT (delegate to `implement` sub-agent)
Condense the Jira description into a 5-bullet brief. Then delegate:

**Brief for implement sub-agent:**
- Ticket: $ticketKey
- Scope: [1-sentence scope from Step 2]
- Type: [backend | frontend | fullstack]
- Files to create: [from scope]
- Files to modify: [from scope]
- Key constraints: [max 3 non-negotiables from the Jira description, e.g. "bcrypt cost 12", "SHA-256 hash refresh tokens", "fetch unit prices from DB"]

> **→ runSubagent('implement', brief above)**

Wait for result: list of files created/modified + any wiring notes.

---

## STEP 4 — REVIEW (delegate to `review` sub-agent)
Pass only what the review agent needs — no re-fetching Jira:

**Brief for review sub-agent:**
- Files to review: [list returned from Step 3]
- Ticket context: [1-sentence scope]
- Ticket type: [backend | frontend] (determines which checks apply)

> **→ runSubagent('review', brief above)**

Wait for result: PASS/FAIL table.

**If any check is flagged CRITICAL** (SQL injection / missing auth / hardcoded secret):
- Re-delegate to `implement` sub-agent with: `Fix CRITICAL: [specific issue] in [file:line]`
- Then re-delegate to `review` once more.
- **Maximum one fix cycle.** If still CRITICAL after retry: mark STATUS as Blocked.

---

## STEP 5 — TEST (delegate to `test` sub-agent)
Pass only the module name — the test agent handles the rest:

**Brief for test sub-agent:**
- Module: [module name from Step 2]
- Action: Run existing tests for this module. Then generate missing tests from `testcases_phase2_phase3.csv` filtered by Module column.

> **→ runSubagent('test', brief above)**

Wait for result: X passed / Y failed + path of any generated test file.

---

## STEP 6 — SUMMARY & JIRA UPDATE
Aggregate all sub-agent results and output:
```
TICKET:          $ticketKey
FILES CREATED:   <from implement result or "none">
FILES MODIFIED:  <from implement result or "none">
REVIEW FLAGS:    <"none" or list of FAIL items from review result>
TESTS:           X passed / Y failed (from test result)
STATUS:          Done | Blocked (<reason>)
```

Then:
- If `STATUS: Done` → transition `$ticketKey` to **"Done"** in Jira.
- If `STATUS: Blocked` → add Jira comment with blocking reason. Do NOT transition.

Then take action:
- If `STATUS: Done` → transition `$ticketKey` to **"Done"** in Jira.
- If `STATUS: Blocked` → add a Jira comment on `$ticketKey` with the blocking reason. Do NOT transition.
