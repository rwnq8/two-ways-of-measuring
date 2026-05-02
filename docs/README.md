# Two Ways of Measuring

**A framework for distance, memory, and fault-tolerant computation — built from first principles.**

An interactive, multi-page website published via GitHub Pages.

## Structure

```
docs/
  index.html           — Landing page with hero and section navigation
  foundations.html     — Boundaries, containers, metric axioms
  continuous.html      — The continuous way + interactive error demo
  hierarchical.html    — The hierarchical way + interactive tree explorer
  threshold.html       — The threshold principle
  deep-structure.html  — p-adic numbers and Ostrowski's theorem
  architectures.html   — Four physical substrates
  experiments.html     — Testable experimental protocols
  implications.html    — Open problems and future directions
  css/style.css        — Complete stylesheet (dark theme)
  js/main.js           — Navigation and shared utilities
  js/tree-viz.js       — Interactive tree distance explorer
  js/error-demo.js     — Error accumulation comparison demo
  _config.yml          — Jekyll config for GitHub Pages
```

## Publishing

This site is designed for **GitHub Pages** from the `master` branch:

1. Push this repository to GitHub
2. Go to **Settings → Pages**
3. Set **Source** to `Deploy from a branch`
4. Select `master` branch and `/docs` folder
5. Click **Save**

The site will be published at `https://<username>.github.io/<repo>/`.

## Interactive Demos

- **Tree Explorer** (`hierarchical.html`): Click nodes in a binary tree to measure tree distance. See common prefixes and see the ultrametric inequality in action.
- **Error Demo** (`continuous.html`): Side-by-side comparison of continuous (random walk) vs. hierarchical (thresholded) error accumulation.

## Features

- Dark theme with gold accents
- Responsive design (mobile-friendly)
- MathJax-powered LaTeX rendering
- Sticky navigation with mobile hamburger menu
- Proof toggle blocks
- Theorem, definition, and highlight callout boxes
- No external dependencies except MathJax CDN and Google Fonts
