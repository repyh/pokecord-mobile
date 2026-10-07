# Draft implementation plan

Status: runnable foundation, 2026-10-07. Bun workspaces, Expo SDK 57 starter screen, Fastify health/readiness, PostgreSQL Compose and checksummed transactional migrations are implemented. Local checks, PostgreSQL integration, Expo compatibility and Android export passed. CI, deployment image/Dokploy and physical-phone build remain pending. Walking behavior is not implemented yet. Bun replaces the earlier pnpm preference.

## Architecture

```text
apps/mobile                 Expo app, location tasks, notifications, dev HUD
apps/server                 Fastify API, authentication, PostgreSQL persistence
packages/contracts          Versioned runtime schemas and inferred TS types
packages/encounter-engine    Pure movement and encounter rules, deterministic tests
packages/pokemon-data       Small versioned metadata cache, later import tooling
packages/battle             Later: adapter around server-side Pokémon Showdown
infra                       Local Compose, server Dockerfile, Dokploy instructions
docs                        Decisions, workflows, device evidence and debt
```

Create packages only when used. Contracts and the encounter engine come first. Mobile must never import server-only database or simulator dependencies.

Bun will run the backend, with a compatibility smoke test for Fastify and the database driver before committing to them. Keep Node LTS available for Expo tooling as documented by Expo. Showdown gets an isolated adapter and compatibility check before battle work; if Bun cannot run the simulator reliably, document a narrowly scoped Node process fallback rather than changing the whole toolchain.

## Milestone 0: reproducible foundation

1. Scaffold Bun workspaces and Expo's current supported TypeScript template. Pin compatible Expo/native dependencies using Expo tooling; pin Bun and commit the lockfile.
2. Add strict type checking, formatting/linting, meaningful test commands and CI. Do not make empty test suites look like validation.
3. Add PostgreSQL local Compose, migrations, health/readiness endpoints and a multi-stage backend image.
4. Prepare Dokploy staging with separate database, secrets, HTTPS, backups and manual migration/release instructions. Record deployed commit and rollback steps.
5. Create an Android development build, install it on the physical phone and prove phone → staging health connectivity.

Exit: clean checkout can install and pass CI; backend boots against PostgreSQL; phone reaches staging. Required inputs for deployment: Dokploy access, staging hostname, Expo account/project and Android build setup. Do independent local work before requesting unavailable inputs.

## Milestone 1: walking prototype

Implement a minimal authenticated test-player session. No static server secret inside the app. Use short-lived scoped credentials; restrict staging access and rate-limit event ingestion.

Event contract: unique event ID, session ID, sequence, sample timestamp, latitude/longitude, accuracy and real/mock source. Server derives player identity from authentication, records receipt time and applies configured validation. Validate coordinate ranges, timestamp skew/age, accuracy, ordering, plausible speed and meaningful displacement. Treat GPS accuracy conservatively so stationary jitter does not earn walking credit. Coordinates alone cannot prove a person is walking or eliminate spoofing; validation is a prototype defense, not a guarantee.

Store location decisions, accepted movement state and encounters transactionally. Deduplicate events by player/session/event ID; retries return the prior outcome. Serialize concurrent updates per session. Rejected points cannot move the accepted anchor or earn distance. Long gaps re-anchor conservatively without awarding the jump. Bound offline retention and reject stale events without generating catch-up rewards.

Encounter checks use validated accumulated distance and cooldowns, with injected randomness for tests. Thresholds are server configuration, tuned after field evidence. Start with a small cached species list; no live PokéAPI dependency in the walking path. Persist encounter IDs and outcomes so retries cannot reroll encounters.

Mobile: opt-in start/stop walking, foreground permission then an explained background permission request, Android foreground service, local encounter notifications, dev HUD and a bounded persistent outbox/log. Task definitions load at module scope. Display tracking state, GPS accuracy, accepted/rejected reason, distance, last API contact, pending count and encounter. Local notifications provide the milestone output; remote push/FCM registration and delivery are a later explicit extension. Handle notification denial with visible HUD output.

Simulation uses a separate session and staging-only server flag. The server rejects mock input unless explicitly enabled; production must refuse it. Test controlled walking, stationary jitter and impossible jumps without physically walking.

Exit criteria:

- Physical Android: foreground walk and screen-locked/background walk reach the API and produce a persisted encounter and notification/HUD evidence.
- Stationary jitter, low accuracy, teleport, stale/out-of-order events and retries produce expected decisions without duplicate rewards.
- Permission denial, stopping tracking, network loss/recovery and server restart behave as documented.
- Real and simulated sessions remain isolated. Logs avoid credentials and public raw coordinates.
- CI passes; phone evidence identifies device/OS, build, backend commit, settings and observed limitations.

## Later milestones

2. Tune encounter balance and GPS behavior from field data; strengthen identity, abuse defenses, privacy/deletion and remote notifications.
3. Add inventory/capture and cached art with recorded provenance.
4. Integrate Showdown battles behind the server adapter, with reproducible battle fixtures and session persistence.

Do not start later milestones while the walking acceptance criteria remain incomplete. Revisit plans based on measured results, recording decisions rather than accumulating hidden exceptions.
