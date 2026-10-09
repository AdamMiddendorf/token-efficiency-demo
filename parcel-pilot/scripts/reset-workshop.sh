#!/usr/bin/env bash
# Reset the workshop code to its starting state.
# Discards local changes under src/ and tests/. Docs, guides and the scorecard
# are left alone.
set -euo pipefail

cd "$(dirname "$0")/.."

if ! git rev-parse --git-dir >/dev/null 2>&1; then
  echo "Not a git repository - nothing to reset." >&2
  exit 1
fi

echo "This will discard all local changes under src/ and tests/."
read -r -p "Continue? [y/N] " reply
case "$reply" in
  [yY]*) ;;
  *) echo "Aborted."; exit 0 ;;
esac

git checkout -- src tests
echo "Reset. Running the suite (one failure is expected - that is Task 1):"
npm test || true
