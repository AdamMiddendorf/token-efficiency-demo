# Participant guide

**Duration:** 60 minutes
**Repository:** `parcel-pilot` — a small TypeScript order-pricing and
fulfilment service
**Format:** pairs, ideally one Claude Code user and one Cursor user

---

## Before you arrive (5 minutes, at your desk)

Do `workshop/tasks/00-setup.md` **before** the session starts. It is not part
of the 60 minutes. You need: dependencies installed, one failing test observed,
context usage visible, and your own branch.

---

## Agenda

| Time | What | The lesson |
|---:|---|---|
| 0–15 | Fundamentals: using tokens efficiently | Context is a working set |
| 15–27 | Task 1 — the vague prompt | Establish your own baseline |
| 27–33 | Debrief | Where did the context actually go? |
| 33–45 | Task 2 — plan before implementing | Precise prompts, narrow verification |
| 45–55 | Task 4 — the goal changes | Continue, compact, or clear |
| 55–60 | Retrospective | One habit each |

Optional / homework: Task 3 (surgical context), Task 5 (model choice),
Task 6 (capture knowledge), Task 7 (recover a bad session).

---

## The rules

1. **Record as you go.** `workshop/scorecard.md` — fill in each column at the
   end of each task, not at the end of the session.
2. **One operator per task.** The other person co-writes the prompt in
   `workshop/prompt-canvas.md` and counts files inspected. Swap after each task.
3. **Do not read ahead.** Task 1 only works once, and only if you go in blind.
4. **Never weaken a test to make something pass.** If a test encodes the wrong
   behaviour, change it deliberately and say why.
5. **Run the narrowest relevant test first.** Full suite once, at the end.

---

## What you are measuring

For each task, in `workshop/scorecard.md`:

- minutes to a **verified** result
- prompts sent, and how many of those were corrections
- files the agent inspected, and how many of those mattered
- files changed, and whether any were unrelated
- focused vs. full test runs
- context % at start and end, if your tool shows it

The single most useful number:

```text
relevant files inspected ÷ total files inspected      (target ≥ 70%)
```

---

## Commands you will need

```bash
npm test                                                  # everything
npm test -- tests/pricing/calculate-order-total.test.ts   # one file
npm run typecheck
npm run verify:task-1                                     # proves a task is done
```

---

## A note on tools

Claude Code and Cursor report usage differently, and the numbers are not
directly comparable. That is fine — you are comparing *your own* workflow
decisions before and after, not the two tools against each other.
