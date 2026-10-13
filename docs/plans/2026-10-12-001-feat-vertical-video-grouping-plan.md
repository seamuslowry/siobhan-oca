---
title: 'feat: group vertical videos side by side in the courses slider'
type: feat
status: active
date: 2026-10-12
origin: docs/brainstorms/2026-10-12-vertical-video-grouping-requirements.md
---

# feat: group vertical videos side by side in the courses slider

## Overview

Add an `orientation` flag to `mp4` media and teach `Slider` to pack consecutive verticals into one slide according to viewport capacity (1/2/3). This retries closed PR #173. The behavior is the same, but the implementation aims to be about a quarter of the size.

## Requirements Trace

R1–R7 from the origin doc. Each implementation unit below names the requirements it covers.

## Key Technical Decisions

- **Item index is the slider's state, not slide index (R5).** The slider stores the index of the media item the viewer is on and derives the slide index from the current grouping. A regroup keeps the same item in view with no effects, refs, or resync logic. That replaces the two effects and the ref from #173.
- **`useSyncExternalStore` for breakpoints (R3).** A small `useMediaQuery` hook subscribes to `matchMedia`, and its server snapshot is desktop. React reconciles the server snapshot during hydration and then re-renders with the client value. That is hydration-safe without a manual `hydrated` flag or a placeholder render. Non-desktop visitors see a regroup right after hydration. Only `Video` skeletons are on screen at that point, and slot widths come from CSS (see below), so a lone vertical never changes size.
- **Grouping is a pure function over item indices.** `groupSlides(items, capacity) => number[][]` is about 10 lines. Each new item either joins the previous slide (both vertical, slide not full) or starts a new one.
- **Orientation crosses the RSC boundary as data.** `Project` (a server component) maps `media` to `{ vertical, content }` items. `Slider` (a client component) takes `items` instead of `children`. It has only one caller, so the children API is replaced outright rather than kept as a fallback.
- **Sizing is split between two components.** `MediaContent` sizes a vertical as `aspect-[9/16] w-full max-w-sm mx-auto`, which is sensible on its own and keeps it reasonable on the research page (R2). The slider wraps each vertical in a slot sized with responsive classes (`w-full md:w-1/2 lg:w-1/3`). Padding replaces the gap, so a lone vertical is exactly as wide as a grouped one (R4). The slot width comes from CSS rather than JS so the prerendered HTML is already correct on phones, with no layout jump at hydration. The cost is that the breakpoints are written in two adjacent places in `slider.tsx`, and comments there tie them together.

## Implementation Units

1. **Schema and rendering** (R1, R2). In `components/media-content.tsx`, add `orientation` with a default, an `isVertical(media)` helper, and vertical classes.
2. **Breakpoint hook** (R3). Add `components/use-media-query.ts`.
3. **Slider grouping** (R3–R6). In `components/slider.tsx`, add the `items` prop, `groupSlides`, item-index state, and slot widths.
4. **Caller** (R3). `app/courses/project.tsx` builds `items`.
5. **Content and docs** (R7). Tag the three clips in `public/courses/content.yaml` and document `orientation` in the README Media section.

## Verification

There is no test framework (AGENTS.md), so verification is:

- `npm run lint` passes with no new warnings, and `npm run build` succeeds.
- `groupSlides` is checked with a throwaway script against these cases:
  - `[V,V,V]` at capacity 3, 2 and 1 → `[[0,1,2]]`, `[[0,1],[2]]`, `[[0],[1],[2]]`
  - `[V,V,H,V,V,V]` at capacity 3 → `[[0,1],[2],[3,4,5]]`
  - `[H,H]` → `[[0],[1]]`
- A browser check of the static export at phone, tablet and desktop widths, using a temporary three-vertical project.

## Risks

- The 9:16 slots make the slider taller for projects with verticals. That is intended, since the clips are no longer letterboxed.
- On the first paint for non-desktop visitors, the grouping is the desktop one until hydration. Only skeletons are visible at that point, and slot sizes are already final.
- When a resize or rotation crosses a breakpoint, items move between slides and React remounts them, so a playing video stops. This is acceptable because there is no pause or sync handling in scope.
