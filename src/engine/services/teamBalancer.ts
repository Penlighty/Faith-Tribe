import { Player, Team, PlayMode } from '../types';

const TEAM_NAMES = ['Team Alpha', 'Team Omega', 'Team Galilee', 'Team Antioch'];
const TEAM_COLORS = ['#CFEFD2', '#F9D6DB', '#EDE58C', '#FCE3C8'];

/**
 * Balances players into pairs or teams automatically
 */
export function balanceTeams(players: Player[], mode: PlayMode): { players: Player[]; teams: Team[] } {
  if (mode === 'individuals') {
    return {
      players: players.map((p) => ({ ...p, teamId: undefined })),
      teams: [],
    };
  }

  const numTeams = mode === 'pairs' ? Math.max(1, Math.ceil(players.length / 2)) : 2;
  const teams: Team[] = Array.from({ length: numTeams }).map((_, i) => ({
    id: `team_${i + 1}`,
    name: mode === 'pairs' ? `Pair ${i + 1}` : TEAM_NAMES[i % TEAM_NAMES.length],
    color: TEAM_COLORS[i % TEAM_COLORS.length],
    playerIds: [],
    score: 0,
  }));

  // Shuffled or distributed assignment
  const updatedPlayers = players.map((player, index) => {
    const targetTeam = teams[index % numTeams];
    targetTeam.playerIds.push(player.id);
    return {
      ...player,
      teamId: targetTeam.id,
    };
  });

  return { players: updatedPlayers, teams };
}
