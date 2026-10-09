#!/usr/bin/env bash
# Full verification: type-check, normal test suite, then every task check.
set -uo pipefail

cd "$(dirname "$0")/.."
status=0

run() {
  echo ""
  echo "=== $* ==="
  "$@" || status=1
}

run npm run typecheck
run npm test
run npm run verify:all

echo ""
if [ "$status" -eq 0 ]; then
  echo "All checks passed."
else
  echo "Some checks failed (expected before the tasks are solved)."
fi
exit "$status"
