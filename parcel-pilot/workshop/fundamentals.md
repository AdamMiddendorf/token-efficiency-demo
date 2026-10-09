# Fundamentals: using tokens efficiently (first 15 minutes)

A facilitator script for the opening block. Everything here is tool-neutral:
it applies to Claude Code, Cursor, or any other coding agent.

> **The claim of this workshop:** the goal is not to minimise tokens. It is to
> maximise *correct, verified engineering progress* per unit of time, context
> and interaction. A cheap session that produces the wrong change is the most
> expensive outcome available.

---

## 0:00 – 2:00 — What context actually is

Say this out loud, because most of the audience has a wrong model of it:

- The agent has **one working set** — the context window. Everything competes
  for it: your prompt, always-loaded repository instructions, every file the
  agent opened, every test run, every one of its own previous messages.
- The agent does not "remember" your repository. Each turn, it re-reads the
  whole working set.
- Irrelevant material is not free and not neutral. It **competes** with the
  useful material and it invites the agent to explore further.

Two numbers worth having in your head:

| Thing | Rough size |
|---|---|
| A focused source file (~120 lines) | ~1.5k tokens |
| All 57 files under `src/` in this repo | ~30k tokens |
| `fixtures/large-order-history.json` in this repo | ~130k tokens |

Today's four tasks need **six** of those 57 files. One careless `Read` of that
one fixture costs more context than reading the entire source tree — and more
than four times what the files you actually need would cost.

**Mental model:** context is a *working set*, not a knowledge warehouse.
Include what helps the agent make the *next* decision. Nothing else.

---

## 2:00 – 5:00 — What you are actually paying

Tokens are only one of four costs, and usually not the one that hurts:

1. **Time** — wall-clock minutes to a *verified* result.
2. **Context** — how much of the window is consumed, and by what.
3. **Interaction** — how many corrective turns you had to type.
4. **Rework** — changes to files that never needed to change.

So we measure with tool-neutral numbers, not a token counter:

- Minutes to verified completion
- Prompts and corrective turns
- Files inspected / of those, files that were actually relevant
- Unnecessary files modified
- Focused vs. full test runs

The headline ratio for today:

```text
relevant files inspected ÷ total files inspected      (aim for ≥ 70%)
```

### On the "keep context under 20%" rule

It is a useful **early-warning trigger**, not a law. A genuine investigation may
legitimately need more. The durable version of the rule:

> Keep only the context that improves the next decision.
> **Reset** when the goal changes. **Compact** when the goal stays the same.

---

## 5:00 – 11:00 — Eleven principles, four habits

The eleven principles this workshop is built on, grouped so they are learnable.

### Habit 1 — Aim before you fire
*(principles 1, 2, 3, 9)*

1. **Plan before implementing.**
2. **Prepare precise prompts and point the agent at the relevant code.**
3. **Review and refine the plan before committing tokens to implementation.**
9. **Keep each session focused on one goal.**

A prompt that reliably works has six parts. Not six paragraphs — six lines.

| Part | Question it answers |
|---|---|
| **Goal** | What observable result should exist afterwards? |
| **Acceptance criteria** | How do we know it is right, including edge cases? |
| **Context pointers** | Which files, symbols, tests, docs, logs? |
| **Constraints** | What must *not* change? |
| **Plan requirement** | Plan first, or go straight to the edit? |
| **Verification** | The exact command that proves it. |

Before:

```text
An order with a percentage discount is charged too much tax.
Fix the bug and make the tests pass.
```

After:

```text
Fix the discounted-order tax calculation.

Start with:
- src/pricing/calculate-order-total.ts
- tests/pricing/calculate-order-total.test.ts
- docs/decisions/002-pricing-operation-order.md

Expected operation order: subtotal → discount → shipping → tax.
Do not change the tax-rate implementation or public API types.

Verify with:
npm test -- tests/pricing/calculate-order-total.test.ts
npm run typecheck
```

The second prompt is longer. It is also *far* cheaper, because it removes the
agent's need to discover all of that by reading the repository.

