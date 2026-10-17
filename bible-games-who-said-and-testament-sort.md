# Bible Party Games: "Who Said That?" and "Testament Sort"

Two new games for the game engine: full design, the build prompt, and seed question data.

**How to use this file**
1. Read Parts 1–3 (design).
2. Copy the JSON blocks in Part 5 into `content/who-said.json` and `content/testament-sort.json`.
3. Paste the prompt in Part 6 into Cursor or Lovable, in the project that already has the engine and the first three games.

**Important about the data**
- The seed set has **72 "Who Said That?" questions** (18 per tier) and **100 "Testament Sort" entries** (25 per tier).
- It is a **starter set, not the full repository.** Part 4 explains how to reach 400+ per tier and how the engine keeps repeats rare.
- Everything was written from memory of the KJV and **must be proofread against the Bible text before release.** Each item carries a reference to make that quick.
- Scripture text is KJV (public domain). Testament membership follows a modern translation (WEB) so spellings like "Elias" or "Naasson" don't cause confusion.

---

# Part 1: Who Said That?

## Core concept
A line of spoken Scripture appears on every phone, with four possible speakers. The faster you lock in the right one, the more it's worth. Questions climb through four difficulty tiers, from famous lines everyone knows to quotes only careful readers recognize.

## Objective
Score the most points by identifying speakers quickly and correctly.

## Modes

| Mode | Who | How it plays |
|---|---|---|
| **Race the Clock** (solo) | 1 player | Points drain as time passes. Three strikes ends the run. Tier adapts to performance (endless). |
| **Fastest Finger** | Individuals, 3–20+ | Everyone answers on their own phone. Points decay with time, with a bonus for the first correct answer. |
| **Pair Duel** | Pairs | A pair shares one answer. Either partner can lock it in, so you must agree out loud, fast. |
| **Team Rush** | 2+ teams | Every player answers individually. Team score is the sum, with a **Team Sweep** bonus when everyone on the team is right. |

## Round flow
1. **Countdown** (3 seconds). The tier colour changes so people feel the difficulty rise.
2. **Question.** The quote appears with four speaker options. A wavy timer runs.
3. **Close Call window.** When the first correct answer locks, the timer snaps to at most 5 seconds left. Everyone else scrambles.
4. **Reveal.** Correct speaker, reference, a one-line "who/where/why" note, and in group modes who answered what and how fast (great for banter).
5. **Leaderboard** every 5 questions, **final podium** at the end.

## Session lengths

| Length | Questions | Tier ramp |
|---|---|---|
| Quick | 12 | 3 per tier |
| Standard | 20 | 5 per tier |
| Marathon | 32 | 8 per tier |
| Endless (solo) | until 3 strikes | Up a tier after 3 correct in a row, down after 2 wrong |

## Scoring

```
timeLimit   = clamp(8 + 0.5 × wordsInQuote, 12, 25) seconds
timeFactor  = max(0.2, 1 − 0.8 × elapsed / timeLimit)
base        = T1 100 | T2 150 | T3 200 | T4 300
points      = round(base × timeFactor)

First correct (group modes):  + 20% of base
Wrong answer:                 − 25% of base, locked out for that question
Streak (correct in a row):    3 → +10%, 5 → +20%, 7+ → +30%
Team Sweep (Team Rush):       + 25% of base if every teammate is correct
```

**Example.** Tier 2 (base 150), 15-second limit, you answer correctly at 5 seconds: timeFactor = 1 − 0.8 × (5/15) = 0.733, so 110 points. If you were first correct, +30 = **140**.

**Power-ups** (one of each per player per game):
- **Fifty-Fifty:** removes two wrong options, your points ×0.5.
- **Double Down:** declare before answering. Win ×2, lose ×2 (penalty doubles).
- **Shield:** cancels one wrong-answer penalty.

**Gentle Mode** (host setting): no wrong-answer penalties and a longer time limit (×1.5). This keeps beginners in the game.

## Difficulty design

| Tier | Quote type | Distractors |
|---|---|---|
| 1 | Famous lines | Mostly from different stories and eras |
| 2 | Well-known but needs some reading | Same testament, same genre |
| 3 | Mid-profile lines | Same era, similar roles (e.g. prophets, apostles) |
| 4 | Obscure lines, tricky scenes | Characters from the same scene or setting |

## Team configurations (10 players)
- **10 individuals:** Fastest Finger.
- **5 pairs:** Pair Duel (shared lock-in).
- **2 teams of 5:** Team Rush with Team Sweep.
- **3 teams of 3 + host:** Team Rush; the host runs the screen and can use "Read the passage" prompts after reveals.

## The fun factor
The Close Call window. The moment the first correct answer lands, the room goes into a 5-second scramble, and the reveal screen shows who guessed what.

## Replay value
- A very large pool, so repeats are rare (see Part 4).
- Filters: Old Testament only, New Testament only, Gospels, Prophets, History.
- Four tiers, three lengths, Gentle/Normal modes, power-ups.

## Content rules (for adding questions)
1. The quote is **verbatim KJV**, and **one named speaker** (or one clear group) said it per the text.
2. No line that is spoken by multiple people in parallel passages unless the answer is still unique.
3. No distractor said the same line anywhere in Scripture.
4. Keep God/Jesus quotes to about 12% of the pool so the game doesn't feel one-note.
5. Avoid contested authorship (psalm superscriptions, disputed letters) in the main pool.
6. Every item has a reference and a one-line reveal note.
7. Avoid quotes that depict self-harm or are likely to be distressing out of context.

