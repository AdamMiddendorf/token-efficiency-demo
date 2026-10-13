# Demo kit

Everything the presenters need to run the three live demos and the race.
Requires Node 20+, git, and the `claude` CLI signed in. Run `npm install` in
`parcel-pilot/` once first.

| File | What it is for |
|---|---|
| `stage.mjs` | Creates three clean demo copies in `../../../parcel-pilot-stage/` (one per demo). Re-run to reset. |
| `prompts.md` | Every prompt used in the session, vibe and disciplined. Copy-paste from here. |
| `race.mjs` | Runs the vibe lane and the disciplined lane headless through Claude Code, in parallel, and prints a scoreboard. |
| `verify.mjs` | Scores any demo copy: PASS/FAIL per task plus every file changed. |
| `cursor-rule-example/notifications.mdc` | The scoped rule Eugene writes at the end of Demo 3, if typing it live is too slow. |
| `results/` | Created by `race.mjs`: one `.md` scoreboard and one `.json` per run. |

## Why the demo copies are separate

The demo copies leave out `workshop/` (the answers) and `verify/` (the hidden
checks), and live outside this repository, so the agent cannot find the
solutions or these prompts. `verify.mjs` and `race.mjs` copy `verify/` in only
for scoring, then remove it.

## Commands

```bash
node stage.mjs
```

```bash
node race.mjs --model sonnet
```

```bash
node verify.mjs ../../../parcel-pilot-stage/demo1-vibe 1 2
```

```bash
node race.mjs --dry-run
```

The dry run stages, scores and prints an empty scoreboard without calling Claude:
use it to check the machine before the session.

`race.mjs` runs Claude Code with `--permission-mode acceptEdits` and Bash allowed,
but only inside its throwaway copies under your temp folder. Each run spends
real usage (the scoreboard reports the cost); both lanes always use the same
model so the comparison is fair.
