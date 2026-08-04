#!/usr/bin/env bash
set -euo pipefail

INPUT_JSON="$(cat)"
COMMAND="$(python3 -c 'import json,sys; print(json.load(sys.stdin).get("command",""))' <<< "$INPUT_JSON" 2>/dev/null || true)"
COMMAND_LC="$(printf '%s' "$COMMAND" | tr '[:upper:]' '[:lower:]')"

# Only enforce policy for gh commands. Other commands are always allowed.
if [[ ! "$COMMAND_LC" =~ (^|[[:space:]])gh([[:space:]]|$) ]]; then
  printf '%s\n' '{"continue":true,"permission":"allow"}'
  exit 0
fi

is_mutating="false"
if [[ "$COMMAND_LC" =~ (^|[[:space:]])(create|edit|merge|close|reopen|delete|transfer|lock|unlock|pin|unpin|upload|archive|unarchive|review|ready)([[:space:]]|$) ]]; then
  is_mutating="true"
fi

targets_disallowed="false"
if [[ "$COMMAND_LC" =~ (--repo|-r)[[:space:]]*(grafana/grafana|fieldsphere/grafana) ]] \
  || [[ "$COMMAND_LC" =~ github\.com/(grafana|fieldsphere)/grafana ]] \
  || [[ "$COMMAND_LC" =~ (^|[[:space:]])(grafana|fieldsphere)/grafana([[:space:]]|$) ]]; then
  targets_disallowed="true"
fi

targets_fork_explicit="false"
if [[ "$COMMAND_LC" =~ (--repo|-r)[[:space:]]*jstein77/grafana ]] || [[ "$COMMAND_LC" =~ github\.com/jstein77/grafana ]]; then
  targets_fork_explicit="true"
fi

if [[ "$is_mutating" == "true" && "$targets_disallowed" == "true" ]]; then
  cat <<'EOF'
{"continue":true,"permission":"deny","user_message":"Blocked: write actions to grafana/grafana or fieldsphere/grafana are not allowed from this repo. Target Jstein77/grafana instead.","agent_message":"This gh command appears to perform a write operation against grafana/grafana or fieldsphere/grafana. Use --repo Jstein77/grafana for write actions."}
EOF
  exit 0
fi

if [[ "$is_mutating" == "true" && "$targets_fork_explicit" != "true" ]]; then
  cat <<'EOF'
{"continue":true,"permission":"deny","user_message":"Blocked: mutating gh commands must include --repo Jstein77/grafana.","agent_message":"For safety, mutating gh commands must explicitly target the personal fork via --repo Jstein77/grafana."}
EOF
  exit 0
fi

printf '%s\n' '{"continue":true,"permission":"allow"}'
