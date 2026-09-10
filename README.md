# N8Codes site (`N8Codes.github.io`)

Static marketing + legal site listing games, apps, and TTRPG tools by
N8Codes — **NutCracker**, a cozy pixel-art match-3 puzzle for Android;
**Noted**, a privacy-first local-only notes app; **DragonWatch**, a macOS
process trust monitor; and the **Dungeon Lore**
interactive TTRPG character sheets and rules. Served via **GitHub Pages** at
`https://n8codes.github.io/` (this is the user-site repo, so it publishes at
the domain root).

Everything listed here follows the same philosophy: privacy-first, no ads, no
tracking, no accounts. Games are fully offline with at most a single optional
one-time in-app purchase handled by Google Play; apps keep your data on your
device.

## Structure

| File / dir              | Purpose                                                     |
|-------------------------|-------------------------------------------------------------|
| `index.html`            | Home page — Games, Apps, and TTRPG sections.                |
| `nutcracker.html`       | NutCracker detail page.                                     |
| `privacy.html`          | Privacy hub — lists every title with a link to its policy.  |
| `privacy-nutcracker.html` | NutCracker's privacy policy (its Play Console URL).       |
| `privacy-nutcracker.md` | Markdown source of the NutCracker policy (keep in sync).    |
| `privacy-dragonwatch.html` | DragonWatch's privacy policy.                            |
| `privacy-dragonwatch.md` | Markdown source of the DragonWatch policy (keep in sync). |
| `styles.css`            | Shared styles for the main site pages.                      |
| `icon.png`              | Site favicon (currently the NutCracker icon).               |
| `images/`               | Per-title icons and feature graphics.                       |
| `ttrpg.html`            | Dungeon Lore TTRPG tools (legacy single-page app shell).    |
| `noted.html`, `noted-about.html` | Staged Noted pages for the future switch-over from noted-site. |
| `dungeonlore*.{html,js,css}`, `home.html`, `home.style.css`, `script.js`, `style.css` | Dungeon Lore pages, scripts, and styles loaded by `ttrpg.html`. |
| `License.GPL2`          | GPL v2 license covering the Dungeon Lore code.              |

## Adding a game or app

1. Add `images/<name>.png` (icon) and optionally a feature graphic.
2. Create `<name>.html` (copy `nutcracker.html` as a template) — or, for an
   app with its own site (like Noted), link out to it instead.
3. Add a `.game-card` entry to the Games or Apps grid in `index.html`.
4. Give it its own policy: copy `privacy-nutcracker.html`/`.md` as a
   template, audit the title's code (manifest permissions, dependencies,
   billing usage) so the policy matches what it actually does, and add an
   entry to the `privacy.html` hub.

## Deploy

Push to `master`. No CI, no build — GitHub Pages serves the files as-is.
