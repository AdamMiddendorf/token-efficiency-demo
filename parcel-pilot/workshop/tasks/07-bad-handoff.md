# Task 7 — Recover from a bad session (optional, 15–20 minutes)

For a second session, or for anyone who finishes early.

## Set up the mess

On a scratch branch, have an agent (or a facilitator) produce a plausible bad
state:

- six unrelated files modified,
- a **global** discount cap added (not wholesale-only),
- `tests/pricing/wholesale-discount.test.ts` edited to encode that wrong
  behaviour,
- a long, confident progress note,
- no verification run.

## Brief

```md
Take over this incomplete task. Do not assume the previous implementation is
correct.

1. Inspect the working diff.
2. Restate the intended behaviour in your own words.
3. Identify unrelated or incorrect changes.
4. Propose a recovery plan.
5. Repair the implementation.
6. Verify.
7. Produce a handoff of no more than 200 words.
```

Start from a **fresh conversation**. The diff, the tests and the ADRs are your
context — not the previous transcript, and not the progress note.

## Success criteria

- Incorrect and unrelated changes are identified explicitly.
- Genuinely useful prior work is kept.
- The weakened test is **restored**, not deleted.
- The implementation matches the wholesale-only cap (`npm run verify:task-2`).
- The handoff fits in 200 words and uses `workshop/handoff-template.md`.

## Worth noticing

The verbose progress note is the least reliable artefact in the working tree,
and the one a fresh session is most tempted to trust. The diff and the tests
are evidence; the note is a claim.

---

**Lesson:** a fresh context does not mean starting the engineering from zero.
Diffs, tests, commits and a short handoff transfer state far more efficiently
than a long transcript.
