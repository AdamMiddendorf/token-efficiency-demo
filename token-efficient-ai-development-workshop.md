# Token-Efficient AI Development Workshop

## A practical, tool-neutral workshop for Claude Code and Cursor users

**Audience:** Software developers using Claude Code, Cursor, or both  
**Recommended duration:** 90 minutes  
**Format:** Pairs or small groups, ideally mixing Claude Code and Cursor users  
**Workshop repository:** `parcel-pilot` — a small TypeScript order-pricing and fulfilment service

---

## 1. Purpose

This workshop teaches developers to use coding agents efficiently by managing goals, prompts, repository knowledge, models, and context deliberately.

The workshop turns the following principles into observable practice:

1. Plan before implementing.
2. Prepare precise prompts and point the agent to relevant code.
3. Review and refine the plan before committing tokens to implementation.
4. Make context and usage visible.
5. Clear or compact conversations deliberately.
6. Keep context lean and relevant.
7. Match the model and interaction mode to the task.
8. Keep always-loaded repository instructions concise.
9. Keep each session focused on one goal.
10. Preserve useful discoveries at the correct scope.
11. Treat planning as an ongoing activity, not a one-time ceremony.

The aim is not to minimize tokens at any cost. It is to maximize correct, verified engineering progress per unit of time, context, and interaction.

---

## 2. Central teaching approach

The workshop uses an A/B structure:

- Participants first solve a task using a deliberately vague prompt and their normal workflow.
- They measure how much exploration, context, and correction the task required.
- They then solve comparable tasks using planning, targeted context, explicit constraints, and narrow verification.
- Finally, they move to an unrelated goal and decide whether to continue, compact, clear, or start a fresh conversation.

This makes the cost of unfocused context visible instead of presenting token efficiency as a list of abstract rules.

---

## 3. Learning outcomes

By the end of the session, participants should be able to:

- Turn a vague request into a clear engineering goal and acceptance criteria.
- Identify the smallest useful set of files, symbols, tests, logs, and documentation.
- Ask for a plan before implementation when uncertainty warrants it.
- Distinguish useful planning from verbose restatement.
- Use focused tests instead of repeatedly running the complete suite.
- Recognize when the current conversation no longer matches the current goal.
- Use a fresh session, clearing, or compaction appropriately.
- Select a suitable model or mode for mechanical, well-defined, and ambiguous work.
- Keep `CLAUDE.md`, `AGENTS.md`, and always-applied Cursor rules lean.
- Capture durable knowledge without turning every observation into permanent context.

---

## 4. Recommended session agenda

| Time | Activity | Main lesson |
|---:|---|---|
| 0–10 min | Introduction and tool setup | Context is a limited working set |
| 10–25 min | Task 1: inefficient baseline | Establish a personal baseline |
| 25–35 min | Compare results | Identify where time and context went |
| 35–55 min | Task 2: plan before implementing | Planning and precise prompts |
| 55–70 min | Task 3: surgical context | Architecture maps and targeted references |
| 70–80 min | Task 4: change goals | Clear, compact, or start fresh |
| 80–90 min | Task 6: capture knowledge and retrospective | Preserve learning at the right scope |

Task 5 and the advanced recovery exercise can be used as optional homework or as a second session.

---

## 5. Working principles

### 5.1 Context is a working set, not a knowledge warehouse

Only include information that helps the agent make the next decision. More context is not automatically better: irrelevant material competes with useful information and may trigger unnecessary exploration.

### 5.2 The 20% guideline is a trigger, not a law

“Keep context under 20%” is useful as an early-warning heuristic, especially for small tasks. It should not become a rigid target. Complex investigation may legitimately require more context.

A more durable rule is:

> Keep only the context that improves the next decision. Reset when the goal changes; compact when the goal remains the same.

### 5.3 Token counts are not perfectly comparable across tools

Claude Code and Cursor expose usage, caching, and context differently. The workshop therefore combines tool-specific usage information with tool-neutral measurements:

