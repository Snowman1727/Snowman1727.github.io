# Yuanyuan Ground Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this
> plan task-by-task in the current session.

**Goal:** Put the selected B pixel cat on a 2.5D floor with grounded pointer following.

**Architecture:** Canvas2D projects a bounded ground plane. Pure movement helpers
control ground coordinates, while cached sprites preserve the selected cat.

**Tech Stack:** Existing vanilla JS, Vite, Canvas2D, node:test, Playwright CLI.

**Spec:** `docs/superpowers/specs/2026-11-07-yuanyuan-ground-design.md`

## Global Constraints
- Preserve existing homepage identity and all planet interactions.
- Preserve the February 2025 age calculation in Asia/Shanghai.
- No dependencies, remote assets, commits, or pushes.
- Grounded depth movement, static reduced motion, touch-safe scrolling.

## Review Focus
- Targets beyond each edge must keep all feet safely inside the floor.
- Resizing and scrolling must not move targets into the wrong coordinate space.
- Arrival must stop walking and rendering without overshooting.
- Offscreen, hidden, and reduced-motion states must stop animation.
- Narrow screens must retain the entire platform and readable introduction.

### Task 1: Ground Movement
**Files:** `prototype/cat-ground.js`, `tests/cat-ground.test.js`.
**Interfaces:** `projectGround({u,v}) -> {x,y}`,
`groundTarget({x,y}) -> {u,v}`, `advanceGround(position,target,dt) -> {u,v,moving}`.
- [x] Add tests for literal projection fixtures, target clamping, travel/arrival,
  zero elapsed time, and equivalent 30/60 Hz motion.
- [x] Run `npm test`, observe missing behavior (four expected assertion failures).
- [x] Implement projection, inset bounds, and constant-speed ground stepping.
- [x] Run `npm test`, expect all passing (9/9).

### Task 2: Pixel Scene And Integration
**Files:** `prototype/pixel-cat.js`, `prototype/cat-study-art.js`,
`prototype/cat.js`, `prototype/index.html`, `prototype/styles.css`.
**Interfaces:** Task 1 helpers feed the renderer; `createCat()` retains its
existing disposal contract.
- [x] Write a browser check for rendered platform, pointer depth/side travel,
  grounded feet, walk-to-idle, gaze, touch, keyboard, and reduced motion.
- [x] Run against the old homepage and observe missing pixel scene.
- [x] Share B's original pixel drawing; add cached walking poses and pupils.
- [x] Replace only the old cat portrait with a responsive, accessible canvas.
- [x] Implement target delay, projection, bounded travel, gaze, lifecycle cleanup.
- [x] Verify actual canvas pixels and inspect desktop/mobile screenshots.
  Browser check: 23 assertions, six viewport sizes, no errors or warnings.
  Touch regression caught pointerleave on finger lift; mouse-only suspension
  fixed it, then the complete browser check passed.

### Task 3: Regression And Documentation
**Files:** `PRODUCT.md`, `README.md`, this plan.
- [x] Update superseded fixed-body requirements and document current behavior.
- [x] Run `npm test`, `npm run build`, and relevant browser regression checks.
  Nine unit tests pass; cat scene, four style studies, and seven-viewport
  planet regression pass. Existing Vite outDir and bundle-size warnings remain.
- [x] Review touched code, mark tasks complete, leave the existing server running.
  Independent read-only review returned no concrete findings.

## Execution Notes
This is the existing uncommitted prototype branch with no HEAD commit. Work
stayed in place without staging, committing, pushing, or creating a worktree.
The existing development server remains at `http://127.0.0.1:5174/`.
