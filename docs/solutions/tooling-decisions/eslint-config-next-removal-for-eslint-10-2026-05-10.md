---
title: Replacing eslint-config-next with hand-rolled flat config to unblock ESLint 10
date: 2026-05-10
last_updated: 2026-05-10
category: docs/solutions/tooling-decisions
module: eslint
problem_type: tooling_decision
component: development_workflow
severity: medium
applies_when:
  - Upgrading ESLint from v9 to v10 in a Next.js 16 + React 19 + TypeScript project
  - Using ESLint flat config (eslint.config.mjs)
  - Currently depending on eslint-config-next (which transitively pulls eslint-plugin-react@7.x)
symptoms:
  - "npm install warns EBADENGINE because ESLint 10 requires Node ^20.19.0 || ^22.13.0 || >=24"
  - "eslint . crashes with: TypeError: contextOrFilename.getFilename is not a function (eslint-plugin-react@7.x calling removed ESLint 10 API)"
  - "Peer-dep warnings for eslint-plugin-react capping at eslint ^9.7"
resolution_type: dependency_update
related_components:
  - tooling
  - documentation
tags:
  - eslint-10
  - eslint-config-next
  - eslint-react
  - flat-config
  - next.js
  - dependency-upgrade
  - node-engines
  - jsx-a11y-deferred
---

# Replacing eslint-config-next with hand-rolled flat config to unblock ESLint 10

## Context