- Time to verified completion
- Number of prompts and corrective turns
- Total files inspected
- Relevant files inspected
- Unnecessary files modified
- Focused versus full test runs
- Context growth where visible

### 5.4 Planning should reduce uncertainty

A useful plan identifies affected behavior, likely files, verification, risks, and open questions. A long plan that merely repeats the request is not efficient.

### 5.5 Repository state is durable memory

Tests, code, version control, architecture decisions, and concise handoffs are usually better long-term state than a large conversation transcript.

---

## 6. Workshop repository concept

The repository is a fictional service called **Parcel Pilot**. It calculates order totals, selects shipping, and sends fulfilment notifications.

It should be realistic enough to encourage normal engineering behavior, but small enough for all tasks to finish quickly.

### Technology

- TypeScript
- Node.js
- Vitest
- ESLint
- No database
- No network services
- No secrets or API credentials
- Full test suite completes in less than five seconds

### Core business rules

- Money is represented as integer minor units, such as pence or cents.
- Discounts are applied before tax.
- Shipping is taxable.
- Retail and wholesale customers can have different discount policies.
- Wholesale percentage discounts have a maximum cap.
- Failed notifications can be retried.
- Public API response types must remain backward-compatible.

### Pricing pipeline

```text
subtotal
  → discount
  → discounted merchandise subtotal
  → shipping
  → taxable amount
  → tax
  → total
```

---

## 7. Repository structure

```text
parcel-pilot/
├── README.md
├── CLAUDE.md
├── AGENTS.md
├── package.json
├── tsconfig.json
├── vitest.config.ts
│
├── .cursor/
│   └── rules/
│       ├── core.mdc
│       ├── pricing.mdc
│       └── notifications.mdc
│
├── docs/
│   ├── architecture.md
│   ├── domain-glossary.md
│   ├── testing.md
│   └── decisions/
│       ├── 001-money-as-minor-units.md
│       ├── 002-pricing-operation-order.md
│       └── 003-notification-retries.md
│
├── src/
│   ├── api/
│   │   ├── create-order-handler.ts
│   │   ├── get-order-handler.ts
│   │   └── order-response.ts
│   ├── orders/
│   │   ├── order.ts
│   │   ├── order-service.ts
│   │   ├── order-repository.ts
│   │   └── in-memory-order-repository.ts
│   ├── pricing/
│   │   ├── calculate-order-total.ts
│   │   ├── apply-discount.ts
│   │   ├── pricing-policy.ts
│   │   ├── tax-calculator.ts
│   │   ├── shipping-price.ts
│   │   └── money.ts
│   ├── shipping/
│   │   ├── shipping-method.ts
│   │   ├── shipping-selector.ts
│   │   └── shipping-zones.ts
│   ├── notifications/
│   │   ├── notification-service.ts
│   │   ├── retry-policy.ts
│   │   ├── email-client.ts
│   │   └── templates.ts
│   ├── customers/
│   │   ├── customer.ts
│   │   └── customer-tier.ts
│   └── shared/
│       ├── result.ts
│       ├── errors.ts
│       └── clock.ts
│
├── tests/
│   ├── pricing/
│   │   ├── calculate-order-total.test.ts
│   │   ├── wholesale-discount.test.ts
│   │   └── tax-calculator.test.ts
│   ├── shipping/
│   │   └── shipping-selector.test.ts
│   ├── notifications/
│   │   └── retry-policy.test.ts
│   └── orders/
│       └── order-service.test.ts
│
├── fixtures/
│   ├── sample-orders.json
│   ├── customer-catalog.json
│   └── large-order-history.json
│
├── archive/
│   ├── README.md
│   ├── pricing-v1.ts
│   ├── old-tax-calculator.ts
│   └── legacy-order-service.ts
│
├── workshop/
│   ├── participant-guide.md
│   ├── facilitator-guide.md
│   ├── prompt-canvas.md
│   ├── scorecard.md
│   ├── handoff-template.md
│   └── tasks/
│       ├── 00-setup.md
│       ├── 01-tax-bug.md
│       ├── 02-discount-cap.md
│       ├── 03-free-shipping.md
│       ├── 04-context-handoff.md
│       ├── 05-model-choice.md
│       └── 06-capture-knowledge.md
│
└── scripts/
    ├── reset-workshop.sh
    ├── verify-task-1.sh
    ├── verify-task-2.sh
    ├── verify-task-3.sh
    ├── verify-task-4.sh
    └── verify-all.sh
```

