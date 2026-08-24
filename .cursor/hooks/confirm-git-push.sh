#!/usr/bin/env bash
set -euo pipefail

cat >/dev/null

printf '%s\n' '{"permission":"ask","user_message":"Review and approve this git push.","agent_message":"Repository policy requires explicit human approval before pushing."}'
