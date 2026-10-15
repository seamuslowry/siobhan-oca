---
title: 'feat: group vertical videos side by side in the courses slider'
type: feat
status: active
date: 2026-10-12
origin: docs/brainstorms/2026-10-12-vertical-video-grouping-requirements.md
---

# feat: group vertical videos side by side in the courses slider

## Overview

Add an `orientation` flag to `mp4` media and show consecutive verticals side by side in the courses slider, 3/2/1 per step by viewport. This retries closed PR #173 with the same behavior and less code.

## Requirements Trace

R1–R7 from the origin doc. Each implementation unit below names the requirements it covers.

## Key Technical Decisions

- **Embla Carousel replaces the hand-rolled slider (R3, R5, R6).** Review of the first revision asked whether to stop home-rolling. [Embla](https://www.embla-carousel.com/) with `slidesToScroll: 'auto'` scrolls by however many slides fit the view, so responsive grouping falls out of slide widths alone: verticals are `basis-full md:basis-1/2 lg:basis-1/3`, everything else is `basis-full`. That removed the breakpoint hook, the grouping function, and the item-index state from the first revision, and `react-swipeable` with it, since Embla handles drag and touch. Embla is 50 kB unpacked with no dependencies.
- **The current step hides its neighbours.** Embla scrolls continuously, so when a step is narrower than the view (a lone vertical, or two on desktop), parts of the neighbouring steps would peek in. Slides outside the selected step get `opacity-0`. The selected slides come from `internalEngine().slideRegistry`, the one piece of advanced API in use; `slidesInView()` would need a visibility threshold and still mis-handle a neighbour that happens to fit entirely.
- **Embla state is read with `useSyncExternalStore`.** One `useEmblaValue(embla, read, fallback)` hook subscribes to `select` and `reInit` and returns a primitive. It supplies the arrow states and the selected slides without `setState` in effects.
- **Pause what the viewer left.** Slides stay mounted, so one effect pauses every video outside the selected step whenever it changes. This was first planned as a follow-up; with Embla it is six lines, so it ships here.
- **Media owns its slider item.** `toSliderItem(media)` in `media-content.tsx` builds `{ vertical, content }`, so the width the slider reserves and the way `MediaContent` renders can't disagree. `Project` just maps over it. `Slider` takes `items` instead of `children`; it has one caller, so no fallback API is kept.
- **`MediaContent` sizes a vertical as `aspect-9/16 w-full max-w-sm mx-auto`** (R2), which also keeps a vertical sensible on the research page where there is no slider.

## Implementation Units

1. **Schema and rendering** (R1, R2). In `components/media-content.tsx`, add `orientation` with a default, vertical classes, and `toSliderItem`.
2. **Slider** (R3–R6). Rewrite `components/slider.tsx` on `embla-carousel-react`; drop `react-swipeable`.
3. **Caller** (R3). `app/courses/project.tsx` passes `media.map(toSliderItem)`.
4. **Content and docs** (R7). Tag the three clips in `public/courses/content.yaml` and document `orientation` in the README Media section.

## Verification

There is no test framework (AGENTS.md), so verification is:

- `npm run lint` passes with no new warnings, and `npm run build` succeeds.
- A browser check of the static export at phone, tablet and desktop widths, using a temporary five-item project `[V, V, V, H, V]`: step contents, equal vertical sizes, neighbour fading, arrow states, drag, and that a playing video pauses when the viewer moves on.

## Risks

- The 9:16 slides make the slider taller for projects with verticals. That is intended, since the clips are no longer letterboxed.
- Across a breakpoint, Embla re-measures and keeps the same *step index*, not the same video, so a viewer who resizes mid-browse may land one step off. Rare enough to accept rather than track per-item position.
- Until Embla initialises on the client, every slide is treated as selected. Only `Video` skeletons are on screen at that point, and slide widths come from CSS, so nothing changes size at hydration.
