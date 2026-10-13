---
date: 2026-10-12
topic: vertical-video-grouping
supersedes: PR #173 (closed)
---

# Vertical Video Side-by-Side Support (retry)

Resolves [#139](https://github.com/seamuslowry/siobhan-oca/issues/139): "for teaching classes, support multiple videos side by side. use case of three vertical videos".

## Problem Frame

Every course-project `mp4` renders in a 16:9 box, one item per slide. The three vertical clips already on the courses page (`richardlight.mp4`, `frosty.mp4`, `purpleintromedrob.mp4`, all 360×640) are letterboxed. Authors also can't show several vertical clips together.

PR #173 delivered the right behavior but was closed so the work could be redone more simply. It added a children-or-items dual API, an `IsActiveContext`, a play mutex, a hand-rolled breakpoint hook with a hydration gate, and two effects that kept the slide position in sync. Product behavior stays the same this time. The implementation has to be much smaller.

## Requirements

- R1. `mp4` media accepts `orientation: horizontal | vertical`. The default is `horizontal`, so existing YAML is unchanged.
- R2. A vertical video renders at 9:16 and never stretches the full width of a wide container. This holds anywhere `MediaContent` renders, including the research page.
- R3. In the courses slider, consecutive verticals share one slide, up to 1 (phone), 2 (tablet `md`) or 3 (desktop `lg`). A horizontal video or an image always gets its own slide and breaks a vertical run. YAML order is preserved.
- R4. A vertical is the same size whether it is alone on a slide or grouped. Its width is one slot of the current capacity.
- R5. When a resize changes the grouping, the viewer stays on the media item they were looking at.
- R6. Arrows and swipe move between slides. Existing slider behavior is unchanged for projects with no verticals.
- R7. The three existing vertical clips are tagged `orientation: vertical`.

## Scope Boundaries

- Grouping is automatic. YAML has no group syntax, and authors can't override capacity.
- No play mutex, no pause-on-slide-change, no synced playback. Off-screen playback already happens today. It can be a separate follow-up if it bothers anyone.
- No probing of video dimensions at build time or runtime.

## Key Decision (confirmed with Seamus)

Automatic, screen-size-driven grouping (the #173 behavior), done more simply. An explicit YAML grouping with CSS-only layout was offered and declined.