The `archive/` directory and large fixtures are deliberate distractions. They should look plausible but should not be required for the core tasks.

---

## 8. Minimal domain model

```ts
export type CustomerTier = "retail" | "wholesale";

export interface OrderLine {
  sku: string;
  quantity: number;
  unitPrice: number; // integer minor units
}

export interface Order {
  customerTier: CustomerTier;
  lines: OrderLine[];
  discountPercent?: number;
  shippingMethod: "standard" | "express";
  countryCode: string;
}

export interface OrderTotal {
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
}
```

---

## 9. Always-loaded repository instructions

### 9.1 `CLAUDE.md`

```md
# Parcel Pilot

TypeScript order-pricing and fulfilment service.

## Commands

- Install: `npm install`
- Test all: `npm test`
- Test one file: `npm test -- <path>`
- Type-check: `npm run typecheck`
- Lint: `npm run lint`

## Architecture

- Domain logic lives under `src/`.
- Tests mirror source areas under `tests/`.
- Money is stored as integer minor units.
- Public API response types must remain backward-compatible.
- `archive/` is historical and must not be used as the current implementation.

Read `docs/architecture.md` only when broader architectural context is needed.
Read the relevant decision under `docs/decisions/` when changing a business rule.
```

The complete domain model, every file name, and every coding preference should not be placed in this file.

### 9.2 `AGENTS.md`

```md
# Repository instructions

Run the narrowest relevant test before running the full suite.

Before editing:

1. Identify the goal and acceptance criteria.
2. Name the files likely to be relevant.
3. For changes spanning more than one module, propose a plan first.

Avoid reading `archive/` and large fixtures unless the task explicitly requires them.

Do not modify unrelated files or weaken existing tests.
```

### 9.3 Cursor core rule

`.cursor/rules/core.mdc`:

```md
---
description: Core Parcel Pilot repository conventions
alwaysApply: true
---

- Money values are integer minor units.
- Run the narrowest relevant test first.
- Do not use code under `archive/` as the current implementation.
- Keep public API response types backward-compatible.
- For multi-file changes, propose a plan before editing.
```

### 9.4 Scoped pricing rule

`.cursor/rules/pricing.mdc`:

```md
---
description: Pricing domain rules and verification
globs:
  - "src/pricing/**/*.ts"
  - "tests/pricing/**/*.ts"
alwaysApply: false
---

Pricing operation order:

1. Calculate subtotal.
2. Apply discounts.
3. Add shipping.
4. Calculate tax on the discounted subtotal plus shipping.

Use integer minor units. Never introduce floating-point currency calculations.

Run pricing tests with:

`npm test -- tests/pricing`
```

### 9.5 Scoped notification rule

`.cursor/rules/notifications.mdc`:

```md
---
description: Notification retry semantics and verification
globs:
  - "src/notifications/**/*.ts"
  - "tests/notifications/**/*.ts"
alwaysApply: false
---

- A retry occurs after the initial delivery attempt.
- Two retries means three total attempts.
- Permanent failures must not be retried.
- Run notification tests with `npm test -- tests/notifications`.
```

---

## 10. Tool-specific preparation

### Claude Code

Participants should make model and context use visible. A useful status line shows:

- Current model
- Context percentage
- Session cost, where available
- Git branch

Suggested setup request:

```text
/statusline show model name, context percentage, cost, and git branch
```

Useful session actions include:

