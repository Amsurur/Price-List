---
description: Stop the Softclub Store dev stack (web, API, and Postgres)
allowed-tools: Bash
---

Stop the local dev stack for Softclub Store. Report a concise summary at the end.

1. **Web + API:** kill the background dev servers started by `/start`.
   - If you have their background shell IDs from this session, stop those.
   - Otherwise kill by port: `lsof -ti :3000 | xargs kill 2>/dev/null` (Next.js) and `lsof -ti :3001 | xargs kill 2>/dev/null` (NestJS). Use `kill -9` only if a process refuses to stop.

2. **Postgres (Docker):** run `npm run db:down` from the repo root. This stops the container but **keeps the data volume** (`softclub_pgdata`), so nothing is lost. Only run `docker compose down -v` if the user explicitly asks to wipe the database.

3. **Report:** confirm the web, API, and DB are stopped, and remind the user the Postgres data volume was preserved.
