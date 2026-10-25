export const SHELF_RUSH_COPY = {
  gameName: 'Shelf Rush',
  campaignName: 'The Ascent',
  tagline: 'Sort books of the Bible into biblical bins at high speed!',
  sortIt: 'Sort it!',
  correct: 'Well sorted',
  wrong: (book: string, bin: string) => `Not quite: ${book} is ${bin}`,
  newQuestion: 'New question',
  restStop: 'Rest stop: +1 life',
  results: {
    summitReached: 'Summit reached',
    deckComplete: 'Deck complete',
    runOver: 'Run over',
  },
  practiceReveal: 'Next',
  emptyWeakBooks: "Play a few runs first and we'll find your tricky books",
  forgivingHelp: 'Forgiving: earn lives back as you go',
  strictHelp: 'Strict: no lives are ever earned back',
  rulesSteps: [
    'A book of the Bible appears on the card.',
    'Sort it into the correct biblical bin before time runs out.',
    'Three strikes and the run ends! Climb higher for run bonuses.',
  ],
};