- Inspect the current context when needed.
- Use compaction when continuing the same goal but shedding conversation detail.
- Clear the conversation when changing to an unrelated goal.
- Use plan or read-only behavior before implementation where uncertainty is high.

### Cursor

Participants should be able to:

- Select an appropriate model.
- Use Ask mode for investigation and planning.
- Use Agent mode for implementation.
- Attach a symbol or file before attaching an entire folder.
- Start a new chat when changing to an unrelated goal.
- Use scoped project rules rather than one large global rule.

### Tool-neutral reminder

Do not optimize only for a low displayed token number. A short but under-specified prompt that causes broad repository exploration can be less efficient than a slightly longer prompt containing the correct file, test, constraint, and acceptance criteria.

---

## 11. Task 0 — setup and measurement

**Time:** 10 minutes  
**Purpose:** Establish a visible baseline and prepare the tools.

### Participant brief

```md
Prepare your AI coding tool for the workshop.

1. Record the tool and model you are using.
2. Make context usage visible if your tool supports it.
3. Start a fresh conversation.
4. Run the test suite without asking the agent to explore the repository.
5. Record starting context usage in `workshop/scorecard.md`.
```

### Facilitator checks

- Everyone can install dependencies.
- The initial test suite passes, except where a task-specific branch intentionally contains a failing test.
- Participants know how to start a fresh conversation.
- Participants know how to change model or mode.
- Each participant or pair has an isolated branch or working copy.

### Lesson

Developers need a feedback loop before they can improve their usage.

---

## 12. Task 1 — inefficient baseline

**Time:** 15 minutes  
**Purpose:** Reveal the cost of vague prompts and broad exploration.

### Participant brief

Provide only this prompt:

```text
An order with a percentage discount is charged too much tax.

Fix the bug and make the tests pass.
```

Do not initially provide file references or architectural hints.

### Seeded defect

In `src/pricing/calculate-order-total.ts`, tax is incorrectly calculated from the pre-discount subtotal:

```ts
const taxableAmount = subtotal + shipping;
```

The correct calculation is:

```ts
const taxableAmount = subtotal - discount + shipping;
```

### Relevant files

- `src/pricing/calculate-order-total.ts`
- `tests/pricing/calculate-order-total.test.ts`
- Optionally, `docs/decisions/002-pricing-operation-order.md`

### Deliberate distractions

- `archive/old-tax-calculator.ts`
- `src/pricing/tax-calculator.ts`
- `src/shipping/shipping-zones.ts`
- `fixtures/large-order-history.json`
- API handlers

### Acceptance example

For:

- £100 merchandise subtotal
- 10% discount
- £5 shipping
- 20% tax

The calculation should be:

```text
discounted merchandise = £90
taxable amount = £90 + £5 = £95
tax = £19
total = £90 + £5 + £19 = £114
```

Also verify:

- Orders without a discount remain unchanged.
- Integer currency arithmetic remains in use.
- Public API types are not modified.

### Facilitator observations

Record whether the agent:

- Lists or scans most of the repository.
- Reads `archive/`.
- Opens broad folders.
- Changes the tax calculator unnecessarily.
- Runs the complete suite repeatedly.
- Modifies unrelated files.
- Arrives at a one-line fix only after substantial exploration.

### Debrief exercise

Ask participants to rewrite the prompt they wish they had received.

Example:

```text
Fix the discounted-order tax calculation.

Start with:
- src/pricing/calculate-order-total.ts
- tests/pricing/calculate-order-total.test.ts
- docs/decisions/002-pricing-operation-order.md

Expected operation order:
subtotal → discount → shipping → tax.

Do not change the tax-rate implementation or public API types.

Verify with:
npm test -- tests/pricing/calculate-order-total.test.ts
npm run typecheck
```

### Lesson

A small defect can become expensive when the prompt does not identify relevant state, constraints, or verification.

---

## 13. Task 2 — plan before implementing

**Time:** 20 minutes  
**Purpose:** Practice planning, constraint definition, and narrow verification.