**Complexity: Moderate.** Real-time answer timing and fair scoring across phones is the main work (see the prompt's latency handling).

---

# Part 2: Testament Sort

## Core concept
A name pops up: a person, a place, or a thing. Is it in the **Old Testament**, the **New Testament**, or **Both**? The Hint button reveals a short clue or the meaning of the name, but costs points. Every card has a countdown.

## Objective
Sort names into the right testament quickly, using as few hints as possible.

## The one rule
**A name counts for a testament if that name appears in that testament**, even for a different person or place. (For example, "Simeon" appears in Genesis as a son of Jacob and in Luke as the man in the temple, so it's **Both**.) The reveal screen always shows the verses that prove it.

## Modes

| Mode | Who | How it plays |
|---|---|---|
| **Solo Practice** | 1 | Steady run, 3 strikes. |
| **Everyone Sorts** | Individuals, 3–20+ | Everyone answers on their own phone at the same time. No buzzer race, so it's friendly for slower readers. |
| **Huddle** | Pairs or teams | Each member picks secretly. The majority is the team answer. **Ties force a 10-second huddle** where teammates must talk it out. |
| **Sort Rush** | Any | 60-second blitz: as many cards as you can, hints disabled. |

## Round flow
1. Card appears: **name**, a **type chip** (Person / Place / Thing), and the countdown.
2. Optional **Hint** (once per card).
3. Pick **Old Testament**, **New Testament**, or **Both**, then lock.
4. **Reveal:** the correct answer, verses, and in group modes a bar showing how the room voted (e.g. OT 4 · NT 3 · Both 3).

## Scoring

```
timeLimit   = T1 15s | T2 15s | T3 12s | T4 12s
timeFactor  = max(0.25, 1 − 0.75 × elapsed / timeLimit)
base        = T1 100 | T2 150 | T3 200 | T4 250
hintFactor  = 0.6 if a hint was used, else 1
bothBonus   = 1.25 if the correct answer is BOTH and you got it right, else 1
points      = round(base × timeFactor × hintFactor × bothBonus)

Wrong answer: 0 points (Risk Mode: −20% of base)
Streak: 3 → +10%, 5 → +20%, 7+ → +30%
```

**Example.** Tier 3 (base 200), 12-second limit. You pick "Both" correctly at 4 seconds after using a hint: timeFactor = 1 − 0.75 × (4/12) = 0.75, so 200 × 0.75 × 0.6 × 1.25 = **113 points**.

**Team hints:** in Huddle mode each team shares a budget of 3 hints. Whoever taps Hint reveals it to the whole team, and the whole team's points on that card are ×0.6.

## Difficulty design

| Tier | Content |
|---|---|
| 1 | Famous names (Goliath, Paul, Nazareth, Egypt) |
| 2 | Well-known but easier to mix up (Elijah, Damascus, Barnabas) |
| 3 | Namesakes and places that appear in both (Nineveh, Joppa, Hyssop) |
| 4 | Genealogy names, obscure figures, and tricky "Both" traps (Gamaliel, Simeon, Lamech) |

## Team configurations (10 players)
- **10 individuals:** Everyone Sorts.
- **5 pairs:** Huddle. Pairs always tie-break by talking.
- **2 teams of 5:** Huddle with majority vote.
- **3 teams of 3 + host:** Huddle; the host reads out reveal verses.

## The fun factor
"Both." Beginners guess a testament, experts remember the namesakes, and the reveal bar makes the whole room argue about it.

## Replay value
- A large pool (see Part 4), three answer types, Hints and Risk Mode, Sort Rush for speed.
- Filters: People, Places, Things, and a "Namesake Traps" pack of tier-3/4 Both entries.

## Content rules
1. Every entry has a **verifiable answer** with a verse reference for each testament that applies.
2. Hints give context or a name meaning but **never the answer**, and never say "Old Testament" or "New Testament."
3. Where a name's meaning is an interpretation (not stated in Scripture), the hint says "usually understood to mean".
4. Balance per session: about 1/3 OT, 1/3 NT, 1/3 Both. (The seed set is Both-heavy, see Part 4.)
5. Spelling follows a modern translation (WEB); the reveal can show the KJV spelling in notes (e.g. Elias).

**Complexity: Easy.** A card, a timer, three buttons, a hint, and a reveal.

---

# Part 3: Shared Systems

## Anti-repeat ledger
Players should "hardly ever see" a repeated question. The engine needs a ledger, not just random picks.

- Each device stores a **seen-IDs set** per game (IndexedDB).
- When a player joins a room, their device sends a compact seen-set (a bitset keyed by question index) to the host.
- The host picks each question from the **tier pool**, preferring questions seen by the fewest players in the room (ties broken randomly).
- When fewer than 20% of a tier's questions are unseen for the room, the engine reuses the **least recently seen** ones first, not random ones.
- Content IDs are stable and append-only. A fixed question keeps its ID and gets a `"revised"` flag; a removed one gets a `"retired"` flag.

**Pool maths:** a Standard game (20 questions) uses 5 per tier. With 400 questions per tier, one device can play about 80 games before seeing a repeat. With the seed set (18 per tier), expect repeats after about 3–4 games, which is why expansion matters.

## Selection by session
- **Who Said That?:** a tier schedule, plus filters (testament, section of the Bible). Avoid the same speaker answering twice in a row, and cap God/Jesus at about 1 in 8 per session.
- **Testament Sort:** balance answer types per session to about 1/3 each, and avoid consecutive same-type cards.

---

# Part 4: Scaling the Repository

The Bible has thousands of verses of direct speech and several thousand distinct names, so the pool can grow very large. A practical plan:

**Who Said That?** (target 400+ per tier)
- Work book by book. For each book, list the direct-speech verses with a clear speaker, then grade tiers by how widely known the line is.
- Suggested spread per tier: Law ~15%, History ~25%, Prophets/Poets (clear speakers only) ~15%, Gospels ~25%, Acts ~15%, Epistles/Revelation ~5%.
- Reuse speakers across many lines; vary distractors so no pairing repeats.

**Testament Sort** (target 400+ per tier)
- Harvest names from: genealogies (Genesis 5, 10, 11; 1 Chronicles 1–9; Matthew 1; Luke 3), Acts' journeys and greetings (Romans 16), the prophets' oracles against nations, the Gospels' towns and regions, the Tabernacle/Temple inventory, flora/fauna/objects.
- **First priority: more OT-only and NT-only entries**, because the seed set is about 52% Both. Aim for a 1/3 split.
- For every Both entry, record a verse in each testament.

**Verification checklist (every new item)**
1. Quote or name checked against the KJV or WEB text.
2. Reference correct.
3. Speaker/testament claim uncontroversial or flagged.
4. No distractor said the same line or is the same figure.
5. Hint doesn't give away the answer.
6. A second reviewer approves.

If you want, I can generate additional batches (say 100 at a time) in this same format.

---

# Part 5: Data

## Schemas

**Who Said That?**
```
id, tier (1-4), quote (KJV), answer, options[4] (includes answer; app shuffles),
ref, note (reveal line)
```

**Testament Sort**
```
id, tier (1-4), name, type ("person"|"place"|"thing"),
answer ("OT"|"NT"|"BOTH"), hint, refs, note? (optional extra reveal text)
```

## Who Said That? (72 questions)

```json who-said
[
{"id":"ws-101","tier":1,"quote":"Am I my brother's keeper?","answer":"Cain","options":["Cain","Abel","Adam","Noah"],"ref":"Genesis 4:9","note":"Cain's reply when God asked where Abel was."},
{"id":"ws-102","tier":1,"quote":"Ye shall not surely die.","answer":"The serpent","options":["The serpent","Eve","Adam","Cain"],"ref":"Genesis 3:4","note":"The serpent's words to the woman about the forbidden fruit."},
{"id":"ws-103","tier":1,"quote":"The serpent beguiled me, and I did eat.","answer":"Eve","options":["Eve","Adam","Sarah","Rebekah"],"ref":"Genesis 3:13","note":"Eve answers God in the garden."},
{"id":"ws-104","tier":1,"quote":"Who is the LORD, that I should obey his voice to let Israel go?","answer":"Pharaoh","options":["Pharaoh","Balak","Nebuchadnezzar","Haman"],"ref":"Exodus 5:2","note":"Pharaoh's answer to Moses and Aaron."},
{"id":"ws-105","tier":1,"quote":"Choose you this day whom ye will serve; but as for me and my house, we will serve the LORD.","answer":"Joshua","options":["Joshua","Moses","Caleb","Gideon"],"ref":"Joshua 24:15","note":"Joshua's challenge to Israel at Shechem."},
{"id":"ws-106","tier":1,"quote":"Whither thou goest, I will go; and where thou lodgest, I will lodge.","answer":"Ruth","options":["Ruth","Naomi","Orpah","Esther"],"ref":"Ruth 1:16","note":"Ruth's vow to stay with Naomi."},
{"id":"ws-107","tier":1,"quote":"If I perish, I perish.","answer":"Esther","options":["Esther","Mordecai","Vashti","Ruth"],"ref":"Esther 4:16","note":"Esther's resolve before approaching the king uninvited."},
{"id":"ws-108","tier":1,"quote":"The LORD gave, and the LORD hath taken away; blessed be the name of the LORD.","answer":"Job","options":["Job","Eliphaz","Elihu","Noah"],"ref":"Job 1:21","note":"Job's response after losing his children and possessions."},
{"id":"ws-109","tier":1,"quote":"Here am I; send me.","answer":"Isaiah","options":["Isaiah","Jeremiah","Ezekiel","Amos"],"ref":"Isaiah 6:8","note":"Isaiah's answer in the temple vision."},
{"id":"ws-110","tier":1,"quote":"Divide the living child in two, and give half to the one, and half to the other.","answer":"Solomon","options":["Solomon","David","Rehoboam","Nathan"],"ref":"1 Kings 3:25","note":"Solomon's test to expose the real mother."},
{"id":"ws-111","tier":1,"quote":"Behold the handmaid of the Lord; be it unto me according to thy word.","answer":"Mary","options":["Mary","Elizabeth","Martha","Anna"],"ref":"Luke 1:38","note":"Mary's response to the angel Gabriel."},
{"id":"ws-112","tier":1,"quote":"Behold the Lamb of God, which taketh away the sin of the world.","answer":"John the Baptist","options":["John the Baptist","Peter","Andrew","Simeon"],"ref":"John 1:29","note":"Said when he saw Jesus coming toward him."},
{"id":"ws-113","tier":1,"quote":"Thou art the Christ, the Son of the living God.","answer":"Peter","options":["Peter","John","Andrew","Thomas"],"ref":"Matthew 16:16","note":"Peter's confession at Caesarea Philippi."},
{"id":"ws-114","tier":1,"quote":"What is truth?","answer":"Pilate","options":["Pilate","Herod","Caiaphas","Nicodemus"],"ref":"John 18:38","note":"Pilate to Jesus during the trial."},
{"id":"ws-115","tier":1,"quote":"My Lord and my God.","answer":"Thomas","options":["Thomas","Peter","Philip","Nathanael"],"ref":"John 20:28","note":"Thomas after seeing the risen Jesus."},
{"id":"ws-116","tier":1,"quote":"He that is without sin among you, let him first cast a stone at her.","answer":"Jesus","options":["Jesus","Moses","Paul","Nathan"],"ref":"John 8:7","note":"Jesus to those who brought a woman accused of adultery."},
{"id":"ws-117","tier":1,"quote":"Saul, Saul, why persecutest thou me?","answer":"Jesus","options":["Jesus","Ananias","Barnabas","Stephen"],"ref":"Acts 9:4","note":"The voice Saul heard on the Damascus road."},
{"id":"ws-118","tier":1,"quote":"I have fought a good fight, I have finished my course, I have kept the faith.","answer":"Paul","options":["Paul","Peter","John","Barnabas"],"ref":"2 Timothy 4:7","note":"Paul in his final letter to Timothy."},
{"id":"ws-201","tier":2,"quote":"Hear, O Israel: The LORD our God is one LORD.","answer":"Moses","options":["Moses","Joshua","Aaron","Samuel"],"ref":"Deuteronomy 6:4","note":"Moses' charge to Israel, known as the Shema."},
{"id":"ws-202","tier":2,"quote":"I will not let thee go, except thou bless me.","answer":"Jacob","options":["Jacob","Esau","Isaac","Laban"],"ref":"Genesis 32:26","note":"Jacob to the man who wrestled with him at the Jabbok."},
{"id":"ws-203","tier":2,"quote":"But as for you, ye thought evil against me; but God meant it unto good.","answer":"Joseph","options":["Joseph","Judah","Reuben","Benjamin"],"ref":"Genesis 50:20","note":"Joseph to his brothers after Jacob's death."},
{"id":"ws-204","tier":2,"quote":"The voice is Jacob's voice, but the hands are the hands of Esau.","answer":"Isaac","options":["Isaac","Esau","Abraham","Laban"],"ref":"Genesis 27:22","note":"Isaac, blind and suspicious, about the son in front of him."},
{"id":"ws-205","tier":2,"quote":"Thou art the man.","answer":"Nathan","options":["Nathan","Joab","Gad","Samuel"],"ref":"2 Samuel 12:7","note":"Nathan confronting David about Bathsheba and Uriah."},
{"id":"ws-206","tier":2,"quote":"Thou comest to me with a sword, and with a spear, and with a shield: but I come to thee in the name of the LORD of hosts.","answer":"David","options":["David","Jonathan","Eliab","Saul"],"ref":"1 Samuel 17:45","note":"David to Goliath."},
{"id":"ws-207","tier":2,"quote":"Behold, to obey is better than sacrifice, and to hearken than the fat of rams.","answer":"Samuel","options":["Samuel","Nathan","Eli","Elijah"],"ref":"1 Samuel 15:22","note":"Samuel rebuking King Saul."},
{"id":"ws-208","tier":2,"quote":"How long halt ye between two opinions?","answer":"Elijah","options":["Elijah","Elisha","Ahab","Obadiah"],"ref":"1 Kings 18:21","note":"Elijah to the people on Mount Carmel."},
{"id":"ws-209","tier":2,"quote":"Who knoweth whether thou art come to the kingdom for such a time as this?","answer":"Mordecai","options":["Mordecai","Haman","Hegai","Ahasuerus"],"ref":"Esther 4:14","note":"Mordecai urging Esther to act."},
{"id":"ws-210","tier":2,"quote":"What have I done unto thee, that thou hast smitten me these three times?","answer":"Balaam's donkey","options":["Balaam's donkey","Balaam","Balak","The angel of the LORD"],"ref":"Numbers 22:28","note":"The LORD opened the donkey's mouth to speak."},
{"id":"ws-211","tier":2,"quote":"Doth Job fear God for nought?","answer":"Satan","options":["Satan","Eliphaz","Bildad","Elihu"],"ref":"Job 1:9","note":"Satan's challenge to God about Job's loyalty."},
{"id":"ws-212","tier":2,"quote":"Thou art Peter, and upon this rock I will build my church.","answer":"Jesus","options":["Jesus","John the Baptist","Paul","Andrew"],"ref":"Matthew 16:18","note":"Jesus to Simon after his confession."},
{"id":"ws-213","tier":2,"quote":"Silver and gold have I none; but such as I have give I thee.","answer":"Peter","options":["Peter","Paul","John","Stephen"],"ref":"Acts 3:6","note":"Peter to the lame man at the temple gate."},
{"id":"ws-214","tier":2,"quote":"Can there any good thing come out of Nazareth?","answer":"Nathanael","options":["Nathanael","Philip","Thomas","Nicodemus"],"ref":"John 1:46","note":"Nathanael's reaction when Philip described Jesus."},
{"id":"ws-215","tier":2,"quote":"How can a man be born when he is old?","answer":"Nicodemus","options":["Nicodemus","Gamaliel","Caiaphas","Joseph of Arimathaea"],"ref":"John 3:4","note":"Nicodemus puzzled by being born again."},
{"id":"ws-216","tier":2,"quote":"Jesus, thou son of David, have mercy on me.","answer":"Bartimaeus","options":["Bartimaeus","Zacchaeus","Jairus","Lazarus"],"ref":"Mark 10:47","note":"A blind beggar near Jericho."},
{"id":"ws-217","tier":2,"quote":"What will ye give me, and I will deliver him unto you?","answer":"Judas Iscariot","options":["Judas Iscariot","Caiaphas","Peter","Pilate"],"ref":"Matthew 26:15","note":"Judas to the chief priests."},
{"id":"ws-218","tier":2,"quote":"He must increase, but I must decrease.","answer":"John the Baptist","options":["John the Baptist","Andrew","Peter","Simeon"],"ref":"John 3:30","note":"John speaking about Jesus' growing ministry."},
{"id":"ws-301","tier":3,"quote":"Now therefore give me this mountain, whereof the LORD spake in that day.","answer":"Caleb","options":["Caleb","Joshua","Othniel","Gideon"],"ref":"Joshua 14:12","note":"Caleb, at eighty-five, asks for Hebron's hill country."},
{"id":"ws-302","tier":3,"quote":"Out of the eater came forth meat, and out of the strong came forth sweetness.","answer":"Samson","options":["Samson","Delilah","Manoah","Gideon"],"ref":"Judges 14:14","note":"His riddle at the wedding feast."},
{"id":"ws-303","tier":3,"quote":"Call me not Naomi, call me Mara: for the Almighty hath dealt very bitterly with me.","answer":"Naomi","options":["Naomi","Ruth","Orpah","Boaz"],"ref":"Ruth 1:20","note":"Naomi returning to Bethlehem."},
{"id":"ws-304","tier":3,"quote":"For this child I prayed; and the LORD hath given me my petition which I asked of him.","answer":"Hannah","options":["Hannah","Peninnah","Abigail","Michal"],"ref":"1 Samuel 1:27","note":"Hannah presenting young Samuel at Shiloh."},
{"id":"ws-305","tier":3,"quote":"Behold, I have played the fool, and have erred exceedingly.","answer":"Saul","options":["Saul","Ahab","Eli","Abner"],"ref":"1 Samuel 26:21","note":"Saul after David spared his life in the wilderness."},
{"id":"ws-306","tier":3,"quote":"How are the mighty fallen!","answer":"David","options":["David","Joab","Abner","Samuel"],"ref":"2 Samuel 1:19","note":"David's lament for Saul and Jonathan."},
{"id":"ws-307","tier":3,"quote":"Fear not: for they that be with us are more than they that be with them.","answer":"Elisha","options":["Elisha","Elijah","Gehazi","Isaiah"],"ref":"2 Kings 6:16","note":"To his frightened servant surrounded by an army at Dothan."},
{"id":"ws-308","tier":3,"quote":"I am doing a great work, so that I cannot come down.","answer":"Nehemiah","options":["Nehemiah","Ezra","Zerubbabel","Mordecai"],"ref":"Nehemiah 6:3","note":"Replying to those who wanted him to leave the wall."},
{"id":"ws-309","tier":3,"quote":"Is not this great Babylon, that I have built for the house of the kingdom by the might of my power, and for the honour of my majesty?","answer":"Nebuchadnezzar","options":["Nebuchadnezzar","Belshazzar","Darius","Cyrus"],"ref":"Daniel 4:30","note":"Said on his palace roof, just before he lost his reason."},
{"id":"ws-310","tier":3,"quote":"Our God whom we serve is able to deliver us from the burning fiery furnace.","answer":"Shadrach, Meshach and Abednego","options":["Shadrach, Meshach and Abednego","Daniel","Nebuchadnezzar","Darius"],"ref":"Daniel 3:17","note":"Their answer to the king before the furnace."},
{"id":"ws-311","tier":3,"quote":"I fear the LORD, the God of heaven, which hath made the sea and the dry land.","answer":"Jonah","options":["Jonah","Jeremiah","Obadiah","The ship's captain"],"ref":"Jonah 1:9","note":"Jonah answering the sailors who asked who he was."},
{"id":"ws-312","tier":3,"quote":"Ah, Lord GOD! behold, I cannot speak: for I am a child.","answer":"Jeremiah","options":["Jeremiah","Isaiah","Ezekiel","Samuel"],"ref":"Jeremiah 1:6","note":"Jeremiah's response when called as a prophet."},
{"id":"ws-313","tier":3,"quote":"Fear not, Mary: for thou hast found favour with God.","answer":"Gabriel","options":["Gabriel","Michael","Zacharias","Joseph"],"ref":"Luke 1:30","note":"The angel to Mary in Nazareth."},
{"id":"ws-314","tier":3,"quote":"Lord, now lettest thou thy servant depart in peace, according to thy word.","answer":"Simeon","options":["Simeon","Zacharias","Joseph","Anna"],"ref":"Luke 2:29","note":"Simeon holding the infant Jesus in the temple."},
{"id":"ws-315","tier":3,"quote":"Lord, to whom shall we go? thou hast the words of eternal life.","answer":"Peter","options":["Peter","Judas Iscariot","Andrew","Thomas"],"ref":"John 6:68","note":"Peter after many disciples turned away."},
{"id":"ws-316","tier":3,"quote":"Paul, thou art beside thyself; much learning doth make thee mad.","answer":"Festus","options":["Festus","Agrippa","Felix","Gamaliel"],"ref":"Acts 26:24","note":"Festus interrupting Paul's defense."},
{"id":"ws-317","tier":3,"quote":"Behold, I see the heavens opened, and the Son of man standing on the right hand of God.","answer":"Stephen","options":["Stephen","Peter","Philip","Paul"],"ref":"Acts 7:56","note":"Stephen's vision before the council."},
{"id":"ws-318","tier":3,"quote":"Sirs, what must I do to be saved?","answer":"The Philippian jailer","options":["The Philippian jailer","Cornelius","The Ethiopian eunuch","Lydia"],"ref":"Acts 16:30","note":"After an earthquake opened the prison doors in Philippi."},
{"id":"ws-401","tier":4,"quote":"I will go.","answer":"Rebekah","options":["Rebekah","Rachel","Leah","Sarah"],"ref":"Genesis 24:58","note":"Asked whether she would leave with Abraham's servant."},
{"id":"ws-402","tier":4,"quote":"I have enough, my brother; keep that thou hast unto thyself.","answer":"Esau","options":["Esau","Laban","Isaac","Jacob"],"ref":"Genesis 33:9","note":"Esau declining Jacob's gift at their reunion."},
{"id":"ws-403","tier":4,"quote":"Can we find such a one as this is, a man in whom the Spirit of God is?","answer":"Pharaoh","options":["Pharaoh","Potiphar","The chief butler","Joseph's brothers"],"ref":"Genesis 41:38","note":"Pharaoh to his servants about Joseph."},
{"id":"ws-404","tier":4,"quote":"Speak thou with us, and we will hear: but let not God speak with us, lest we die.","answer":"The people of Israel","options":["The people of Israel","Moses","Aaron","Joshua"],"ref":"Exodus 20:19","note":"The people at the foot of Sinai after the thunder."},
{"id":"ws-405","tier":4,"quote":"Why hast thou troubled us? the LORD shall trouble thee this day.","answer":"Joshua","options":["Joshua","Achan","Caleb","Phinehas"],"ref":"Joshua 7:25","note":"Joshua to Achan after the defeat at Ai."},
{"id":"ws-406","tier":4,"quote":"There is no restraint to the LORD to save by many or by few.","answer":"Jonathan","options":["Jonathan","David","Saul","Abner"],"ref":"1 Samuel 14:6","note":"Jonathan proposing a raid on a Philistine outpost."},
{"id":"ws-407","tier":4,"quote":"Whose ox have I taken? or whose ass have I taken?","answer":"Samuel","options":["Samuel","Eli","Nathan","Gad"],"ref":"1 Samuel 12:3","note":"Samuel's farewell speech to Israel."},
{"id":"ws-408","tier":4,"quote":"Thou hast asked a hard thing.","answer":"Elijah","options":["Elijah","Elisha","Gehazi","Jehu"],"ref":"2 Kings 2:10","note":"Elijah's reply when Elisha asked for a double portion of his spirit."},
{"id":"ws-409","tier":4,"quote":"Are not Abana and Pharpar, rivers of Damascus, better than all the waters of Israel?","answer":"Naaman","options":["Naaman","Gehazi","Ben-hadad","Jehu"],"ref":"2 Kings 5:12","note":"Naaman's angry reaction to the prophet's instruction."},
{"id":"ws-410","tier":4,"quote":"Hast thou found me, O mine enemy?","answer":"Ahab","options":["Ahab","Jehu","Jeroboam","Omri"],"ref":"1 Kings 21:20","note":"Ahab to Elijah after the seizure of Naboth's vineyard."},
{"id":"ws-411","tier":4,"quote":"I was no prophet, neither was I a prophet's son; but I was an herdman.","answer":"Amos","options":["Amos","Hosea","Micah","Joel"],"ref":"Amos 7:14","note":"Amos to the priest Amaziah at Bethel."},
{"id":"ws-412","tier":4,"quote":"His name is John.","answer":"Zacharias","options":["Zacharias","Elizabeth","Joseph","Simeon"],"ref":"Luke 1:63","note":"Written on a tablet while he could not speak."},
{"id":"ws-413","tier":4,"quote":"We have found him, of whom Moses in the law, and the prophets, did write, Jesus of Nazareth, the son of Joseph.","answer":"Philip","options":["Philip","Andrew","Nathanael","Peter"],"ref":"John 1:45","note":"Philip telling Nathanael about Jesus."},
{"id":"ws-414","tier":4,"quote":"Behold an Israelite indeed, in whom is no guile!","answer":"Jesus","options":["Jesus","Philip","John the Baptist","Andrew"],"ref":"John 1:47","note":"Said of Nathanael as he approached."},
{"id":"ws-415","tier":4,"quote":"Go thy way for this time; when I have a convenient season, I will call for thee.","answer":"Felix","options":["Felix","Festus","Agrippa","Lysias"],"ref":"Acts 24:25","note":"Felix after Paul spoke of righteousness and judgment to come."},
{"id":"ws-416","tier":4,"quote":"Refrain from these men, and let them alone.","answer":"Gamaliel","options":["Gamaliel","Caiaphas","Nicodemus","Festus"],"ref":"Acts 5:38","note":"Advising the council about the apostles."},
{"id":"ws-417","tier":4,"quote":"Sirs, ye should have hearkened unto me, and not have loosed from Crete, and to have gained this harm and loss.","answer":"Paul","options":["Paul","Luke","Julius the centurion","Aristarchus"],"ref":"Acts 27:21","note":"Paul reminding the sailors of his earlier warning."},
{"id":"ws-418","tier":4,"quote":"Almost thou persuadest me to be a Christian.","answer":"Agrippa","options":["Agrippa","Felix","Festus","Pilate"],"ref":"Acts 26:28","note":"Agrippa's reply to Paul's defense."}
]
```

## Testament Sort (100 entries)

```json testament-sort
[
{"id":"ts-101","tier":1,"name":"Goliath","type":"person","answer":"OT","hint":"A giant from Gath who challenged Israel's army for forty days.","refs":"1 Samuel 17"},
{"id":"ts-102","tier":1,"name":"Abraham","type":"person","answer":"BOTH","hint":"God changed his name to one meaning 'father of many nations.'","refs":"OT: Genesis 17:5; NT: Matthew 1:1, Hebrews 11:8"},
{"id":"ts-103","tier":1,"name":"Moses","type":"person","answer":"BOTH","hint":"Named because he was 'drawn out' of the water.","refs":"OT: Exodus 2:10; NT: Matthew 17:3"},
{"id":"ts-104","tier":1,"name":"David","type":"person","answer":"BOTH","hint":"A shepherd boy anointed by Samuel before he became king.","refs":"OT: 1 Samuel 16:13; NT: Matthew 1:1"},
{"id":"ts-105","tier":1,"name":"Paul","type":"person","answer":"NT","hint":"A tentmaker and missionary who wrote letters to young churches.","refs":"Acts 13:9; Acts 18:3"},
{"id":"ts-106","tier":1,"name":"Peter","type":"person","answer":"NT","hint":"A fisherman whose name means 'rock.'","refs":"Matthew 16:18"},
{"id":"ts-107","tier":1,"name":"Noah","type":"person","answer":"BOTH","hint":"His name sounds like the Hebrew for 'rest' or 'comfort.'","refs":"OT: Genesis 5:29, 6:9; NT: Matthew 24:37, Hebrews 11:7"},
{"id":"ts-108","tier":1,"name":"Samson","type":"person","answer":"BOTH","hint":"A Nazirite whose strength was tied to his uncut hair.","refs":"OT: Judges 16; NT: Hebrews 11:32"},
{"id":"ts-109","tier":1,"name":"Delilah","type":"person","answer":"OT","hint":"A woman of the valley of Sorek, paid by Philistine rulers.","refs":"Judges 16:4-18"},
{"id":"ts-110","tier":1,"name":"Esther","type":"person","answer":"OT","hint":"Her other name was Hadassah.","refs":"Esther 2:7"},
{"id":"ts-111","tier":1,"name":"Judas Iscariot","type":"person","answer":"NT","hint":"One of the Twelve who kept the money bag.","refs":"Matthew 10:4; John 12:4-6"},
{"id":"ts-112","tier":1,"name":"Lazarus","type":"person","answer":"NT","hint":"A man of Bethany whose sisters sent word that he was ill.","refs":"John 11; Luke 16:20"},
{"id":"ts-113","tier":1,"name":"Zacchaeus","type":"person","answer":"NT","hint":"A short man who climbed a sycamore tree to see someone pass.","refs":"Luke 19:1-10"},
{"id":"ts-114","tier":1,"name":"Egypt","type":"place","answer":"BOTH","hint":"A land along the Nile where Joseph rose to power.","refs":"OT: Genesis 39:1; NT: Matthew 2:14, Acts 7:9"},
{"id":"ts-115","tier":1,"name":"Jerusalem","type":"place","answer":"BOTH","hint":"A hilltop city David captured and made his capital.","refs":"OT: 2 Samuel 5:6-7; NT: Luke 2:22"},
{"id":"ts-116","tier":1,"name":"Bethlehem","type":"place","answer":"BOTH","hint":"Its name is usually understood to mean 'house of bread.'","refs":"OT: Ruth 1:1, Micah 5:2; NT: Matthew 2:1"},
{"id":"ts-117","tier":1,"name":"Nazareth","type":"place","answer":"NT","hint":"A small Galilean town where a carpenter's family settled.","refs":"Matthew 2:23; Luke 4:16"},
{"id":"ts-118","tier":1,"name":"Jericho","type":"place","answer":"BOTH","hint":"A walled city whose fall followed seven days of marching.","refs":"OT: Joshua 6; NT: Luke 10:30, Hebrews 11:30"},
{"id":"ts-119","tier":1,"name":"Eden","type":"place","answer":"OT","hint":"A garden planted 'eastward,' where a river divided into four.","refs":"Genesis 2:8-14"},
{"id":"ts-120","tier":1,"name":"Sodom","type":"place","answer":"BOTH","hint":"A city Abraham pleaded for, asking about fifty righteous people.","refs":"OT: Genesis 18:24, 19:24; NT: Matthew 10:15, 2 Peter 2:6"},
{"id":"ts-121","tier":1,"name":"Capernaum","type":"place","answer":"NT","hint":"A lakeside town described as 'his own city.'","refs":"Matthew 9:1; Mark 2:1"},
{"id":"ts-122","tier":1,"name":"Babylon","type":"place","answer":"BOTH","hint":"A great Mesopotamian city where Israel's exiles were taken.","refs":"OT: 2 Kings 24:15; NT: Matthew 1:11, Revelation 14:8"},
{"id":"ts-123","tier":1,"name":"Galilee","type":"place","answer":"BOTH","hint":"A northern region around a lake that Jesus visited often.","refs":"OT: Joshua 20:7, Isaiah 9:1; NT: Matthew 4:23"},
{"id":"ts-124","tier":1,"name":"Gethsemane","type":"place","answer":"NT","hint":"A garden at the foot of the Mount of Olives; its name is usually linked to an olive press.","refs":"Matthew 26:36; Mark 14:32"},
{"id":"ts-125","tier":1,"name":"Manna","type":"thing","answer":"BOTH","hint":"A bread-like food that appeared with the morning dew.","refs":"OT: Exodus 16:31; NT: John 6:31, Hebrews 9:4, Revelation 2:17"},
{"id":"ts-201","tier":2,"name":"Nehemiah","type":"person","answer":"OT","hint":"A royal cupbearer who led the rebuilding of Jerusalem's walls.","refs":"Nehemiah 1:11; 2:11-18"},
{"id":"ts-202","tier":2,"name":"Elijah","type":"person","answer":"BOTH","hint":"A prophet from Tishbe who confronted Baal's prophets on a mountain.","refs":"OT: 1 Kings 17:1, 18; NT: Luke 4:25, Matthew 17:3","note":"The KJV New Testament spells it 'Elias.'"},
{"id":"ts-203","tier":2,"name":"Isaiah","type":"person","answer":"BOTH","hint":"A prophet whose name is usually understood to mean 'the LORD saves.'","refs":"OT: Isaiah 1:1; NT: Matthew 3:3"},
{"id":"ts-204","tier":2,"name":"Ezekiel","type":"person","answer":"OT","hint":"A priest-prophet who saw a valley of dry bones.","refs":"Ezekiel 1:3; 37:1-14"},
{"id":"ts-205","tier":2,"name":"Jonah","type":"person","answer":"BOTH","hint":"A prophet who ran toward Tarshish.","refs":"OT: Jonah 1:3; NT: Matthew 12:39-41"},
{"id":"ts-206","tier":2,"name":"Daniel","type":"person","answer":"BOTH","hint":"An exile in Babylon who interpreted a king's dreams.","refs":"OT: Daniel 2; NT: Matthew 24:15"},
{"id":"ts-207","tier":2,"name":"Haman","type":"person","answer":"OT","hint":"An Agagite promoted by King Ahasuerus.","refs":"Esther 3:1"},
{"id":"ts-208","tier":2,"name":"Mordecai","type":"person","answer":"OT","hint":"A Benjamite who sat at the king's gate in Susa.","refs":"Esther 2:5, 2:19"},
{"id":"ts-209","tier":2,"name":"Barnabas","type":"person","answer":"NT","hint":"His name means 'son of encouragement.'","refs":"Acts 4:36"},
{"id":"ts-210","tier":2,"name":"Timothy","type":"person","answer":"NT","hint":"A young coworker from Lystra.","refs":"Acts 16:1-2"},
{"id":"ts-211","tier":2,"name":"Priscilla","type":"person","answer":"NT","hint":"A tentmaker who, with her husband, explained the way of God more accurately to a gifted speaker.","refs":"Acts 18:2, 18:26"},
{"id":"ts-212","tier":2,"name":"Nicodemus","type":"person","answer":"NT","hint":"A Pharisee who visited by night.","refs":"John 3:1-2"},
{"id":"ts-213","tier":2,"name":"Boaz","type":"person","answer":"BOTH","hint":"A landowner of Bethlehem who showed kindness to a gleaner.","refs":"OT: Ruth 2; NT: Matthew 1:5"},
{"id":"ts-214","tier":2,"name":"Rahab","type":"person","answer":"BOTH","hint":"A woman of Jericho who hid two spies on her roof.","refs":"OT: Joshua 2:1-6; NT: Matthew 1:5, Hebrews 11:31, James 2:25"},
{"id":"ts-215","tier":2,"name":"Naaman","type":"person","answer":"BOTH","hint":"A commander of Aram's army who was told to wash seven times.","refs":"OT: 2 Kings 5:14; NT: Luke 4:27"},
{"id":"ts-216","tier":2,"name":"Melchizedek","type":"person","answer":"BOTH","hint":"A king of Salem and priest of God Most High.","refs":"OT: Genesis 14:18; NT: Hebrews 7:1"},
{"id":"ts-217","tier":2,"name":"Balaam","type":"person","answer":"BOTH","hint":"A seer from Pethor whose donkey spoke to him.","refs":"OT: Numbers 22:5, 22:28; NT: 2 Peter 2:15, Jude 1:11, Revelation 2:14"},
{"id":"ts-218","tier":2,"name":"Gideon","type":"person","answer":"BOTH","hint":"A judge who tested God with a fleece.","refs":"OT: Judges 6:37; NT: Hebrews 11:32"},
{"id":"ts-219","tier":2,"name":"Mount Sinai","type":"place","answer":"BOTH","hint":"Where Moses received the tablets of the Law.","refs":"OT: Exodus 19:20; NT: Acts 7:30, Galatians 4:24-25"},
{"id":"ts-220","tier":2,"name":"Mount Carmel","type":"place","answer":"OT","hint":"A mountain where fire fell on a soaked altar.","refs":"1 Kings 18:19-38"},
{"id":"ts-221","tier":2,"name":"Damascus","type":"place","answer":"BOTH","hint":"A Syrian city on the road where a persecutor was blinded by light.","refs":"OT: Genesis 14:15, 2 Kings 5:12; NT: Acts 9:3"},
{"id":"ts-222","tier":2,"name":"Philippi","type":"place","answer":"NT","hint":"A Macedonian city where a jailer asked what he must do to be saved.","refs":"Acts 16:12, 16:30"},
{"id":"ts-223","tier":2,"name":"Patmos","type":"place","answer":"NT","hint":"An island where a vision was received.","refs":"Revelation 1:9"},
{"id":"ts-224","tier":2,"name":"Passover","type":"thing","answer":"BOTH","hint":"A feast marking a night when the destroyer passed over.","refs":"OT: Exodus 12:11; NT: Luke 22:1, John 2:13"},
{"id":"ts-225","tier":2,"name":"Goshen","type":"place","answer":"OT","hint":"The region of Egypt where Jacob's family settled.","refs":"Genesis 47:6"},
{"id":"ts-301","tier":3,"name":"Nineveh","type":"place","answer":"BOTH","hint":"A capital that repented at a prophet's short warning.","refs":"OT: Jonah 3:3-5; NT: Matthew 12:41, Luke 11:32"},
{"id":"ts-302","tier":3,"name":"Methuselah","type":"person","answer":"BOTH","hint":"Genesis gives his age as 969 years.","refs":"OT: Genesis 5:27; NT: Luke 3:37"},
{"id":"ts-303","tier":3,"name":"Enoch","type":"person","answer":"BOTH","hint":"A man who 'walked with God' and was no more, for God took him.","refs":"OT: Genesis 5:24; NT: Hebrews 11:5, Jude 1:14"},
{"id":"ts-304","tier":3,"name":"Joel","type":"person","answer":"BOTH","hint":"A prophet who wrote about a plague of locusts.","refs":"OT: Joel 1:1-4; NT: Acts 2:16"},
{"id":"ts-305","tier":3,"name":"Hezekiah","type":"person","answer":"BOTH","hint":"A king of Judah who showed Babylonian envoys his treasures.","refs":"OT: 2 Kings 20:12-13; NT: Matthew 1:9-10"},
{"id":"ts-306","tier":3,"name":"Josiah","type":"person","answer":"BOTH","hint":"A king of Judah, crowned as a boy, who found the Book of the Law.","refs":"OT: 2 Kings 22:1, 22:8; NT: Matthew 1:10-11"},
{"id":"ts-307","tier":3,"name":"Habakkuk","type":"person","answer":"OT","hint":"A prophet who cried out 'How long, LORD?'","refs":"Habakkuk 1:1-2"},
{"id":"ts-308","tier":3,"name":"Obadiah","type":"person","answer":"OT","hint":"A prophet whose book is the shortest in this part of the Bible.","refs":"Obadiah 1:1"},
{"id":"ts-309","tier":3,"name":"Ezra","type":"person","answer":"OT","hint":"A priest and scribe skilled in the Law of Moses who returned to Jerusalem.","refs":"Ezra 7:1-6"},
{"id":"ts-310","tier":3,"name":"Gehazi","type":"person","answer":"OT","hint":"A prophet's servant who coveted a foreign commander's gifts.","refs":"2 Kings 5:20-27"},
{"id":"ts-311","tier":3,"name":"Zerubbabel","type":"person","answer":"BOTH","hint":"A governor of Judah who led a return from exile and laid the temple foundation.","refs":"OT: Ezra 3:2, Haggai 1:1; NT: Matthew 1:12, Luke 3:27"},
{"id":"ts-312","tier":3,"name":"Mount Moriah","type":"place","answer":"OT","hint":"The region where Abraham was told to offer Isaac.","refs":"Genesis 22:2; 2 Chronicles 3:1"},
{"id":"ts-313","tier":3,"name":"Mount of Olives","type":"place","answer":"BOTH","hint":"A ridge east of Jerusalem that David climbed weeping.","refs":"OT: 2 Samuel 15:30, Zechariah 14:4; NT: Matthew 24:3"},
{"id":"ts-314","tier":3,"name":"Tarshish","type":"place","answer":"OT","hint":"A far-off destination a fleeing prophet tried to reach by ship.","refs":"Jonah 1:3; 1 Kings 10:22"},
{"id":"ts-315","tier":3,"name":"Sychar","type":"place","answer":"NT","hint":"A Samaritan town near Jacob's well.","refs":"John 4:5-6"},
{"id":"ts-316","tier":3,"name":"Bethany","type":"place","answer":"NT","hint":"The village of Mary and Martha, near Jerusalem.","refs":"John 11:1, 11:18"},
{"id":"ts-317","tier":3,"name":"Emmaus","type":"place","answer":"NT","hint":"A village where two travelers recognized a stranger when he broke bread.","refs":"Luke 24:13-31"},
{"id":"ts-318","tier":3,"name":"Antioch","type":"place","answer":"NT","hint":"A city where disciples were first called Christians.","refs":"Acts 11:26"},
{"id":"ts-319","tier":3,"name":"Mount Zion","type":"place","answer":"BOTH","hint":"A fortress David captured and called the City of David.","refs":"OT: 2 Samuel 5:7; NT: Hebrews 12:22, Revelation 14:1"},
{"id":"ts-320","tier":3,"name":"Joppa","type":"place","answer":"BOTH","hint":"A seaport on the Mediterranean coast.","refs":"OT: Jonah 1:3, 2 Chronicles 2:16; NT: Acts 9:36, Acts 10:5"},
{"id":"ts-321","tier":3,"name":"Gaza","type":"place","answer":"BOTH","hint":"A Philistine city whose gates were carried off to a hilltop.","refs":"OT: Judges 16:1-3; NT: Acts 8:26"},
{"id":"ts-322","tier":3,"name":"Tarsus","type":"place","answer":"NT","hint":"A city in Cilicia, the hometown of a famous apostle.","refs":"Acts 9:11, 21:39"},
{"id":"ts-323","tier":3,"name":"Frankincense","type":"thing","answer":"BOTH","hint":"A fragrant resin burned with grain offerings.","refs":"OT: Exodus 30:34, Leviticus 2:1; NT: Matthew 2:11"},
{"id":"ts-324","tier":3,"name":"Hyssop","type":"thing","answer":"BOTH","hint":"A plant used to apply blood to doorposts.","refs":"OT: Exodus 12:22, Psalm 51:7; NT: John 19:29, Hebrews 9:19"},
{"id":"ts-325","tier":3,"name":"Leviathan","type":"thing","answer":"OT","hint":"A sea creature described in God's speech from the whirlwind.","refs":"Job 41:1; Psalm 74:14; Isaiah 27:1"},
{"id":"ts-401","tier":4,"name":"Jesse","type":"person","answer":"BOTH","hint":"A Bethlehemite with eight sons, the youngest a shepherd.","refs":"OT: 1 Samuel 16:1, 17:12; NT: Matthew 1:5, Acts 13:22"},
{"id":"ts-402","tier":4,"name":"Obed","type":"person","answer":"BOTH","hint":"A son born to a Moabite widow and her second husband.","refs":"OT: Ruth 4:17; NT: Matthew 1:5"},
{"id":"ts-403","tier":4,"name":"Salmon","type":"person","answer":"BOTH","hint":"A name in the family line leading to Boaz.","refs":"OT: Ruth 4:20-21; NT: Matthew 1:4-5"},
{"id":"ts-404","tier":4,"name":"Gamaliel","type":"person","answer":"BOTH","hint":"A respected teacher of the law who advised a council to leave the apostles alone.","refs":"OT: Numbers 1:10; NT: Acts 5:34, 22:3","note":"The same name belongs to a leader of Manasseh in the wilderness census (Numbers 1:10)."},
{"id":"ts-405","tier":4,"name":"Simeon","type":"person","answer":"BOTH","hint":"A righteous man in the temple who took a baby in his arms.","refs":"OT: Genesis 29:33; NT: Luke 2:25","note":"The name is also borne by a son of Jacob and Leah."},
{"id":"ts-406","tier":4,"name":"Zechariah","type":"person","answer":"BOTH","hint":"A prophet who saw visions of a lampstand and olive trees.","refs":"OT: Zechariah 1:1, 4:2-3; NT: Luke 1:5","note":"The NT priest in Luke 1 shares the name (KJV: Zacharias)."},
{"id":"ts-407","tier":4,"name":"Eleazar","type":"person","answer":"BOTH","hint":"A priest, son of Aaron, who succeeded his father.","refs":"OT: Numbers 20:28; NT: Matthew 1:15"},
{"id":"ts-408","tier":4,"name":"Rehoboam","type":"person","answer":"BOTH","hint":"Solomon's son whose harsh answer split the kingdom.","refs":"OT: 1 Kings 12:1-17; NT: Matthew 1:7"},
{"id":"ts-409","tier":4,"name":"Perez","type":"person","answer":"BOTH","hint":"A twin son of Judah whose birth involved a scarlet thread.","refs":"OT: Genesis 38:29; NT: Matthew 1:3, Luke 3:33"},
{"id":"ts-410","tier":4,"name":"Nahshon","type":"person","answer":"BOTH","hint":"A leader of Judah during the wilderness years.","refs":"OT: Numbers 1:7, 2:3; NT: Matthew 1:4, Luke 3:32"},
{"id":"ts-411","tier":4,"name":"Shem","type":"person","answer":"BOTH","hint":"One of the three sons who survived the flood with Noah.","refs":"OT: Genesis 5:32; NT: Luke 3:36"},
{"id":"ts-412","tier":4,"name":"Terah","type":"person","answer":"BOTH","hint":"A father who set out from Ur toward Canaan but stopped at Haran.","refs":"OT: Genesis 11:26, 11:31; NT: Luke 3:34"},
{"id":"ts-413","tier":4,"name":"Lamech","type":"person","answer":"BOTH","hint":"A man who boasted of avenging himself seventy-sevenfold.","refs":"OT: Genesis 4:19-24, 5:25; NT: Luke 3:36","note":"Two different Lamechs: Cain's descendant (Genesis 4) and Noah's father (Genesis 5, Luke 3)."},
{"id":"ts-414","tier":4,"name":"Theophilus","type":"person","answer":"NT","hint":"A name usually understood to mean 'friend of God,' addressed by a historian.","refs":"Luke 1:3; Acts 1:1"},
{"id":"ts-415","tier":4,"name":"Epaphras","type":"person","answer":"NT","hint":"A faithful servant who prayed hard for the Colossians.","refs":"Colossians 1:7, 4:12"},
{"id":"ts-416","tier":4,"name":"Onesimus","type":"person","answer":"NT","hint":"A runaway slave sent back with a letter.","refs":"Philemon 1:10-12; Colossians 4:9"},
{"id":"ts-417","tier":4,"name":"Eutychus","type":"person","answer":"NT","hint":"A young man who fell from a window during a very long sermon.","refs":"Acts 20:9-12"},
{"id":"ts-418","tier":4,"name":"Bartholomew","type":"person","answer":"NT","hint":"Listed among the Twelve, paired with Philip in the lists.","refs":"Matthew 10:3; Acts 1:13"},
{"id":"ts-419","tier":4,"name":"Jehoiada","type":"person","answer":"OT","hint":"A priest who protected a hidden boy-king for six years.","refs":"2 Kings 11:1-4"},
{"id":"ts-420","tier":4,"name":"Zephaniah","type":"person","answer":"OT","hint":"A prophet active in the days of King Josiah.","refs":"Zephaniah 1:1"},
{"id":"ts-421","tier":4,"name":"Mephibosheth","type":"person","answer":"OT","hint":"Jonathan's son, lame in both feet after an accident as a child.","refs":"2 Samuel 4:4; 9:6-13"},
{"id":"ts-422","tier":4,"name":"Ichabod","type":"person","answer":"OT","hint":"A baby named 'no glory' after the ark was captured.","refs":"1 Samuel 4:19-22"},
{"id":"ts-423","tier":4,"name":"Nabal","type":"person","answer":"OT","hint":"A wealthy sheep-owner of Carmel whose name means 'fool.'","refs":"1 Samuel 25:3, 25:25"},
{"id":"ts-424","tier":4,"name":"Shibboleth","type":"thing","answer":"OT","hint":"A word that exposed those who could not pronounce it.","refs":"Judges 12:5-6"},
{"id":"ts-425","tier":4,"name":"Peniel","type":"place","answer":"OT","hint":"Jacob named it 'face of God' after wrestling.","refs":"Genesis 32:30"}
]
```

---

# Part 6: The Build Prompt

Paste this into Cursor or Lovable, in the project that already has the engine, the session/lobby system, the design system, and the first three games (Fake-a-Proverb, Tares Among the Wheat, Hot Coal).

````text
You are adding two games to the existing Bible party-games platform. The engine, lobby, Transport interface, plugin registry, shared timer/vote/scoreboard, and Material 3 Expressive design system already exist. Do not change core code except to add small, generic hooks the games need. Nothing in the core may reference a specific game.

GAMES TO ADD
1. "Who Said That?" (id: who-said)
2. "Testament Sort" (id: testament-sort)

Each is a plugin folder implementing the existing Game interface (meta, setup, reduce, phases, HostView, PlayerView, scoring, content loader). Register both in the game registry and show them in the library as cards with their own seed colors.

CONTENT
- Load content from /content/who-said.json and /content/testament-sort.json (I will provide them). Validate at build time with a schema (zod): unique ids, tier in 1..4, who-said has exactly 4 unique options that include the answer, testament-sort answer in OT|NT|BOTH.
- Add a content ledger service shared by both games (see ANTI-REPEAT).

SHARED SERVICE: ANTI-REPEAT LEDGER
- Per device, per game: a seen-IDs set in IndexedDB, with a last-seen timestamp per id.
- On room join, each guest sends a compact seen-set (bitset keyed by question index in the loaded file, plus the file's content version) to the host.
- The host selects each question from the current tier pool, preferring questions seen by the fewest players in the room, ties broken randomly. When fewer than 20% of a tier is unseen for the room, prefer least-recently-seen.
- Selection helpers: no same speaker twice in a row (who-said); cap God/Jesus answers at 1 in 8 per session; balance answer types to about 1/3 OT, 1/3 NT, 1/3 BOTH per session and avoid three consecutive same-type cards (testament-sort).
- Unit-test selection (no repeats within a session, freshness preference, tier schedule, balance).

GAME 1: WHO SAID THAT?
Modes: Race the Clock (solo, 3 strikes, adaptive tier: up after 3 correct in a row, down after 2 wrong), Fastest Finger (individuals), Pair Duel (a pair shares one lock-in, either partner can lock), Team Rush (each member answers, team score is the sum plus Team Sweep).
Session lengths: Quick 12, Standard 20, Marathon 32 questions. Tier = ceil(questionNumber / (length/4)).
Phases: COUNTDOWN(3s) > QUESTION > CLOSE_CALL (starts when the first correct answer locks: timer snaps to min(remaining, 5s)) > REVEAL (5s, host can skip) > LEADERBOARD (every 5 questions) > FINAL.
Intents: ANSWER {optionIndex}, USE_POWERUP {type: "fifty"|"double"|"shield"}.
Player view: the quote in a large hero card, four big pill answer buttons (shuffled per player), a wavy timer, power-up chips. After locking, show "Locked" and what everyone else is doing (count only, not choices).
Host view: the quote large, live count of locks, wavy timer, and after reveal a list of who answered what and how fast.
Reveal: correct speaker, reference, the note; each player sees their own points breakdown.

Scoring (pure functions in scoring.ts with tests):
  timeLimit = clamp(8 + 0.5 * wordCount(quote), 12, 25) seconds; Gentle Mode multiplies by 1.5
  timeFactor = max(0.2, 1 - 0.8 * elapsed / timeLimit)
  base = {1:100, 2:150, 3:200, 4:300}[tier]
  points = round(base * timeFactor)
  firstCorrectBonus (group modes) = +20% of base
  wrong = -25% of base and locked out of the question (0 in Gentle Mode)
  streak multiplier on correct answers: 3 in a row +10%, 5 +20%, 7+ +30%
  Team Sweep = +25% of base when every member of a team answers correctly
  Power-ups, one each per player per game: fifty (hide two wrong options, points x0.5), double (declare before answering: gain and penalty x2), shield (cancels one penalty)
Timing: the host is authoritative. Measure each answer as host receive time minus question start minus half the player's measured round-trip time (ping each guest every 5 seconds). Reject answers that arrive after the question ends. Make the clock robust to reconnects by always sending absolute timestamps with state snapshots.

GAME 2: TESTAMENT SORT
Modes: Solo Practice (3 strikes), Everyone Sorts (individuals, simultaneous, no buzzer), Huddle (pairs/teams: each member picks secretly, majority is the team answer, a tie triggers a 10-second huddle where the team must agree; shared team hint budget of 3), Sort Rush (60 seconds blitz, hints disabled).
The one rule shown in onboarding: a name counts for a testament if that name appears in that testament, even for a different person or place.
Phases: COUNTDOWN > CARD > (HUDDLE if tie) > REVEAL > ... > FINAL.
Intents: PICK {choice: "OT"|"NT"|"BOTH"}, LOCK, USE_HINT.
Player view: a big name card with a type chip (Person/Place/Thing) and a wavy timer; a Hint pill labeled with its cost ("Hint: -40%"); three large pill buttons: Old Testament, New Testament, Both. Tapping a button selects it and a Lock button confirms (solo and everyone-sorts can lock on tap).
Reveal: correct answer, the verse references, any extra note, and (group modes) a distribution bar for how the room voted.
Scoring:
  timeLimit = {1:15, 2:15, 3:12, 4:12} seconds
  timeFactor = max(0.25, 1 - 0.75 * elapsed / timeLimit)
  base = {1:100, 2:150, 3:200, 4:250}[tier]
  hintFactor = 0.6 if the hint was used
  bothBonus = 1.25 when the correct answer is BOTH and the player is right
  points = round(base * timeFactor * hintFactor * bothBonus)
  wrong = 0 (Risk Mode setting: -20% of base)
  streak multiplier like Who Said That?
In Huddle mode a team hint applies hintFactor to every team member's points on that card.
Hints never contain the words "Old Testament" or "New Testament".

SHARED UI (follow the existing Material 3 Expressive design system)
- Each tier has its own tint so the difficulty ramp is visible: tier 1 mint, tier 2 butter yellow, tier 3 lavender, tier 4 blush. Transition smoothly between tiers.
- Large rounded hero card for the prompt, wavy progress timer, pill answer buttons, round tonal icon buttons for Rules and Scoreboard (bottom sheets), floating pill nav hidden during play.
- Rules sheet per game in three steps.
- Settings per session: Gentle Mode, Risk Mode (testament-sort), session length, filters (who-said: Old Testament / New Testament; testament-sort: People / Places / Things / "Namesake Traps").
- Haptics on lock-in and on reveal; respect reduced-motion; do not rely on colour alone to show correct/incorrect.

ROBUSTNESS
- Reconnect during a question restores your lock state and timer.
- Late joiners spectate until the next question.
- Ignore duplicate taps and late answers. If the host disconnects, pause the game and show a "waiting for host" state.
- Ties on the final leaderboard share a rank.

TESTS
- Unit tests for every scoring function with the worked examples: Who Said That? tier 2, limit 15s, correct at 5s as first correct = 140; Testament Sort tier 3, limit 12s, BOTH correct at 4s with a hint = 113.
- Reducer tests for each phase transition, including Close Call, Huddle ties, and powerups.
- Integration test: 6 simulated players through a full Quick game of each.

BUILD ORDER
1. Content schemas, loader, and ledger service with tests.
2. Scoring modules with tests.
3. Testament Sort (simpler), solo and everyone-sorts first, then Huddle and Sort Rush.
4. Who Said That?, Fastest Finger first, then Race the Clock, Pair Duel, Team Rush.
5. Library cards, rules sheets, settings, filters.
After each step, tell me what runs and what is stubbed. Ask before inventing any visual detail not covered by the design system.
````
