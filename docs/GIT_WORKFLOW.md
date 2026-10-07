# Git workflow for humans and agents

## Branch and PR lifecycle

1. Inspect `git status`, branch, remotes and existing changes. Update clean main with a fast-forward fetch/pull; do not overwrite local work.
2. Create a focused branch such as `feat/walking-events`, `fix/location-retries` or `docs/field-checklist`.
3. Implement one reviewable slice with tests and related documentation. Review the diff and staged contents for secrets, personal location data, unrelated files and generated artifacts.
4. Commit coherent changes with intent in the message. Push the branch and open a draft PR early for substantial work. Never force-push main; avoid rewriting shared feature history without coordination.
5. PR description states problem, resulting behavior, verification, device evidence when relevant, migration/deployment implications and known limitations. Link any tracked debt.
6. Resolve checks and review findings. Merge only with user authorization; prefer squash merge and delete the completed branch. Deploy staging from a known merged commit and record the smoke test.

The initial planning bootstrap may establish main directly in this new repository. Application changes follow the PR workflow.

## GitHub settings to enable

Protect main with a ruleset: require PRs, successful checks, resolved conversations and block force pushes/deletion. Add review requirements when another reviewer is available; do not create an impossible solo-maintainer gate. Required check names can be configured only after real CI jobs exist. Until then, do not claim branch protection or CI is active.

Target CI gates: frozen Bun install, formatting/lint, strict TypeScript checks, unit tests, PostgreSQL integration tests and mobile Expo compatibility/bundle checks. Pin action revisions and tool versions during CI implementation. Add dependency/security review appropriate to the selected packages without letting an unused scanner substitute for functional tests.

## Debt control

No silent skipped checks or unexplained TODOs. A necessary deferral needs a debt entry or issue with impact, owner, exit condition and due milestone. Resolve correctness, authentication, data-loss and migration risks before merge. Treat formatting and maintainability as routine completion work. Do not accumulate features on top of a known broken baseline.