### Participant brief

```md
Wholesale customers may receive percentage discounts, but the discount
must never exceed £500.

Retail behavior must remain unchanged.

Before editing:

1. Identify the acceptance criteria.
2. Inspect only the likely relevant files.
3. Produce a concise implementation plan.
4. Wait for plan approval.
5. Implement the approved plan.
6. Run the narrowest relevant test.
```

Provide these starting references:

```text
- src/pricing/apply-discount.ts
- src/pricing/pricing-policy.ts
- tests/pricing/wholesale-discount.test.ts
```

### Expected plan

A useful plan should resemble:

1. Define the wholesale discount cap in the pricing policy.
2. Calculate the percentage discount and cap it only for wholesale customers.
3. Leave retail behavior unchanged.
4. Add tests below, at, and above the cap.
5. Run the wholesale pricing test and type-check.

### Required behavior

| Customer tier | Calculated discount | Applied discount |
|---|---:|---:|
| Retail | £600 | £600 |
| Wholesale | £400 | £400 |
| Wholesale | £500 | £500 |
| Wholesale | £600 | £500 |

The retail case is intentionally surprising. It proves that the cap is a wholesale policy rather than a global limit.

### Expected files changed

- `src/pricing/pricing-policy.ts`
- `src/pricing/apply-discount.ts`
- `tests/pricing/wholesale-discount.test.ts`

### Common wrong solutions

- Cap every customer's discount.
- Introduce floating-point currency calculations.
- Add pricing policy to an API handler.
- Duplicate the literal `50000` across files.
- Change tests to accept incorrect behavior.
- Refactor the entire pricing pipeline.

### Verification

```text
npm test -- tests/pricing/wholesale-discount.test.ts
npm run typecheck
```

### Lesson

Planning is valuable when it reduces uncertainty and restricts the solution space. Planning should not become an unbounded essay.

---

## 14. Task 3 — precise context versus broad context

**Time:** 15 minutes  
**Purpose:** Use a small architecture map instead of scanning the repository.

### Participant brief

```md
Standard shipping should be free when the discounted merchandise subtotal
is at least £100.

Express shipping is never free.

Determine the smallest set of files needed, then implement and verify the
change.
```

Do not initially provide file names. Participants should use `docs/architecture.md` to route themselves.

### Architecture routing table

Include this table in `docs/architecture.md`:

| Concern | Primary location |
|---|---|
| Order totals | `src/pricing/calculate-order-total.ts` |
| Discounts | `src/pricing/apply-discount.ts` |
| Shipping prices | `src/pricing/shipping-price.ts` |
| Shipping selection | `src/shipping/shipping-selector.ts` |
| Notification retries | `src/notifications/retry-policy.ts` |

### Relevant files

- `src/pricing/shipping-price.ts`
- `src/pricing/calculate-order-total.ts`
- `tests/pricing/calculate-order-total.test.ts`

`src/shipping/shipping-selector.ts` is a plausible distraction. It selects the method but does not determine the price.

### Acceptance cases

| Discounted merchandise subtotal | Method | Shipping charge |
|---:|---|---:|
| £99.99 | Standard | £5 |
| £100 | Standard | £0 |
| £150 | Standard | £0 |
| £150 | Express | £15 |

### Important ambiguity

The threshold applies to the subtotal after discount but before shipping and tax. “Order value” is too ambiguous and should not be used without definition.

### Suggested prompt after investigation

```text
Implement free standard shipping when the discounted merchandise subtotal
is at least 10000 minor units.

Relevant files:
- src/pricing/shipping-price.ts
- src/pricing/calculate-order-total.ts
- tests/pricing/calculate-order-total.test.ts

Constraints:
- Express shipping is never free.
- Evaluate the threshold after discount and before shipping and tax.
- Keep all money values as integer minor units.
- Do not modify shipping-method selection.

First give me a short plan. After approval, implement it and run the focused
pricing test plus type-checking.
```

### Lesson

