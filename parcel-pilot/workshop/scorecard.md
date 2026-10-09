# Token-efficiency scorecard

Fill in each column at the **end of each task**, not at the end of the session.

| Field | Task 1 | Task 2 | Task 4 | Task 3 (opt) |
|---|---:|---:|---:|---:|
| Tool and model | | | | |
| Starting context % | | | | |
| Ending context % | | | | |
| Minutes to verified result | | | | |
| Prompts / turns | | | | |
| ...of which corrective | | | | |
| Files inspected | | | | |
| ...of which relevant | | | | |
| Files changed | | | | |
| ...of which unrelated | | | | |
| Focused test runs | | | | |
| Full test runs | | | | |
| Continue / compact / clear | | | | |
| Verification passed | | | | |

## The headline ratio

```text
relevant files inspected ÷ total files inspected      (target ≥ 70%)
```

| | Task 1 | Task 2 | Task 4 |
|---|---:|---:|---:|
| Ratio | | | |

## Evaluation dimensions

| Dimension | What good looks like |
|---|---|
| Correctness | Task verification passes |
| Focus | Most inspected files were relevant |
| Context discipline | Context grew only where it bought something |
| Interaction cost | Few corrective turns |
| Scope discipline | No unrelated files changed |
| Verification | Narrow test first, broad verification once |
| Recoverability | A fresh session could resume without rediscovery |
| Knowledge quality | Durable learning captured, global rules unchanged |

## Reflection

- Which context turned out to be useful?
- Which context turned out to be unnecessary?
- What should have been in the initial prompt?
- Was the model appropriate to the task?
- Should any discovery persist beyond today? Where does it belong?
- What will you do differently in your next real session?
