# Pokecord Mobile

Planning foundation for a GPS walking Pokémon fan-game. No application implementation yet.

## Accepted direction

- Expo + React Native + TypeScript; Android development builds are the primary integration target.
- Bun workspaces, dependency management, scripts and server runtime; Fastify + TypeScript backend and PostgreSQL.
- Server-authoritative movement validation and encounters. Pokémon Showdown runs server-side behind an adapter when battles are introduced.
- Cached Pokémon metadata sourced from PokéAPI; pixel-art sprites. No heavy AR or Phaser initially.
- Dokploy staging on the VPS is the normal phone backend. Local backend remains available for fast debugging.

Read [the implementation plan](docs/PLAN.md), [development workflow](docs/DEVELOPMENT.md), [Git workflow](docs/GIT_WORKFLOW.md), [testing strategy](docs/TESTING.md), and [shared agent instructions](AGENTS.md).

The first milestone is GPS → validated movement → server encounter check → notification and debug output. Broader gameplay follows only after this works on a physical Android phone.

This is an unofficial fan project. Ownership and licenses of third-party metadata, simulator code and art must be recorded before importing or distributing those assets. No affiliation is claimed.
