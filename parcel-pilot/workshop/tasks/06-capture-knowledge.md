# Task 6 — Capture learning without bloating context (optional, 10 minutes)

## Brief

Review what you learned today. Propose repository knowledge updates — but do
**not** add every observation to the always-loaded instructions.

Classify each discovery as one of:

- Always-loaded repository rule (`CLAUDE.md`, `AGENTS.md`, `alwaysApply` rule)
- Scoped domain rule (`.cursor/rules/*.mdc` with globs)
- Architecture or decision documentation (`docs/`)
- Temporary session note
- Not worth preserving

## Classification exercise

| Discovery | Where does it go? |
|---|---|
| Money uses integer minor units | |
| Pricing operation order | |
| The wholesale cap is £500 | |
| Task 1 took three prompts | |
| Notification retries exclude the initial attempt | |
| `archive/` is historical only | |
| The exact files you changed today | |
| The focused pricing test command | |

Suggested answers are in `workshop/solutions.md`.

## The hard constraint

You may make **at most**:

- one small clarification in `CLAUDE.md` or `AGENTS.md`,
- one update to a scoped Cursor rule,
- one improvement to a decision document.

**The always-loaded material must not grow by more than five lines.** If your
best idea doesn't fit, that is the exercise, not an obstacle: find the narrower
home for it.

---

**Lesson:** knowledge accumulation is a permanent token leak if it all lands in
the always-loaded files. Store it at the narrowest scope where it stays
discoverable.
