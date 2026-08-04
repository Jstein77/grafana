---
name: github-fieldsphere-fork
description: Ensure GitHub context, issues, and pull request work targets the Jstein77/grafana personal fork. Use for any GitHub-related task, including issues, PRs, commits, searches, or repository context.
---

# GitHub fork targeting: Jstein77/grafana

## Instructions

- Always use `Jstein77/grafana` for GitHub queries and operations (issues, PRs, commits, code search, and repo context).
- For mutating `gh` CLI commands (for example `pr create`, `pr edit`, `pr merge`, issue/release writes), always pass `--repo Jstein77/grafana`.
- For read-only/sync operations, upstream `grafana/grafana` or `fieldsphere/grafana` may be used when explicitly needed (for example comparing, listing, syncing, or fetching context), but never as the target for write actions.
- For GitHub MCP tools, set owner to `Jstein77` and repo to `grafana` (or include this in the tool query when required).
- For PR creation and PR updates, explicitly state the target repo in user-facing output, e.g. `Target repo: Jstein77/grafana`, and include the PR URL.
- Never create, edit, or merge PRs/issues/releases against `grafana/grafana` or `fieldsphere/grafana` unless the user explicitly requests that target.
- If the target repo is ambiguous, check `git remote -v` and still prefer `Jstein77/grafana` (`origin`).
