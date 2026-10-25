# Shelf Rush: sorting game spec and build prompt

Adds the book-sorting game to the existing Faith Tribe app. Contains the scheme summary, the campaign design, the icon-kit patch, and the full build prompt.

**Files**
- `content/shelf-rush.json`: the 66 books, 8 sorting schemes (with bins, per-book assignments, tradition notes), and the campaign configuration. Validated: 66 books, 929 + 260 chapters, every scheme partitions its deck exactly, 343 distinct (book, scheme) questions.
- This file: the build prompt (Part 3) is self-contained, so paste it as is.

**Caution on the data.** Classifications follow common English Protestant conventions, and the *Who Wrote It?* scheme uses traditional attribution. Review the tradition notes in the JSON with someone from your church or tradition before release, especially for the Authors scheme.

---

# Part 1: The sorting schemes

| Scheme | Bins | Deck | Difficulty | Bin sizes |
|---|---|---|---|---|
| **Testament** | 2 | 66 | easy | Old Testament 39 · New Testament 27 |
| **Genres** | 6 | 66 | medium | Law 5 · History 13 · Poetry & Wisdom 5 · Prophecy 18 · Gospels 4 · Letters 21 |
| **Old Testament Sections** | 5 | 39 | medium | Law 5 · History 12 · Poetry & Wisdom 5 · Major Prophets 5 · Minor Prophets 12 |
| **Law, Prophets & Writings** | 3 | 39 | medium | Law 5 · Prophets 21 · Writings 13 |
| **New Testament Sections** | 5 | 27 | medium | Gospels 4 · Acts 1 · Paul's Letters 13 · General Letters 8 · Revelation 1 |
| **Paul or Not?** | 2 | 27 | hard | Paul's Letters 13 · Not Paul 14 |
| **Major or Minor?** | 2 | 17 | hard | Major Prophets 5 · Minor Prophets 12 |
| **Who Wrote It?** | 7 | 62 | hard | Moses 5 · David & Solomon 4 · A Prophet 16 · Paul 13 · John 5 · Other NT Writers 8 · Unknown 11 |

The Authors deck has 62 books. Joshua, Lamentations, Ezra, and Nehemiah are left out because their traditions don't fit one bin, and the reason is stored in the JSON.

# Part 2: Modes

1. **Single scheme:** pick one scheme and sort its whole deck. Each book appears once. Misses return 6-10 cards later until every book has been sorted correctly.
2. **The Ascent (campaign):** a climb of 15 steps (or an 8-step short climb), named for the fifteen Songs of Ascents (Psalms 120-134). Every card can use a different scheme, so the bins change card to card (Testament, then Genres, then Paul or Not?, and so on). Early steps lean on easy schemes and later steps on hard ones. Name alternatives: *Jacob's Ladder*, *Pilgrim's Road*.

Both modes can be played solo, in a Race (everyone plays the same deck on their own phone, with live lanes on the host screen), or in Practice (no timer or lives, a reveal after each card).

---

# Part 3: The build prompt

Paste this into Cursor or Lovable with the repo open.

````text
ROLE AND WORKING RULES
You are adding one new game, "Shelf Rush", to the existing Faith Tribe app. The engine, lobby, Transport, plugin registry, shared timer/vote/scoreboard, design layer (tokens, GameCard, AnswerPill, WavyTimer, TribeChip, Podium, BottomSheet, feedback event bus), and the icon kit (Icon, GameBadge, GameShape, GAME_VISUALS) already exist. Work in phases. After each phase, run its acceptance checks, then STOP and report before starting the next. Do not change core code except for small, generic hooks the game needs. Nothing in core may reference this game. Do not rename existing game ids. If a precondition fails (for example, a design-layer component does not exist), use the closest existing component, say so in your report, and continue. Do not build a parallel design system. Do not add a runtime dependency without listing it and its gzipped size first.

