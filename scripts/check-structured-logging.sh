#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

PATTERN='logger\.(Debug|Info|Warn|Error)\(fmt\.Sprintf'

if matches=$(rg -n "$PATTERN" pkg --glob '*.go' || true); then
  if [ -n "$matches" ]; then
    echo "Found unstructured logging calls using fmt.Sprintf inside logger methods:"
    echo "$matches"
    exit 1
  fi
fi

echo "Structured logging check passed."
