#!/usr/bin/env bash
# Verification for Task 1: behaviour check plus type-checking.
set -euo pipefail

cd "$(dirname "$0")/.."
npm run verify:task-1
npm run typecheck
echo "Task 1 verified."
