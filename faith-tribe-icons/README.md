# Faith Tribe icon kit

Original drawings for the Faith Tribe app. No third-party icon sets were used.

## What's inside

| Folder | Contents |
|---|---|
| `icons/line/`, `icons/tonal/` | 73 UI icons as SVG (24px grid, 2px stroke, round caps, `currentColor`). Tonal adds a soft fill for active/selected states. |
| `icons/png/{line,tonal}/{48,96}/` | The same icons as PNG (dark green ink, transparent). |
| `icons/sprite.svg` | All icons as `<symbol>`s: `ft-home`, `ft-home-tonal`, etc. |
| `icons/icons.json` | Manifest: name, category, tags, whether a tonal variant exists. |
| `games/` | 8 game badges: `*-badge.svg` (pastel), `*-badge-solid.svg` (dark), `*-shape.svg` (silhouette only), `*-glyph.svg` (24px glyph). PNGs in `games/png/` at 128/256/512. |
| `brand/` | Logo mark (on dark / on light), app icon, maskable icon, monochrome icon, favicon, and PNGs (48 to 1024). |
| `web/` | PWA-ready files: favicon.ico, favicon.svg, icon-192/512, maskable 192/512, apple-touch-icon, `manifest.icons.json`, `head-snippet.html`. |
| `src/` | React + TypeScript: `Icon`, `GameBadge`, `GameShape`, generated data files, `tokens.css`. |
| `preview/` | Contact sheets of every icon and badge. |
| `tools/build_icons.py` | The generator. Change colors, stroke, or sizes and rebuild: `pip install cairosvg pillow && python3 tools/build_icons.py out_dir`. |

## Game shape identifiers

| Game | Shape | Container | Ink | Status |
|---|---|---|---|---|
| Fake-a-Proverb | Arch (tablet) | #F9D6DB | #7A2E3B | launch |
| Tares Among the Wheat | Leaf / seed | #CFEFD2 | #1F4D2C | launch |
| Hot Coal | Burst (9 lobes) | #FBDDBF | #8A3B10 | launch |
| Who Said That? | Squircle | #F3EBA0 | #5C5410 | launch |
| Testament Sort | Hexagon | #E3DDF5 | #43337A | launch |
| Blueprint from the Mountain | Triangle | #D2E7F6 | #1B4D72 | planned |
| One Accord | Four-lobe clover | #C9EDE8 | #145A52 | planned |
| Six Degrees of Abraham | Diamond | #EADFCB | #5B4620 | planned |

## Brand mark

Six dots in a ring (the tribe) gathered around a flame. Colors: forest `#2F5D3A`, cream `#FFF8E7`, plus six pastels that echo the difficulty-tier tints.
`mark-on-dark.svg` uses pastel dots and a cream flame; `mark-on-light.svg` uses deeper dots and a forest flame.
There is no wordmark yet. Add one once you've chosen a typeface.

## Usage (React)

```tsx
import { Icon, GameBadge, GameShape } from '@/design/icons';

<Icon name="timer" />                      // 24px line
<Icon name="home" variant="tonal" />       // active state
<Icon name="flame" size=32 title="Streak" />
<GameBadge game="hot-coal" size=64 />
<GameBadge game="testament-sort" variant="solid" />
```

Plain HTML: `<svg width="24" height="24"><use href="/icons/sprite.svg#ft-home-tonal"/></svg>`

## Icon list

- **navigation** (14): `home`, `play`, `games`, `profile`, `settings`, `back`, `forward`, `up`, `down`, `arrow-right`, `arrow-left`, `close`, `menu`, `more`
- **action** (22): `check`, `plus`, `minus`, `search`, `filter`, `share`, `copy`, `link`, `qr`, `edit`, `trash`, `refresh`, `info`, `help`, `bell`, `sound-on`, `sound-off`, `vibrate`, `eye`, `lock`, `unlock`, `flag`
- **game** (18): `timer`, `hint`, `book-open`, `scoreboard`, `trophy`, `crown`, `medal`, `star`, `flame`, `heart`, `bolt`, `shield`, `fifty`, `double`, `skip`, `pause`, `shuffle`, `target`
- **session** (6): `host`, `join`, `team`, `person-add`, `tribe`, `code`
- **bible** (7): `bible`, `scroll`, `tablets`, `shofar`, `wheat`, `mountain`, `cross`
- **types** (6): `ot`, `nt`, `both`, `person`, `place`, `thing`

## Notes
- Colors: icons use `currentColor`, so they inherit text color. PNGs are dark green; regenerate for other colors.
- Maskable icons keep all artwork inside the central safe zone.
- Shofar, tablets, and wheat are simplified drawings; review them in context before shipping.
