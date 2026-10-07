# Instructions for every agent

Read README.md and docs/PLAN.md before modifying this repository. Read docs/GIT_WORKFLOW.md before Git operations and docs/TESTING.md before claiming completion. These files are the shared source of truth across agents and sessions.

## Engineering rules

- Use Bun. Commit one root bun.lock; do not introduce npm, pnpm or Yarn lockfiles. Keep a pinned Bun version identical in local documentation, CI and deployment images once implementation starts.
- Implement one milestone at a time under the current user instruction. Distinguish implemented, tested and planned behavior in all reports.
- Keep TypeScript strict. Validate untrusted inputs at the API boundary. Keep secrets out of source, EXPO_PUBLIC variables and logs.
- Mobile owns location collection and presentation; server owns movement acceptance, encounter eligibility and rewards. Mock events must be gated server-side and isolated from real sessions.
- Do not add broad abstractions, new services or broader gameplay before the walking milestone passes its acceptance criteria.
- Every behavior change needs appropriate verification. Record commands run, results and any untested device behavior. A mocked test does not prove Android background behavior.
- Document any necessary compromise in docs/DEBT.md with owner, impact, resolution and milestone. Fix relevant debt before extending the affected area. Never silently leave TODOs or skipped failing tests.
- Diagnose failures before retrying. Do not repeat a failing approach without new evidence or a corrective change.
- Follow the user's Spirit of Excellence: understand before editing, protect existing work, verify assumptions and communicate limitations plainly.

## Git safety

- Permanent requirement: follow docs/GIT_WORKFLOW.md for every task and use micro commits. Commit each small, coherent, verified change as it is completed; do not accumulate a whole task into one large commit.
- Each micro commit must have one clear purpose and include related tests/docs where needed. Do not split changes into broken intermediate states merely to make commits smaller.
- Before each commit, inspect the staged diff, run the checks appropriate to that slice, and use an intent-based message (for example `feat(server): add readiness endpoint`). Never commit known failing changes or unrelated user work.
- Push completed micro commits to the task branch and keep the PR description current. A final handoff must include commit/check evidence and an honest statement of remaining prerequisites.

- Inspect branch, status and diff first. Preserve existing user changes; never reset, clean or force-push shared history.
- Use a focused branch and PR for implementation. Avoid unrelated edits. Do not commit credentials, raw location traces or personal data.
- Report CI, integration and device checks separately. Never fabricate passing checks or claim a deploy happened from writing a configuration.
- Do not merge or publish deployments without user authorization. Creating a draft PR is allowed within an authorized implementation task; attach created PRs to the Codex chat when tools support it.
- Handoff with branch, changed files, checks, known debt and the next concrete step. Shared repo instructions apply to subagents as well.
