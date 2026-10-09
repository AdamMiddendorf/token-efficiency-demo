# Parcel Pilot

TypeScript order-pricing and fulfilment service.

## Commands

- Install: `npm install`
- Test all: `npm test`
- Test one file: `npm test -- <path>`
- Type-check: `npm run typecheck`
- Lint: `npm run lint`

## Architecture

- Domain logic lives under `src/`; tests mirror those areas under `tests/`.
- `src/app/build-app.ts` wires everything; only `src/config/` reads the environment.
- Money is stored as integer minor units.
- Public API response types must remain backward-compatible.
- `archive/` is historical and must not be used as the current implementation.

Run the narrowest relevant test before the full suite.

Read `docs/architecture.md` only when you need to locate code.
Read the relevant `docs/decisions/` record only when changing a business rule.
