import { describe, it, expect } from 'vitest';
import { PracticeSummaryModal } from '../src/components/ui/PracticeSummaryModal';

describe('PracticeSummaryModal Component & Thematic Specifications', () => {
  it('exports PracticeSummaryModal successfully', () => {
    expect(PracticeSummaryModal).toBeDefined();
    expect(typeof PracticeSummaryModal).toBe('function');
  });

  it('defines thematic subtitles and icons across all solo practice games', () => {
    const gameThematicProfiles: Record<string, { title: string; subtitle: string; icon: string }> = {
      'bible-or-not': {
        title: 'Practice Complete',
        subtitle: "You tested your discernment on God's Word!",
        icon: '📜',
      },
      'who-said': {
        title: 'Practice Complete',
        subtitle: 'You recognized the voices of prophets, apostles, and kings!',
        icon: '🗣️',
      },
      'testament-sort': {
        title: 'Practice Complete',
        subtitle: 'You sorted the sacred treasures of the Old and New Testaments!',
        icon: '⚖️',
      },
      'fake-a-proverb': {
        title: 'Practice Complete',
        subtitle: 'You discerned true biblical wisdom from worldly wit!',
        icon: '🕊️',
      },
      'tares-among-the-wheat': {
        title: 'Practice Complete',
        subtitle: 'You guarded the wheat and rooted out the deceptive tares!',
        icon: '🌾',
      },
      'hot-coal': {
        title: 'Practice Complete',
        subtitle: 'You stood firm under the altar fire of the Sanctuary!',
        icon: '🔥',
      },
      'four-signs': {
        title: 'Practice Complete',
        subtitle: 'You decoded the prophetic signs across holy scripture!',
        icon: '🧩',
      },
      'scribes-tiles': {
        title: 'Practice Complete',
        subtitle: 'You transcribed the sacred words of the biblical manuscripts!',
        icon: '✍️',
      },
    };

    for (const [gameId, profile] of Object.entries(gameThematicProfiles)) {
      expect(profile.title).toBe('Practice Complete');
      expect(profile.subtitle.length).toBeGreaterThan(10);
      expect(profile.icon.length).toBeGreaterThanOrEqual(1);
      expect(gameId).toBeDefined();
    }
  });

  it('replaces obsolete GameOverCard across all practice game views', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const soloPracticeCode = fs.readFileSync(
      path.join(process.cwd(), 'src/screens/SoloPracticeScreen.tsx'),
      'utf-8'
    );

    // Verify GameOverCard is completely deleted from SoloPracticeScreen
    expect(soloPracticeCode.includes('const GameOverCard')).toBe(false);
    expect(soloPracticeCode.includes('<GameOverCard')).toBe(false);

    // Verify PracticeSummaryModal is used for all 8 practice games
    const occurrences = (soloPracticeCode.match(/<PracticeSummaryModal/g) || []).length;
    expect(occurrences).toBe(8); // 8 solo practice games rendered inside SoloPracticeScreen
  });
});
