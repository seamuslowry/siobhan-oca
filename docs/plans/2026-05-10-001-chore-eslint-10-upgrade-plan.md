---
title: 'chore(eslint): Upgrade to ESLint 10 by replacing eslint-config-next with hand-rolled flat config'
type: refactor
status: active
date: 2026-05-10
---

# chore(eslint): Upgrade to ESLint 10 by replacing eslint-config-next with hand-rolled flat config

## Overview

Upgrade `eslint` from `^9` to `^10.3.0`. `eslint-config-next@16.x` cannot reach ESLint 10 today: it transitively depends on `eslint-plugin-react@^7.37.0`, which calls the removed `context.getFilename()` API and crashes at lint time on ESLint 10. The Next.js team has acknowledged this (vercel/next.js#89764, label `linear: next`) but the open community fix (vercel/next.js#90068) has been unmerged for ~3 months and is not yet reviewed by Vercel maintainers.

Rather than wait for upstream or run a `@eslint/compat` shim through a transitive dependency the user does not control, drop `eslint-config-next` and assemble a small hand-rolled flat config equivalent to what the project actually uses today: Next.js's own rule set (`@next/eslint-plugin-next`), `@eslint-react/eslint-plugin` (the ESLint 10-ready successor to `eslint-plugin-react`), `eslint-plugin-react-hooks`, `typescript-eslint`, and `eslint-plugin-prettier`. This mirrors the swap pattern already used in `~/git/hundred-and-ten-web` (PR #40 there), adapted for the Next.js dependency graph.

---

## Problem Frame

`npm run lint` is the only CI quality gate (`.github/workflows/lint.yml`) and the only tool gating PRs to `main`. Keeping ESLint pinned to `^9` is acceptable today but blocks routine Dependabot upgrades and leaves the project on a major version that will eventually fall behind security and rule fixes.

A direct `eslint@^10` bump fails in two stages:
1. Peer-dep warnings during `npm install` because `eslint-plugin-react@7.x` caps at `eslint ^9.7`, and `eslint-plugin-import@2.32.0` caps at `eslint ^9` (both arrive transitively via `eslint-config-next`).
2. **Runtime crash** when ESLint loads `react/display-name`: `TypeError: contextOrFilename.getFilename is not a function` (vercel/next.js#89764). ESLint 10 removed several context shorthand methods; `eslint-plugin-react@7.x` still calls them.

The reference project (`hundred-and-ten-web`) was a Vite app that consumed `eslint-plugin-react` directly, so the fix there was a one-line plugin swap. This project consumes the same plugin transitively through `eslint-config-next`, so the fix has to remove the dependency on `eslint-config-next` itself.

---

## Requirements Trace

- R1. `npm run lint` continues to pass on the current source tree on ESLint 10 (no new errors that didn't exist on ESLint 9). New warnings from `@eslint-react`'s stricter rule set are acceptable as long as the lint job's exit code stays `0`.
- R2. `package.json` declares `"eslint": "^10.3.0"` and removes `eslint-config-next`.
- R3. `eslint.config.mjs` no longer imports anything from `eslint-config-next`; it composes plugins directly.
- R4. The CI lint job at `.github/workflows/lint.yml` continues to use Node 20.18.1 and pass on a fresh `npm install` with no peer-dep `ERESOLVE` errors. Warnings are acceptable; errors are not.
- R5. Prettier formatting still enforced via `eslint-plugin-prettier` (`.prettierrc` rules unchanged).
- R6. `next build` (the Azure SWA deploy step) is unaffected — Next no longer auto-runs ESLint during `next build` (Next 15+), but verify the deploy workflow still produces `out/`. (See [Risk: Azure SWA deploy parity](#risks--dependencies).)

---

## Scope Boundaries

- Not switching to `recommended-typescript` or `recommended-type-checked` `@eslint-react` presets — typed linting is meaningfully slower and not currently used.
- Not enabling new lint rules beyond what each plugin's `recommended` preset turns on. New warnings surfaced by `@eslint-react` may be addressed in a follow-up; this plan only requires the lint command exit `0`.
- Not addressing `next-env.d.ts` or `.next/` ignores — those are preserved verbatim.
- Not touching the rest of the dependency tree (`next`, `react`, etc.) beyond the ESLint-related packages.
- Not setting up `@eslint/compat` as a shim around `eslint-plugin-react@7`. Considered and rejected — see [Alternatives Considered](#alternatives-considered).

### Deferred to Follow-Up Work

- Resolving any new lint warnings introduced by `@eslint-react` (`no-array-index-key`, `use-state` lazy-init, etc.): separate PR after this lands and CI is green.
- Re-evaluating the move back to `eslint-config-next` once Vercel ships an ESLint-10-compatible release: tracked informally in the README/AGENTS, no scheduled work.

---

## Context & Research

### Relevant Code and Patterns

- `eslint.config.mjs` — current flat config; imports `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`, registers `eslint-plugin-prettier`, applies `globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts'])`.
- `package.json` — declares `eslint: ^9`, `eslint-config-next: 16.1.6`, `eslint-config-prettier: ^10.1.8`, `eslint-plugin-prettier: ^5.5.5`. No direct dependency on `eslint-plugin-react` or `eslint-plugin-react-hooks` — both come transitively through `eslint-config-next`.
- `node_modules/eslint-config-next/dist/index.js` (read for this plan, not part of the change) — confirms the rules it currently applies: `eslint-plugin-react/recommended`, `eslint-plugin-react-hooks/recommended`, `@next/eslint-plugin-next/recommended`, `eslint-plugin-jsx-a11y` rule set, `eslint-plugin-import/no-anonymous-default-export`, plus `react/react-in-jsx-scope: off`, `react/prop-types: off`, `react/no-unknown-property: off`, `react/jsx-no-target-blank: off`. The hand-rolled config below mirrors what we actually use and drops `import` and `jsx-a11y` (not currently flagging anything in this 14-file repo and adding them would expand the lint surface beyond a like-for-like upgrade).
- `.github/workflows/lint.yml` — uses Node 20.18.1, runs `npm install && npm run lint`. No matrix, no caching tweaks needed.

### External References

- vercel/next.js#89764 — confirmed open ESLint 10 bug, label `linear: next`, opened Feb 10 2026, no fix shipped as of plan date.
- vercel/next.js#90068 — community PR using `@eslint/compat` to shim removed ESLint context methods, opened Feb 17 2026, **still unmerged**, Vercel bot flagged that `@eslint/compat ^1.4.0` doesn't proxy `getFilename` (needs `^2.0.2`+).
- vercel/next.js#93340 — separate "bump ESLint-related packages" PR, also open as of plan date.
- `~/git/hundred-and-ten-web` PR #40 (commit `b05160e`) — the migration this plan is patterned after. That repo dropped `eslint-plugin-react`, added `@eslint-react/eslint-plugin@^5.7.5`, used the `recommended` preset via `extends`, and saw 8 pre-existing warnings surfaced (no errors).
- `~/git/hundred-and-ten-web/docs/solutions/tooling-decisions/eslint-plugin-react-to-eslint-react-upgrade-2026-05-09.md` — captures the install order, preset choice, and config diff for the swap. Reused below.
- [`@eslint-react/eslint-plugin` on npm](https://www.npmjs.com/package/@eslint-react/eslint-plugin) — peer-dep `eslint ^10.3.0`, `^5.7.5` is the version `hundred-and-ten-web` validated against.
- [`@next/eslint-plugin-next` on npm](https://www.npmjs.com/package/@next/eslint-plugin-next) — Next's own ESLint plugin; declares peer-dep that already accepts ESLint 10. Already present transitively at `16.1.6`; will become a direct dependency.

---

## Key Technical Decisions

- **Drop `eslint-config-next` entirely; do not shim with `@eslint/compat`.** `@eslint/compat`'s `fixupPluginRules()` works for individual legacy plugins, but here the legacy plugin (`eslint-plugin-react`) arrives transitively. Wrapping it would mean reaching into `eslint-config-next/core-web-vitals`'s exported config array, mutating one plugin's rule listeners, and trusting that Next's internal plugin layout doesn't change between minor versions. Hand-rolling the equivalent ~30 lines of flat config is simpler, easier to reason about, and removes an upstream blocker entirely. The Next-specific rules we care about (`@next/next/*`) come from `@next/eslint-plugin-next`, which we depend on directly instead.
- **Use `@eslint-react`'s `recommended` preset, not `recommended-typescript` or `recommended-type-checked`.** Same rationale as `hundred-and-ten-web`: at 5.7.5, `recommended` and `recommended-typescript` have identical rule sets and `recommended` auto-injects `settings["react-x"]`. `recommended-type-checked` requires `parserOptions.project` and slows lint significantly. Minimal-diff migration.
- **Pin `@next/eslint-plugin-next` to the same version as `next` itself (16.1.6).** Next ships them in lockstep; mismatched versions occasionally produce confusing rule errors.
- **Keep `eslint-plugin-prettier` and `eslint-config-prettier` unchanged.** Both already support ESLint 10 (`eslint-plugin-prettier@5.5.5` peer-deps `eslint: ">=8.0.0"`, `eslint-config-prettier@10.1.8` accepts ESLint 10).
- **Do not add `eslint-plugin-import` or `eslint-plugin-jsx-a11y` to the new config.** They are part of `eslint-config-next`'s preset but the repo's small surface (14 source files) doesn't currently rely on any of their findings, and adding them would re-introduce ESLint 9-pinned plugins (`eslint-plugin-import@2.32.0` peers `eslint: ^9`).
- **Install order matters.** `@eslint-react/eslint-plugin` peer-deps `eslint ^10.3.0`. Bump ESLint first, then remove `eslint-config-next`, then add the new plugins. Doing it out of order produces `ERESOLVE` errors. Captured in U2.

---

## Open Questions

### Resolved During Planning

- *Should we wait for upstream Next.js ESLint 10 support?* No. PR #90068 has been open without maintainer review for ~3 months; no public timeline. The hand-rolled config is small and reversible.
- *Does dropping `eslint-config-next` lose Next-specific lint signal?* No. The Next-specific rules live in `@next/eslint-plugin-next` (`@next/next/*` namespace), which we depend on directly. `eslint-config-next` is a thin wrapper that bundles that plugin alongside React/import/a11y plugins.
- *Does `next build` still run ESLint and break the SWA deploy if lint fails?* As of Next 15+, `next build` no longer runs ESLint by default. `next.config.ts` does not opt back in. The deploy workflow uses `Azure/static-web-apps-deploy@v1` which runs its own build; lint is only invoked through `.github/workflows/lint.yml`. Confirm during U6 (verification) by inspecting workflow logs once.

### Deferred to Implementation

- Exact peer-dep warnings emitted on `npm install` after the swap. Some chained `@types/*` warnings are normal across ESLint majors and only matter if they become errors.
- Whether `@eslint-react`'s `recommended` preset surfaces new warnings on this codebase (the reference repo had 8). Counted, not fixed, in U6.

---

## High-Level Technical Design

> *This illustrates the intended approach and is directional guidance for review, not implementation specification. The implementing agent should treat it as context, not code to reproduce.*

The new `eslint.config.mjs` shape, expressed as a sketch:

```js
// Sketch only — exact import names and rule keys verified during implementation.
import { defineConfig, globalIgnores } from 'eslint/config';
import eslintReact from '@eslint-react/eslint-plugin';
import reactHooks from 'eslint-plugin-react-hooks';
import nextPlugin from '@next/eslint-plugin-next';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

export default defineConfig([
  // Base TS+React rules
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{js,jsx,mjs,ts,tsx}'],
    extends: [eslintReact.configs.recommended],
    plugins: {
      'react-hooks': reactHooks,
      '@next/next': nextPlugin,
      prettier,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
      'prettier/prettier': 'error',
    },
  },
  prettierConfig,                      // turn off stylistic rules that conflict with Prettier
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
]);
```

The shape mirrors `hundred-and-ten-web/eslint.config.mjs` post-swap, with two adaptations: (1) `@next/eslint-plugin-next` registered directly with `core-web-vitals` rules to preserve the Next signal that `eslint-config-next/core-web-vitals` was contributing, and (2) `typescript-eslint` consumed via its v8 flat-config helpers since this repo runs TypeScript everywhere.

---

## Implementation Units

- U1. **Capture baseline lint output**

**Goal:** Record current `npm run lint` output on ESLint 9 before changing anything, so U6 can compare what changed.

**Requirements:** R1

**Dependencies:** None

**Files:**
- Create: none — output captured inline in PR description, not committed

**Approach:**
- Run `npm run lint` on the current `main` to record the baseline (expected: clean exit, possibly some warnings).
- Note in PR description so reviewers can see the diff in lint surface.

**Test scenarios:** Test expectation: none — this is a measurement step with no behavioral change.

**Verification:**
- Baseline exit code and warning count recorded for U6 comparison.

---

- U2. **Update package.json: bump ESLint, remove eslint-config-next, add direct plugins**

**Goal:** Swap the dependency set in three ordered steps so peer-dep resolution succeeds at every intermediate state.

**Requirements:** R2, R4

**Dependencies:** U1

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json` (regenerated by npm)

**Approach:**
- Execute the three install steps in order (this is the same order `hundred-and-ten-web` used; doing it in any other order produces `ERESOLVE`):
  1. `npm install --save-dev eslint@^10.3.0`
  2. `npm uninstall eslint-config-next`
  3. `npm install --save-dev @eslint-react/eslint-plugin@^5.7.5 @next/eslint-plugin-next@16.1.6`
- Confirm `eslint-plugin-react-hooks` is still present (it should be — `eslint-config-next` was the only thing pulling it transitively). If it's been pruned, add it explicitly: `npm install --save-dev eslint-plugin-react-hooks@^7.0.0`. Then add `typescript-eslint@^8.46.0` directly (`eslint-config-next` was the only thing pulling it too).
- Verify final `npm install` runs clean (no `ERESOLVE`, peer-dep warnings only — no errors).

**Patterns to follow:**
- `~/git/hundred-and-ten-web` PR #40 commit `b05160e` — same install order, different leaf package set.

**Test scenarios:**
- Happy path: After `npm install` on a clean checkout, `npm ls eslint` reports `eslint@10.3.x` deduped at the top level.
- Happy path: `npm ls eslint-plugin-react eslint-config-next` reports both as missing (not present anywhere in the tree).
- Edge case: Peer-dep warnings exist but no `ERESOLVE` errors. (Document any warnings in the PR; do not suppress them with `--legacy-peer-deps`.)

**Verification:**
- `npm install` exits 0 on a fresh checkout with no `node_modules` or `package-lock.json`.
- `npm ls eslint` shows `^10.3.0`.
- No package named `eslint-config-next` anywhere in the lockfile.

---

- U3. **Rewrite eslint.config.mjs as a hand-rolled flat config**

**Goal:** Replace the `eslint-config-next` import with direct plugin composition that produces equivalent rule coverage.

**Requirements:** R3, R5

**Dependencies:** U2

**Files:**
- Modify: `eslint.config.mjs`

**Approach:**
- Remove imports of `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`.
- Import directly: `@eslint-react/eslint-plugin` (default export), `eslint-plugin-react-hooks`, `@next/eslint-plugin-next`, `typescript-eslint`, `eslint-plugin-prettier`, `eslint-config-prettier`.
- Compose with `defineConfig`:
  - Spread `tseslint.configs.recommended` for TS rules.
  - Add a config block with `extends: [eslintReact.configs.recommended]`, `files: ['**/*.{js,jsx,mjs,ts,tsx}']`, and manual plugin registration for `react-hooks`, `@next/next`, `prettier`.
  - Spread `reactHooks.configs.recommended.rules` and `nextPlugin.configs['core-web-vitals'].rules` into `rules`.
  - Add `'prettier/prettier': 'error'`.
  - Append the imported `eslint-config-prettier` config object to disable stylistic rules that conflict with Prettier.
- Preserve `globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts'])` exactly. **Do not** drop or reorder these — see [`docs/solutions/eslint-fix-hang-missing-globalignores`](../../../hundred-and-ten-web/docs/solutions/developer-experience/eslint-fix-hang-missing-globalignores-2026-04-25.md) in the reference repo: missing `globalIgnores` causes ESLint to hang on `--fix`.
- Drop the old `settings.react.version` if any was inherited (none in current config) — `@eslint-react` uses `settings["react-x"]` and auto-injects it.

**Patterns to follow:**
- `~/git/hundred-and-ten-web/eslint.config.mjs` post-swap (commit `b05160e`).

**Test scenarios:**
- Happy path: `npm run lint` on the unchanged source tree exits 0.
- Edge case: `npm run lint -- --print-config app/page.tsx` resolves and prints a config without errors. (Sanity check that all plugins loaded.)
- Error path: If a plugin import fails (e.g., wrong default vs named export), the ESLint error message names the file and import — fix at this step rather than U6.

**Verification:**
- `npm run lint` exits 0 on the working tree.
- The flat config no longer imports anything from `eslint-config-next`.
- `globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts'])` is unchanged.

---

- U4. **Verify CI lint workflow on the new config**

**Goal:** Confirm `.github/workflows/lint.yml` runs cleanly on Node 20.18.1 with the new dependency set, since CI is the only quality gate.

**Requirements:** R4

**Dependencies:** U3

**Files:**
- Modify: none expected — `.github/workflows/lint.yml` should not need changes
- Reference: `.github/workflows/lint.yml`

**Approach:**
- Push the branch and let the `Code Quality / NPM Lint` workflow run.
- If the job fails on `npm install` due to peer-dep `ERESOLVE` errors that didn't appear locally (npm's resolver behaves differently on `package-lock.json` regeneration in some environments), iterate on U2's dependency set rather than adding `--legacy-peer-deps` or `npm-shrinkwrap.json` patches.
- If the job fails on `npm run lint` only, return to U3 — likely a missing rule or misconfigured plugin.

**Test scenarios:**
- Integration: GitHub Actions `Code Quality / NPM Lint` job exits 0 on the PR.
- Integration: The `npm install` step in CI does not emit any `ERESOLVE` errors. Peer-dep *warnings* are acceptable.

**Verification:**
- The lint check is green on the PR before requesting review.

---

- U5. **Update AGENTS.md to remove stale eslint-config-next reference**

**Goal:** Keep AGENTS.md accurate so future agents don't expect `eslint-config-next` in the dependency tree.

**Requirements:** R3

**Dependencies:** U3

**Files:**
- Modify: `AGENTS.md`

**Approach:**
- Edit the bullet under `## Commands` that says "ESLint via flat config (`eslint.config.mjs`)" — no change needed there.
- The file does not currently name `eslint-config-next` directly, so this unit may be a no-op. Re-read AGENTS.md after U3 lands and update only if a current claim has gone stale (e.g., if anything about plugin sources was added).
- Leave the README untouched — README is for non-engineers configuring content; ESLint setup is not in scope for it.

**Test scenarios:** Test expectation: none — documentation-only.

**Verification:**
- `git grep -n eslint-config-next` returns no matches outside `package-lock.json`.

---

- U6. **Document the migration in docs/solutions and capture warning delta**

**Goal:** Capture the institutional learning so the next ESLint upgrade in this or related repos doesn't re-derive it.

**Requirements:** R1 (informational)

**Dependencies:** U4

**Files:**
- Create: `docs/solutions/tooling-decisions/eslint-config-next-removal-for-eslint-10-2026-05-10.md`

**Approach:**
- Mirror the format of `~/git/hundred-and-ten-web/docs/solutions/tooling-decisions/eslint-plugin-react-to-eslint-react-upgrade-2026-05-09.md` (frontmatter, Context, Guidance, Examples, Related sections).
- Cover: why `@eslint/compat` was rejected (transitive dependency), why `eslint-config-next` was dropped (cost vs. benefit for a 14-file Next app), the install order, the resulting `eslint.config.mjs` shape, and the count + identity of any new warnings the swap surfaced.
- Link out to vercel/next.js#89764 and vercel/next.js#90068 so future readers can check whether upstream has resolved this and whether moving back to `eslint-config-next` makes sense.
- Note the rollback recipe in one sentence: revert `eslint.config.mjs` and `package.json`, run `npm install`.

**Test scenarios:** Test expectation: none — documentation-only.

**Verification:**
- New doc exists at the path above with frontmatter and the standard solution-doc shape.

---

## System-Wide Impact

- **Interaction graph:** `npm run lint` is the only consumer. `next build` (used by Azure SWA deploy) does not invoke ESLint as of Next 15+ and `next.config.ts` does not opt back in. No other developer command depends on ESLint.
- **Error propagation:** Lint errors flow to a single CI job. Peer-dep `ERESOLVE` errors during `npm install` would block both CI and local development.
- **API surface parity:** None. ESLint config is internal tooling.
- **Integration coverage:** Verified in U4 by running the actual GitHub Actions workflow rather than relying on local-only `npm run lint`.
- **Unchanged invariants:** `next build`, `next dev`, the static export to `out/`, the Azure SWA deploy workflow, Prettier formatting rules, the `globalIgnores` set, and the `.prettierrc` configuration are all unchanged. Only the ESLint plugin composition is changing.

---

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| `@eslint-react`'s stricter `recommended` preset surfaces new errors (not just warnings), failing CI | Run `npm run lint` locally during U3 before pushing. If new *errors* appear, either fix them in this PR or downgrade the specific rule(s) to `warn` and document in U6. New *warnings* are acceptable per R1. |
| Hand-rolled config drifts from what `eslint-config-next` will eventually ship for ESLint 10, leaving us off the upgrade path | Document the rollback recipe in U6's solution doc. The change is small (one file) and reversible. Track vercel/next.js#89764 informally; revisit when Vercel ships an ESLint 10–compatible release. |
| `@next/eslint-plugin-next@16.1.6` independent install pins the lint signal to one Next version while `next` itself is bumped by Dependabot | Keep the version range as `16.1.6` (not `^16.1.6`) and let Dependabot pair its updates with `next` PRs. Acceptable for a small repo. |
| Azure SWA deploy regresses if `next build` is silently invoking ESLint somewhere | U4 verifies CI lint independently. After merge, watch the next deploy workflow run; if it fails on a lint-shaped error, that's a signal Next is invoking ESLint and the fix is to set `eslint.ignoreDuringBuilds: true` in `next.config.ts`. Not expected based on Next 15+ behavior. |
| `npm install` resolves differently in CI than locally (different npm version, different platform) | U4 explicitly runs the workflow on the PR. CI runs on Node 20.18.1; local development typically runs Node 22.12.0 per `.nvmrc`. Cross-version peer-dep resolution should be identical, but this is verified by green CI, not assumed. |

---

## Alternative Approaches Considered

- **Wait for upstream Next.js to ship ESLint 10 support.** Lowest-risk, zero work, but PR #90068 has sat unreviewed for ~3 months and the issue is labeled `Upstream` (the Next team views it as `eslint-plugin-react`'s problem to fix). Indefinite wait. Rejected because we lose Dependabot signal in the meantime.
- **Wrap `eslint-plugin-react` with `@eslint/compat`'s `fixupPluginRules()`.** What PR #90068 attempts. Works in principle, but the legacy plugin arrives via `eslint-config-next`, which means we'd need to reach into `eslint-config-next`'s exported config array, identify the React plugin object, wrap it, and reinsert it. Brittle across `eslint-config-next` minor versions and the maintenance cost is roughly the same as just dropping the wrapper. Rejected.
- **Pin Dependabot to ESLint 9.x indefinitely** (the path `justmarks/itinly#187` took). Defers the problem rather than solving it. The repo already enables Dependabot (`.github/dependabot.yml`), and silencing one ecosystem creates a long-term gotcha. Rejected.
- **Replace `eslint-config-next` with `eslint-config-next-flat` or another community fork.** No actively maintained fork visible on npm. Rejected for supply-chain reasons.

---

## Documentation / Operational Notes

- Update AGENTS.md only if a stale claim is introduced — current AGENTS.md doesn't name `eslint-config-next`, so likely a no-op (U5).
- New solution doc at `docs/solutions/tooling-decisions/eslint-config-next-removal-for-eslint-10-2026-05-10.md` (U6) — first document under `docs/solutions/` in this repo; create the directory.
- No rollout, monitoring, or feature-flag concerns. The change affects developer tooling and CI only.
- Rollback: `git revert` the merge commit, run `npm install`. No data, no users affected.

---

## Sources & References

- Reference migration: `~/git/hundred-and-ten-web` PR #40, commit `b05160e` ("chore(eslint): upgrade to ESLint 10 by replacing eslint-plugin-react").
- Reference solution doc: `~/git/hundred-and-ten-web/docs/solutions/tooling-decisions/eslint-plugin-react-to-eslint-react-upgrade-2026-05-09.md`.
- vercel/next.js#89764 — "[ESLint v10]: TypeError: contextOrFilename.getFilename is not a function" (open, `linear: next`).
- vercel/next.js#90068 — "fix: attempt to make eslint-config-next support v10" (open, unmerged Feb 17 2026).
- vercel/next.js#93340 — "[deps] Bump ESLint-related packages to clear peer dependency warnings" (open).
- [`@eslint-react/eslint-plugin` on npm](https://www.npmjs.com/package/@eslint-react/eslint-plugin)
- [`@eslint/compat` on npm](https://www.npmjs.com/package/@eslint/compat) (the alternative we did not take)
- [`@next/eslint-plugin-next` on npm](https://www.npmjs.com/package/@next/eslint-plugin-next)
- ESLint 10 migration guide: https://eslint.org/docs/latest/use/migrate-to-10.0.0
- Local files referenced: `eslint.config.mjs`, `package.json`, `.github/workflows/lint.yml`, `next.config.ts`, `AGENTS.md`.
