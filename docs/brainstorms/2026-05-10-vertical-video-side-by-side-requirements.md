---
date: 2026-05-10
topic: vertical-video-side-by-side
---

# Vertical Video Side-by-Side Support

Resolves [#139](https://github.com/seamuslowry/siobhan-oca/issues/139).

## Problem Frame

Course project media on the teaching page currently assumes every video is 16:9. The renderer applies `aspect-video` to every `mp4` (`components/media-content.tsx:27`) and the `Slider` (`components/slider.tsx`) shows one media item per slide. The lab owner wants to feature vertical (Instagram-style, ~9:16) videos — and the motivating use case is three vertical clips of the same student project shown together, not three unrelated clips paged through one at a time.

Today, dropping a 9:16 file into a project either letterboxes it inside a 16:9 box (wasted space, bad composition) or stretches it. There is also no way to express "these three belong together on one slide." The viewer cannot see the composition the instructor intends.

---

## Requirements

**Authoring**
- R1. The `mp4` media entry in YAML accepts an explicit orientation marker indicating whether the file is `horizontal` (default, current behavior) or `vertical`. The exact field name is a planning decision; the brainstorm-level requirement is one explicit string-valued field on `mp4` entries.
- R2. Existing project YAML continues to parse and render unchanged. Entries without the new field are treated as `horizontal`.
- R3. The orientation marker is the only signal used to decide layout. No build-time probing of mp4 metadata and no runtime measurement of `videoWidth` / `videoHeight` is required.

**Rendering — single video**
- R4. A `horizontal` video renders at the full slide width with a 16:9 aspect box (current behavior preserved).
- R5. A `vertical` video renders with a 9:16 aspect box and is constrained in width so it does not blow out the slide on a wide viewport. Multiple verticals on one slide share the available horizontal space.

**Slide grouping**
- R6. The slider groups consecutive `vertical` items in the YAML order into a single slide, up to a per-breakpoint capacity:
    - phone: 1 vertical per slide
    - tablet: 2 verticals per slide
    - desktop: 3 verticals per slide
- R7. A `horizontal` item is always its own slide and breaks any in-progress vertical grouping. Sequence `[V, V, H, V, V, V]` on desktop produces three slides: `[V, V]`, then `[H]`, then `[V, V, V]`. (Authoring order is preserved; horizontals are never reordered or merged with verticals.)
- R8. When a slide contains fewer verticals than the breakpoint capacity (e.g., 2 verticals on desktop where 3 fit), the verticals spread evenly across the horizontal space rather than left-aligning with empty space on the right.
- R9. Regrouping is responsive: when the viewport changes breakpoint (e.g., rotating a tablet, resizing a desktop window), the slide composition updates to reflect the new capacity. The user's current position should remain on the same media content where reasonable; exact resume behavior is a planning detail (see Outstanding Questions).

**Playback and interaction**
- R10. Each video on a multi-vertical slide has independent native HTML5 controls. No synchronized playback, no autoplay, no muting logic.
- R11. Existing slider affordances — arrow buttons, swipe, single-slide visibility, opacity-until-loaded — continue to work. Arrow / swipe navigation moves between *slides* (whatever the current grouping has produced), not between individual media items.

---

## Acceptance Examples

- AE1. **Covers R6, R8.** A project with media `[vertical, vertical]` on a desktop viewport (capacity 3) renders as a single slide containing both verticals, distributed evenly across the slide's horizontal space. The slider shows no left/right arrows because there is only one slide.
- AE2. **Covers R6, R7.** A project with media `[vertical, vertical, vertical]` renders as: one slide of three side-by-side verticals on desktop; two slides (`[V, V]` then `[V]`) on tablet; three slides of one vertical each on phone.
- AE3. **Covers R7.** A project with media `[vertical, vertical, horizontal, vertical, vertical, vertical]` on desktop renders as three slides in this order: `[V, V]`, `[H]`, `[V, V, V]`.
- AE4. **Covers R2, R4.** A project YAML written before this feature shipped, with only `type: mp4` entries and no orientation field, renders identically to its current behavior — one horizontal video per slide.
- AE5. **Covers R9.** A viewer on desktop sees three verticals on one slide. They resize the window down to tablet width. The same three verticals now span two slides (`[V, V]` then `[V]`), reachable via the existing arrow / swipe navigation.

---

## Success Criteria

- The lab owner can publish a course project containing three vertical clips of the same student work, and a visitor on a desktop sees all three side by side on one slide without letterboxing, stretching, or visual clutter.
- A visitor on a phone sees the same three clips as three swipeable slides, each clip at a usable size.
- Existing course projects render with no visible difference.
- A planner reading this document can specify the YAML schema change, the renderer change, and the slider-grouping logic without re-deriving product behavior — the only invented surface is implementation strategy (e.g., CSS-only scroll-snap vs. JS breakpoint observer).

---

## Scope Boundaries

- No synchronized multi-video playback (no "play all three together" button).
- No autoplay or auto-mute behavior on slide entry.
- No per-author override of the responsive breakpoint capacities (1 / 2 / 3 is hard-coded for this iteration).
- No support for grouping horizontal videos side by side. Horizontal videos remain one-per-slide.
- No grouping concept exposed in YAML. Authors don't declare "this is a group" — the renderer groups consecutive verticals automatically based on order and viewport.
- No images-in-vertical-group support: image side-by-side layout is out of scope. Vertical grouping applies only to `vertical` mp4 entries. (An image between two verticals breaks the group the same way a horizontal video does, by virtue of not being a vertical mp4.)
- No build-time probing of mp4 dimensions. No new build dependencies (e.g., ffprobe).
- No changes to research / home / team pages. This feature lives on the courses page's project media.

---

## Key Decisions

- **Orientation declared in YAML, not detected.** Chosen because the lab owner already edits YAML for all content, the static-export build (`output: 'export'` in `next.config.ts`) avoids adding a probe step, and runtime measurement would cause visible layout shift. Cost: authors must remember to tag verticals correctly. Mitigation: default to `horizontal` so the failure mode is the current behavior, not a broken page.
- **Responsive grouping rather than authored groups.** No `group:` key, no nested arrays. Authors write a flat media list as they do today; the renderer packs verticals based on viewport. Keeps the YAML schema flat, keeps the mental model simple ("just list your clips in order"), and means the same content adapts cleanly across devices.
- **Horizontal breaks the group.** YAML order is authoritative. A horizontal between verticals splits them rather than letting verticals jump over horizontals to fill capacity. Preserves authoring intent and avoids reordering surprises.
- **Independent native controls.** Matches the existing `Video` component's behavior. Synchronized playback was considered for the "three angles of one event" use case but rejected as significant extra complexity (duration mismatches, seek coordination, error states) for a use case that hasn't been confirmed as primary.
- **Phone shows one-per-slide, not three-crammed.** Three vertical videos side by side on a phone are too narrow to be readable. The slide grouping degrades gracefully to swipeable single clips.

---

## Dependencies / Assumptions

- Assumes the existing `Slider` component (`components/slider.tsx`) is the right place for grouping logic, or that a thin layer between project media and slider is the right insertion point. Which one is a planning decision.
- Assumes the existing `Video` component (`components/video.tsx`) handles vertical videos correctly given a different aspect-ratio container. Worth confirming during planning — the loading skeleton currently uses `w-full` and `h-full` against a parent-supplied aspect class, which should work, but it has only been exercised at `aspect-video`.
- Assumes Tailwind v4's standard responsive prefixes (`sm:`, `md:`, `lg:`) map cleanly to the phone / tablet / desktop capacities. Planning will pick the exact breakpoint boundaries.
- No new third-party dependencies are anticipated. If the responsive-grouping implementation needs a small utility (e.g., a `useBreakpoint` hook), it should be local to this feature, not a library import.

---

## Outstanding Questions

### Deferred to Planning

- [Affects R6, R9][Technical] Should responsive grouping be CSS-only (e.g., a flex/grid container with scroll-snap that the breakpoint reflows naturally) or JS-driven (a breakpoint observer that recomputes the grouping and re-renders slides)? CSS-only is cheaper and avoids hydration mismatches but constrains the grouping rule to what CSS can express; JS gives full control over R7's "horizontal breaks the group" rule. Resolve during planning.
- [Affects R9][Technical] When the viewport crosses a breakpoint mid-view, what is the precise resume behavior — stay on the same media item (which may now be on a different slide index), stay on the same slide index, or reset to slide 0? Worth pinning down in the plan; brainstorm-level answer is "stay on the same content where reasonable."
- [Affects R1][Technical] Exact YAML field name and value vocabulary (`orientation: vertical` vs `aspect: 9:16` vs `vertical: true`). Brainstorm-level decision is "one explicit string-valued field with a `horizontal` default"; the bikeshed is for planning.
- [Affects R5][Needs research] What maximum width should a single vertical occupy on desktop when it appears alone on a slide (e.g., a project with one vertical)? Pinning the upper bound prevents one tall video from dominating a wide screen. Likely a Tailwind `max-w-*` value; pick during planning with a quick visual check.

---

## Next Steps

-> `/ce-plan` for structured implementation planning
