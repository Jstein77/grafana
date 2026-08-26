#!/usr/bin/env bash
set -euo pipefail

INPUT_JSON="$(cat)"
printf '%s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ) $INPUT_JSON" >> /tmp/confirm-git-push.log

COMMAND="$(python3 -c 'import json,sys; print(json.load(sys.stdin).get("command",""))' <<< "$INPUT_JSON" 2>/dev/null || true)"

# Ask on any git push, including wrapped forms like bash -lc '...git push...' or /usr/bin/git push
if [[ "$COMMAND" == *git* && "$COMMAND" == *push* ]]; then
  printf '%s\n' '{"permission":"ask","user_message":"Review and approve this git push.","agent_message":"Repository policy requires explicit human approval before pushing."}'
  exit 0
fi

printf '%s\n' '{"permission":"allow"}'
