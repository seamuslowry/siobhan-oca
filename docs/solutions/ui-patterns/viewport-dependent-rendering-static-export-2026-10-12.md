---
title: Viewport-dependent rendering in a static export without hydration jumps
date: 2026-10-12
last_updated: 2026-10-12
category: docs/solutions/ui-patterns
module: components/slider
problem_type: best_practice
component: frontend
severity: low
applies_when:
  - A client component needs to render differently depending on viewport width (breakpoints)
  - The site is `output: 'export'`, so the server never knows the viewport
symptoms:
  - "Hydration mismatch warnings after reading window.matchMedia during render"
  - "Content visibly resizes or jumps right after the page loads on phones"
  - "Effects plus a `hydrated` flag just to read a media query"
resolution_type: code_fix
related_components:
  - components/use-media-query.ts
  - components/slider.tsx
tags:
  - hydration
  - matchMedia
  - useSyncExternalStore
  - static-export
  - tailwind-breakpoints
---

# Viewport-dependent rendering in a static export

## Problem

Grouping vertical videos per slide (#139) depends on viewport width. The first attempt (PR #173, closed) used `useState`, a `useEffect` that read `matchMedia`, a `hydrated` flag, and a placeholder render to avoid hydration mismatches. That was a lot of machinery, and it fought the `set-state-in-effect` lint rules.

## Solution

1. **Read media queries with `useSyncExternalStore`** (`components/use-media-query.ts`). Pass a server snapshot, such as "assume desktop". React uses it for the prerender and during hydration, then re-renders with the real value. That gives no mismatch, no effects, and no `hydrated` flag.
2. **Decide what can be CSS and what must be JS.** Anything that only *sizes* elements should use responsive Tailwind classes (`w-full md:w-1/2 lg:w-1/3`), so the prerendered HTML is already right on every device. Use the JS hook only for things CSS can't express, like how many items share a slide. If both encode the same breakpoints, keep them next to each other with a comment that ties them together.
3. **Store state that survives a re-layout.** The slider stores the *item* in view, not the slide index, and derives the slide from the current grouping. A breakpoint change regroups the slides without effects or refs to resync position.

## Prevention

Before writing `useEffect(() => setX(window...))`, check whether the value is an external store (use `useSyncExternalStore`) or purely presentational (use CSS).
