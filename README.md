# N8Codes site (`N8Codes.github.io`)

The N8Codes website: games, apps and tabletop tools, each with its own
privacy policy. Served by GitHub Pages at `https://n8codes.github.io/`.

Everything listed follows the same rules: no ads, no tracking, no accounts.

## What is here

| Title | Pages |
|-------|-------|
| NutCracker (Android match-3) | `nutcracker.html`, `privacy-nutcracker.html`, `terms-nutcracker.html` |
| Wreckage of the Namtar (Android, in development) | `namtar.html`, `privacy-namtar.html`, `terms-namtar.html` |
| BitBoard (Android tabletop grid and board games) | `bitboard.html`, `privacy-bitboard.html` |
| DragonWatch (macOS) | links to its GitHub repo; `privacy-dragonwatch.html` |
| Noted (notes app) | links to its own site, which also holds its policy |
| PC builder and the Build a PC guide | `pc-builder.html`, `learn-pc*.html`, `privacy-pcbuilder.html` |
| Character sheets | `sheets.html`, `privacy-sheets.html` |
| Dungeon Lore (archive) | `ttrpg.html` |

`index.html` is the home page and `privacy.html` lists every policy.

## Structure

| File / dir | Purpose |
|------------|---------|
| `styles.css`, `icon.png`, `images/` | Shared styles, favicon, per-title art. |
| `privacy-*.md`, `terms-*.md` | Markdown source of each policy or terms page. Keep each pair in sync. |
| `sheets/` | Character sheet code (ES modules, no libraries). |
| `pc/` | PC builder code, styles and pixel art. |
| `_tools/` | Dev scripts, not published. `learn_pages.py` generates the `learn-pc*.html` pages and `pc/builder/content.js`. |
| `_tests/` | Tests, not published. |
| `noted.html`, `noted-about.html` | Staged Noted pages, not linked and not indexed. |
| `dungeonlore*`, `home.html`, `home.style.css`, `script.js`, `style.css` | The Dungeon Lore app loaded by `ttrpg.html` (GPL v2, `License.GPL2`). |
| `404.html` | Shown for any address that does not exist. |

## Rules

- A policy or terms URL never changes once its title ships. Edit the content
  in place.
- A policy states what the code does. Audit the title's manifest,
  dependencies and billing before writing or changing one.
- The main site has no JavaScript and loads nothing from other sites. The
  character sheets, the PC builder and Dungeon Lore are the exceptions, and
  they load nothing third-party either.

## Develop

```sh
python3 -m http.server 8000          # preview; the sheets and builder need a server
node --test '_tests/*.test.mjs'      # Node 22 or newer
python3 -I _tools/learn_pages.py .   # after editing the guide's content
```

## Deploy

Push to `master`. There is no build: GitHub Pages serves the files as they
are.