A small navigation document can save more context than a large permanent instruction file.

---

## 15. Task 4 — change goals and manage context

**Time:** 15 minutes  
**Purpose:** Decide consciously between continuation, compaction, clearing, and a fresh chat.

This task intentionally switches from pricing to notifications.

### Participant brief

```md
Failed fulfilment notification deliveries currently allow three retries.
Change the maximum to two retries.

Do not change pricing code.
```

Before starting, participants must record:

- Whether this is the same goal or a new goal.
- Which existing context is still useful.
- Whether they will continue, compact, clear, or open a fresh conversation.
- Which files or documentation the new session should receive.

### Recommended decision

Start a fresh conversation because the subsystem and goal have changed. Compaction is acceptable if necessary, but carrying detailed pricing discussion into notification work is not useful.

### Relevant files

- `src/notifications/retry-policy.ts`
- `tests/notifications/retry-policy.test.ts`
- `docs/decisions/003-notification-retries.md`

### Semantic trap

“Two retries” means:

```text
initial attempt + retry 1 + retry 2 = three total attempts
```

Seed the implementation with unclear naming:

```ts
const maxAttempts = 3;
```

A careless change to `2` would allow only one retry. A clearer solution is:

```ts
const MAX_RETRIES = 2;
const maxAttempts = 1 + MAX_RETRIES;
```

### Acceptance cases

- Attempt 1 may be retried.
- Attempt 2 may be retried.
- Attempt 3 may not be retried.
- Successful deliveries never retry.
- Permanent failures never retry.

### Verification

```text
npm test -- tests/notifications/retry-policy.test.ts
npm run typecheck
```

### Lesson

Clearing context is not losing engineering work. Code, tests, documentation, and version history preserve the durable state.

---

## 16. Task 5 — match model and mode to the task

**Time:** 10 minutes  
**Purpose:** Choose deliberately rather than always using the most capable or expensive option.

Participants do not need to implement every scenario. They should select a model or interaction mode and justify the choice.

### Scenario A: mechanical change

```text
Rename an internal test helper in one test file. No production behavior changes.
```

Preferred characteristics:

- Fast, lower-cost model
- Direct or inline edit
- No elaborate planning stage
- Only the relevant test file provided

### Scenario B: ambiguous defect

```text
Intermittently, duplicate notification emails are sent after a timeout.
The root cause is unknown.
```

Preferred characteristics:

- Strong reasoning model
- Ask or plan mode first
- Runtime evidence and focused logs
- Implementation only after a plausible hypothesis exists

### Scenario C: known multi-file feature

```text
Expose the existing shipping estimate through a new API response field.
The domain behavior already exists.
```

Preferred characteristics:

- Normal coding model
- Short plan
- Agent mode after plan approval
- Attach the response type, handler, estimator, and tests

### Participant output

```md
Scenario:
Selected model or mode:
Reason:
Context to provide:
Context to exclude:
Escalation condition:
```

### Lesson

“Use the strongest model” is not a complete strategy. Escalate when reasoning complexity or uncertainty warrants it.

---

## 17. Task 6 — capture learning without bloating context

**Time:** 10 minutes  
**Purpose:** Preserve useful discoveries at the narrowest durable scope.

### Participant brief

```md
Review what you learned during the exercises.

Propose repository knowledge updates, but do not add every observation to
the always-loaded instructions.

Classify each discovery as:

- Always-loaded repository rule
- Scoped domain rule
- Architecture or decision documentation
- Temporary session note
- Not worth preserving
```

### Classification exercise

| Discovery | Recommended destination |
|---|---|
| Money uses integer minor units | Core rule or concise repository instructions |
| Pricing operation order | Scoped pricing rule and decision document |
| Wholesale cap is £500 | Pricing policy, tests, and possibly a domain decision |
| Task 1 used three prompts | Do not preserve |
| Notification retries exclude the initial attempt | Notification decision or scoped rule |
| `archive/` is historical only | Core rule |
| Exact files changed today | Handoff or version control |
| Focused pricing test command | Scoped rule or testing documentation |

