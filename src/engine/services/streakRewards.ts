export interface StreakMilestone {
  count: number;
  title: string;
  subtitle: string;
  badge: string;
  levelTag: string;
  soundType: 'milestone3' | 'milestone5' | 'milestone7' | 'milestone10' | 'milestone15' | 'milestone20';
}

export const STREAK_MILESTONES: Record<number, StreakMilestone> = {
  3: {
    count: 3,
    title: "Nice! You're on a roll!",
    subtitle: '3 in a row! Keep the fire burning bright!',
    badge: '🔥',
    levelTag: 'On Fire!',
    soundType: 'milestone3',
  },
  5: {
    count: 5,
    title: 'Awesome! Speedy! ⚡',
    subtitle: '5 in a row! Running the race with divine swiftness!',
    badge: '⚡',
    levelTag: 'Speedy!',
    soundType: 'milestone5',
  },
  7: {
    count: 7,
    title: 'Elijah Level! ⚡🔥',
    subtitle: '7 in a row! Calling down fire from heaven! Supercharged speed!',
    badge: '🔥⚡',
    levelTag: 'Elijah Level!',
    soundType: 'milestone7',
  },
  10: {
    count: 10,
    title: "Solomon's Wisdom! 👑",
    subtitle: '10 in a row! A discerning heart rich in divine understanding!',
    badge: '👑',
    levelTag: "King's Wisdom!",
    soundType: 'milestone10',
  },
  15: {
    count: 15,
    title: "David's Zeal! 🏹",
    subtitle: '15 in a row! Fearless faith and unwavering accuracy!',
    badge: '🏹',
    levelTag: "Champion's Zeal!",
    soundType: 'milestone15',
  },
  20: {
    count: 20,
    title: "Paul's Endurance! 🛡️",
    subtitle: '20 in a row! Fought the good fight and kept the faith!',
    badge: '🛡️',
    levelTag: 'Legendary Faith!',
    soundType: 'milestone20',
  },
};

export function getStreakMilestone(streak: number): StreakMilestone | null {
  if (STREAK_MILESTONES[streak]) {
    return STREAK_MILESTONES[streak];
  }
  // For streaks > 20 every 5 questions:
  if (streak > 20 && streak % 5 === 0) {
    return {
      count: streak,
      title: `${streak} in a Row! Heavenly Glow! ✨`,
      subtitle: 'Unshakable knowledge of the Holy Scriptures!',
      badge: '✨',
      levelTag: 'Transcendent!',
      soundType: 'milestone20',
    };
  }
  return null;
}

const CORRECT_ENCOURAGEMENTS: string[] = [
  'Nice!',
  'Awesome!',
  'Spot on!',
  'Scripture Sharp! 📖',
  'Amen! ✨',
  'Walking in the Light! ☀️',
  'Disciple of the Word! 🕊️',
  'Truth Prevails! 🛡️',
  'Blessed Insight! 💡',
  'Sharp as an Arrow! 🏹',
  'Wisdom in Action! ⭐',
  'Faithful and True! 🌟',
];

const WRONG_ENCOURAGEMENTS: string[] = [
  'Keep pressing on! 🏃‍♂️',
  'Grace for the journey! 🕊️',
  'Almost had it! You got the next one!',
  'The righteous rise again! 💪',
  'Good effort! Store this verse in your heart!',
  'Never give up! Wisdom comes with every step!',
  'Keep your faith high! You are learning!',
  'Press toward the mark! 🎯',
];

export function getRandomEncouragement(isCorrect: boolean): string {
  const pool = isCorrect ? CORRECT_ENCOURAGEMENTS : WRONG_ENCOURAGEMENTS;
  return pool[Math.floor(Math.random() * pool.length)];
}
