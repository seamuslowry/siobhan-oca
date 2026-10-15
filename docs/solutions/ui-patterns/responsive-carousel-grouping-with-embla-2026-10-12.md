---
title: Responsive side-by-side grouping in a carousel with Embla and CSS widths
date: 2026-10-12
last_updated: 2026-10-12
category: docs/solutions/ui-patterns
module: components/slider
problem_type: best_practice
component: frontend
severity: low
applies_when:
  - A carousel needs to show a different number of items per step depending on viewport width
  - Items have mixed widths (for example portrait and landscape video)
  - The site is `output: 'export'`, so the server never knows the viewport
symptoms:
  - "Hand-rolled breakpoint listeners, hydration flags and grouping logic inside a slider"
  - "Content visibly resizes or jumps right after the page loads on phones"
  - "Neighbouring slides peek into the view when a step is narrower than the viewport"
resolution_type: code_fix
related_components:
  - components/slider.tsx
  - components/media-content.tsx
tags:
  - embla-carousel
  - responsive
  - hydration
  - useSyncExternalStore
  - tailwind-breakpoints
---

# Responsive carousel grouping with Embla

## Problem

Vertical course videos (#139) should share a slider step: 3 on desktop, 2 on tablet, 1 on phone, with horizontal videos always alone. Two home-rolled attempts (PR #173, then the first revision of #182) needed `matchMedia` listeners, hydration handling, a grouping function and position bookkeeping to survive resizes.

## Solution

1. **Let slide widths do the grouping.** With [Embla](https://www.embla-carousel.com/) and `slidesToScroll: 'auto'`, each step is whatever fits the view. Size slides with responsive Tailwind classes (`basis-full md:basis-1/2 lg:basis-1/3`) and the per-breakpoint count falls out with no JS. The prerendered HTML is already the right size, so nothing jumps at hydration. Embla also replaces `react-swipeable`.
2. **Hide the neighbours.** Embla scrolls continuously, so a step narrower than the view lets adjacent slides peek in. Fade (`opacity-0`) every slide outside the selected step. Read the step's slides from `embla.internalEngine().slideRegistry[embla.selectedScrollSnap()]`; `slidesInView()` needs a threshold and can still count a small neighbour that fits entirely.
3. **Read Embla through `useSyncExternalStore`.** A hook that subscribes to `select`/`reInit` and returns a primitive (`canScrollPrev()`, a joined list of selected indices) keeps render pure and avoids `setState` inside effects, which the repo's lint flags.
4. **Pause what left the view.** Slides stay mounted; one effect keyed on the selected step pauses videos outside it.

## Prevention

Before adding viewport logic to a component, check whether CSS sizing plus a library that measures layout (like Embla) expresses it already. Reach for `matchMedia` in JS only for behavior CSS cannot describe.
