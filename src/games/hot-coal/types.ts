import { BaseGameState } from '../../engine/types';

export interface CategoryItem {
  name: string;
  aliases: string[];
}

export interface HotCoalCategory {
  id: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  items: CategoryItem[];
  references: string[];
  needsReview?: boolean;
}

export interface HotCoalContent {
  categories: HotCoalCategory[];
}

export interface HotCoalState extends BaseGameState {
  currentCategory: HotCoalCategory;
  plannedCategories?: HotCoalCategory[];
  coalHolderId: string;
  fuseDurationSeconds: number;
  fuseRemainingSeconds: number;
  burnCount: Record<string, number>; // playerId -> number of burns
  passedPlayerIds: string[];
  activeChallenge: {
    challengerId: string;
    challengedId: string;
    resolved: boolean;
    loserId?: string;
  } | null;
  lastBurnedPlayerId?: string;
}
