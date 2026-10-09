# ADR 005 — Dependencies are constructed once and passed explicitly

**Status:** accepted (2025-04)

## Context

Earlier versions reached for module-level singletons: a shared clock, a global
logger, a module that read `process.env` when first imported. Tests then had to
reset global state between cases, and two tests that ran in either order could
disagree about the current time.

## Decision

- `src/app/build-app.ts` is the composition root. It is the only place that
  constructs services.
- `src/config/` is the only place that reads `process.env`. Everything else
  receives an `AppConfig`.
- Time comes from an injected `Clock`, identifiers from an injected
  `IdGenerator`, and logging and metrics from injected instances. No module
  calls `new Date()` or `Math.random()` for domain behaviour.
- Optional collaborators are genuinely optional: `OrderService` works with just
  a repository, and gains inventory, promotions, events and metrics when they
  are supplied.

## Consequences

- Tests construct what they need with fakes (`fixedClock`,
  `SequentialIdGenerator`, `ScriptedEmailClient`, `RecordingLogger`) and share
  no state.
- There is no hidden initialisation order, so a file can be read on its own and
  understood.
- Wiring a new collaborator means one change in `build-app.ts`, not a new
  import in every call site.
