import { gameRegistry } from '../engine/registry';
import { fakeAProverbPlugin } from './fake-a-proverb';
import { hotCoalPlugin } from './hot-coal';
import { taresPlugin } from './tares-among-the-wheat';
import { whoSaidPlugin } from './who-said';
import { testamentSortPlugin } from './testament-sort';
import { shelfRushPlugin } from './shelf-rush';

export function registerLaunchGames() {
  gameRegistry.register(fakeAProverbPlugin);
  gameRegistry.register(hotCoalPlugin);
  gameRegistry.register(taresPlugin);
  gameRegistry.register(whoSaidPlugin);
  gameRegistry.register(testamentSortPlugin);
  gameRegistry.register(shelfRushPlugin);
}

