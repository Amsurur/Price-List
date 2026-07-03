---
description: Stop the Softclub Store dev stack (web, API, Postgres) and commit + push the session's work
allowed-tools: Bash
---

Stop the local dev stack for Softclub Store. Report a concise summary at the end.

1. **Web + API:** kill the background dev servers started by `/start`.
   - If you have their background shell IDs from this session, stop those.
   - Otherwise kill by port: `lsof -ti :3000 | xargs kill 2>/dev/null` (Next.js) and `lsof -ti :3001 | xargs kill 2>/dev/null` (NestJS). Use `kill -9` only if a process refuses to stop.

2. **Postgres (Docker):** run `npm run db:down` from the repo root. This stops the container but **keeps the data volume** (`softclub_pgdata`), so nothing is lost. Only run `docker compose down -v` if the user explicitly asks to wipe the database.

2.5 **Update Roadmap.md** which M is done check the mark 

3. **Commit + push the session's work:** run `git status --porcelain`.
   - No changes → skip this step entirely.
   - Changes present:
     - Run `git status` / `git diff` to see what changed and understand *why*, and check for accidental artifacts (e.g. paths written under a stale nested directory like `apps/x/apps/x/...` from a `cd` that didn't reset) — clean those up before staging.
     - Branch: if currently on `main` or `master`, create a new branch named for the work done this session (kebab-case, e.g. `feature/<short-description>`) and switch to it. If already on a non-main feature branch, stay on it — don't branch again every stop.
     - Stage by explicit path (never `git add -A` or `git add .`); skip anything that looks like a secret (`.env`, credentials).
     - Commit with a message describing *why* the change was made, matching this repo's existing commit style, ending with:
       ```
       Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
       ```
     - Push: `git push -u origin <branch-name>`.
     - If push fails (no network, auth, etc.), report the failure — don't force-push or retry destructively.

4. **Report:** confirm the web, API, and DB are stopped, remind the user the Postgres data volume was preserved, and state the branch name + commit summary + push result (or "nothing to commit").
