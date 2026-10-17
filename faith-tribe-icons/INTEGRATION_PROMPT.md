# Integration prompt

Paste this into Cursor or Lovable with the repo open.

```text
You are integrating a new custom icon kit and game identity system into the Faith Tribe app (repo: Penlighty/Faith-Tribe). Start by inspecting the repo (package.json, framework, router, styling approach, current icon usage, index.html, PWA manifest) and tell me what you found. Then proceed. Do not change gameplay logic.

KIT LAYOUT (I have added the folder `faith-tribe-icons/` at the repo root)
- src/*            -> copy to src/design/icons/ (icons.ts, games.ts, Icon.tsx, GameBadge.tsx, index.ts, tokens.css)
- icons/sprite.svg -> public/icons/sprite.svg (optional, for non-React use)
- web/*            -> public/icons/ (also copy favicon.ico to public/)
- brand/*.svg      -> src/assets/brand/
- games/*.svg      -> public/games/ (raw files for OG images, emails, etc.)
Generated files (icons.ts, games.ts) must not be hand-edited. They come from tools/build_icons.py.

TASKS
1. Wire up: add an alias for src/design/icons and import tokens.css once at the app root.
2. Replace every existing icon with <Icon name="..." />. Search for lucide-react, @mui/icons-material, material-symbols, react-icons, heroicons, and inline SVGs. Use this mapping and put it in src/design/icons/legacy-map.ts:
   Home->home, Play->play, Gamepad2/LayoutGrid->games, User->profile, Settings/SlidersHorizontal->settings,
   ChevronLeft->back, ChevronRight->forward, ChevronUp->up, ChevronDown->down, ArrowRight->arrow-right, ArrowLeft->arrow-left,
   X->close, Menu->menu, MoreHorizontal->more, Check->check, Plus->plus, Minus->minus, Search->search, Filter->filter,
   Share2->share, Copy->copy, Link->link, QrCode->qr, Pencil->edit, Trash2->trash, RefreshCw->refresh, Info->info,
   HelpCircle->help, Bell->bell, Volume2->sound-on, VolumeX->sound-off, Vibrate->vibrate, Eye->eye, Lock->lock,
   Unlock->unlock, Flag->flag, Timer/Clock->timer, Lightbulb->hint, BookOpen->book-open, BarChart3->scoreboard,
   Trophy->trophy, Crown->crown, Medal->medal, Star->star, Flame->flame, Heart->heart, Zap->bolt, Shield->shield,
   SkipForward->skip, Pause->pause, Shuffle->shuffle, Target->target, Megaphone->host, LogIn->join, Users->team,
   UserPlus->person-add, Hash->code, MapPin->place, Box->thing.
   If something has no equivalent, do NOT invent an icon. List it for me at the end.
3. States: selected nav items, chips, and toggles use variant="tonal"; unselected use "line". Sizes: 16 inline, 20 chips, 24 default, 32 cards, 48 empty states. Leave strokeWidth at the default 2 unless I say otherwise.
4. Game identity: each game has its own silhouette (shape), container color, ink color, and glyph in GAME_VISUALS.
   - Render <GameBadge game={id} /> everywhere a game is shown: library cards, lobby header, in-game top bar, rules sheet, leaderboard header, recent games.
   - Use the game's container and ink colors as the seed for that game's theme (replace the old seed colors).
   - Use <GameShape> to clip or mask the art area on library cards so each card has its own shape.
   - Launch games: fake-a-proverb, tares-among-the-wheat, hot-coal, who-said-that, testament-sort. Planned games: blueprint-from-the-mountain, one-accord, six-degrees-of-abraham (show a "Coming soon" chip, not playable).
   - If the repo uses different game ids, keep the repo's ids and add a mapping; don't rename.
5. Brand and PWA: replace favicon, apple-touch-icon, and manifest icons (192/512 "any" plus 192/512 "maskable"), set theme_color #2F5D3A, and update <head> using web/head-snippet.html. Use brand/mark-on-dark.svg and brand/mark-on-light.svg for the in-app logo depending on theme. Keep brand/app-icon-monochrome.svg for Android themed icons if the manifest/platform supports it.
6. Testament Sort: name-type chips use person / place / thing icons; the answer buttons use ot / nt / both icons.
7. Game UI icons: timer, hint, fifty, double, shield (power-ups), bolt, flame (streaks), trophy/crown/medal/scoreboard (results), lock (locked answer), host/join/code/qr/share/copy (lobby).
8. Accessibility: decorative icons stay aria-hidden; icon-only buttons need aria-label; a badge gets a title when it is the only identifier of a game; never signal correct/incorrect by color alone.
9. Quality: add a dev-only /dev/icons route that renders every icon in both variants plus every game badge in tonal and solid. Add a unit test that every name in legacy-map.ts exists in ICONS and every game id has visuals. Run typecheck, lint, and build, and fix errors.
10. Cleanup: remove unused icon dependencies only after grep confirms no remaining imports.

DELIVER: a summary of the files changed, the list of legacy icons I still need to decide on, and a screenshot of the dev gallery if you can.
```
