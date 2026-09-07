# Content to write

The clone kept every component, animation and layout intact. The entry text
has been emptied, so nothing written for anyone else is live. This is what still
needs writing, and where each piece lives.

Ordered by how visible it is. Section 1 is the substantive one.

---

## 1. The entries themselves — `src/data/dailyEntries.json`

The two seeded entries are the original poems. Replace `title`, `thought` and
`themeTag` on both.

- [ ] Entry `id: 1` — blank, unlocks 2026-09-07. Needs a title, a body and a
      theme tag. Nothing of the original build's writing remains in it.

Day 2 was removed; the journal currently holds a single entry. Adding more is
just appending objects to this array — the nav, timeline and unlock logic all
derive from it, and there is no per-day code to write.

Entries also support optional `subtitle`, `poem`, `photoUrl`, `photoCaption` and
`secretReveal` fields — see [HOW_TO_ADD_POEMS.md](HOW_TO_ADD_POEMS.md). Editing
in the browser (`Cmd+Shift+E`) writes to the cloud bin, not to this file; this
file is the seed for a fresh visitor.

## 2. Day Four's finale — DELETED

`src/components/DayFourElements.jsx` and `src/components/days/DayOne..DayFour.jsx`
were dead code (nothing imported them, and they were tree-shaken out of the
build). They held content written for someone else, so they were removed
before the first commit and never entered git history. Nothing to do here.

## 2b. The opening letter — `src/components/Prologue.jsx`

Written for Bess, so nothing here is carried over. The text lives in the
`STANZAS` array at the top of the file: each object is one screen, and its
`lines` are revealed one at a time. `emphasis: true` gives a stanza the large
handwritten accent treatment; `handoff: true` gives it the italic serif that
matches the hero subtitle it dissolves into.

To change the letter, edit that array — the pacing, progress dots and butterfly
handoff all derive from its length, so adding or removing a stanza needs no
other change.

## 3. Hero and framing copy

- [ ] `src/App.jsx:188` — footer, "Made for Bess."
- [ ] `src/App.jsx` hero subtitle — "A daily journal, written with love,
      unfolding day by day."
- [ ] `index.html` — `<title>` and the description / OG meta tags
- [ ] `src/components/CinematicIntro.jsx:212` — the intro reads
      "a daily thought / Bess's / journal."

## 4. Reaction labels

Wording assumes the reader is a woman ("her", "she"). Fine if that holds,
otherwise adjust:

- [ ] `src/components/PinboardArchive.jsx:264` — "Bess's Whisper"
- [ ] `src/components/PinboardArchive.jsx:294` and
      `src/components/ActiveNoteCard.jsx:230` — the "— Bess ♡" signature
- [ ] The `herReaction` field name in `src/context/TimelineContext.jsx` (cosmetic;
      renaming it means migrating any data already in the bin)

## 5. Media

- [ ] `public/audio/lights-are-on.mp3` — the soundtrack, hardcoded in
      `src/components/AudioSoundscape.jsx:32` with its title shown in the player
      UI at line 54. Swap the file *and* both strings to change songs.
- [ ] `src/assets/hero.png` — carried over but not referenced by any component;
      safe to delete.

## 6. Dates

The timeline now starts **2026-09-07**. Two places define this:

- [ ] `src/data/dailyEntries.json` — the explicit `unlockDate` on each entry
- [ ] `src/context/TimelineContext.jsx:47` — the fallback base date, used for any
      entry with no `unlockDate` (day N unlocks base + N-1 days)

Keep the two consistent if you shift the schedule.

## Not personal — safe to leave

Day 1–3 components, the texture and paper assets, the hand-drawn SVG elements,
the unlock interactions (red string, firecracker rope), the cursor, the canvas
backgrounds, and the export/share modal are all content-agnostic.
