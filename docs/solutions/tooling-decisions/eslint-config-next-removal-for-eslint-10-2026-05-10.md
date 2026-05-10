---
title: Replacing eslint-config-next with hand-rolled flat config to unblock ESLint 10
date: 2026-05-10
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
resolution_type: dependency_replacement
tags:
  - eslint
  - eslint-10
  - eslint-config-next
  - eslint-react
  - flat-config
  - next.js
  - react
  - typescript
  - dependency-upgrade
  - node-engines
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
- Keep the `globalIgnores` exactly as before. Removing `out/**` will cause ESLint to walk the static export and hang or take minutes; this is a known footgun in ESLint flat config (see `eslint-fix-hang-missing-globalignores` if such a doc exists in the repo).

### 4. Decide which `eslint-config-next` features to preserve

`eslint-config-next` bundles five plugins. Only some are worth re-adding manually for a small Next app:

| Plugin | Re-add? | Reason |
|---|---|---|
| `@next/eslint-plugin-next` | **Yes** | Next-specific rules (`@next/next/*`); ship in lockstep with `next` |
| `eslint-plugin-react` | **No, swap** | Replace with `@eslint-react/eslint-plugin` (ESLint 10–ready) |
| `eslint-plugin-react-hooks` | **Yes** | Standard React hooks rules; works with ESLint 10 |
| `eslint-plugin-import` | **No** | Caps at ESLint 9; not currently flagging anything in this 14-file repo |
| `eslint-plugin-jsx-a11y` | **No** | Not currently flagging anything in this repo; can re-add later if a11y signal becomes a goal |

For a larger app that actively relies on `import` or `jsx-a11y` rules, you'd need to either wait for ESLint 10–compatible versions of those plugins or wrap them with `@eslint/compat`. Skipping them was acceptable here because the lint surface is small.

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
- `~/git/hundred-and-ten-web` PR #40 (commit `b05160e`) — sister-repo migration that swapped `eslint-plugin-react` for `@eslint-react/eslint-plugin`. That repo used Vite, so it didn't have to drop a wrapping config like `eslint-config-next`.
- [`@eslint-react/eslint-plugin` on npm](https://www.npmjs.com/package/@eslint-react/eslint-plugin)
- [`@next/eslint-plugin-next` on npm](https://www.npmjs.com/package/@next/eslint-plugin-next)
- [ESLint 10 migration guide](https://eslint.org/docs/latest/use/migrate-to-10.0.0)
