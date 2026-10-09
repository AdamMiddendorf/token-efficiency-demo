# Task 0 — Setup (pre-work, ~5 minutes, before the session)

Do this at your desk **before** the workshop starts. It is not part of the 60
minutes.

## 1. Install and check the repository

```bash
npm install
npm test
```

Expect **one failing test**:
`tests/pricing/calculate-order-total.test.ts`. That is deliberate — it is the
starting point of Task 1. Do not fix it yet, and do not read the file.

```bash
npm run typecheck    # should pass cleanly
```

## 2. Make usage visible

**Claude Code** — ask it to build you a status line:

```text
/statusline show model name, context percentage, session cost, and git branch
```

**Cursor** — have the model picker and the chat's context indicator visible,
and know where the "new chat" button is.

Either tool: know how to (a) start a fresh conversation, (b) compact or
summarise, (c) switch model, (d) switch between ask/plan and agent/edit mode.

## 3. Take your own branch

```bash
git checkout -b pair/team-01     # your pair's name
```

Do not work on a shared working tree.

## 4. Record your starting point

Open `workshop/scorecard.md` and fill in the tool, model and starting context
percentage. Leave it open — you will add to it after every task.

## 5. Arrive with a fresh conversation

Start the session with an **empty** conversation. Do not pre-explore the
repository, do not ask the agent to summarise it, do not open the files.
Task 1 only works once.

---

**Lesson:** you cannot improve a number you cannot see. Everything else today
depends on this feedback loop existing.
