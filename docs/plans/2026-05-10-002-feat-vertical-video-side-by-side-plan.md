---
title: 'feat: Vertical video side-by-side support'
type: feat
status: completed
date: 2026-05-10
origin: docs/brainstorms/2026-05-10-vertical-video-side-by-side-requirements.md
---

# feat: Vertical video side-by-side support

## Overview

Add support for vertical (9:16, "Instagram-style") course project videos and render multiple verticals side by side on a single slide so they make efficient use of the slider's horizontal space. Authors mark videos as `vertical` in YAML; the slider packs consecutive verticals into slides whose capacity scales with viewport size (1 on phone, 2 on tablet, 3 on desktop). Horizontal videos retain their current full-width-per-slide behavior, and the slider container retains its current 16:9 aspect — verticals fit by filling the available height. Resolves [#139](https://github.com/seamuslowry/siobhan-oca/issues/139).

---

## Problem Frame

Course project media on the teaching page currently assumes every video is 16:9. `MediaContent` hard-codes `aspect-video` for every `mp4` (`components/media-content.tsx:27`) and `Slider` shows one media item per slide (`components/slider.tsx`). Several of the existing course videos under `public/courses/` were actually shot vertically — they have been letterboxed (or otherwise distorted) inside the 16:9 box since launch. The feature exists to make efficient use of slider space when video content is tall rather than wide: one vertical clip on a wide slide leaves a lot of horizontal space; two or three side by side fill the slide naturally without distortion. There is no intent to express that side-by-side verticals form a "set" — verticals can be split across multiple slides on smaller breakpoints with no semantic loss.

See origin: `docs/brainstorms/2026-05-10-vertical-video-side-by-side-requirements.md`. (The origin document framed this in terms of "three angles of one student project" appearing together; during planning the lab owner clarified that side-by-side rendering is purely a space-efficiency concern, not a grouping-meaning concern. The plan reflects that revision.)

---

## Requirements Trace

- R1. YAML `mp4` entries gain an explicit `orientation` field (`horizontal` default, `vertical` opt-in). The orientation field is the only signal used for layout — no build-time probing of mp4 metadata, no runtime measurement of `videoWidth` / `videoHeight`. [origin R1, R2, R3]
- R2. `vertical` videos render at the slider container's full height with 9:16 aspect; width is whatever 9:16 yields, not capped. [origin R5]
- R3. `horizontal` videos render unchanged (full slide width, 16:9 aspect). [origin R4]
- R4. The slider groups consecutive verticals into one slide, capacity 1/2/3 by breakpoint. [origin R6]
- R5. A `horizontal` item breaks any in-progress vertical group; YAML order is preserved. [origin R7]
- R6. Partially-filled vertical slides distribute children evenly across the horizontal axis. [origin R8]
- R7. Slide grouping recomputes on viewport breakpoint changes; the user's position stays on the same media item where reasonable. [origin R9]
- R8. Multi-vertical slides use independent native controls per video, with within-slide play mutex (starting one video pauses the others on the same slide). [origin R10, refined during planning — see Key Technical Decisions]
- R9. Existing slider affordances (arrows, swipe, opacity-until-loaded) continue to work; navigation moves between slides, not individual media. Additionally, any playing video pauses when its slide leaves the active position. [origin R11, refined during planning]

**Origin acceptance examples:** AE1 (covers R4, R6), AE2 (covers R4), AE3 (covers R5), AE4 (covers R1, R3 — backward compatibility), AE5 (covers R7).

---

## Scope Boundaries

- No synchronized multi-video playback (no "play all together" control).
- No autoplay or auto-mute behavior on slide entry.
- No per-author override of breakpoint capacities (1 / 2 / 3 is hard-coded for this iteration).
- No side-by-side support for `horizontal` videos or `image` media — vertical packing applies only to `mp4` entries marked `vertical`.
- No YAML grouping concept (no `group:` keys, no nested arrays). Slide composition is inferred from order and orientation.
- No build-time probing of mp4 dimensions; no new build dependencies.
- No changes to research / home / team pages, or to image rendering.
- No new test framework. The repository has no test runner today (`AGENTS.md`: "No test framework is configured. Lint is the only CI quality gate."), and adding one is out of scope for this feature. Verification is manual via dev server, plus build + lint as the automated gates.
- No special treatment for "group meaning" across breakpoints. When a multi-vertical group is split across slides on a smaller breakpoint, the slides read as ordinary navigation; no group label, set indicator, or shared frame is added.
- No visual cue when the within-slide play mutex pauses a sibling video. The mutex is silent; deactivated siblings show their native paused state with no additional treatment.
- No panel, border, or shadow around lone-vertical desktop slides. The empty flanks show page background; the minimalist treatment is intentional.

---

## Context & Research

### Relevant Code and Patterns

