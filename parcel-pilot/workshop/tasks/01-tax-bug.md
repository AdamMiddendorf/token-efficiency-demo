# Task 1 — The vague baseline (12 minutes)

Establish *your own* baseline. This task is deliberately under-specified. Work
the way you normally would.

## Your prompt

Start a **fresh conversation** and give your agent exactly this, and nothing
more:

```text
An order with a percentage discount is charged too much tax.

Fix the bug and make the tests pass.
```

## Rules

- No file names, no hints, no architecture summary — not in the first prompt
  and not in follow-ups. If the agent asks, tell it to decide.
- You may correct it when it goes wrong, but **count every correction**.
- Stop at 12 minutes even if it is unfinished.

## While it runs, the non-operator records

| | |
|---|---|
| Files the agent inspected | |
| ...of which actually mattered | |
| Did it open `archive/`? | |
| Did it open `fixtures/large-order-history.json`? | |
| Did it change `src/pricing/tax-calculator.ts`? | |
| Did it wander into `src/promotions/` or `src/http/`? | |
| Did it read `docs/architecture.md`? (that one is cheap and useful) | |
| Full test-suite runs | |
| Prompts sent / of which corrections | |
| Minutes to a verified fix | |

## Done when

```bash
npm test -- tests/pricing/calculate-order-total.test.ts
npm run typecheck
npm run verify:task-1
```

`verify:task-1` also checks the things the failing test does not: undiscounted
orders are unchanged, every amount is still an integer, the tax-rate table is
untouched, and the public API response shape has not moved.

## Then, before the debrief

Write the prompt you *wish* you had been given, using the six-part shape:
goal · acceptance criteria · context pointers · constraints · plan requirement ·
verification. Put it in `workshop/prompt-canvas.md`.

---

**Lesson:** a one-line fix becomes expensive when the prompt doesn't say what
you already know — the relevant file, the rule, the constraint, and the check.
