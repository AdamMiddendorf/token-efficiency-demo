#!/usr/bin/env bash
# Verification for Task 2: behaviour check plus type-checking.
set -euo pipefail

cd "$(dirname "$0")/.."
npm run verify:task-2
npm run typecheck
echo "Task 2 verified."