### Allowed final edits

At most:

- One small clarification in `CLAUDE.md` or `AGENTS.md`.
- One update to a scoped Cursor rule.
- One decision-document improvement.

The always-loaded material must not grow by more than five lines.

### Lesson

Knowledge accumulation can become a permanent token leak. Store knowledge at the narrowest scope where it remains discoverable.

---

## 18. Optional advanced task — recover from a bad session

**Time:** 15–20 minutes  
**Purpose:** Demonstrate that a fresh context can recover effectively from repository state.

Prepare a branch where a previous agent has:

- Modified six unrelated files.
- Added an incorrect global discount cap.
- Changed a test to encode the incorrect behavior.
- Left a verbose progress note.
- Not completed verification.

### Participant brief

```md
Take over this incomplete task.

Do not assume the previous implementation is correct.

1. Inspect the working diff.
2. Restate the intended behavior.
3. Identify unrelated or incorrect changes.
4. Propose a recovery plan.
5. Repair the implementation.
6. Verify the result.
7. Produce a concise handoff.
```

### Success criteria

- Incorrect and unrelated changes are identified.
- Existing useful work is preserved.
- Tests are restored rather than weakened.
- The implementation matches the wholesale-only cap.
- The handoff is no longer than 200 words.

### Lesson

A new model context does not require starting the engineering work from zero. Diffs, tests, commits, and concise handoffs provide efficient state transfer.

---

## 19. Participant prompt canvas

Save as `workshop/prompt-canvas.md`:

```md
# Prompt canvas

## Goal

What observable result should be produced?

## Acceptance criteria

-
-
-

## Relevant context

Files, symbols, tests, logs, or documentation:

-

## Constraints

- Files that must not change:
- Compatibility requirements:
- Safety requirements:

## Plan requirement

Should the agent plan first? Why?

## Verification

Exact command or observable check:

## Completion condition

The task is complete when:
```

---

## 20. Session handoff template

Save as `workshop/handoff-template.md`:

```md
# Session handoff

## Goal

## Completed

## Current state

## Decisions and reasons

## Files changed

## Verification performed

## Remaining work

## Known risks

## Recommended starting context for the next session
```

Set a maximum length of approximately 200 words to require genuine distillation.

---

## 21. Scorecard

Save as `workshop/scorecard.md`:

```md
# Token-efficiency scorecard

| Field | Task 1 | Task 2 | Task 3 | Task 4 |
|---|---:|---:|---:|---:|
| Tool and model | | | | |
| Starting context % | | | | |
| Ending context % | | | | |
| Minutes | | | | |
| Prompts or turns | | | | |
| Files inspected | | | | |
| Relevant files inspected | | | | |
| Files changed | | | | |
| Corrective turns | | | | |
| Focused test runs | | | | |
| Full test runs | | | | |
| Verification passed | | | | |

## Reflection

- Which context was useful?
- Which context was unnecessary?
- What should have been in the initial prompt?
- Was the selected model appropriate?
- Should any discovery persist beyond the session?
```

### Recommended evaluation dimensions

| Dimension | Desired outcome |
|---|---|
| Correctness | Task verification passes |
| Focus | Most inspected files are relevant |
| Context discipline | Context grows only as needed |
| Interaction cost | Few corrective turns |
| Scope discipline | No unrelated changes |
| Verification | Narrow test first, broader verification once |
| Recoverability | A fresh session can resume without rediscovery |
| Knowledge quality | Durable learning is captured without bloating global rules |

The ratio below is a useful tool-neutral measure:

```text
relevant files inspected ÷ total files inspected
```

A suggested target is at least 70% for the guided exercises.

---

## 22. Verification scripts

Provide these commands:

```text
npm run verify:task-1
npm run verify:task-2
npm run verify:task-3
npm run verify:task-4
npm run verify:all
```