- `components/media-content.tsx` — defines the `mp4` and `image` discriminated-union schema and renders both. The mp4 branch is where the orientation-aware container goes.
- `components/slider.tsx` — client component (`'use client'`) that treats each direct child as a slide via `Children.map`. The grouping logic goes here; an optional `items` prop is added alongside the existing `children`-driven path.
- `components/video.tsx` — already handles SSR-refresh hydration via a `hydrated` state gate and renders a skeleton placeholder on a parent-supplied aspect-ratio container. The skeleton uses `h-full w-full`, so it respects whatever aspect-ratio container its parent applies. The component also already keeps a `videoRef` to the underlying `<video>` element, which is the natural hook for the play-mutex and pause-on-deactivate behaviors.
- `app/courses/project.tsx` — the only call site for `<MediaContent>` inside `<Slider>`. The `items` array is built here (a server-component context where `m.orientation` is in scope), then passed to the client `Slider`.
- `utils/courses.ts` — defines `mediaSchema` (imported from `media-content.tsx`) and prepends `courses/` to filenames. No grouping logic should leak into the data layer; the schema change is the only data-layer touch.
- `components/text-content.tsx` — pattern for explicit-Tailwind-class conditional rendering using `clsx` with literal class strings (Tailwind's JIT needs class strings to be present in source). The new code mirrors this — no template-string class names.

### Institutional Learnings

- `docs/solutions/tooling-decisions/eslint-config-next-removal-for-eslint-10-2026-05-10.md` — notes that `eslint-plugin-jsx-a11y` is deliberately deferred; no a11y rules fire automatically on the new code. The feature continues the existing pattern of relying on `<video controls>` native UI for accessibility; no new a11y debt is introduced.

### External References

- None required. The implementation is contained within existing patterns (Tailwind responsive utilities, React client components, `matchMedia`-based breakpoint detection). Tailwind v4's default breakpoints (`sm: 640px`, `md: 768px`, `lg: 1024px`) are confirmed unmodified in `app/globals.css` (the file defines `@theme` extensions only — no breakpoint overrides).

---

## Key Technical Decisions

- **YAML field shape**: extend the `mp4` variant of `mediaSchema` (in `components/media-content.tsx`) with `orientation: z.enum(['horizontal', 'vertical']).default('horizontal')`. The `.default('horizontal')` makes existing YAML files parse unchanged. Reads naturally in YAML; the zod schema is the single source of truth.
- **Layout decision is JS-side at the slider boundary, not CSS-only.** R5 (horizontal breaks the group) is an order-dependent structural decision about *which children share a slide*. CSS alone cannot express "this child interrupts the run." A grouping function (pure: `(items, capacity) => Slide[]`) produces slide containers; CSS handles within-slide responsive layout inside multi-vertical slides.
- **`items` prop is required, not preferred, due to the RSC boundary.** `MediaContent` is an `async function` server component; its rendered output (a `<Video>`) crosses the boundary into the client `Slider`, *not* the original `<MediaContent value={...}/>` element. So `child.props.value.orientation` is unreachable from inside the client `Slider`. The grouping logic therefore needs orientation supplied explicitly via a new optional `items` prop typed as `{ orientation: 'horizontal' | 'vertical'; node: ReactNode }[]`. The existing `children`-driven path remains for backward compatibility on the public API but is unexercised by production code post-landing (the sole caller migrates to `items`).
- **Slider container aspect is breakpoint-aware, not a single global value.** On desktop and tablet (capacity 2 and 3), the container keeps its existing 16:9 aspect across all slides; verticals fit by filling height (`h-full`) with 9:16, displayed width follows from the ratio. On phone (capacity 1), if *any* slide in the slider's items contains a vertical, the container takes a 9:16 aspect for *all* slides in that slider; horizontals on those slides letterbox or scale down to fit. If a phone slider has no verticals at all, the container stays 16:9 (today's behavior is preserved for horizontal-only projects). This rule is necessary because the naive "16:9 everywhere" rule on phone makes a vertical render at ~107px wide on a 375px viewport — smaller than today's letterboxed rendering and effectively unwatchable.
- **Verticals are not width-capped.** Width is whatever 9:16 yields at the slide's available height. On desktop and tablet, a lone vertical takes ~316px wide × 562px tall inside the 16:9 container; the rest of the slide is empty page background (no panel, border, or shadow treatment — minimalist, matching the site's aesthetic). On phone with a vertical-containing project, verticals fill the slide width naturally.
- **Within-slide vertical layout uses `grid-cols-N` with `place-items-center`.** Each multi-vertical group container is `grid grid-cols-N h-full place-items-center` (using literal class strings — see Tailwind JIT pattern). Each vertical's aspect ratio constrains its actual size; `place-items-center` centers each vertical within its track. Result: 2-up shows two verticals each centered in their half of the slide with a gap between; 3-up shows three verticals each centered in their third with tighter gaps. Equal tracks with centered content; no `justify-around` ambiguity.
- **`hydrated` gate is firm.** Because `next.config.ts` sets `output: 'export'`, the build produces a single static HTML artifact served to every viewer. Without a `hydrated` gate, every non-desktop visitor would briefly see desktop-capacity grouping before the client recomputes. The `Slider` therefore mirrors `components/video.tsx`'s posture: render a stable placeholder on the server pass, then render the real grouping after hydration when `matchMedia` results are known. The placeholder uses the same outer `grid-cols-[min-content_1fr_min-content]` frame as the real slider so the slide content column width is stable across the hydration boundary (the arrow buttons themselves may appear or disappear after hydration as the new slide count becomes known — accepted as a minor and infrequent transition).
- **Pause-on-deactivate.** When a slide leaves the active position (via arrow, swipe, or breakpoint recompute), every `<video>` element within it is paused via `.pause()`. The existing `Video` component's `videoRef` is the hook; the slider exposes an "isActive" signal to each slide. This addresses the audio-bleed defect that the current `Children.map` translate-based slider would otherwise produce now that audio-capable content is more likely to be played.
- **Within-slide play mutex.** Within a single slide containing multiple `<video>` elements, starting playback on one pauses the others. Implemented via a `play` event listener on each `<video>` that pauses its siblings. Preserves R8's "independent native controls" while eliminating the simultaneous-audio failure mode.
- **Resume behavior on resize**: remember the media-item index of the first item on the currently visible slide; after regrouping, advance to the slide containing that item index. If the new total is smaller than the previous current index, clamp to the last slide.
- **Grouping function placement**: a new pure function in `components/slider.tsx` (or extracted to `components/slide-grouping.ts` if it grows beyond ~30 lines). The function is dependency-free of `matchMedia` — capacity is a parameter passed in by the caller.

