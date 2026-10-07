# Draft development workflow

These commands are targets for the implementation phase, not runnable scripts yet.

## Three development loops

| Loop | Mobile | Backend | Purpose |
| --- | --- | --- | --- |
| Fast logic | Fixtures/simulation or Android dev build | Local Bun + local PostgreSQL | Validation, deterministic encounters, rapid debugging |
| Field | Physical Android development build | Dokploy staging HTTPS | Real walking, locked-screen tracking, notifications |
| Integration | Development or self-contained preview build | Dokploy staging | Persistence, release compatibility and recovery |

Target local setup: `bun install --frozen-lockfile`, `docker compose -f infra/compose.dev.yml up -d`, `bun run db:migrate`, `bun run dev:server`, and `bun run dev:mobile`. Staging is the default field profile; local mode must be selected explicitly. A phone cannot reach the PC via localhost: use the PC's LAN address on Wi-Fi or a separately secured backend tunnel. Metro's tunnel exposes Metro only, not the local API.

Use `bun expo start --dev-client --tunnel` from apps/mobile for field live editing. The PC/Metro must remain running and internet-accessible. For walks independent of the PC, install a self-contained preview build with its JS bundle embedded. Rebuild the native client when native dependencies, permissions or plugins change; JS-only changes normally use Metro reload.

## Environment boundaries

- Mobile public configuration: API base URL and environment label only. Never put server secrets in EXPO_PUBLIC variables.
- Server secrets: database URL, authentication configuration and development simulation flag, stored in Dokploy or ignored local environment files.
- Separate local, staging and eventual production databases, credentials and app identifiers. Staging GPS data stays private, with bounded retention and deletion tooling.
- Start/stop tracking must be visible and deliberate. Document Android permission and battery settings used in testing; do not promise tracking after force-stop.

## Dokploy release workflow

Build from a reviewed commit, run CI and integration tests, back up the database before risky migrations, apply migration once as a controlled job, then deploy the API and verify readiness and a phone smoke test. Record commit, schema version and app/API compatibility. Do not run migrations independently in every server replica.

Use backward-compatible schema/API changes so a previous API image can be restored. Database rollback needs its own tested recovery plan; rolling back an image does not undo a migration. Keep staging deployment manual initially; later automate successful reviewed releases once health checks and rollback are proven.

## References

- [Expo with Bun](https://docs.expo.dev/guides/using-bun/)
- [Expo monorepos](https://docs.expo.dev/guides/monorepos/)
- [Development builds](https://docs.expo.dev/develop/development-builds/use-development-builds/)
- [Expo Location](https://docs.expo.dev/versions/latest/sdk/location/)
- [Expo Notifications](https://docs.expo.dev/versions/latest/sdk/notifications/)