> **Counter-intuitive rule:** do not optimise for a short prompt. Optimise for a
> short *search*. A vague one-line prompt that triggers a repository-wide scan
> costs more than a ten-line prompt that names the file, the constraint and the
> test.

Plan only when planning reduces uncertainty. A plan that restates your request
in more words is pure cost. A useful plan names: affected behaviour, likely
files, verification, risks, open questions — and fits on a screen.

### Habit 2 — See what you are spending
*(principles 4, 5)*

4. **Make context and usage visible.**
5. **Clear or compact conversations deliberately.**

You cannot improve a number you cannot see. Before anything else, put model,
context percentage, cost and branch somewhere you can glance at.

Then learn the three-way decision:

| Situation | Action |
|---|---|
| Same goal, context getting long | **Compact** — keep conclusions, drop transcript |
| New, unrelated goal | **Clear / new chat** — start from repository state |
| Same goal, context still small | **Continue** |

Clearing is not losing work. Code, tests, docs and git history are the durable
memory. The transcript is scaffolding.

### Habit 3 — Keep the working set lean
*(principles 6, 7)*

6. **Keep context lean and relevant.**
7. **Match the model and interaction mode to the task.**

- Attach a *symbol* before a file; a file before a folder; a folder almost never.
- Run the narrowest relevant test first. `npm test -- <one file>` produces a few
  lines; a full suite run produces many, every time, forever, in your context.
- "Always use the strongest model" is not a strategy. Mechanical rename → fast
  model, inline edit. Unknown root cause → strong model, ask/plan mode first.
  Known multi-file feature → normal model, short plan, then agent mode.
- Escalate on evidence: two failed attempts, or a hypothesis you can't form.

### Habit 4 — Put knowledge where it belongs
*(principles 8, 10, 11)*

8. **Keep always-loaded repository instructions concise.**
10. **Preserve useful discoveries at the correct scope.**
11. **Treat planning as ongoing, not a one-time ceremony.**

Always-loaded files (`CLAUDE.md`, `AGENTS.md`, `alwaysApply` Cursor rules) are
a tax on *every* turn of *every* session forever. Cap them at about one screen.

Route each discovery to the narrowest place it stays discoverable:

| Discovery | Where it belongs |
|---|---|
| Money is integer minor units | Always-loaded (one line) |
| Pricing operation order | Scoped pricing rule + ADR |
| Wholesale cap is £500 | Policy constant + tests + ADR |
| Notification retries exclude attempt 1 | Scoped rule + ADR |
| "Task 1 took me three prompts" | Nowhere. Let it go. |

And re-plan when evidence invalidates the plan. Sunk tokens are sunk.

---

## 11:00 – 14:00 — Live demo (facilitator drives, 3 minutes)

Same repository, same defect, two prompts. Screen shared, context meter visible.

1. Fresh session. Paste the vague Task 1 prompt. **Do not let it finish** —
   after ~60 seconds, stop and point at: files opened, context consumed, whether
   `archive/` or the large fixture got touched.
2. Clear. Paste the six-part version above. Let it run to the focused test.
3. Put the two side by side: files inspected, turns, context, minutes.

Say the punchline explicitly: *the fix is one line in both cases.* Everything
else was the cost of not saying what you knew.

---

## 14:00 – 15:00 — What happens next

- **Task 1 (12 min)** — you run the vague prompt yourself and measure it.
- **Debrief (6 min)** — where did the context go?
- **Task 2 (12 min)** — plan before implementing, with precise context.
- **Task 4 (10 min)** — the goal changes: continue, compact, or clear?
- **Retrospective (5 min)** — one habit each to take away.

Fill in `workshop/scorecard.md` as you go. The numbers are the lesson.

---

## Pocket checklist

```text
BEFORE      one goal · acceptance criteria · name the files · plan? · model? · note context %
DURING      narrow before broad · narrowest test first · no drive-by refactors · re-plan on new evidence
SWITCHING   same goal → compact · new goal → clear · write a 200-word handoff if state isn't obvious
AFTER       verify · check nothing unrelated changed · keep only durable learning, at the narrowest scope
```
