# Meet Popat portfolio

Static HTML, CSS, and JavaScript portfolio. No build step or package installation required.

## Local preview

Run `python3 -m http.server 4173 --directory dist` from this directory and open http://localhost:4173.

## GitHub Pages

Upload the contents of this repository, including `.github`, to your GitHub repository. For your main personal site, name the repository `404Meet.github.io`. Use a `main` branch, then select **Settings → Pages → Source → GitHub Actions**. The included workflow publishes only `dist`. Nothing has been pushed or published by this change.

Relative asset paths also support a project site under a repository subdirectory. If you choose a different default branch, update `.github/workflows/pages.yml`.

## Files

- `dist/index.html`: content and accessible project dialogs.
- `dist/style.css`: responsive layout and typography.
- `dist/app.js`: Three.js hero and scroll transitions.
- `dist/projects.js`: project details and visible-only video playback.
- `dist/assets`: required models, textures, fonts, logos, original project videos, and vendored runtime dependencies.
- `dist/Meet-Popat-Resume.pdf`: downloadable résumé.

## Visual credits

The M model, cutting-mat artwork, refraction shader, and original project films come from Maxime Heckel’s website (https://maximeheckel.com/). Three.js and its loaders/Draco decoder are vendored from version 0.170.0. Employer logos identify Meet’s experience. The signature and employer artwork were supplied by Meet. Portfolio text describes Meet Popat.

Application HTML, CSS, JavaScript, and shaders are kept readable. Vendored third-party runtime files retain their distributed format. Formatting settings are in `.prettierrc.json`.