---

## High-Level Technical Design

> *This illustrates the intended approach and is directional guidance for review, not implementation specification. The implementing agent should treat it as context, not code to reproduce.*

```text
YAML file
  └─ utils/courses.ts (mediaSchema, now with orientation field)
       └─ app/courses/project.tsx (server, builds items array)
            └─ <Slider items={...}/>
                 items: [
                   { orientation: 'horizontal', node: <MediaContent value={H}/> },
                   { orientation: 'vertical',   node: <MediaContent value={V}/> },
                   { orientation: 'vertical',   node: <MediaContent value={V}/> },
                   { orientation: 'vertical',   node: <MediaContent value={V}/> },
                 ]

  Slider (client, after hydration gate clears):
    1. Determine breakpoint capacity from matchMedia: 1 (phone) / 2 (tablet) / 3 (desktop).
    2. Run the grouping function: pack consecutive verticals up to capacity,
       break on every horizontal:
          [H, V, V, V] @ desktop -> [[H], [V, V, V]]
          [V, V, H, V, V, V] @ desktop -> [[V, V], [H], [V, V, V]]
          [V, V, V] @ tablet -> [[V, V], [V]]
    3. Decide the slider container aspect:
         - Desktop / tablet (capacity >= 2): always 16:9.
         - Phone (capacity 1): 9:16 if any item is vertical; else 16:9.
       Render one slide per group inside that container, with the existing
       translate-x-based animation applied to each group container.
    4. Within a multi-vertical slide, lay out verticals via
       `grid grid-cols-N h-full place-items-center` (N = group.length).
       Each vertical's aspect ratio sets its size; `place-items-center`
       centers each within its track. Equal tracks, centered content.
    5. Wire up isActive signal: when a slide is not the active slide, its
       videos pause. Within the active slide, starting one video pauses
       the others (silent mutex — no visual cue on the deactivated
       siblings for v1; deferred to a follow-up if real-world feedback
       surfaces friction).
```

---

## Implementation Units

- U1. **Extend media schema with `orientation` field**

**Goal:** Add an opt-in `orientation: 'horizontal' | 'vertical'` field to the `mp4` variant of `mediaSchema` with a `horizontal` default so existing YAML parses unchanged.

**Requirements:** R1.

**Dependencies:** None.

**Files:**
- Modify: `components/media-content.tsx` — extend the `mp4` member of the discriminated union with the new field.

**Approach:**
- Add `orientation: z.enum(['horizontal', 'vertical']).default('horizontal')` to the `mp4` object inside `mediaSchema`.
- The `image` variant is unchanged.
- Type inference automatically propagates the new field through `MediaContent`'s `value` prop type.

**Patterns to follow:**
- `components/text-content.tsx` uses `z.enum(...).default(...)` widely (e.g., `tag`, `whitespace`, `align`) — same convention.
- The discriminated-union pattern in `mediaSchema` continues; only the `mp4` arm changes.

