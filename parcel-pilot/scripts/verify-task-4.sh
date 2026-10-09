#!/usr/bin/env bash
# Verification for Task 4: behaviour check plus type-checking.
set -euo pipefail

cd "$(dirname "$0")/.."
npm run verify:task-4
npm run typecheck
echo "Task 4 verified."