PHASE 0: PREFLIGHT (report, then continue only if nothing blocks)
- Inspect the engine's Game plugin interface, the registry, the Transport interface, the session/lobby flow, the feedback event bus, the design layer components, and how existing games are structured (use the closest existing game as the template). Report the exact names you will reuse.
- Confirm the content folder convention (/content/*.json) and the persistence approach (IndexedDB or localStorage helpers). Reuse them.

GAME SUMMARY
Id: shelf-rush. Name: Shelf Rush. Players: 1 to 20+. Estimated time: 3 to 6 minutes per run.
A book of the Bible appears on a card. The player sorts it into the correct bin before time runs out. Cards arrive faster as the run goes on. Wrong answers and timeouts cost a life. Lose all lives and the run ends.
Two modes (the "mode" setting):
  1. "scheme": the player picks one sorting scheme and sorts that scheme's whole deck.
  2. "ascent": a campaign called "The Ascent" where the scheme changes from card to card. The campaign name must be a single constant (CAMPAIGN.name) so it can be changed later.
Three ways to play, orthogonal to mode (the "play" setting):
  - "solo": one player, personal bests.
  - "race": everyone in the room plays the same deck on their own phone at the same time; the host screen shows live lanes; ranking at the end.
  - "practice": no timer, no lives, no score; a reveal after every card; mastery data still recorded.

CONTENT (use /content/shelf-rush.json exactly as provided; do not retype or "fix" its data)
The file contains: books[66] {id,name,abbr,order,testament,chapters,blurb}; schemes[8] {id,name,question,difficulty,tradition,deckSize,bins[{id,label,icon}],assign{bookId:binId},notes{bookId:text},excluded{bookId:reason}}; campaign{...}.
The 8 schemes (deck size, bins): testament (66; ot, nt); genres (66; law, history, poetry, prophecy, gospels, letters); ot_sections (39; law, history, poetry, major, minor); law_prophets_writings (39; law, prophets, writings); nt_sections (27; gospels, acts, paul, general, revelation); paul_or_not (27; paul, other); major_minor (17; major, minor); authors (62; moses, david_solomon, prophet, paul, john, other_nt, unknown).
Total distinct (book, scheme) questions: 343. This is the "pair space" for the Ascent.
Build-time validator (scripts/validate-shelf-rush.ts, run in CI and before build). Fail with a clear message if any rule breaks:
  - 66 books, unique ids, chapters sum to 1189 (929 OT + 260 NT), OT = first 39 by order.
  - every scheme: every key of assign is a real book id; every bin id used in assign exists in bins; every bin has at least one book; deckSize equals the number of keys; no book appears twice.
  - the total of deckSize across schemes equals 343.
  - every scheme id referenced in campaign.tiers exists; tier weights sum to 1 per band.
Load with zod. Expose typed helpers: getBook(id), getScheme(id), pairIndex (an ordered list of "bookId|schemeId" keys: schemes in file order, then books in book order; this order defines ledger indexes), binOf(schemeId, bookId).
Display rules: book names are shown as "Name" (large) with the abbreviation only on small tiles. Never show a book's testament or section on the card (that would give the answer away). After a sort, show the scheme's note for that book (notes[bookId]) when one exists, in the reveal, together with the book's blurb.
The "tradition" text of a scheme is shown on the scheme picker card (one line, expandable) and in the results screen.

CONSTANTS (src/games/shelf-rush/engine/constants.ts; every tunable lives here)
BASE_POINTS = 10.
BIN_FACTOR: 2 bins = 1; 3 to 4 bins = 1.5; 5 to 7 bins = 2.
Window by bin count (ms), start and floor: 2 bins: 4000/1600; 3 to 4 bins: 5000/2400; 5 to 7 bins: 6000/3000.
SPEED multiplier on windows: relaxed 1.5, standard 1.0, blitz 0.7.
ACCESS_TIME multiplier: 1, 1.5, 2 (player setting, applied last and never reduces below the unscaled window).
MIN_WINDOW_MS = 900 (after all multipliers; except ACCESS_TIME may exceed).
Lives: scheme mode 3; ascent 5. LIFE_RULE: "forgiving" (default) or "strict".
  forgiving: scheme mode gains +1 life (max 3) for every 10 consecutive correct sorts; ascent gains +1 life (max 5) at the rest stops listed in campaign.length.<length>.restStopsAfterStep. strict: no life is ever gained.
  A timeout counts as a wrong answer.
Boomerang (scheme mode only): a wrong or timed-out card is reinserted at position (cursor + randInt(6..10)) using the per-player PRNG; if beyond the end of the deck, append. The run is complete when every distinct book in the deck has been sorted correctly at least once.
Ascent has no boomerang; missed pairs are recorded in the ledger for later.
Completion: scheme mode = distinctBooksCorrect / deckSize; ascent = correctCards / totalCards (unreached cards count as not correct). Practice reports completion the same way.
PERFECT_RUN = completed with zero strikes.

SCORING (src/games/shelf-rush/engine/scoring.ts, pure and fully unit-tested)
  speedFactor = 1 + clamp(remainingMs / windowMs, 0, 1)            // 1.0 at the buzzer, 2.0 instantly
  streakMult = min(2, 1 + 0.1 * floor(streakBefore / 5))            // streakBefore = consecutive correct sorts before this card
  points = round(BASE_POINTS * binFactor(bins of the current scheme) * speedFactor * streakMult)
  Wrong or timeout: 0 points, lose a life, streak resets to 0.
Run bonuses (added once at the end):
  scheme mode: +100 if completed; +50 per life remaining if completed; +100 if PERFECT_RUN.
  ascent: +25 per step cleared with no strike in that step; +150 if the Summit (final step) is reached with at least one life; +50 per life remaining at the Summit.
Worked examples that MUST be unit tests: Testament scheme, answered instantly, streakBefore 0 = 20 points; answered at the buzzer = 10; Genres (6 bins), instantly, streakBefore 10 = round(10*2*2*1.2) = 48.

TIMING (src/games/shelf-rush/engine/timing.ts)
Scheme mode: windowMs = lerp(start, floor, min(1, correctCount / min(deckSize, 40))) * SPEED * ACCESS_TIME, with min MIN_WINDOW_MS. (correctCount counts correct sorts so far in this run.)
Ascent: windowMs = start(binsOfCurrentScheme) * max(rampFloor, 1 - rampPerStep * (step - 1)) * SPEED * ACCESS_TIME, plus schemeChangeGraceMs (1000) added after multipliers whenever the card's scheme differs from the previous card's scheme (and on the very first card).
The card's clock starts when its entrance animation completes (not when it is queued). Use performance.now() on the client; never trust Date.now() for run timing.

RANDOMIZATION (the most important part; implement exactly and test hard)
Use one seedable PRNG everywhere: xmur3(seedString) to produce a 32-bit seed, then mulberry32. No Math.random() in engine code (lint rule). Provide rng.int(a,b), rng.pick(arr), rng.weightedPick(items, weights), rng.shuffle(arr) (Fisher-Yates).
Seeds: solo = random string; daily = "daily-" + local YYYY-MM-DD; race = generated by the host.
IMPORTANT: In a race the HOST generates the deck once and broadcasts it as an array of {bookId, schemeId} (about 75 small objects). Clients never regenerate it. This removes any cross-device drift. Each player's own boomerang requeues use a per-player stream rng(seed + ":" + playerId).

A) Scheme-mode deck (buildSchemeDeck)
  1. Start with the scheme's books. Shuffle with the seeded PRNG.
  2. Rhythm constraint: no more than 4 consecutive cards with the same correct bin (when the deck has 2 bins; with more bins no more than 3). Fix violations by swapping the offending card with the nearest later card of a different bin; if impossible, leave it.
  3. Family spacing: books sharing a numbered family (1/2 Samuel, 1/2 Kings, 1/2 Chronicles, 1/2 Corinthians, 1/2 Thessalonians, 1/2 Timothy, 1/2 Peter, 1/2/3 John) must be at least 3 cards apart where possible (same swap strategy).
  4. Weak-books option (scheme mode): instead of the whole deck, build a deck of N=20 books for that scheme chosen by weakness: weight = 1 + 2*missRate + 1.5*(unseen ? 1 : 0), weighted sampling without replacement, then shuffle and apply rules 2 and 3.
  5. Never repeat the same book twice in the base deck. (Repeats only come from boomerang requeues.)

B) Ascent deck (buildAscentDeck({seed, length, summaries}))
  Inputs: length "full" (15 steps) or "short" (8 steps), 5 cards per step; summaries = per-player ledger summaries (see ledger).
  1. Bands: split the steps into 3 contiguous bands (full 5/5/5 steps, short 3/3/2). Cards per band = steps in band * 5.
  2. Tier quotas per band: counts = largestRemainder(tierWeightsByBand[band] * cardsInBand) over [easy, medium, hard]. Quotas are exact integers; the totals must equal cardsInBand.
  3. Build the band's tier slots (a list with the exact quota of each tier), shuffle it with the PRNG, then deal 5 slots to each step. Never deal a "hard" slot into step 1 (swap it with a later non-hard slot).
  4. Fill each slot in order, keeping these running structures: usedPairs (Set), bookUses (Map), recent (last 8 bookIds), schemeRun (last 2 schemeIds).
     a. Choose a scheme in the slot's tier: take the tier's schemes in a PRNG-shuffled cycle (so the schemes in a tier are rotated evenly, not sampled independently). Skip a scheme if it was the scheme of the previous 2 cards (no more than 2 in a row). If every scheme in the tier is blocked, use any other scheme of the same tier; if still none, use the next tier.
     b. Candidates = the scheme's books where pair (book, scheme) is not in usedPairs AND bookUses[book] < maxBookUsesPerRun (2) AND book not in recent.
     c. If no candidates, relax in this order and retry after each step: recentWindow 8 -> 4 -> 0; maxBookUsesPerRun 2 -> 3; switch to another scheme in the tier; switch tier. NEVER relax the rule that an identical (book, scheme) pair appears at most once per run.
     d. Weight each candidate: w = (1 + 0.75 * missMean) / (1 + seenMean)^1.5, where seenMean and missMean are the mean over the room's players of that pair's seen count and miss count. Pick with rng.weightedPick.
     e. Record the pick; mark schemeChange = true if the scheme differs from the previous card's scheme (the first card is also schemeChange).
  5. Return Card[] {index, step, bookId, schemeId, tier, schemeChange}. Also return metadata {steps, cardsPerStep, restStops}.
  The first card of each step also sets stepStart = true (for the step banner).

C) Ledger and freshness (src/games/shelf-rush/engine/ledger.ts, persisted in IndexedDB store "shelf-rush")
  - Keyed by pairIndex position. Store per pair: seen (count, saturating at 255), miss (count, saturating at 255), lastSeenAt.
  - record(runLog) updates after every run (including practice). In race, each player's device updates its own ledger from its own run.
  - summary(): returns {seen: Uint8Array(n), miss: Uint8Array(n), version} where n = pairIndex length. At race join, each guest sends its summary (about 700 bytes) to the host; the host also uses its own. For solo, the player's own summary is used.
  - age(schemeId): at the start of a run, if at least 90% of a scheme's pairs have seen >= 1, subtract 1 from every seen count in that scheme (floor 0). This makes freshness cycle evenly instead of saturating.
  - If the content version changes, remap by key (bookId|schemeId), never by raw index.
  - Provide a "Reset my progress" action in settings that clears the ledger, mastery, and bests (with confirmation).

D) Mastery (src/games/shelf-rush/engine/mastery.ts)
  Per book and scheme: {seen, correct, lastSeenAt}. A book's overall accuracy = sum correct / sum seen across schemes. Used by the results mastery map and by Weak-books mode.

PLAYER RUN REDUCER (src/games/shelf-rush/engine/run.ts, pure; used by solo, race, and practice)
State: {config, deck, cursor, lives, maxLives, streak, bestStreak, score, correctBooks:Set, log[], requeueCount, step, stepStrikes, status: "ready"|"showing"|"revealing"|"won"|"lost"|"finished", shownAt}
Events: START, SHOW (card entrance finished, supplies a monotonic timestamp), SORT {binId, t}, TIMEOUT {t}, REVEAL_DONE, RESUME.
Outputs per card: a log entry {cardIndex, bookId, schemeId, binId|null, correct, ms, windowMs, points, livesAfter}.
The reducer never reads clocks or storage; callers pass timestamps. Everything is deterministic given deck, PRNG stream, and events, so the host can replay it.

ROOM-LEVEL GAME PLUGIN (race and solo wiring to the existing engine)
Register {id:"shelf-rush"} with the existing Game interface. Map it like this:
  - config (host or solo): mode "scheme"|"ascent"; schemeId (scheme mode); length "full"|"short" (ascent); speed; lifeRule; play "solo"|"race"|"practice"; accessTime; weak (scheme mode).
  - Phases: SETUP -> COUNTDOWN(3s, synchronized to the host timestamp) -> RUN -> COLLECT -> RESULTS.
  - RUN: each player plays their run locally with the run reducer. The host does not drive per-card timing.
  - Intents from players: PROGRESS {cardsDone, correctCount, lives, streak, status} every 1000 ms and on life changes; FINISH {log[], summary}.
  - Host: validates by replaying each FINISH log through the same pure functions (scoring, timing, reducer). The host's computed score and completion are authoritative; ignore any client-claimed score. Flag (do not reject) any log entry with ms < 150. Reject logs whose card sequence does not match the broadcast deck plus the player's deterministic requeues.
  - COLLECT ends when all players have finished or are out, OR at the cap: capMs = (deckSize + 10) * 6000. A player who disconnects may reconnect and submit within 60 seconds of the cap; otherwise they appear as DNF with their last PROGRESS.
  - Late joiners during RUN spectate and join the next game.
  - Solo and practice use the same reducer with no network.

LEADERBOARD (src/games/shelf-rush/engine/leaderboard.ts, pure)
Sort by: completion desc, points desc, totalTimeMs asc, then name asc. Ties share a rank (equal completion, points, and time). totalTimeMs = from the first card shown to the final sort or game over. Badges: "Perfect" (PERFECT_RUN), "Summit" (ascent summit reached), "Blitz" (completed on blitz).

SCREENS AND LAYOUT (mobile first; design at 360x800 and 390x844; use the design layer's tokens, GameCard, Chip, AnswerPill styles, WavyTimer, TribeChip, Podium, BottomSheet, FloatingNav; no raw color values in components)
Theme: game scope [data-game="shelf-rush"] from GAME_VISUALS (container #E8D2E8, ink #5E2F66). Bins use a fixed 7-pair BIN_PALETTE defined in design tokens (container/ink pairs, each meeting 4.5:1 contrast, distinct in hue and lightness so they stay distinguishable for color-blind players). Bin position within a scheme is fixed in the order given in the JSON, so players build muscle memory. Color is never the only signal: each bin shows its label, its icon (when it has one), and a position number.

1) Library card: the standard GameCard with the pentagon shape and glyph from GAME_VISUALS (see icon kit task in Phase 7). Meta line: "1-20+ players · 3-6 min".

2) Game detail / config bottom sheet (opened from the card):
   - Segmented control: "One scheme" | "The Ascent".
   - One scheme: a scrollable list of scheme cards (2 columns). Each shows the scheme name, deck size, difficulty dots (1 to 3), and mini bin chips with icons. Selected card uses the tonal style. A "Tradition" line expands under the selected card.
   - The Ascent: a summary panel with the name, tagline, the 15-step track preview (15 pips), and a length toggle "Full (15 steps)" | "Short (8 steps)". A "Daily Ascent" button starts a run with today's seed (label shows the date).
   - Settings rows: Speed (Relaxed | Standard | Blitz), Lives (Forgiving | Strict), Extra time (Off | x1.5 | x2), Practice (switch), Weak books (switch, scheme mode only, disabled when there is no history).
   - Primary action at the bottom: "Start" (solo) or, inside a room, "Start for everyone".
   - When launched from a lobby, the host sees the same sheet; guests see a read-only summary.

3) Race lobby: the existing lobby plus a settings summary card (mode, scheme or length, speed, lives rule). Guests send their ledger summary silently when the host picks The Ascent.

4) Play screen (portrait). Vertical layout, top to bottom:
   - HUD row (56px): back/pause button (solo and practice only; in race it is replaced by a "Leave" confirmation), lives as heart icons (filled/empty, plus an aria-label "3 of 3 lives"), streak with the flame icon and count (visible from streak 3), score (tabular numerals).
   - Context row (40px): scheme chip showing the scheme name and the question text ("Which testament?"). In The Ascent also show a step indicator: "Step 7 of 15" and a track of 15 pips (current pip filled, cleared pips tonal). On a scheme change, the chip plays a 200ms flip and the bins re-layout (see below).
   - WavyTimer (24px) bound to the card's window; it speeds up in the last 5 seconds per the design layer, and the card pulses in the last 500ms.
   - Stage (flexible height): a ScriptureCard-style card is NOT used here. Use a SortCard: width min(86%, 320px), height 140px, radius xl, surface = --game-container, the book name in the UI font at title-xl (32px, 800 weight, auto-shrinks to fit, never truncates), and below it a caption with "Book N of 66" ONLY in practice mode (otherwise nothing, to avoid giving hints). A looping belt texture sits behind the card (decorative, aria-hidden, removed in low-end mode and reduced motion). The card enters from the right in 160ms (transform only), settles, and the clock starts.
   - Bins zone (bottom, min 280px, up to 46dvh, safe-area padded): a BinGrid. Layouts by bin count:
       2: one row, 2 equal cells (each at least 140px tall)
       3: one row, 3 equal cells
       4: 2x2
       5: row of 3 above a row of 2 (the second row's cells are wider)
       6: 2 rows x 3
       7: row of 4 above a row of 3
     Minimum cell height 72px; touch targets at least 48px; gaps 12px. Each Bin: container color from BIN_PALETTE, icon (24px) above a label (label style 14/20, up to 2 lines, never truncated), a small position number in the corner (1 to 7).
   - Input: tapping a bin sorts the card. For 2-bin schemes, the card also follows horizontal finger drag; releasing beyond 25% of the screen width toward a bin sorts it. Tap targets must work without any swipe. Keyboard: digits 1-7 pick the bin; left/right arrows pick bin 1/2 in 2-bin schemes.
   - Feedback (feedback event bus events: sort_correct, sort_wrong, streak, life_lost, life_gained, scheme_change, step_clear, summit): correct = the card shrinks into the chosen bin with a short thunk (transform + opacity, 180ms), bin pulses, points float up (+24) in tabular numerals. Wrong = the card shakes (translateX 8px x3, 240ms), the correct bin gets a 2px success outline and "check" icon, the chosen bin gets "close" icon, and a non-blocking toast under the context row shows "Habakkuk is Minor Prophets" (the book name and correct bin label) for 1200ms without pausing the next card. In practice mode the run pauses and shows the reveal card (blurb + scheme note) with a "Next" button.
   - Scheme change (ascent only): the next card carries a "New question" chip for 1.5s and the extra 1000ms grace from the timing rules.
   - Step banner (ascent only): between steps, a 900ms banner "Step 8 of 15" with the step pips advancing; at rest stops show "Rest stop: +1 life" (forgiving) with the heart animating in.
   - Reduced motion: no belt, no sliding, no shake; use 120ms opacity fades; the wrong-answer correction is shown by the outline and icon only.
   - Low-end mode (useLowEnd): no belt, no blur, no looping animation.

5) Host screen in race (landscape-friendly, also fine on phone): "Race lanes". Each lane: TribeChip + name, a progress bar (correctCards / deckSize or totalCards) that moves via transform, hearts, flame streak, and status (Playing, Out, Finished). Up to 20 lanes: 2 columns on wide screens, scrollable on phones. Sorted live by completion then points. Finished lanes show their final rank badge.

6) Results screen (solo and race):
   - Headline: "Summit reached" / "Deck complete" / "Run over" with the completion percentage large, then points, time, best streak, strikes used, and badges.
   - In race: the leaderboard (Podium for the top 3 plus a list), then the player's own detail.
   - Mastery map: a grid of the 66 books (6 columns x 11 rows at 360px width), each tile showing the abbreviation, with accuracy states: unseen (outline), under 50% (error tint + "close" icon), 50 to 80% (neutral tint + "minus" icon), 80%+ (success tint + "check" icon). Tapping a tile opens a BottomSheet with the book's blurb and per-scheme accuracy.
   - "Most missed" list: the 5 pairs missed most this run, each as "Book: correct bin".
   - Actions: "Play again" (same config, new seed), "Weak books" (scheme mode), "Change settings", "Done".
   - Personal bests: show "New best" chips where applicable. Store per key mode|schemeId or "ascent"|speed|length.

7) Rules sheet (BottomSheet, 3 steps): "A book appears", "Sort it before time runs out", "Three misses and you're out" (use the correct number of lives for the mode). Opened from the detail sheet and a help icon in the HUD (solo only).

FEEDBACK EVENTS (extend the existing event bus; the game only emits events)
Haptics (ms): sort_correct [12]; sort_wrong [60]; streak [20,30,20]; life_lost [80]; life_gained [20,40,20]; scheme_change [10]; step_clear [20,40]; summit [30,60,30,60,60].
Sounds (existing synth approach; default off with the existing toggle): sort_correct soft thunk; sort_wrong low thud; streak rising chime at every 10; life_lost short downward tone; life_gained upward tone; scheme_change page-turn whoosh; step_clear two-note chime; summit shofar-style fanfare. Fall back to nothing if audio is unavailable.

COPY (src/games/shelf-rush/copy.ts; visible text and aria-labels must match)
Game name "Shelf Rush"; campaign "The Ascent"; "Sort it!"; correct "Well sorted"; wrong "Not quite: {book} is {bin}"; new question "New question"; rest stop "Rest stop: +1 life"; result titles "Summit reached", "Deck complete", "Run over"; practice reveal "Next"; empty weak-books state "Play a few runs first and we'll find your tricky books"; strict/forgiving help text: "Forgiving: earn lives back as you go" / "Strict: no lives are ever earned back".

ACCESSIBILITY
- The card is announced on entry as "{Book}. {Question}. {n} options" via a polite live region; each bin is a button with aria-label "{n}. {label}".
- Every swipe has a tap equivalent. Keyboard support as specified. 48px minimum targets. Visible focus rings.
- Correct and wrong are never signalled by color alone (icon + text + outline).
- Extra time setting (x1.5, x2). Reduced motion and low-end modes as specified. Hearts and streak have text equivalents.
- The mastery map has a table fallback for screen readers (list of books with accuracy).

PERFORMANCE
- The per-card clock and the timer update through refs and requestAnimationFrame, never through React state per frame.
- Only transform and opacity animate (plus clip-path in shared components). No layout-thrashing reads during a run.
- Input to visual feedback under 100ms. Preload fonts used by the card. Code-split the game (lazy import from the registry).
- Report: gzipped size added by the game, and frame-time results on a 4x CPU-throttled mobile profile for a 66-card run.

PERSISTENCE
IndexedDB database "ft-shelf-rush" with stores: ledger, mastery, bests, settings. Settings: speed, lifeRule, accessTime, last mode/scheme/length. Version the schema; write a migration stub. Never store anything about other players beyond the current session.

TESTS (all must pass before the final report)
Unit:
  - scoring: the three worked examples above; bin factors; streak multiplier boundaries (streakBefore 4, 5, 9, 10, 40); bonuses.
  - timing: windows for 2, 4, 6, and 7 bins at the start and floor; speed and access multipliers; MIN_WINDOW_MS; ascent ramp at step 1, 8, 15; scheme-change grace.
  - run reducer: lives, forgiving refills (10-streak and rest stops), strict mode, timeout = wrong, boomerang positions in 6..10, completion rules, PERFECT_RUN, ascent has no boomerang.
  - leaderboard comparator and tie ranks.
  - ledger: saturation at 255, age(), summary round trip, remap by key after a content version change.
Property tests (fast-check or equivalent), run over at least 1000 seeds each:
  - Scheme deck: every book exactly once; no more than 4 (2-bin) or 3 (other) consecutive same-bin cards when avoidable; numbered-family books at least 3 apart when avoidable; determinism (same seed gives the identical deck).
  - Ascent deck (full and short): exact length (75 and 40); no duplicate (book, scheme) pair; no book more than 2 times (3 only if the fallback log says so); no scheme more than 2 in a row; tier counts per band equal the largest-remainder quotas; schemeChange flags are correct; deck is deterministic per seed; the first step contains no "hard" scheme; and across 1000 seeds the share of each scheme stays within the expected range.
  - Weighting: with a ledger where some pairs were seen 5 times and others never, unseen pairs appear significantly more often (assert a ratio above 3:1 across 200 decks); with a high miss rate a pair appears more often.
  - Fairness check: two players' logs replayed on the host give the same score as the reducer run on the player's device.
Content: the validator passes; a test that every bin in every scheme has an icon key that exists in ICONS or is null.
Integration: 6 simulated players race through a Short Ascent and a Testament scheme deck; one player disconnects mid-run and reconnects; one submits a tampered log (inflated score and an impossible ms) and the host score ignores it and flags it. 
UI (Playwright + axe): BinGrid layouts for n = 2..7 at 360x640 and 390x844 have no overlap, minimum 48px targets, and labels never truncated; the play screen at both sizes in light/dark; axe zero serious or critical issues; keyboard-only completion of a short scheme deck.

PHASES (stop and report after each)
Phase 1: content validator + typed loader + constants. Accept: validator passes; deliberate break tests fail as expected.
Phase 2: engine (rng, scheme deck, ascent deck, scoring, timing, run reducer, leaderboard) + unit and property tests. Accept: all pass; report seed-sweep statistics (scheme distribution, band tier counts).
Phase 3: ledger, mastery, weighting, summary exchange format + tests. Accept: weighting tests pass; summaries under 1KB.
Phase 4: UI primitives (SortCard, BinGrid, Bin, Hud, AscentTrack, SchemeCard, MasteryMap, Lanes) and a dev gallery page /dev/shelf-rush showing all states, all bin counts, light/dark, reduced motion, low-end. Accept: layout and axe tests pass.
Phase 5: solo experience end to end: config sheet, scheme mode, The Ascent, daily, practice, weak books, results, bests, persistence. Accept: a full 66-card Testament run and a full 15-step Ascent are completable by keyboard; performance numbers reported.
Phase 6: race: lobby settings, deck broadcast, summaries, progress heartbeats, host lanes, validation, collect/cap, disconnect handling, race results and leaderboard. Accept: the integration test passes.
Phase 7: identity and integration. Icon kit: in faith-tribe-icons/tools/build_icons.py add the following (the helpers rpoly, R, math already exist in that file), then run the generator, copy the regenerated src/games.ts (and src/icons.ts if changed) and the new badge SVG/PNG files into the app, and update GAME_VISUALS consumers:
      SHAPES["pentagon"] = rpoly([(48 + 44 * math.cos(math.radians(-90 + 72 * k)), 50 + 44 * math.sin(math.radians(-90 + 72 * k))) for k in range(5)], 10)
      GLYPHS["shelf-rush"] = {"d": ["M3 20.5h18", R(3.5, 9, 4, 11.5, 1), "M3.5 13h4", R(10, 4.5, 4, 16, 1), "M10 8.5h4", "M16.6 20.5 15.4 11.3l3.9-.8 1.9 10z"], "tone": R(10, 4.5, 4, 16, 1)}
      GAMES entry: {"id": "shelf-rush", "name": "Shelf Rush", "shape": "pentagon", "container": "#E8D2E8", "ink": "#5E2F66", "dy": 3, "scale": 2.5, "status": "launch"}
    Check the pentagon badge in preview/games.png and adjust dy and scale if the glyph looks off-center. Register the game in the library with the badge and the "launch" status; add the rules sheet, copy, sounds and haptics; final a11y and performance pass; remove any dead code. Accept: library shows 6 launch games with distinct silhouettes; all tests pass; typecheck, lint, and build are clean.

DO NOT
- Do not use Math.random() in engine code. Do not generate the Ascent deck on clients in a race. Do not hard-code colors, use CDN assets, animate layout properties, or show a book's testament, section, or any hint on the card. Do not repeat an identical (book, scheme) pair in a single Ascent run. Do not edit /content/shelf-rush.json except through a reviewed change. Do not edit generated files by hand; change the generator and rerun it.
- Do not proceed past a failing acceptance check.

REPORT FORMAT (after every phase)
1. Files created or changed. 2. Acceptance results (pass or fail with numbers). 3. Deviations from this spec and why. 4. Anything you need from me. Then wait.

````
