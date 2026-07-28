---
name: github-demo-fork
description: Ensure GitHub context, issues, and pull request work targets the Jstein77/grafana demo fork. Use for any GitHub-related task, including issues, PRs, commits, searches, pushes, or repository context.
---

# GitHub fork targeting: Jstein77/grafana

Demo work always targets the personal fork, not fieldsphere or upstream Grafana.

## Instructions

- Always use `Jstein77/grafana` for GitHub queries and operations (issues, PRs, commits, pushes, code search, and repo context).
- For mutating `gh` CLI commands (for example `pr create`, `pr edit`, `pr merge`, issue/release writes), always pass `--repo Jstein77/grafana`.
- Git remotes must be:
  - `origin` → `https://github.com/Jstein77/grafana.git` (push/pull for demos)
  - `upstream` → `https://github.com/fieldsphere/grafana.git` (optional sync source only)
- For read-only/sync operations, `fieldsphere/grafana` or `grafana/grafana` may be used when explicitly needed (comparing, listing, syncing, or fetching context), but never as the target for write actions.
- For GitHub MCP tools, set owner to `Jstein77` and repo to `grafana` (or include this in the tool query when required).
- For PR creation and PR updates, explicitly state the target repo in user-facing output, e.g. `Target repo: Jstein77/grafana`, and include the PR URL.
- Never create, edit, or merge PRs/issues/releases against `fieldsphere/grafana` or `grafana/grafana` unless the user explicitly requests that remote.
- If the target repo is ambiguous, check `git remote -v` and still prefer `Jstein77/grafana`.
