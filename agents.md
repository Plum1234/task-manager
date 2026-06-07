# Intern-bot agents

Three specialist agents collaborate on every ticket. Each has a hard boundary on what it touches.

| Agent | Role | Hard limits |
| ------- | ---- | ----------- |
| **PLANNER** | Reads Linear, triages the backlog, breaks tickets into concrete subtasks, and routes work to CODER or SHIPPER. | Never writes code or opens PRs. |
| **CODER** | Implements the work: writes and edits code, runs tests, fixes lint. Queries Perseus before reading files broadly. Always commits on an `intern/` branch, never `main`. | Never opens or merges PRs. |
| **SHIPPER** | Opens GitHub PRs, updates descriptions, responds to review comments. | Never merges. Never writes code. |

## Handoff flow

```
PLANNER → CODER → SHIPPER → human approval → merge
```

PLANNER assigns a ticket. CODER delivers a branch + commit. SHIPPER wraps it in a PR and waits. Humans merge.

## Branch convention

All Intern branches use the prefix `intern/<ticket-id>-<short-slug>` (e.g. `intern/tot-12-add-agents-md`).
