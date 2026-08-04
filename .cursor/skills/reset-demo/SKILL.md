---
name: reset-demo
description: Reset the Grafana demo environment by closing the active demo PR, checking out main, and deleting the feature branch locally and on origin. Use when the user asks to reset the demo, clean up after a demo, close the PR and return to main, or restore a clean main checkout.
---

# Reset Demo

Tear down the current demo branch/PR and return to a clean `main`.

Also follow [github-fieldsphere-fork](../github-fieldsphere-fork/SKILL.md) for all `gh` mutations (`--repo fieldsphere/grafana`).

## Steps

1. **Identify the demo PR and branch**
   - Prefer the PR/branch from the current conversation.
   - If unclear: `git branch --show-current`, `git status -sb`, and `gh pr list --repo fieldsphere/grafana --head <user>:<branch>` (or view by PR number).

2. **Close the PR** (if open)

```bash
gh pr close <PR_NUMBER> --repo fieldsphere/grafana --comment "Closing to reset demo environment."
```

3. **Return to main and sync**

```bash
git checkout main
git pull origin main
```

4. **Delete the feature branch** (local + origin)

```bash
git branch -D <feature-branch>
git push origin --delete <feature-branch>
```

Skip remote delete if the branch was never pushed. Do not delete `main`.

5. **Confirm clean state**

```bash
git status -sb
git branch --show-current
```

Expect `main` tracking `origin/main` with a clean working tree. Call `SetActiveBranch` for `main`.

## Rules

- Do **not** force-push or hard-reset `main` unless the user explicitly asks.
- Do **not** discard unrelated uncommitted work without asking; stash or leave it and warn.
- Summarize: closed PR URL, current branch, deleted branch names.