Verification should test observable behavior rather than search source files for expected strings. It should also detect:

- Changes to public API response types
- Floating-point money behavior
- Retail regression in Task 2
- Express-shipping regression in Task 3
- Confusion between retries and total attempts in Task 4

Keep normal tests visible. If additional facilitator checks are used, do not make them so obscure that participants cannot reason about the intended behavior.

---

## 23. Branch and participant setup

Prepare task starting points as Git tags or branches:

```text
workshop/start
workshop/task-1
workshop/task-2
workshop/task-3
workshop/task-4
workshop/bad-handoff
workshop/solutions
```

Give each participant or pair an isolated branch:

```text
participant/alex
participant/sam
pair/team-01
pair/team-02
```

Do not have all participants edit the same working tree.

For a larger group, prepare equivalent A and B variants of the same tasks so neighboring pairs cannot simply copy answers. Keep the learning goal and difficulty equivalent while changing business values or subsystems.

---

## 24. Suggested pair format

For mixed-tool pairs:

- Developer A operates Claude Code.
- Developer B operates Cursor.
- Both discuss the goal and fill in the prompt canvas.
- Only the operator sends prompts or approves edits.
- After each task, compare context, files inspected, turns, and verification.
- Switch operators or tools for the next task.

The comparison should focus on workflow decisions, not declaring one tool universally better.

---

## 25. Facilitator debrief questions

After Task 1:

- What information did the agent have to discover that the prompt could have provided?
- Which files were read but did not influence the solution?
- Did the agent verify the correct behavior or merely make the failing test pass?

After Tasks 2 and 3:

- Did the plan change the implementation approach?
- Was the plan concise enough to be useful?
- Which reference provided the highest value for the least context?
- Did the team run the narrowest relevant test first?

After Task 4:

- Which pricing context would have helped with notification retries?
- What durable state survived the fresh session?
- Did clearing context reduce or increase recovery time?

After Task 6:

- Which discovery belongs in global instructions?
- Which discovery should be scoped to one subsystem?
- Which observation should be allowed to disappear?

---

## 26. Closing retrospective

Ask every pair to contribute:

1. One source of wasted context they observed.
2. One prompt pattern they intend to reuse.
3. One durable repository fact worth documenting.
4. One signal that should trigger a fresh conversation.
5. One condition that justifies switching to a stronger model.

Combine the best findings into a short team checklist. Cap always-loaded guidance at roughly one screen. Put detailed or subsystem-specific knowledge in linked documentation and scoped rules.

---

## 27. Final team checklist

Before starting:

- State one concrete goal.
- Define observable acceptance criteria.
- Identify likely files, symbols, tests, or logs.
- Decide whether the task needs a plan.
- Select an appropriate model and mode.
- Record initial context or usage where available.

During the task:

- Inspect narrowly before searching broadly.
- Stop and re-plan when new evidence invalidates the approach.
- Run the narrowest relevant verification first.
- Avoid unrelated cleanup and refactoring.
- Watch for a change in goal or subsystem.

Before continuing a long session:

- Remove irrelevant attachments.
- Compact only when continuing the same goal.
- Start fresh when the goal changes.
- Write a concise handoff when state is not obvious from the repository.

After completion:

- Run proportionate verification.
- Confirm that unrelated files were not changed.
- Record useful measurements.
- Preserve only durable, reusable learning.
- Store knowledge at the narrowest appropriate scope.

---

## 28. Definition of workshop success

The workshop is successful when participants leave with changed working habits, not merely completed exercises.

Evidence of success includes:

- Prompts name goals, constraints, relevant code, and verification.
- Agents inspect fewer irrelevant files.
- Plans are requested for ambiguous or multi-file work, not for every trivial edit.
- Participants change sessions when goals change.
- Model choices vary according to task difficulty.
- Repository instructions remain concise.
- New domain knowledge is placed in scoped rules, tests, or decision documents.
- Teams compare efficiency using correctness, focus, time, and corrections—not raw tokens alone.

