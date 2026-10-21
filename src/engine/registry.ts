import { GamePlugin, BaseGameState } from './types';

class GameRegistry {
  private games = new Map<string, GamePlugin<any, any>>();

  register<S extends BaseGameState, C = any>(plugin: GamePlugin<S, C>) {
    if (this.games.has(plugin.meta.id)) {
      console.warn(`Game plugin ${plugin.meta.id} already registered. Overwriting.`);
    }
    this.games.set(plugin.meta.id, plugin);
  }

  get(id: string): GamePlugin<any, any> | undefined {
    return this.games.get(id);
  }

  getAll(): GamePlugin<any, any>[] {
    return Array.from(this.games.values());
  }

  getAllMeta() {
    return this.getAll().map((g) => g.meta);
  }

  updateContent(id: string, content: any): boolean {
    const game = this.games.get(id);
    if (game) {
      game.content = content;
      return true;
    }
    return false;
  }
}

export const gameRegistry = new GameRegistry();
