# AGENTS.md

Static Next.js 16 site (App Router, React 19, Tailwind v4) exported to `out/` and deployed to Azure Static Web Apps.

## Commands

- `npm run dev` — Next dev server with Turbopack on `http://localhost:3000`.
- `npm run build` — Produces a fully static export in `out/` (`next.config.ts` sets `output: 'export'`). There is no Node runtime in production; do not add server-only features (route handlers, ISR, dynamic `cookies()`/`headers()`, middleware, etc.).
- `npm run lint` — ESLint 10 via flat config (`eslint.config.mjs`). This is the only CI quality gate (`.github/workflows/lint.yml`); there is no separate `typecheck`, `format`, or test script. Prettier runs through `eslint-plugin-prettier` so lint failures include formatting issues.
- No test framework is configured.

Node is pinned to `22.13.0` (`.nvmrc`, CI, and `package.json` engines all agree). 22.13.0 is the floor because ESLint 10 requires `^20.19.0 || ^22.13.0 || >=24`; the previous 22.12.0 floor warned `EBADENGINE` on install. Use `nvm use` locally.

The flat config is **hand-rolled, not via `eslint-config-next`**. `eslint-config-next@16.x` transitively depends on `eslint-plugin-react@7.x`, which crashes on ESLint 10 (vercel/next.js#89764, unfixed upstream as of May 2026). Lint signal is composed directly from `@next/eslint-plugin-next`, `@eslint-react/eslint-plugin`, `eslint-plugin-react-hooks`, `typescript-eslint`, and `eslint-plugin-prettier`.

Two rule sets that `eslint-config-next` previously contributed are **deliberately deferred**, not dropped: `eslint-plugin-jsx-a11y` (`alt-text`, `aria-*`, `role-*` warnings) and `eslint-plugin-import` (`no-anonymous-default-export`). Both cap their npm peer dep at `eslint ^9` and would force a permanent `--legacy-peer-deps` install. Neither was firing on the pre-PR codebase, but the a11y signal in particular is real and worth restoring once an ESLint 10–compatible release ships. See `docs/solutions/tooling-decisions/eslint-config-next-removal-for-eslint-10-2026-05-10.md` before reintroducing `eslint-config-next`, changing the React plugin, or restoring a11y/import linting.

## Architecture quirks

- Pages live under `app/{courses,research,team}/page.tsx` plus root `app/page.tsx`. Shared chrome (`Navbar`, fonts, metadata) is in `app/layout.tsx`.
- All page content is **data-driven from `public/`**, not hardcoded:
  - YAML: `public/{home,courses,research,team}/content.yaml`
  - CSV: `public/research/papers.csv`, `public/team/members.csv`
  - Media: MP4s sit beside the relevant `content.yaml`; images live under `assets/{home,courses,research}/` (note: `assets/`, not `public/assets/`).
- Loaders live in `utils/{home,courses,research,team,metadata}.ts`. They are async server functions called from `page.tsx` files; each parses YAML/CSV with `zod` schemas. Schemas are the source of truth for valid content shapes — update them when adding fields.
- Path alias `@/*` maps to the repo root (see `tsconfig.json`). Imports look like `@/utils/team`, `@/components/text-content`, `@/app/navbar`.
- Reusable content primitives in `components/`: `text-content.tsx` (the "stylable text" object from README), `media-content.tsx`, `any-content.tsx` (text-or-media union). Reuse these instead of inventing new shapes; their zod schemas are exported and composed by the page loaders.
- `papers.csv` is **headerless** with a variable number of trailing author columns; parsed positionally in `utils/research.ts`. `members.csv` **does** have a header row and is parsed by column name in `utils/team.ts`.

## Content gotchas

- `utils/team.ts` `teamMemberSchema` accepts `type` values `student | faculty | collaborator`. The README says `team | faculty | collaborator` — the code is correct; rows using `team` will fail zod parsing at build time.
- `Paper.topic` must match a topic's `name` exactly (string compare against the raw `name` field, which may be a stylable object — see `Topic` constructor in `utils/research.ts`); mismatches silently drop papers.
- Adding a new top-level page means adding it to `DefinedMetadata` in `utils/metadata.ts` and creating `public/<page>/content.yaml` with a `metadata` block, or `retrieveMetadata` will throw.
- `utils/metadata.ts` references `./public/team/[slug]/<slug>.yaml` for per-member metadata, but no `[slug]` route or directory exists yet. Treat `retrieveTeamMemberMetadata` as scaffolding for future per-member pages, not as live behavior.

## Conventions

- Prettier: single quotes, trailing commas, 2-space indent, `arrowParens: avoid` (`.prettierrc`). Lint will fail on violations.
- `"type": "module"` — use ESM `import`/`export` everywhere, including config files (`*.mjs` for non-TS configs).
- Keep components and utils as pure functions/classes; data classes (e.g. `TeamMember`, `Paper`, `Topic`) wrap raw zod-parsed records and expose helpers — extend them rather than reaching into raw shapes from pages.

## Deploy / infra

- Deploy is via `Azure/static-web-apps-deploy@v1` in `.github/workflows/deploy.yml` on push/PR to `main`. It runs its own build inside the action (no separate `npm run build` step) and uploads `out/`.
- `infrastructure/` is Terraform (Azure + GitHub providers) with a remote `azurerm` backend. The state container itself is unmanaged. Do not run `terraform apply` casually — it touches live Azure resources and GitHub repo settings.

## Reference

- README.md documents the full content schema for non-engineers (YAML field reference for each page). When the schema changes, update both the zod schema in `utils/` and the matching README section.
