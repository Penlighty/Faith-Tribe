import { GameId, GAME_VISUALS, GameVisual } from './games';

export type VisualGameId = GameId;

/**
 * Maps repository game IDs (e.g. 'who-said') to the custom icon kit's GameId (e.g. 'who-said-that').
 */
export function toVisualGameId(id: string): GameId {
  if (id === 'who-said' || id === 'who-said-that') {
    return 'who-said-that';
  }
  if (id in GAME_VISUALS) {
    return id as GameId;
  }
  return 'fake-a-proverb';
}

/**
 * Retrieves the GameVisual data for a game id.
 */
export function getGameVisual(id: string): GameVisual {
  const visualId = toVisualGameId(id);
  return GAME_VISUALS[visualId];
}

export const GAME_IDS = Object.keys(GAME_VISUALS) as GameId[];
