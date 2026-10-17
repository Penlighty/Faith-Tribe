# Faith Tribe — Bible Game Platform & Engine

> [!NOTE]
> The mobile-first Bible party games platform and extensible engine is initialized and running in [bible-party-engine](file:///C:/Users/Owner/.gemini/antigravity-ide/scratch/bible-party-engine). We recommend setting `C:\Users\Owner\.gemini\antigravity-ide\scratch\bible-party-engine` as your active workspace.

---

## 1. What Is Running vs What Is Stubbed

### Running (Complete & Tested)
- **Extensible Game Engine**: Pure functional plugin architecture with zero core coupling. Adding any new game requires only adding its folder and calling `gameRegistry.register(plugin)`.
- **Three Complete Launch Games**:
  1. **Fake-a-Proverb** (4–20 players, 6 rounds, prompt > write > vote > reveal with +2 majority bonus).
  2. **Hot Coal** (5–20 players, random fuse, category shout, pass tap, challenge mechanism, burn tracker).
  3. **Tares Among the Wheat** (6–20 players, deal secret role > spoken clues in turn > debate timer > vote > steal attempt with 6 options).
- **Core Play Modes**: Individuals, Pairs, Teams with auto-balance and manual assignment.
- **Material 3 Expressive Design System**:
  - Dynamic tonal palette per game context (`lavender` Home, `butter` Fake-a-Proverb, `mint` Tares, `peach`/`blush` Hot Coal, `#2F5D3A` forest green action button).
  - Shape morphing on press (`buttonPill` $\to$ `buttonMorphed` rounded-square).
  - Floating pill bottom nav with 4 tabs (Home, Play, Games, Settings) with tonal pill active indicator, automatically hidden during active gameplay.
  - In-game Now Playing layout: rounded back button, centered phase & round badge, round action buttons (Rules, Scoreboard) opening spring-physics bottom sheets with predictive-back drag dismiss.
  - Animated sine-wave countdown timer ([`WavyTimer.tsx`](file:///C:/Users/Owner/.gemini/antigravity-ide/scratch/bible-party-engine/src/components/ui/WavyTimer.tsx)) with tabular numerals.
  - Light and Dark modes both compliant with WCAG AA.
- **Realtime Transport**:
  - Abstracted behind the [`Transport`](file:///C:/Users/Owner/.gemini/antigravity-ide/scratch/bible-party-engine/src/engine/transport/types.ts) interface (`send`, `onMessage`, `onPresenceSync`, `getPresence`).
  - [`SupabaseRealtimeTransport`](file:///C:/Users/Owner/.gemini/antigravity-ide/scratch/bible-party-engine/src/engine/transport/supabaseTransport.ts) (Broadcast + Presence, zero database requirements).
  - [`MockTransport`](file:///C:/Users/Owner/.gemini/antigravity-ide/scratch/bible-party-engine/src/engine/transport/mockTransport.ts) with `BroadcastChannel` support allowing multi-tab play on the same device without requiring an active internet connection.
- **Session Lifecycle**: 4-letter memorable biblical room codes (`ZION`, `EDEN`, `HOPE`, etc.), QR code generation, persistent player ID in `localStorage` for refresh resilience, host-authoritative snapshots with versioning.
- **Solo Practice Mode**: Interactive proverb guessing game with real-time feedback and streak tracking.
- **PWA Ready**: `manifest.json`, icon, standalone display configuration, and install prompts.
- **All 16 Tests Passing**: Reducer unit tests for all 3 games and a full 6-player integration simulation.
- **Code-Splitting**: Initial shell bundle under 60KB (14KB gzip), well within the 200KB mobile budget.

### Stubbed / Placeholders Awaiting Content Review
- **Content Seed Review**: 20+ biblical entries per game have been bundled and marked with `"needsReview": true` using public domain translations (KJV/WEB/ASV):
  - [proverbs content](file:///C:/Users/Owner/.gemini/antigravity-ide/scratch/bible-party-engine/src/games/fake-a-proverb/content.json) (22 entries)
  - [categories content](file:///C:/Users/Owner/.gemini/antigravity-ide/scratch/bible-party-engine/src/games/hot-coal/content.json) (21 entries)
  - [passages content](file:///C:/Users/Owner/.gemini/antigravity-ide/scratch/bible-party-engine/src/games/tares-among-the-wheat/content.json) (21 entries)
- **Supabase Credentials**: When `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are not provided in `.env`, the engine automatically falls back to cross-tab `BroadcastChannel` local transport for instant play.

---

## 2. Browser Verification Recording

![Browser session recording of Bible Party Engine walkthrough](file:///C:/Users/Owner/.gemini/antigravity-ide/brain/b57dfe8c-99c2-4bac-aa1f-456142851eea/bible_games_engine_demo_1792188344548.webp)

---

## 3. How to Run & Test Locally

In `C:\Users\Owner\.gemini\antigravity-ide\scratch\bible-party-engine`:

```bash
# Run the test suite (16 tests)
npm test

# Run production build & verify bundle split
npm run build

# Start the dev server
npm run dev
```