**Verification cases:**
- A YAML `mp4` entry with `orientation: vertical` parses with `orientation === 'vertical'`.
- A YAML `mp4` entry with `orientation: horizontal` parses with `orientation === 'horizontal'`.
- **Covers AE4.** A YAML `mp4` entry omitting `orientation` parses with `orientation === 'horizontal'`.
- A YAML `mp4` entry with an invalid value (e.g., `orientation: portrait`) fails zod validation at build time with a clear schema error.
- An `image` entry is unaffected (zod's discriminated-union behavior; the test confirms current behavior is unchanged).

**Verification method:** edit `public/courses/content.yaml` to add `orientation: vertical` to one existing mp4 entry, run `npm run dev`, confirm the page loads without zod errors. Confirm `npm run build && npm run lint` succeed.

**Verification:**
- The existing course-page renders without changes for entries that don't use the field.
- Adding `orientation: vertical` to one entry does not break the build or the lint pass.

---

- U2. **Render vertical orientation in `MediaContent`**

**Goal:** When an `mp4` entry has `orientation: vertical`, render it inside a 9:16 aspect-ratio container that fills the available height (`h-full`); width follows from the ratio. When `horizontal`, render the current `aspect-video` layout unchanged. Each vertical video reveals independently inside a stable container as its own metadata loads — no aggregate gate.

**Requirements:** R2, R3.

**Dependencies:** U1.

**Files:**
- Modify: `components/media-content.tsx` — branch on `orientation` inside the `mp4` case to apply the right container classes.

**Approach:**
- For `horizontal`: keep the existing `className="w-full aspect-video"` (no change to current behavior).
- For `vertical`: apply `aspect-[9/16] h-full` (width follows from the ratio; no `max-w-*` cap). The wrapper does not constrain horizontal width — the surrounding slide layout (U3) decides how verticals share the horizontal axis when grouped.
- Class strings must be present as literal strings in source (Tailwind JIT requirement) — mirror the explicit-conditional pattern in `components/text-content.tsx`.
- The `Video` component's existing `hydrated`-gated skeleton works at any aspect-ratio container without modification; nothing in `components/video.tsx` changes.

**Patterns to follow:**
- `components/text-content.tsx:54-79` — explicit `clsx(...)` with literal class strings for each variant.
- `components/video.tsx` — no changes; it already accepts any aspect-ratio container via the parent `className`.

**Verification cases:**
- Rendering a vertical `mp4` produces a wrapping `<Video>` whose container carries `aspect-[9/16]` and `h-full`.
- Rendering a horizontal `mp4` produces a wrapping `<Video>` with `aspect-video` and `w-full` (current behavior preserved).
- **Covers AE4.** Rendering an `mp4` entry whose YAML omitted `orientation` produces the horizontal layout (no regression).
- The image branch is unaffected.

**Verification method:** flip one existing mp4 in `public/courses/content.yaml` between `orientation: horizontal` and `orientation: vertical` and confirm visually in the dev server. Check that the skeleton placeholder during initial load looks correct (not stretched, not collapsed) at both aspect ratios.

**Verification:**
- A vertical-marked mp4 viewed alone on a wide desktop occupies the slider container's full height at 9:16 width; the rest of the slide is empty page background (intentional, minimalist treatment).
- A vertical-marked mp4 on a phone-width viewport fills the slide and keeps its 9:16 aspect (because the slider container takes 9:16 on phone for vertical-containing projects — see U3 and U4).
- The Video skeleton (pulsing placeholder before metadata loads) renders correctly at `aspect-[9/16]`.

---

- U3. **Group consecutive verticals into slides; add `items` prop; container aspect; isActive + play mutex**

**Goal:** Replace the slider's "one child = one slide" rendering with a grouping step driven by an explicit `items` prop. Group consecutive verticals into one slide (up to a per-breakpoint capacity), break on every horizontal, and preserve YAML order. Apply the breakpoint-aware container aspect. While here, add the isActive signal and the within-slide play mutex so the multi-vertical UX is correct.

**Requirements:** R4, R5, R6, R8, R9.

**Dependencies:** U1, U2.

**Files:**
- Modify: `components/slider.tsx` — add the `items` prop, the grouping function, the breakpoint-aware container aspect, the within-slide grid layout, the isActive signal wired to slide visibility, and the play-mutex event listener on multi-video slides. If the grouping function grows beyond ~30 lines, extract to `components/slide-grouping.ts`.
- Modify: `components/video.tsx` — add an optional `isActive` prop (default `true`). When `isActive` transitions from `true` to `false`, call `.pause()` on the underlying `<video>` via the existing `videoRef`. Self-contained change to the existing component; existing callers that don't pass the prop are unaffected.

**Approach:**
- The grouping function is pure: `(items: Item[], capacity: number) => Item[][]` where `Item = { orientation: 'horizontal' | 'vertical'; node: ReactNode }`.
- Grouping rule:
    - Iterate items in order.
    - If the item is horizontal, finalize the in-progress group (if any) and emit `[item]` as its own slide.
    - If the item is vertical, append to the in-progress group. When the group reaches capacity, finalize and start a new one.
    - At the end, finalize any in-progress group.
- The `items` prop is required to be used by `Slider`'s grouping logic. Why required (not just preferred): `MediaContent` is an `async` server component, so by the time children reach the client `Slider` they are the rendered `<Video>` output, not the original `<MediaContent value={...}/>` element. There is no `props.value.orientation` to inspect from the client side. The `items` array (built server-side in `app/courses/project.tsx`) is the only way orientation crosses the boundary. The `children`-driven path is preserved as a fallback to keep the slider's public API non-breaking, but is unexercised by production code after this change — the sole caller migrates in U5.
- **Container aspect rule** (applies after breakpoint detection in U4 yields capacity):
    - Capacity 2 or 3 (tablet/desktop): container is `aspect-video` (16:9).
    - Capacity 1 (phone) AND at least one item in `items` is `orientation === 'vertical'`: container is `aspect-[9/16]`.
    - Capacity 1 (phone) AND no vertical items: container is `aspect-video` (preserves today's behavior for horizontal-only projects).
- **Internal restructure**: when `items` is provided, `totalSlides = groups.length` (not `items.length`). The existing `Children.map` over children becomes a map over groups; each *group* container carries the existing `translate-x-full` / `-translate-x-full` transforms (so the animation continues to apply at the slide level, not the item level). Inside a multi-vertical group container, items lay out via `grid h-full place-items-center` plus a conditional column class — `clsx('grid h-full place-items-center', group.length === 2 && 'grid-cols-2', group.length === 3 && 'grid-cols-3')`. `place-items-center` centers each aspect-constrained vertical within its grid track (since each vertical's intrinsic width from `aspect-[9/16]` is smaller than its full track width).
- **isActive signal**: each group container knows whether it is the currently-active slide (i.e., `groupIndex === index`). Pass an `isActive` prop to each `<Video>` rendered inside (or expose a context). When `isActive` flips from true to false, the `<Video>` calls `.pause()` on its underlying `<video>` element via the existing `videoRef`. This pairs with the `components/video.tsx` extension listed in Files.
- **Within-slide play mutex**: for a group container with multiple `<video>` elements, attach a `play` event listener on each `<video>` that calls `.pause()` on its siblings within the same group container. Implemented via `useEffect` in the group container's component, scoped to that group's DOM subtree (e.g., `groupRef.current?.querySelectorAll('video')`, never `document.querySelectorAll('video')`). The mutex is silent — no visual cue on the deactivated siblings — for this iteration; the assumption is that most viewers play one video, watch it, then navigate or stop. If real-world feedback surfaces friction (viewers ping-ponging because the mutex rule isn't observable), revisit in a follow-up with a subtle visual cue.

**Patterns to follow:**
- The slider already uses `useState` and stable callbacks (`useCallback`) for index control — keep the same idiom.
- `clsx` for conditional within-slide grid classes (literal strings only, never template interpolation).
- `components/video.tsx`'s existing `videoRef` is the handle for `.pause()` and `play`-event wiring.

**Verification cases** (grouping function — exercise by toggling YAML entries to reproduce orderings):
- **Covers AE2 @ desktop.** Items `[V, V, V]` with capacity 3 → one slide of three verticals filling the slide width via `grid-cols-3`.
- **Covers AE2 @ tablet.** Items `[V, V, V]` with capacity 2 → two slides: `[V, V]` (using `grid-cols-2`), `[V]`. Arrow buttons appear.
- **Covers AE2 @ phone.** Items `[V, V, V]` with capacity 1 → three slides of one vertical each. Arrow buttons appear.
- **Covers AE3.** Items `[V, V, H, V, V, V]` with capacity 3 → three slides in order: `[V, V]`, `[H]`, `[V, V, V]`.
- **Covers AE1.** Items `[V, V]` with capacity 3 → one slide of two verticals using `grid-cols-2` (verticals share equal-width tracks, distributed across the slide's horizontal axis).
- Empty items array → no slides rendered; the slider renders nothing (existing `if (!totalSlides) return null` path continues to apply).
- Single horizontal item → one slide with one item. Arrows hidden (current behavior).
- All horizontal items `[H, H, H]` with capacity 3 → three slides, one horizontal each (capacity does not apply to horizontals).
- Vertical group exactly at capacity `[V, V, V, V]` with capacity 3 → two slides: `[V, V, V]`, `[V]`. (A lone trailing vertical takes its natural 9:16 size at the container's full height, centered within the slide; the empty flanks show the page background. Intentional minimalist treatment.)
- Mixed `[V, H]` with capacity 3 → two slides: `[V]`, `[H]`.

**Verification cases** (interaction):
- On a multi-vertical slide, pressing play on video 1 while video 2 is playing pauses video 2. (Within-slide play mutex.)
- Pressing the right arrow / swiping right while video 2 on slide 1 is playing pauses video 2. Returning to slide 1 (left arrow) leaves video 2 paused (viewer must press play again — no auto-resume).
- Existing arrow-disable behavior continues at slide boundaries.
- `totalSlides` reflects group count, not item count (e.g., `[V, V, V]` at desktop has 1 slide → arrow buttons hidden; same items at phone has 3 slides → arrow buttons visible).

**Verification method:** load the courses page with at least one project flipped to `orientation: vertical` on multiple existing mp4 entries; manually exercise the orderings above by editing YAML; check play-mutex and pause-on-deactivate by playing videos and navigating.

**Verification:**
- The courses page renders without runtime errors for mixed-orientation projects.
- No audio bleed after navigating away from a playing video.
- No overlapping audio on a multi-vertical slide.
- Arrow buttons disable correctly at slide boundaries; arrow visibility reflects group count.

---

- U4. **Detect breakpoint and recompute slides on resize**

**Goal:** Read the current viewport breakpoint inside `Slider` and recompute grouping when the breakpoint changes. Preserve the user's position on the same media item where reasonable. Render a stable hydration placeholder until breakpoint information is known.

**Requirements:** R4 (the capacity values), R7.

**Dependencies:** U3.

**Files:**
- Modify: `components/slider.tsx` — add breakpoint detection, the `hydrated` gate, and the position-preservation logic.

**Approach:**
- Detect breakpoint via `window.matchMedia('(min-width: 1024px)')` (lg → capacity 3) and `window.matchMedia('(min-width: 768px)')` (md → capacity 2); otherwise capacity 1. Tailwind v4's default `md` (768px) and `lg` (1024px) boundaries — confirmed unmodified in `app/globals.css`.
- **Hydration gate**: until the client has hydrated and read `matchMedia` results, render a stable placeholder. The placeholder uses the same outer `grid-cols-[min-content_1fr_min-content]` frame as the real slider (with the arrow-button cells empty since slide count is unknown), and the slide content cell shows a single 16:9 container with the same skeleton-pulse classes the `Video` component uses (`animate-pulse bg-limestone/60 dark:bg-graphite/30 rounded-lg`). This mirrors `components/video.tsx:22-27,30-34`. After hydration, render the real grouping; the arrow buttons may then appear in the side cells if the new slide count exceeds 1, and the slider container's aspect may shift to 9:16 if the rule applies (phone with vertical items). Both are accepted as a brief, infrequent transition rather than a sustained UX issue. This is required because `next.config.ts` sets `output: 'export'`; every visitor receives the same static HTML, so a server-render guess at capacity would always be wrong for some visitors. The featureless pulsing rectangle is acceptable for v1 (matches the existing `Video` skeleton pattern visible elsewhere on the site); if real-world feedback surfaces "looks broken on slow connections," consider a subtle inner cue (e.g., a low-opacity media glyph) in a follow-up.
- Listen for `matchMedia` `change` events and update state when the breakpoint crosses. Clean up listeners on unmount.
- **Position preservation**: when the breakpoint changes, identify the first item index on the current slide (computed from the old grouping). After the new grouping is built, set the slide index to the slide containing that item index. If the new total is smaller than the previous current index, clamp to the last slide.

**Patterns to follow:**
- `components/video.tsx:18-27` — `useState` + `useEffect`-driven hydration gate pattern. The `Slider` adopts the same approach.

**Verification cases:**
- On a desktop browser, three vertical items render as one slide; arrow buttons absent.
- Resizing from desktop to tablet across the `lg` boundary with three vertical items causes the slider to re-render with two slides; arrow buttons appear; the visible content stays on the first vertical (resume-on-the-same-item).
- **Covers AE5.** Starting at desktop with `[V, V, V]` on a single slide (index 0), resizing to tablet width, the slider shows two slides and the first one is still the `[V, V]` pair starting with the same first vertical — viewer is not bounced past their content.
- Toggling between breakpoints repeatedly does not accumulate event listeners (verified by lack of memory growth / no duplicate handlers; cleanup in `useEffect` return).
- The hydration placeholder appears briefly on initial page load (especially noticeable on a slow throttled connection) and is replaced by the real grouping after hydration.
- When `matchMedia` is not available (degenerate environments), the slider falls back to capacity 3 (desktop) and does not crash.

**Verification method:** open the courses page, use browser devtools to resize across the `md` and `lg` boundaries with a multi-vertical project in view; observe smooth re-grouping. Throttle network in devtools to see the hydration placeholder. Check console for hydration warnings (should be absent).

**Verification:**
- No console errors related to hydration mismatches.
- No layout flash on initial page load — the `hydrated` gate renders a stable placeholder until the real grouping is known.
- Resize behavior smoothly transitions slide groupings.

---

- U5. **Update docs and call site; flip existing vertical mp4s**

**Goal:** Update the README to document the `orientation` field; rewire the sole call site (`app/courses/project.tsx`) to pass `items` to `<Slider>` instead of `children`; flip at least one existing mp4 entry in `public/courses/content.yaml` to `orientation: vertical` so the feature ships exercised and the lab owner sees real before/after on existing content.

**Requirements:** None directly — this unit delivers the documentation and call-site plumbing that lets U1–U4's behavior reach authors and the existing call site. The behavior of R1–R9 is satisfied by U1–U4; R8 specifically falls out of U3 (play mutex + isActive), and R9 falls out of U3 + U4 (slide-level nav + pause-on-deactivate).

**Dependencies:** U1, U2, U3, U4.

**Files:**
- Modify: `README.md` — extend the "Media" section to document `orientation: horizontal | vertical` (default `horizontal`) on `mp4` entries, with a short note on responsive side-by-side behavior.
- Modify: `app/courses/project.tsx` — pass `items` (with `orientation` and the `<MediaContent>` node) to `<Slider>` instead of children.
- Modify: `public/courses/content.yaml` — flip at least one existing `mp4` entry whose underlying file is actually vertical to `orientation: vertical`. Several existing entries (`frosty.mp4`, `richardlight.mp4`, `purpleintromedrob.mp4`, etc.) were filmed vertically and have been letterboxed by today's renderer; this is the change that makes the feature visible. The implementer picks at least one to flip; the lab owner can flip additional entries post-merge as they wish.

**Approach:**
- README change: insert two bullets under the `mp4` description — one for the new field, one short note about responsive side-by-side behavior with example phrasing matching the existing prose voice.
- `project.tsx` change: build the `items` array in the JSX of the slider:

    ```text
    items = media.map((m, i) => ({
      orientation: m.type === 'mp4' ? m.orientation : 'horizontal',
      node: <MediaContent value={m} key={i} />,
    }))
    ```

    (Conceptual only — final code follows the patterns in the file. Image entries are treated as horizontal, preserving today's one-per-slide behavior for images.)
- YAML change: identify one or more entries in `public/courses/content.yaml` whose underlying mp4 file is vertical (e.g., one of the courses listed above), and add `orientation: vertical` to those entries.

**Patterns to follow:**
- The README's existing Media section (lines 64-75) is the structural template.
- `app/courses/project.tsx:47-51` is the only call site for `<Slider>` and the only place that needs the `items` rewiring.

**Verification cases:**
- This unit has no automated behavior to verify on its own; its purpose is to wire the existing call site and document the new field.
- **Smoke check**: the existing course page builds and renders identically to before for projects that were not flipped to `orientation: vertical`. Image entries continue to render as their own slides; unflipped horizontal mp4 entries continue to render full-width one-per-slide.
- **Real-content check**: the flipped vertical mp4 entries now render at 9:16 inside the slider's container (16:9 on desktop/tablet, 9:16 on phone for vertical-containing projects); if two or three flipped entries appear consecutively, they render side by side at desktop. The lab owner can see existing content displayed correctly for the first time.

**Verification method:** `npm run build` succeeds with no new errors; load the dev server, navigate to courses, verify the unflipped entries look unchanged, verify the flipped entries now display as intended verticals (not letterboxed).

**Verification:**
- The README accurately reflects the YAML behavior implemented in U1.
- A hand inspection of the courses page shows the flipped entries display correctly and the unflipped entries are unchanged.

---

## System-Wide Impact

- **Interaction graph:** `Slider` is used in exactly one place (`app/courses/project.tsx`). No other page or component imports it. The risk of breaking other pages is bounded to that one call site.
- **Error propagation:** Zod parse errors at build time surface as a failed `next build` with a clear schema error. Adding the new field with a default makes existing YAML files immune to parse errors. Runtime fall-through on an unrecognized orientation value is not possible because zod rejects invalid enum values at parse time.
- **State lifecycle risks:** `matchMedia` listeners must be cleaned up on `Slider` unmount. The position-preservation logic must not get stuck at an out-of-range index when the slide count shrinks (clamp to last slide). The `Video` component's new `isActive` handling must not call `.pause()` on a `<video>` element that has not yet mounted (gate on the ref being non-null).
- **API surface parity:** `Slider`'s public prop surface gains an optional `items` prop. The existing `children`-driven path is preserved for backward compatibility but unused by production code after this PR. `Video`'s public prop surface gains an optional `isActive` prop, defaulting to true (so existing callers that don't pass it are unaffected).
- **Integration coverage:** The grouping function is pure and verifiable by inspection of its inputs/outputs against the verification cases in U3. The interaction behaviors (pause-on-deactivate, play mutex, breakpoint regroup) are verified manually in the dev server because the repo has no test framework.
- **Unchanged invariants:** The `image` branch of `MediaContent`, all other pages, all other components, and the courses page's behavior for unflipped projects all remain untouched. Existing horizontal-mp4 projects on the courses page render identically.

---

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| No automated tests, so regressions to the existing courses page could slip through unnoticed. | The change is concentrated in `Slider`, `MediaContent`, `Video`, and `project.tsx`. Manual verification covers both the new (flipped vertical entries) and the existing (unflipped horizontal entries) paths. Build + lint are the automated gates. |
| Hydration mismatch between the static export (which has no viewport context) and the client. | Firm `hydrated` gate in `Slider`, mirroring `components/video.tsx`. Slider renders a 16:9 skeleton inside the same outer grid as the real slider until the breakpoint is known. Arrow buttons and container aspect (9:16 on phone for vertical-containing projects) may shift briefly after hydration — accepted as a small, infrequent transition rather than a sustained layout issue. |
| Tailwind JIT misses the dynamic class strings for within-slide grid columns. | Use literal class strings inside `clsx(...)` conditions (the pattern in `components/text-content.tsx`), never template-string interpolation. Only `grid-cols-2` and `grid-cols-3` are needed — a small fixed set. |
| Per-slide pause-on-deactivate edge cases when the breakpoint changes mid-playback (a playing video's slide gets re-grouped and may or may not still be active). | The position-preservation logic resolves the new active-slide index first; whichever group contains the previously-first item is the new active slide. Videos on slides that are no longer active pause. Documented in U4. |
| The within-slide play mutex relies on `play` events firing reliably across browsers including iOS Safari. | The `play` event is well-supported across all current browsers. If a future browser quirk emerges, the failure mode is the original simultaneous-audio issue — not new functionality breaking. |
| The swipe gesture on phone overlaps with native video controls' horizontal scrub gesture. | Trust `react-swipeable`'s existing gesture disambiguation. If real-world feedback surfaces friction here, address in a follow-up. |
| Grouping function grows beyond easy-to-read inline length as edge cases land. | Extract to `components/slide-grouping.ts` if it exceeds ~30 lines or develops enough verification surface to merit its own file. |
| Within-slide grid alignment with aspect-ratio items could surprise (items not filling tracks). | `place-items-center` on the grid container centers each aspect-constrained vertical within its track. Specified in U3. |
| Phone visitors of a vertical-containing project briefly see a 16:9 placeholder, then the slider shifts to 9:16 after hydration. | Accepted. The hydration gate is short on most connections; the alternative (always 16:9 on phone) makes verticals unwatchably small. The placeholder uses the same outer grid as the real slider so the slide content column width is stable; only the container aspect (and arrow buttons, conditionally) shift. |
| `Video` component skeleton was only exercised at `aspect-video`. | Confirm visually at `aspect-[9/16]` during U2 implementation. The skeleton uses `h-full w-full` against a parent-supplied aspect class, which should work; if not, the fix is localized to `components/video.tsx`'s wrapper `<div>` classes. |

---

## Documentation / Operational Notes

- README's Media section is the canonical authoring reference for the lab owner; U5's change to it is the only documentation surface that needs updating.
- The deployment pipeline (Azure Static Web Apps via `.github/workflows/deploy.yml`) runs its own build inside the action — no separate build step or environment variable change is needed.
- No rollout flag, monitoring change, or migration. Once the PR merges, the lab owner can flip additional mp4 entries to `orientation: vertical` in YAML at any time.

---

## Open Questions

### Resolved During Planning

- *Test framework?* Resolved: no new test framework. Verification is manual (dev server + YAML toggling) plus build + lint. Matches the existing AGENTS.md posture.
- *CSS-only vs JS-driven grouping?* Resolved: JS-driven at the slider boundary. The horizontal-breaks-the-group rule is order-dependent and structural; CSS alone cannot express it.
- *`items` prop vs inspect children?* Resolved: `items` prop is required (not just preferred), because `MediaContent` is an async server component and its `value` prop does not cross the RSC boundary in a way the client `Slider` can introspect.
- *Resume behavior on resize?* Resolved: remember the first media-item index of the current slide, recompute, place the slide containing that item as current; clamp to last slide if the new total is smaller.
- *YAML field name and values?* Resolved: `orientation: 'horizontal' | 'vertical'` with `'horizontal'` default.
- *Max width of a lone vertical on desktop?* Resolved: not capped. Verticals are constrained by height (`h-full`); width follows from 9:16. On desktop/tablet a lone vertical sits at its natural width centered in the 16:9 slide; the empty flanks show page background (intentional minimalist treatment — no panel, border, or shadow).
- *Slider container aspect across breakpoints?* Resolved: breakpoint-aware. Tablet and desktop (capacity 2 and 3) keep 16:9 across all slides. Phone (capacity 1) uses 9:16 if any item is vertical, else 16:9. Reason: 16:9-everywhere on phone makes verticals render at ~107px wide on a 375px viewport — worse than today's letterboxed behavior. The trade is a brief container-aspect shift on phone for vertical-containing projects, accepted in exchange for watchable verticals.
- *Within-slide grid alignment?* Resolved: `place-items-center` on the multi-vertical grid container. Equal tracks; each vertical centers within its track. 2-up shows two verticals with gutters between and outside; 3-up shows three verticals nearly edge-to-edge.
- *Empty-flank treatment for lone vertical on desktop?* Resolved: no special treatment — page background fills the empty area, consistent with the site's minimalist aesthetic.
- *Hydration gate posture?* Resolved: firm `hydrated` gate; placeholder uses the same outer grid frame as the real slider so the slide content column width is stable across hydration. Container aspect may shift briefly after hydration on phone for vertical-containing projects.
- *Hydration placeholder visual cues?* Resolved for v1: featureless pulsing rectangle matching the existing `Video` skeleton pattern. Add a subtle inner cue (e.g., low-opacity media glyph) in a follow-up if real-world feedback surfaces "looks broken on slow connections."
- *Audio bleed across slides?* Resolved: pause-on-deactivate. When a slide leaves the active position, all its videos pause via `.pause()`.
- *Simultaneous audio on a multi-vertical slide?* Resolved: within-slide play mutex. Starting playback on one video pauses the others in the same slide.
- *Vertical asset for verification?* Resolved: at least one of the existing mp4 entries in `public/courses/content.yaml` gets flipped to `orientation: vertical` as part of U5, so the feature ships exercised against real content.
- *Group meaning across breakpoints?* Resolved: there is no group meaning. Side-by-side rendering exists for space efficiency only; splitting a vertical group across slides on smaller breakpoints is normal navigation, not semantic loss.
- *Play mutex visual cue?* Resolved for v1: silent mutex — no visual cue on deactivated sibling videos. Assumption: most viewers play one video, watch it, then navigate or stop. If real-world feedback surfaces ping-pong friction, revisit with a subtle treatment (e.g., `opacity-70` on non-playing siblings).
- *Grouping function placement?* Soft-resolved: start inline in `components/slider.tsx`, extract to `components/slide-grouping.ts` if it grows beyond ~30 lines.

### Deferred to Implementation

- Whether the `Video` component's `isActive` extension is best implemented via a prop, context, or a small new sibling hook. All three are workable; pick whichever reads cleanest given how many `<Video>` instances exist on a slide.
- Exact gutter size between side-by-side verticals (e.g., `gap-4` vs `gap-6`) — visual taste check during U3.
- Whether the swipe-vs-scrub conflict on phone needs further handling. Default: trust `react-swipeable`; revisit if real-world feedback surfaces friction.

---

## Sources & References

- **Origin document:** [docs/brainstorms/2026-05-10-vertical-video-side-by-side-requirements.md](../brainstorms/2026-05-10-vertical-video-side-by-side-requirements.md)
- **Related issue:** [#139](https://github.com/seamuslowry/siobhan-oca/issues/139)
- **Related code:**
    - `components/media-content.tsx` — schema + render branching
    - `components/slider.tsx` — grouping function, items prop, hydration gate, breakpoint detection, isActive/play-mutex wiring
    - `components/video.tsx` — hydration / loading-skeleton pattern; gains optional `isActive` prop
    - `components/text-content.tsx` — explicit-Tailwind-class-string pattern
    - `app/courses/project.tsx` — sole slider call site; rewired to pass `items`
- **Tailwind v4 default breakpoints:** confirmed unmodified in `app/globals.css` (sm: 640px, md: 768px, lg: 1024px).
- **Static export posture:** `next.config.ts` sets `output: 'export'`; per `AGENTS.md`, there is no Node runtime in production and lint is the only CI quality gate.
