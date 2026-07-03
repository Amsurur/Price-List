---
description: Resume work on Softclub Store — start the dev stack, read Roadmap.md + PROGRESS.md, summarize last session, propose a plan for today, then wait for "go".
allowed-tools: Bash, Read, Write
---

# /start — Resume session

Execute these steps in order. **Do not start writing or editing app code until the user says "go".**

## 1. Start the dev stack

1. **Postgres (Docker):** run `npm run db:up` from the repo root. Poll `docker inspect --format '{{.State.Health.Status}}' softclub-postgres` until it prints `healthy` (give up after ~30s). If Docker isn't running or the container never turns healthy, report the problem but **do not abort the command** — skip the rest of this step and continue to state-gathering below (planning doesn't need the stack up).
2. **API (NestJS):** start `npm run dev:api` **in the background** (run_in_background). Wait a few seconds, then confirm with `curl -s http://localhost:3001/api/health` — expect `{"status":"ok","database":"up",...}`.
3. **Web (Next.js):** start `npm run dev:web` **in the background** (run_in_background).
4. Note the three URLs (web `http://localhost:3000`, API `http://localhost:3001/api`, DB `localhost:5432`) for the final report. Env comes from the repo-root `.env` (copy from `.env.example` if missing).

## 2. Gather state

Run these in parallel:

- `cat documents/Roadmap.md` — the milestone checklist (M0–M5), each with `- [ ]` items and a **"Done when:"** line. There is no explicit "next action" pointer in this file — progress must be inferred from ticked boxes + git log.
- `cat PROGRESS.md 2>/dev/null || echo "NO_PROGRESS"` — this session's entry point, written by the previous `/start` run.
- `cat handoff.md 2>/dev/null` — emergency context (only present after a context-limit save per the global handoff rule).
- `git status --short` — what's dirty.
- `git log --oneline -10` — recent commits.
- `git show --stat HEAD | head -30` — what the last commit actually touched.
- `git branch --show-current` — which branch we're on.
- `git remote -v` — does a remote exist?

**Cross-check for staleness:** if `documents/Roadmap.md`'s checkboxes contradict what git log/git show show actually happened (e.g. a milestone item is unchecked but the code + commits show it's done), trust **git log** for "what happened" and say so explicitly in the briefing — then propose updating the stale checkboxes as part of today's plan. Don't silently rewrite `documents/Roadmap.md` yourself.

## 3. Maintain PROGRESS.md

This is the one exception to "read-only until go" — session bookkeeping, not app code.

- Cross-check each milestone (M0–M5) in `documents/Roadmap.md` against real repo state (commits, files present under `apps/`) to judge actual status: done / in progress / not started.
- Write (create or overwrite) `PROGRESS.md` at the repo root with this structure:

```markdown
# Progress

## Entry Point
Branch: <current branch>
Files in flight: <files touched/uncommitted, from git status + last diff — or "none">

## Last Session
<1-3 lines summarizing the most recent commit(s) and what they actually touched>

## Milestone Status
- M0 — Project setup: <done / in progress / not started>
- M1 — Data + admin core: <...>
- M2 — Storefront browse: <...>
- M3 — Student codes + member pricing: <...>
- M4 — Reservations: <...>
- M5 — Polish + launch: <...>
(flag here if this disagrees with documents/Roadmap.md's checkboxes)

## Blockers
<anything found — env issues, failing health check, etc. — or "none">

## Next Step
<the single most logical next action, derived from the first unchecked/incomplete Roadmap item>
```

- If `PROGRESS.md` didn't exist before this run, note in the briefing that this is the first tracked session — git log is the only history available.

## 4. Briefing

Print a tight 4-section briefing:

- **What changed last session** — from git log/show: 1–2 lines naming the actual files/features touched.
- **Where we left off** — the Entry Point just written to `PROGRESS.md`, condensed to ~2 lines.
- **What's blocking** — the Blockers section.
- **What's next** — `documents/Roadmap.md`'s first unchecked item reconciled with `PROGRESS.md`'s Next Step; if they disagree, state which one you're following and why.

Then read any files mentioned in "Files in flight" or the Next Step so you have real context, not just the summary.

## 5. Rotate to a fresh branch (one branch per session)

Today's work starts on its own branch — never keep committing onto a branch carried over from a previous session.

- Propose `feature/<slug>` where `<slug>` names today's work (3–5 words, kebab-case) — matching this repo's existing convention (e.g. `feature/m1-slice1-data-products`).
- Create it (`git checkout -b <branch>`) once the user says "go" on the plan — before the first edit.
- If the carried-over branch has uncommitted changes, resolve them (keep / stash / commit) per the dirty-state rule below before branching.

## 6. Propose today's plan

Aim for a **full, shippable feature per session — not a thin slice of one.** A session should land roughly 2× what a single 20–90 min task would: think "the whole reservation-actions feature (cancel + extend + convert)", not "just cancel".

In 4–7 bullets, propose what to attempt. Be concrete:

- "Wire `useProduct(id)` hook against `GET /products/:id`, add fixture test, smoke in dev"
- "Add admin login screen route + form (schema only, no API call yet)"
- "Resolve the stock-decrement TODO in reservation completion logic"

NOT:
- "Continue M1" (too vague)
- "Build the whole admin dashboard" (too big for one session)

Sizing rules:
- **Don't carve a cohesive feature into one-action slices.** If three actions share a surface, a hook layer, and tests, they are *one* session's work — plan all of them.
- **Don't over-defer.** Only push a piece to a future session when it's genuinely multi-session (a whole new module, a new screen tree, an unbuilt dependency). "It touches more files" or "there's an edge case" is not a reason to defer — handle it now.
- Target ~3–6 hours of focused work total. If the natural feature is bigger than that, split at a real seam and say so; if it's smaller, pull the next coherent chunk forward to fill the session.

For any bullet touching 3+ files (new screens, flows, real-time, permissions): note that it will go through `/plan-feature` first — present the phased plan and wait for a second "go".

## 7. Keep going until the plan is done

After the planned items land green (typecheck + lint + tests + build), **don't stop early.** If context budget remains, roll straight into the next coherent chunk — finish the feature, then pull the next item forward — rather than ending the session with one slice shipped. Only wind down when the feature is complete, the context-limit handoff rule triggers, or the user says stop.

## 8. Wait

End with: *"Say **go** to start, or tell me to swap items."* Do not write or edit any app code until the user responds.

## Rules

- Step 1 (dev stack) and step 3 (`PROGRESS.md`) are the only steps allowed to run commands/write files beyond reads. Steps 2, 4–8 are read + plan only — never edit app code, never commit, never `npm install`.
- If `git status` is dirty with uncommitted changes from a prior session, mention it in step 4 and ask whether to keep them, stash them, or commit them before starting fresh work.
- If we're on `main` (or `master`) and the planned work is non-trivial (anything beyond a doc tweak), note in the plan: *"I'll create a `feature/<slug>` branch before the first commit — confirm slug when ready."*
