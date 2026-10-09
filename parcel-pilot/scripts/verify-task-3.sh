#!/usr/bin/env bash
# Verification for Task 3: behaviour check plus type-checking.
set -euo pipefail

cd "$(dirname "$0")/.."
npm run verify:task-3
npm run typecheck
echo "Task 3 verified."
