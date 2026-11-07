# Yuanyuan Pixel Ground

## Intent
Keep the chosen B pixel cat, with furry golden edges and green eyes, in the
existing Yuanyuan homepage section. The owner selected a 2.5D platform where
the cat can walk both sideways and into/out of depth.

## Approaches
- A dimensional stage with a horizontal path is simpler but does not offer
  the depth movement the owner chose.
- Selected: a projected ground plane rendered with Canvas2D and an upright
  pixel sprite. This preserves B's identity without returning to a 3D cat.
- A full Three.js cat scene adds unnecessary rendering and visual complexity.

## Design
- A small mint/icy platform has a visible top, snowy rim, and shaded sides.
  No decorative container, new navigation, or controls.
- The cat looks at the pointer first, then walks toward its ground projection,
  constrained to an inset region so paws never step off the platform.
- Ground position has two dimensions, not a screen-height chase. Walking
  animates paws and facing; arrival restores the idle pose.
- Touch users can tap a destination without blocking page scrolling. Arrow
  keys work when the canvas has focus. Reduced motion keeps the scene static.
- Preserve the introduction, Shanghai-calendar age, other homepage sections,
  comparison page, and existing planet controls.

## Builder Calls
Use native Canvas2D with cached original sprites and ground art; no new
dependencies or remote assets. Stop animation when settled, hidden, or offscreen.
Keep work in the current uncommitted prototype; do not commit or push.
