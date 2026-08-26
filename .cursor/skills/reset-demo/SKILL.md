---
name: reset-demo
description: Reset the Grafana cloud-agents/automations demo — align Linear to open GitHub issues, close open PRs, return to a clean main checkout. Use when the user asks to reset the demo, clean up after a demo, close PRs and return to main, or restore a clean demo state.
---

# Reset Demo

Restore the cloud agents / automations demo to a clean baseline:

1. Linear issues match open GitHub issues (GitHub is the demo source of truth), with one named exception
2. All open PRs closed; local checkout on `main`
3. Anything else that still looks like mid-demo state is cleaned up

Also follow [github-fieldsphere-fork](../github-fieldsphere-fork/SKILL.md) for all `gh` mutations (`--repo Jstein77/grafana`).

## 1. Align Linear to open GitHub issues

**Source of truth:** open issues on `Jstein77/grafana`.

```bash
gh issue list --repo Jstein77/grafana --state open --limit 100
```

**Linear project:** `Grafana [JS]` (team: Cursor Solutions / `CS-*`). Linear is a mirror only. Demo from GitHub issues on `Jstein77/grafana`.

For every open GH issue, ensure a matching open Linear issue exists in that project (same title / clear 1:1 mapping). Create any missing Linear issues (Backlog) with the GH body and a link to the GH issue.

Cancel (or otherwise close) Linear issues in `Grafana [JS]` that do **not** correspond to an open GH issue, **except**:

| Keep open | Why |
| --------- | --- |
| **CS-868** | Star Dashboards — drives the docs PR automation demo (Linear-only) |

The SpaceX AI theme lives on GitHub as [Jstein77/grafana#41](https://github.com/Jstein77/grafana/issues/41). CS-858 is the Linear mirror of that issue, not a Linear-only seed.

Do not cancel issues in other Linear projects (Changi, canvas, Armin Grafana, etc.).

Leave kept issues in **Backlog** (not In Progress / In Review) unless the user says otherwise.

## 2. Close open PRs and return to main

Close **all** open PRs on `Jstein77/grafana` (including drafts and the SpaceX / Star Dashboards demo PRs — those demos restart from the open GitHub issues, plus CS-868).

```bash
gh pr list --repo Jstein77/grafana --state open
# for each PR:
gh pr close <PR_NUMBER> --repo Jstein77/grafana \
  --comment "Closing to reset demo environment." \
  --delete-branch
```

Then:

```bash
git checkout main
git pull origin main
git branch -D <feature-branch>   # if still present locally
```

Skip remote branch delete if already removed by `--delete-branch`. Do not delete `main`.

Call `SetActiveBranch` for `main`.

## 3. Sweep other demo drift

Check and fix anything else that is not clean demo state:

- Working tree: should be clean on `main` tracking `origin/main`
- No open PRs left on `Jstein77/grafana`
- Linear `Grafana [JS]` open set = open GH issues + CS-868 only
- Optional: mention leftover local demo branches (e.g. old `cursor/*`) — delete only if the user asks

```bash
git status -sb
git branch --show-current
gh pr list --repo Jstein77/grafana --state open
```

## Rules

- Do **not** force-push or hard-reset `main` unless the user explicitly asks.
- Do **not** discard unrelated uncommitted work without asking; stash or leave it and warn.
- Do **not** close or cancel CS-868 during reset. Keep CS-858 only while GH #41 is open (it is the Linear mirror).
- Summarize: Linear creates/cancels, closed PR numbers/URLs, current branch, deleted branches.
