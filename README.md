# Meet Popat portfolio

Serve locally with `python3 -m http.server 4173 --directory dist`, then visit http://localhost:4173.

The hero uses the M model (`splitlogo-optimized-v1.glb`), cutting-mat artwork, and refraction shader delivered by https://maximeheckel.com/, adapted to a standalone Three.js renderer at the user's request. Original visual work: Maxime Heckel. Three.js and its loaders/Draco decoder are vendored from version 0.170.0. Portfolio text and project content describe Meet Popat.

The three M pieces assemble on entrance, with camera orbit, floating motion, cursor parallax, and a keyboard-accessible rotation slider at the left ruler. About shares the fixed scene and fades in over it while the scene darkens with scroll. Reduced motion skips the entrance and floating animation; the pause button freezes the scene.
