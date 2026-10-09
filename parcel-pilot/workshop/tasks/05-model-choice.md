# Task 5 — Match the model and mode to the task (optional, 10 minutes)

A discussion exercise. You do not need to implement anything. For each
scenario, choose a model and interaction mode, and justify it.

## Scenario A — mechanical change

```text
Rename an internal test helper in one test file. No production behaviour changes.
```

## Scenario B — ambiguous defect

```text
Intermittently, duplicate notification emails are sent after a timeout.
The root cause is unknown.
```

## Scenario C — known multi-file feature

```text
Expose the existing shipping estimate through a new API response field.
The domain behaviour already exists.
```

## For each, write

```md
Scenario:
Selected model / mode:
Reason:
Context to provide:
Context to exclude:
Escalation condition:
```

The last line is the one people skip and the one that matters: *what would have
to happen for you to switch to a stronger model?* "Two failed attempts" and "I
cannot form a hypothesis" are good answers. "It feels hard" is not.

## Discussion points

- A: fast model, inline edit, one file attached, no planning stage.
- B: strong reasoning model, ask/plan mode first, runtime evidence and focused
  logs, implement only once a hypothesis exists.
- C: normal coding model, short plan, agent mode after approval; attach the
  response type, the handler, the estimator and the tests.

---

**Lesson:** "use the strongest model" is not a strategy. Escalate on evidence.
