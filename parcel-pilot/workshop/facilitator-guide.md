# Facilitator guide

**Duration:** 60 minutes, hard stop.
**Group size:** works from 4 to ~30 in pairs.
**You will need:** a projector, this repository, and a session of your own with
the context meter visible for the demo.

---

## Preparation

**A week before**

- Send participants `workshop/tasks/00-setup.md` and make clear that setup is
  pre-work, not session time. A room where ten people run `npm install` at
  09:00 has lost its first ten minutes.

**The day before**

- Run `npm install && npm test`. Expect exactly **one** failing test:
  `tests/pricing/calculate-order-total.test.ts > charges tax on the discounted
  merchandise subtotal plus shipping`. That failure is Task 1.
- Run `npm run verify:all`. Before any task is done, all four verification
  files fail. That is correct.
- Rehearse the 3-minute live demo in `workshop/fundamentals.md`.
- Create per-pair branches (see below).

**Branches**

```bash
git tag workshop/start          # clean starting point
git checkout -b pair/team-01    # one per pair or participant
```

Never have two pairs editing the same working tree. To reset a working tree
mid-session: `bash scripts/reset-workshop.sh`.

---

## Run sheet

### 0–15 · Fundamentals

Follow `workshop/fundamentals.md`. It is timed to the minute and includes the
live demo. Do not let this block overrun — the measured tasks are where the
learning sticks, and they cannot be compressed.

### 15–27 · Task 1 — the vague baseline

Give them `workshop/tasks/01-tax-bug.md` and **nothing else**. Do not answer
"which file is it in?" — that question *is* the exercise.

Walk the room and write down, per pair:

- Did the agent list or scan most of the repository? (`src/` has 57 files; the
  task needs one.)
- Did it open `archive/` or `fixtures/large-order-history.json`?
- Did it modify `src/pricing/tax-calculator.ts` (the wrong file)?
- Did it wander into `src/promotions/`, `src/http/` or `src/catalog/`?
- Did it run the full suite more than once? (120 tests; the task needs one file.)
- How long between the first prompt and a verified fix?

Call time at 12 minutes whether or not everyone is finished. Unfinished is a
perfectly good data point.

### 27–33 · Debrief

Collect numbers on the board: files inspected, relevant files, turns, minutes.
The spread across the room is usually larger than anyone expects.

Ask, in this order:

1. What did the agent have to *discover* that you already knew?
2. Which files did it read that had no effect on the answer?
3. Did it verify the *behaviour*, or just make the failing test green?

Then the exercise: **each pair rewrites the prompt they wish they'd been
given**, using the six-part shape from the fundamentals block. Take two out
loud. The point lands by itself — the fix is one line.

### 33–45 · Task 2 — plan before implementing

`workshop/tasks/02-discount-cap.md`. This one supplies the file list and
*requires* a plan before any edit.

Watch for the interesting failure: capping **every** customer's discount. The
retail £600 case is deliberately surprising, and a plan that doesn't mention
tiers usually produces the global cap. If a pair gets it wrong, that is the
best thing that can happen in this room — have them say what their plan omitted.

The second interesting failure: putting the cap in `src/promotions/`.
`MAX_CAMPAIGN_PERCENT` is right there and sounds perfect, but it caps a
percentage, not an amount of money. Ask the pair which units the requirement is
written in — "£500" answers it.

Other things to note: a literal `50000` duplicated across files, a float
sneaking into the money path, a test edited to accept the wrong behaviour.

Verify with `npm run verify:task-2`.

### 45–55 · Task 4 — the goal changes

`workshop/tasks/04-context-handoff.md`. The subsystem changes from pricing to
notifications.

**Before they type anything**, each pair writes down four answers (the task
file has the boxes). Then they choose: continue / compact / clear / new chat.

The recommended answer is a fresh conversation — but a pair that compacts and
can explain why has learned the same lesson. A pair that continues with 40% of
the window full of pricing discussion will feel it.

Two decoys sit next to the answer: `delivery-queue.ts` (backoff schedule, dead
letters) and `notification-log.ts` (audit trail). Both mention attempts;
neither sets the limit. The queue defers to the policy on purpose, so a pair
who changes the queue will see no behaviour change and should be asked why.

The semantic trap is the real content: "two retries" means *three attempts*,
and the seeded constant is named `maxRetries` while holding the attempt count.
A careless change to `2` gives one retry. `docs/decisions/003-notification-retries.md`
says this explicitly — note who reads it and who doesn't.

Verify with `npm run verify:task-4`. The existing test in
`tests/notifications/retry-policy.test.ts` encodes the *old* behaviour and must
be updated deliberately, not deleted.

### 55–60 · Retrospective

Round the room, one line each, no discussion:

1. One source of wasted context you saw with your own eyes.
2. One prompt pattern you will reuse tomorrow.
3. One signal that should trigger a fresh conversation.

Close on the pocket checklist at the end of `workshop/fundamentals.md`.

---

## Timing discipline

| Risk | Mitigation |
|---|---|
| Setup eats the session | Setup is pre-work. Have a spare laptop ready. |
| Fundamentals overruns | Cut the principle groupings, never the live demo. |
| Task 1 overruns | Hard stop at 12 min. Unfinished is a valid result. |
| Task 2 overruns | Accept a plan + partial implementation; the plan is the lesson. |
| A pair is far ahead | Give them `workshop/tasks/03-free-shipping.md`. |

---

## Reference solutions

In `workshop/solutions.md`. Do not share before the retrospective.

---

## If you have 90 minutes instead of 60

Insert Task 3 (15 min) after the Task 2 debrief, and close with Task 6
(10 min). Task 5 and Task 7 make a good second session.