`eslint-config-next@16.x` (the package every Next.js project gets via `create-next-app` and the official lint setup) is the sole blocker for upgrading to ESLint 10 in a Next.js 16 + React 19 project. It depends on `eslint-plugin-react@^7.37.0`, which still calls the `context.getFilename()` API removed in ESLint 10 — so even after the peer-dep warnings settle, `npm run lint` crashes at runtime with `TypeError: contextOrFilename.getFilename is not a function` (vercel/next.js#89764, label `linear: next`).

The community fix (vercel/next.js#90068, opened Feb 17 2026) wraps the legacy plugin with `@eslint/compat`'s `fixupPluginRules()`. As of May 10 2026 it has been open for ~3 months without maintainer review. There is no public timeline for an ESLint 10–compatible `eslint-config-next` release.

For a small Next.js app, dropping `eslint-config-next` and assembling a flat config directly from the underlying plugins is a smaller diff than a `@eslint/compat` shim and removes the upstream dependency entirely.

## Guidance

### 1. Confirm Node version before starting

ESLint 10 requires Node `^20.19.0 || ^22.13.0 || >=24`. Older floors (Node 22.12.0, 20.18.1) warn `EBADENGINE` during `npm install` and may run unpredictably. Bump first:

```bash
# .nvmrc
echo "22.13.0" > .nvmrc
nvm install
```

Then update `package.json` `engines.node` and any CI workflow `node-version` to match.

### 2. Install in the correct order

`@eslint-react/eslint-plugin` peer-deps `eslint ^10.3.0`, so ESLint 10 must be present before installing it. The required sequence:

```bash
# Step 1: bump ESLint first
npm install --save-dev eslint@^10.3.0

# Step 2: drop eslint-config-next (and with it, the transitive
# eslint-plugin-react, eslint-plugin-import, eslint-plugin-jsx-a11y,
# typescript-eslint, eslint-plugin-react-hooks)
npm uninstall eslint-config-next

# Step 3: add direct devDeps for everything we still want
npm install --save-dev \
  @eslint-react/eslint-plugin@^5.7.5 \
  @next/eslint-plugin-next@16.1.6 \
  eslint-plugin-react-hooks@^7.0.0 \
  typescript-eslint@^8.46.0
```

Pin `@next/eslint-plugin-next` to the same exact version as `next` itself — they ship in lockstep and mismatched versions occasionally produce confusing rule errors. `typescript-eslint` and `eslint-plugin-react-hooks` are pulled in transitively by `eslint-config-next`, so removing it prunes them; they must be re-added explicitly.

### 3. Rewrite `eslint.config.mjs`

The existing config used the convenience presets shipped with `eslint-config-next`:

**Before:**
```js
import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettier from 'eslint-plugin-prettier';

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  { plugins: { prettier }, rules: { 'prettier/prettier': 'error' } },
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
]);
```

**After:**
```js
import { defineConfig, globalIgnores } from 'eslint/config';
import eslintReact from '@eslint-react/eslint-plugin';
import reactHooks from 'eslint-plugin-react-hooks';
import nextPlugin from '@next/eslint-plugin-next';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

export default defineConfig([
  ...tseslint.configs.recommended,
  nextPlugin.configs['core-web-vitals'],
  {
    files: ['**/*.{js,jsx,mjs,ts,tsx}'],
    extends: [eslintReact.configs.recommended],
    plugins: { 'react-hooks': reactHooks, prettier },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'prettier/prettier': 'error',
    },
  },
  prettierConfig,
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
]);
```

Notes:

- `nextPlugin.configs['core-web-vitals']` is a flat-config object that self-registers `@next/next` and applies its rule set. Spread it directly; do not also add `@next/next` under `plugins:`.
- `@eslint-react`'s `recommended` preset auto-injects `settings["react-x"]` for version detection. Don't carry forward a `settings.react.version: 'detect'` block — it has no effect with `@eslint-react`.
- `eslint-config-prettier` must come last; it disables stylistic rules from earlier configs that conflict with Prettier.
- Keep the `globalIgnores` exactly as before. Removing `out/**` will cause ESLint to walk the static export and hang or take minutes; this is a known footgun in ESLint flat config — see `~/git/hundred-and-ten-web/docs/solutions/developer-experience/eslint-fix-hang-missing-globalignores-2026-04-25.md` for the sibling-repo write-up.

### 4. Decide which `eslint-config-next` features to preserve

`eslint-config-next` bundles five plugins. Only some are worth re-adding manually for a small Next app:

| Plugin | Re-add? | Reason |
|---|---|---|
| `@next/eslint-plugin-next` | **Yes** | Next-specific rules (`@next/next/*`); ship in lockstep with `next` |
| `eslint-plugin-react` | **No, swap** | Replace with `@eslint-react/eslint-plugin` (ESLint 10–ready) |
| `eslint-plugin-react-hooks` | **Yes** | Standard React hooks rules; works with ESLint 10 |
| `eslint-plugin-import` | **No, deferred** | Caps at ESLint 9 (peer `eslint: ^9` or older). Latest 2.32.0 has no ESLint 10 support and `npm install` `ERESOLVE`s without `--legacy-peer-deps`. Was not flagging anything on the pre-PR codebase. |
| `eslint-plugin-jsx-a11y` | **No, deferred** | Same blocker: latest 6.10.2 caps at `eslint ^3 ‖ ^4 ‖ … ‖ ^9` and `npm install` `ERESOLVE`s without `--legacy-peer-deps`. Verified during this migration. Was active in baseline (`eslint-config-next/core-web-vitals` enabled `jsx-a11y/alt-text`, `aria-props`, `aria-proptypes`, `aria-unsupported-elements`, `role-has-required-aria-props`, `role-supports-aria-props` at `warn`) but not currently firing on the 14-file source tree. |

Both `eslint-plugin-import` and `eslint-plugin-jsx-a11y` are real signal we are choosing to defer rather than dropping permanently. The two paths to bring them back without waiting on upstream:

- **Wrap with `@eslint/compat`'s `fixupPluginRules()`** and accept a permanent `--legacy-peer-deps` requirement on every `npm install` (CI included). The compat shim polyfills the removed `context.getFilename()`–style APIs that broke `eslint-plugin-react@7.x` on ESLint 10, but the npm peer-dep range itself is unchanged.
- **Wait for an ESLint 10–compatible release** of each plugin, or for a successor (e.g., an `@eslint-a11y` analogue to `@eslint-react`).

Re-evaluate after the codebase grows past ~20 components or when a11y becomes a deliberate goal — the absent rule set is most likely to bite on new `<img>`, `<a target="_blank">`, and ARIA-attribute usage.

### 5. Choose `@eslint-react`'s `recommended` preset

At `@eslint-react/eslint-plugin@5.7.5`, `recommended` and `recommended-typescript` have identical rule sets — `recommended-typescript` only adds an explicit `settings["react-x"]` block which the `recommended` preset auto-injects anyway. `recommended-type-checked` adds `no-leaked-conditional-rendering` but requires `parserOptions.project` (typed linting), which is meaningfully slower. For a minimal-diff migration, `recommended` is the right choice.

### 6. Expect new warnings (and possibly false-positive errors)

`@eslint-react/recommended` is stricter than `eslint-plugin-react/recommended`. On this codebase the swap surfaced 18 new warnings (mostly `no-array-index-key`, plus `no-children-count`, `no-children-map`, `set-state-in-effect`) and 2 false-positive errors of `@eslint-react/static-components` on a JSX dynamic-tag pattern.

The dynamic-tag pattern that misfires:

```tsx
const { tag: Tag, ...rest } = schema.parse(input); // Tag is 'p' | 'h1' | 'span' | ...
return <Tag>{...}</Tag>;
```

`Tag` is a destructured zod-validated *string*, not a React component. JSX requires capitalization for dynamic-element rendering, which the `static-components` rule reads as "component created during render." The cleanest fix is a file-level disable with a comment explaining why:

```tsx
/* eslint-disable @eslint-react/static-components */
// `Tag` is a destructured HTML tag name, not a component.
```

A line-level `eslint-disable-next-line` does not work here — the rule attributes the violation to the destructuring statement (the closing `}`), not the JSX usage. File-level disable is fine because this file has no other use of the rule.

The remaining 18 warnings are real codebase findings worth addressing in a follow-up PR but not blockers for the migration itself.

## Examples

Post-migration `npm run lint` (ESLint 10.3.0, exit 0):

```
✖ 18 problems (0 errors, 18 warnings)
```

Pre-migration baseline (ESLint 9.39.2, exit 0): `0 errors, 0 warnings`.

The new warnings break down as:
- 14× `@eslint-react/no-array-index-key` (using `i` as a React key in `.map()` calls — pre-existing latent issue, not new behavior)
- 1× `@eslint-react/no-children-count`
- 1× `@eslint-react/no-children-map`
- 1× `@eslint-react/set-state-in-effect`
- 1× same as above (different file)

## What Didn't Work

Approaches tried during the migration that failed, partially worked, or were considered and rejected. Recorded so a future agent doesn't re-walk the same paths.

### 1. Keeping Node 20.18.1 / 22.12.0 with ESLint 10

The original plan said "continues to use Node 20.18.1." Installing `eslint@^10.3.0` on that floor immediately produced `EBADENGINE`. ESLint 10's own `package.json` declares `engines.node: "^20.19.0 || ^22.13.0 || >=24"`. Node 20.18.1 and 22.12.0 both fall below the minor-floor.

**What worked:** Bump three places in lockstep — `.nvmrc`, `package.json` `engines.node`, and `.github/workflows/lint.yml` `node-version`. Skipping any one of the three either lets local dev silently drift below the floor or breaks CI.

**Lesson:** Treat ESLint 10 as a Node-floor bump, not just an ESLint bump. Audit every place a Node version is pinned before running the first `npm install`.

### 2. `eslint-disable-next-line` on the destructuring site for `@eslint-react/static-components`

First attempt to silence the false-positive on the `<Tag>` pattern in `components/text-content.tsx` placed `// eslint-disable-next-line @eslint-react/static-components` directly above the destructure (`const { tag: Tag, ...rest } = ...`). The rule reports the violation at the **closing brace** of the destructuring expression — not at the line where `Tag` is declared and not at the JSX usage site. `eslint-disable-next-line` only suppresses the very next line, so the comment was attached to the wrong line and the error persisted.

The intermediate attempt was file-level `/* eslint-disable @eslint-react/static-components */`, which worked but masks the rule for any future code added to the file.

**What worked:** A function-block-scoped disable (`/* eslint-disable @eslint-react/static-components */` at the top of the function body, `/* eslint-enable @eslint-react/static-components */` at the bottom) scopes suppression to exactly the destructure + JSX usage, leaving the rest of the file protected.

**Lesson:** When `@eslint-react/static-components` misfires on a JSX dynamic-tag pattern, the violation is attributed to the destructuring expression, not the JSX site. `eslint-disable-next-line` cannot reach the closing brace; reach for block-scope.

### 3. Re-adding `eslint-plugin-jsx-a11y` directly

Code review surfaced that `eslint-config-next/core-web-vitals` had been enabling jsx-a11y rules (`alt-text`, `aria-props`, `aria-proptypes`, `aria-unsupported-elements`, `role-has-required-aria-props`, `role-supports-aria-props`) at `warn`. The instinct was to re-add `eslint-plugin-jsx-a11y@^6.10.2` so those rules survived the migration. `npm install` `ERESOLVE`d: `eslint-plugin-jsx-a11y@6.10.2` declares its peer-dep as `eslint: ^3 || ^4 || ... || ^9` — capped at ESLint 9, same blocker class as `eslint-plugin-react@7.x` but with no `@eslint-*` successor on npm.

**What worked:** Defer the plugin and document the trade-off in both `AGENTS.md` and this doc. The a11y signal is real but not currently firing on a 14-file source tree.

**Lesson:** When migrating off `eslint-config-next` to ESLint 10, audit the **full** transitive plugin tree, not just `eslint-plugin-react`. Assume any plugin without a visible `@eslint-*` successor in the new namespace is also peer-dep-blocked. Check each plugin's `peerDependencies.eslint` range before assuming it'll work.

### 4. `@eslint/compat` + `fixupPluginRules()` shim (rejected)

The community PR vercel/next.js#90068 wraps `eslint-plugin-react@7.x` with `@eslint/compat`'s `fixupPluginRules()` to polyfill the removed `context.getFilename()` API. This is a legitimate escape hatch and would let the project keep `eslint-config-next` largely intact.

Rejected because:

- The shim has to reach into `eslint-config-next`'s exported config array and mutate a plugin object inside it — trusts Next's internal plugin layout to stay stable across minor versions.
- It does not solve the `eslint-plugin-jsx-a11y` / `eslint-plugin-import` peer-dep cap; those would still need `--legacy-peer-deps`.
- The underlying issue (vercel/next.js#89764) has been open ~3 months without maintainer review; the shim leaves us coupled to an upstream we cannot influence.
- Hand-rolling the equivalent flat config is ~30 lines and removes the upstream blocker entirely.

**Lesson:** When evaluating a compat-shim approach, count the upstream dependencies the shim still leaves you exposed to. If the shim only solves one of N blockers, hand-rolling the smaller config is often cheaper and more durable.

## Investigation Journey

The order problems actually surfaced (the "Guidance" section above presents the final ordering, not the exploratory one):

1. **Plan said Node 20.18.1; reality said 22.13.0.** First `npm install` of `eslint@^10.3.0` produced `EBADENGINE`. Required an unplanned detour to bump `.nvmrc`, `package.json` `engines`, and the CI workflow before the rest of the plan could execute.
2. **`@eslint-react` recommended preset surfaced more findings than expected.** The plan anticipated a near drop-in swap. In practice the preset is meaningfully stricter than `eslint-plugin-react/recommended`: 18 new warnings (mostly `no-array-index-key`) and 2 false-positive errors (`static-components`). Warnings are real signal worth a follow-up PR; the errors needed a targeted disable.
3. **The `static-components` false-positive resisted the obvious fix.** `eslint-disable-next-line` at the destructure didn't suppress because the rule reports at the closing brace, not the declaration line. Took two iterations (line-level → file-level → function-block) to land on the right granularity.
4. **Code review caught the silently-dropped jsx-a11y rules.** The migration initially ignored that `eslint-config-next/core-web-vitals` had been contributing jsx-a11y warnings. A reviewer pass surfaced this as regression risk. Investigation showed `eslint-plugin-jsx-a11y` itself caps at ESLint 9 — same blocker class as `eslint-plugin-react`, just less visible because no `@eslint-*` successor exists yet.
5. **`eslint-plugin-import` failed the same audit for the same reason.** Once the jsx-a11y blocker was understood, a quick check showed `eslint-plugin-import` had the identical peer-dep cap. Bundled into the same "deferred" decision.
6. **Final config landed at ~30 lines.** Smaller than the `@eslint/compat` shim approach in vercel/next.js#90068, no upstream dependency on `eslint-config-next`, no `--legacy-peer-deps` anywhere.

**Meta-lesson for future ESLint-10-from-Next migrations:** the work decomposes into four roughly-independent investigations — Node floor, React plugin swap, peer-dep audit of the rest of the `eslint-config-next` tree, and false-positive triage in the new React plugin's stricter preset. Doing them in that order minimizes rework.

## Rollback

If `eslint-config-next` ships ESLint 10 support and we want to move back:

1. Revert this commit — `git revert <commit-sha>`.
2. `npm install`.
3. `npm run lint` to confirm green.

The change is small (one config file + one component file's pragma + dependency manifests) and self-contained.

## Related

- vercel/next.js#89764 — ESLint v10 runtime crash, label `linear: next`, open as of May 10 2026.
- vercel/next.js#90068 — community fix using `@eslint/compat`, open without maintainer review since Feb 17 2026.
- vercel/next.js#93340 — separate "bump ESLint-related packages" PR, also open as of May 10 2026.
- `seamuslowry/siobhan-oca` PR #127 — `chore(deps-dev): bump eslint from 9.39.2 to 10.0.0` (dependabot, closed unmerged Feb 9 2026). The prior auto-bump attempt that this manual migration supersedes.
- `seamuslowry/siobhan-oca` PR #152 — `chore(deps-dev): bump the major-dependencies group ... 2 updates` (dependabot, open since Mar 23 2026). Likely the still-open auto-bump this PR will close.
- `~/git/hundred-and-ten-web` PR #40 (commit `b05160e`) — sister-repo migration that swapped `eslint-plugin-react` for `@eslint-react/eslint-plugin`. That repo used Vite, so it didn't have to drop a wrapping config like `eslint-config-next`.
- [`@eslint-react/eslint-plugin` on npm](https://www.npmjs.com/package/@eslint-react/eslint-plugin)
- [`@next/eslint-plugin-next` on npm](https://www.npmjs.com/package/@next/eslint-plugin-next)
- [ESLint 10 migration guide](https://eslint.org/docs/latest/use/migrate-to-10.0.0)
