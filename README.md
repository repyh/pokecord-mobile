# Pokecord Mobile

Runnable foundation for a GPS walking Pokémon fan-game. The starter app and backend readiness check are implemented; GPS encounters are the next milestone.

## Run locally

Prerequisites: Bun 1.4.2, Node LTS (22.14+), and Docker Desktop running Linux containers.

```sh
bun install --frozen-lockfile
bun run db:up
```

Copy `apps/server/.env.example` to `apps/server/.env`, then run:

```sh
bun run db:migrate
bun run dev:server
```

In a second terminal:

```sh
bun run dev:mobile
```

For the browser preview: `bun run --cwd apps/mobile start --web --port 8081`, then open http://localhost:8081. This previews the UI; background GPS and native notifications require a physical Android development build.

For Android: install a development build first (`bunx eas-cli build --platform android --profile development` from `apps/mobile`, after Expo login/project setup), then connect its launcher to Metro. `bun run dev:field` uses a Metro tunnel for field development. EAS account/project setup and a physical phone build have not yet been verified.

Copy `apps/mobile/.env.example` to `.env` in that same directory and set the real staging HTTPS URL. For local phone debugging, use your PC's LAN address instead of localhost. Restart Metro after environment changes; use `--clear` when exporting after a URL change to avoid a stale embedded address. No staging URL is preconfigured. Browser clients must be listed as exact origins in the server's comma-separated `BROWSER_ORIGINS` setting; the example enables localhost preview only. The app automatically checks readiness and validates the API response using the shared contract.

When the phone is on another network, both the API and Metro need reachable HTTPS endpoints. A Metro tunnel alone does not expose the API. `bun run dev:field` uses the pinned Expo ngrok development helper. Temporary test URLs stop working when their local server/tunnel stops; use Dokploy staging for regular field development.

## Verify

`bun run check` runs lint, strict type checking and API tests. `bun run mobile:check` checks Expo compatibility; `bun run mobile:export` verifies Android bundling.

Integration tests require a disposable PostgreSQL database whose name ends in `_test`. Create `pokecord_test` using `docker compose -f infra/compose.dev.yml exec -T postgres createdb -U pokecord pokecord_test`, set `TEST_DATABASE_URL=postgres://pokecord:local-only@127.0.0.1:5432/pokecord_test`, and run `bun run test:integration`. These tests reset the application schema in that database. Never point them at staging or a database containing valuable data.

Stop local PostgreSQL with `bun run db:down` (retains its volume). Stop Metro and the backend with Ctrl+C. Bun's backend watcher currently warns that shared package files are outside its watch scope; restart the backend after changing contracts.

CI, Dokploy deployment, Android installation and GPS/background tracking remain pending. Do not treat browser/bundle verification as device evidence.

## Accepted direction

- Expo + React Native + TypeScript; Android development builds are the primary integration target.
- Bun workspaces, dependency management, scripts and server runtime; Fastify + TypeScript backend and PostgreSQL.
- Server-authoritative movement validation and encounters. Pokémon Showdown runs server-side behind an adapter when battles are introduced.
- Cached Pokémon metadata sourced from PokéAPI; pixel-art sprites. No heavy AR or Phaser initially.
- Dokploy staging on the VPS is the normal phone backend. Local backend remains available for fast debugging.

Read [the implementation plan](docs/PLAN.md), [development workflow](docs/DEVELOPMENT.md), [Git workflow](docs/GIT_WORKFLOW.md), [testing strategy](docs/TESTING.md), and [shared agent instructions](AGENTS.md).

The first milestone is GPS → validated movement → server encounter check → notification and debug output. Broader gameplay follows only after this works on a physical Android phone.

This is an unofficial fan project. Ownership and licenses of third-party metadata, simulator code and art must be recorded before importing or distributing those assets. No affiliation is claimed.
