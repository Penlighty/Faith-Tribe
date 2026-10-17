# Agape Party — Bible Game Engine & Launch Games

A mobile-first Bible party games platform and extensible game engine built with React, TypeScript, Vite, Tailwind CSS, and Framer Motion following the Material 3 Expressive design language.

## Launch Games Included
1. **Fake-a-Proverb** (4–20 players, 6 rounds, prompt > write > vote > reveal with +2 majority bonus)
2. **Hot Coal** (5–20 players, random fuse, category shout, pass tap, challenge mechanism, burn tracker)
3. **Tares Among the Wheat** (6–20 players, deal secret role > spoken clues in turn > debate timer > vote > steal attempt with 6 options)

## Quick Start

### Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173/` or join on phones connected to the same Wi-Fi using your local IP.

### Run Unit & Integration Tests (16 tests)
```bash
npm test
```

### Production Build
```bash
npm run build
```

## Architecture
- **Host-Authoritative State**: The host device runs the pure reducer state machine and broadcasts versioned snapshots. Players submit intents only.
- **Pluggable Game Interface**: Games are self-contained plugins in `src/games/<game-id>/` implementing `meta`, `setup`, `reduce`, `phases`, `HostView`, `PlayerView`, and `scoring`.
- **Zero Core Coupling**: Adding future games from the Game Design Catalogue requires only adding a folder and calling `gameRegistry.register(plugin)`.
- **Realtime Transport**: Pluggable interface supporting Supabase Realtime (Broadcast + Presence) and local cross-tab `BroadcastChannel`.
- **Sub-200KB Shell**: Code-split chunks with shell bundle under 60KB (14KB gzip).
