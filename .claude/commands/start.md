---
description: Start the Softclub Store dev stack (Postgres, NestJS API, Next.js web)
allowed-tools: Bash, Read
---

Start the full local dev stack for Softclub Store. Do this in order and report the result concisely at the end.

1. **Postgres (Docker):** run `npm run db:up` from the repo root. Then wait until the container is healthy — poll with `docker inspect --format '{{.State.Health.Status}}' softclub-postgres` until it prints `healthy` (give up after ~30s and report the problem). If Docker isn't running, tell the user and stop.

2. **API (NestJS):** start `npm run dev:api` **in the background** (run_in_background). It listens on `http://localhost:3001/api`. Wait a few seconds, then confirm with `curl -s http://localhost:3001/api/health` — expect `{"status":"ok","database":"up",...}`.

3. **Web (Next.js):** start `npm run dev:web` **in the background** (run_in_background). It listens on `http://localhost:3000`.

4. **Report:** print the three URLs (web `http://localhost:3000`, API `http://localhost:3001/api`, DB `localhost:5432`) and the `/api/health` result. Note that the API and web run as background processes and can be stopped with `/stop`.

Notes:
- Env comes from the repo-root `.env` (copy from `.env.example` if it's missing).
- Do not run the dev servers in the foreground — they must be backgrounded so the session stays interactive.
