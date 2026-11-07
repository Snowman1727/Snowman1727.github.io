# Snowman's Little Planet

An original, throwaway homepage prototype. Not the published blog.

## Run

```sh
npm install
npm run dev -- --port 5174 --strictPort
```

Open `http://127.0.0.1:5174`.

```sh
npm run build
npm test
```

## Scope

The question is whether a cinematic, interactive snowy planet feels right
for Snowman's personal home. The user approved one preview composition.
The prototype lives in `prototype/` on `prototype/snow-planet`.

The planet, cabin, snow, trees, stars, and terrain are created locally with
Three.js. No models or assets were copied from the reference site. Sora is
self-hosted through Fontsource; icons are from Lucide.

Yuanyuan's section introduces the owner's golden-shaded cat, born in February
2025. Its age updates automatically by calendar month (Asia/Shanghai). The
chosen pixel cat looks toward the mouse, then walks over a small isometric
mint/icy platform. Both lateral and depth movement are constrained to the
ground, with an inset at the edges to keep paws on the surface.
Touch users can tap a destination; a focused canvas also accepts arrow keys
and Home. Vertical page scrolling is preserved, and reduced motion keeps
the cat static. Rendering stops when settled, hidden, unfocused, or offscreen.
There is no roaming cursor pet outside the section.

The original B sprite and cached walking poses live in `prototype/pixel-cat.js`.
`cat-ground.js` owns the projection and bounded stepping, `cat-scene.js` paints
the cached Canvas2D scene, and `cat.js` owns input and lifecycle.
The previous illustration in `prototype/tools/cat.js` is retained as source
material but is no longer displayed on the homepage.

## Cat Style Studies

Open `http://127.0.0.1:5174/cat-studies.html` with the dev server running.
This separate, local comparison presents four original furry 2D variants:
dumpling, pixel, peeking, and storybook. Each keeps its body still and looks
toward the mouse. Native radio choices are reflected in the URL hash.
The chosen B drawing is shared with the homepage. Radio choices do not change
the homepage; the comparison is not a production build entry.
Illustrations are drawn locally with Canvas; no external generation service
or reference-site assets are used.

There are no real articles or projects yet, so no fictional entries appear.
Blog authoring and GitHub Pages deployment are deliberately deferred until
the visual direction is accepted. No changes have been pushed.
