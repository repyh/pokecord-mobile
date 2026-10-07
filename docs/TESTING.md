# Draft testing strategy

No test suite or CI exists yet. These are implementation requirements.

| Layer | Coverage | Proposed tool/evidence |
| --- | --- | --- |
| Rules | Distance, jitter, accuracy, time, speed, cooldown, deterministic encounters | Bun unit tests with injected clock/randomness |
| API | Schema/auth rejection, ownership, limits, response contract | Fastify inject tests |
| Persistence | Real migrations, transactions, duplicate/concurrent events, restart durability | Bun integration tests against disposable PostgreSQL |
| Mobile logic | Queue bounds, retry policy, permission states, notification fallback | Focused tests and Expo-compatible component tooling |
| Android integration | Real GPS, locked screen, foreground service, permissions, notification channel | Physical-device checklist with recorded evidence |
| Release | Frozen install, API image boot/readiness, Expo dependency/bundle health | CI plus staging smoke test |

Use strict TypeScript checking independently from test execution. Verify selected Bun test/type-check options against the pinned version; use explicit `tsc --noEmit` scripts as the initial portable baseline. Do not mistake successful TS execution for type safety.

## Required edge cases

- Missing/invalid auth, malformed/non-finite/out-of-range coordinates, oversized batch, cross-player session access.
- Stationary drift, poor/missing accuracy, future/old timestamp, zero/negative elapsed time, implausible speed and long sampling gap.
- Duplicate event ID, out-of-order samples, concurrent submissions, repeated encounter response and process restart.
- Offline queue replay, request timeout after server commit, bounded retry/backoff and stale samples after reconnect.
- Mock events disabled server-side; real and mock sessions cannot influence one another.

## Field checklist per location-related change

Record device model/Android version, app build and commit, backend commit, date, environment, permission state and battery settings. Test permission denial and later grant, foreground walk, screen-locked walk, stop tracking, notification denial, airplane-mode/reconnect and relaunch. Explicitly record force-stop behavior and OS service termination rather than assuming delivery.

Compare HUD decisions to private server events. Verify one persisted encounter and one notification per encounter ID. Confirm stopped tracking creates no new samples. Use synthetic traces in Git; keep raw real GPS coordinates outside the public repository. A field result is pending until actually observed.

Completion reports must separate automated checks, staging checks and physical-device checks, listing any unavailable prerequisites.
