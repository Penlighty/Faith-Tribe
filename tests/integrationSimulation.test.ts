import { describe, it, expect } from 'vitest';
import { MockTransport } from '../src/engine/transport/mockTransport';
import { setupFakeAProverb, reduceFakeAProverb, scoreFakeAProverb } from '../src/games/fake-a-proverb/reducer';
import contentData from '../src/games/fake-a-proverb/content.json';
import { Player, SessionConfig, SessionSnapshot, TransportMessage } from '../src/engine/types';

describe('6-Player Full Round Integration Simulation', () => {
  it('simulates 6 players joining a room and completing a full round of Fake-a-Proverb', async () => {
    const roomCode = 'HOPE';
    const playerNames = ['Host Peter', 'John', 'Mary', 'Martha', 'Luke', 'Barnabas'];

    // 1. Initialize transports for all 6 players
    const transports = playerNames.map(
      () => new MockTransport({ useBroadcastChannel: false })
    );

    const players: Player[] = playerNames.map((name, i) => ({
      id: `player_${i + 1}`,
      name,
      isHost: i === 0,
      avatarSeed: `seed_${i + 1}`,
      score: 0,
    }));

    // Connect all 6 players to the room
    for (let i = 0; i < 6; i++) {
      await transports[i].connect(roomCode, {
        id: players[i].id,
        name: players[i].name,
        isHost: players[i].isHost,
        joinedAt: Date.now(),
      });
    }

    // Verify presence across transports
    const hostPresence = transports[0].getPresence();
    expect(hostPresence).toHaveLength(6);

    // 2. Host initializes game state
    const config: SessionConfig = {
      roomCode,
      selectedGameId: 'fake-a-proverb',
      playMode: 'individuals',
      roundsCount: 6,
      soundEffects: true,
    };

    let gameState = setupFakeAProverb(config, players, [], contentData as any);
    expect(gameState.roundNumber).toBe(1);

    // Track latest snapshot received on each player device
    const playerReceivedSnapshots: (SessionSnapshot | null)[] = new Array(6).fill(null);
    transports.forEach((transport, index) => {
      transport.onMessage((msg: TransportMessage<any>) => {
        if (msg.type === 'SNAPSHOT') {
          playerReceivedSnapshots[index] = msg.payload;
        }
      });
    });

    // Host broadcasts initial snapshot (Phase: prompt)
    let currentSnapshot: SessionSnapshot = {
      version: 1,
      gameId: 'fake-a-proverb',
      roomCode,
      status: 'in_game',
      config,
      players,
      teams: [],
      gameState,
    };

    await transports[0].send('SNAPSHOT', currentSnapshot, currentSnapshot.version);

    // Verify all 6 players received the prompt snapshot
    for (let i = 0; i < 6; i++) {
      expect(playerReceivedSnapshots[i]?.version).toBe(1);
      expect(playerReceivedSnapshots[i]?.gameState.currentProverb.firstHalf).toBeTruthy();
    }

    // 3. Advance to WRITE phase
    gameState = {
      ...gameState,
      phaseIndex: 1,
      currentPhaseId: 'write',
    };

    // All 5 non-host players submit fake endings via INTENT
    for (let i = 1; i < 6; i++) {
      const intent = {
        type: 'SUBMIT_ENDING',
        playerId: players[i].id,
        payload: { ending: `Clever fake ending from ${players[i].name}` },
        timestamp: Date.now(),
      };

      // Player sends intent over transport
      await transports[i].send('INTENT', intent);
      // Host reduces intent
      gameState = reduceFakeAProverb(gameState, intent, players[i].id);
    }

    expect(Object.keys(gameState.submissions)).toHaveLength(5);

    // 4. Host prepares voting and advances to VOTE phase
    gameState = reduceFakeAProverb(
      gameState,
      {
        type: 'PREPARE_VOTING',
        playerId: 'HOST',
        payload: {},
        timestamp: Date.now(),
      },
      'HOST'
    );

    gameState = {
      ...gameState,
      phaseIndex: 2,
      currentPhaseId: 'vote',
    };

    expect(gameState.shuffledEndings.length).toBe(6); // 1 real + 5 fakes

    // 5. All 6 players cast their votes
    // Players 0, 1, 2 vote for the real ending!
    // Players 3, 4, 5 vote for John's fake ending (player_2)
    const realEnding = gameState.currentProverb.realEnding;
    const johnsFake = gameState.submissions['player_2'];

    for (let i = 0; i < 3; i++) {
      const voteIntent = {
        type: 'SUBMIT_VOTE',
        playerId: players[i].id,
        payload: { choiceEnding: realEnding },
        timestamp: Date.now(),
      };
      gameState = reduceFakeAProverb(gameState, voteIntent, players[i].id);
    }

    for (let i = 3; i < 6; i++) {
      const voteIntent = {
        type: 'SUBMIT_VOTE',
        playerId: players[i].id,
        payload: { choiceEnding: johnsFake },
        timestamp: Date.now(),
      };
      gameState = reduceFakeAProverb(gameState, voteIntent, players[i].id);
    }

    expect(Object.keys(gameState.votes)).toHaveLength(6);

    // 6. Host calculates round scores and advances to REVEAL
    gameState = reduceFakeAProverb(
      gameState,
      {
        type: 'CALCULATE_ROUND_SCORES',
        playerId: 'HOST',
        payload: {},
        timestamp: Date.now(),
      },
      'HOST'
    );

    gameState = {
      ...gameState,
      phaseIndex: 3,
      currentPhaseId: 'reveal',
    };

    // Verify scoring:
    // Players 0, 1, 2 voted real ending -> +1 point each
    expect(gameState.roundScores['player_1']).toBe(1);
    // player_2 voted real ending (+1) and received 3 votes for his fake (+3) = 4 points (3 is exactly half of 6, not > half)
    expect(gameState.roundScores['player_2']).toBe(1 + 3);
    expect(gameState.roundScores['player_3']).toBe(1);
    expect(gameState.roundScores['player_4']).toBe(0);

    // Broadcast final round reveal snapshot
    currentSnapshot = {
      version: 2,
      gameId: 'fake-a-proverb',
      roomCode,
      status: 'in_game',
      config,
      players: players.map((p) => ({ ...p, score: gameState.scores[p.id] })),
      teams: [],
      gameState,
    };

    await transports[0].send('SNAPSHOT', currentSnapshot, currentSnapshot.version);

    // Check that all 6 players received updated scores
    for (let i = 0; i < 6; i++) {
      expect(playerReceivedSnapshots[i]?.version).toBe(2);
      expect(playerReceivedSnapshots[i]?.gameState.scores['player_2']).toBe(4);
    }

    // Leaderboard validation
    const leaderboard = scoreFakeAProverb(gameState, currentSnapshot.players, []);
    expect(leaderboard[0].id).toBe('player_2');
    expect(leaderboard[0].rank).toBe(1);
    expect(leaderboard[0].score).toBe(4);

    // Disconnect all transports cleanly
    for (let i = 0; i < 6; i++) {
      await transports[i].disconnect();
    }
  });

  it('simulates 6 players joining and completing a round of Who Said That? with Close Call and First Correct bonus', async () => {
    const roomCode = 'HOLY';
    const playerNames = ['Peter', 'James', 'John', 'Andrew', 'Philip', 'Thomas'];
    const players: Player[] = playerNames.map((name, i) => ({
      id: `ws_player_${i + 1}`,
      name,
      isHost: i === 0,
      avatarSeed: `seed_ws_${i + 1}`,
      score: 0,
    }));

    const config: SessionConfig = {
      roomCode,
      selectedGameId: 'who-said',
      playMode: 'individuals',
      roundsCount: 12,
      soundEffects: true,
    };

    const { setupWhoSaid, reduceWhoSaid, scoreWhoSaid } = await import('../src/games/who-said/reducer');
    const { allWhoSaidItems } = await import('../src/engine/content/loader');

    let gameState = setupWhoSaid(config, players, [], allWhoSaidItems);
    expect(gameState.roundNumber).toBe(1);
    expect(gameState.mode).toBe('fastest_finger');

    // Start question
    gameState = reduceWhoSaid(
      gameState,
      { type: 'START_QUESTION', playerId: players[0].id, payload: {}, timestamp: Date.now() },
      players[0].id
    );
    expect(gameState.currentPhaseId).toBe('question');

    const correctAnswer = gameState.currentQuestion.answer;
    const wrongAnswer = gameState.currentQuestion.options.find((o) => o !== correctAnswer)!;

    // Player 1 (Peter) answers correctly at 2s (first correct)
    gameState = reduceWhoSaid(
      gameState,
      {
        type: 'ANSWER',
        playerId: players[0].id,
        payload: { optionSpeaker: correctAnswer, elapsedSeconds: 2 },
        timestamp: Date.now(),
      },
      players[0].id
    );

    // Verify Close Call is triggered
    expect(gameState.isCloseCall).toBe(true);
    expect(gameState.firstCorrectPlayerId).toBe(players[0].id);

    // Players 2, 3, 4 answer correctly under scramble at 4s
    for (let i = 1; i <= 3; i++) {
      gameState = reduceWhoSaid(
        gameState,
        {
          type: 'ANSWER',
          playerId: players[i].id,
          payload: { optionSpeaker: correctAnswer, elapsedSeconds: 4 },
          timestamp: Date.now(),
        },
        players[i].id
      );
    }

    // Players 5 & 6 answer wrong
    for (let i = 4; i < 6; i++) {
      gameState = reduceWhoSaid(
        gameState,
        {
          type: 'ANSWER',
          playerId: players[i].id,
          payload: { optionSpeaker: wrongAnswer, elapsedSeconds: 4.5 },
          timestamp: Date.now(),
        },
        players[i].id
      );
    }

    // All 6 players answered -> transitions to reveal
    expect(gameState.currentPhaseId).toBe('reveal');
    expect(gameState.scores[players[0].id]).toBeGreaterThan(gameState.scores[players[1].id]);

    const leaderboard = scoreWhoSaid(gameState, players, []);
    expect(leaderboard[0].id).toBe(players[0].id);
    expect(leaderboard[0].rank).toBe(1);
  });

  it('simulates 6 players joining and completing a round of Testament Sort with Hint and Room Tally', async () => {
    const roomCode = 'ZION';
    const playerNames = ['Mary', 'Martha', 'Lydia', 'Priscilla', 'Phoebe', 'Dorcas'];
    const players: Player[] = playerNames.map((name, i) => ({
      id: `ts_player_${i + 1}`,
      name,
      isHost: i === 0,
      avatarSeed: `seed_ts_${i + 1}`,
      score: 0,
    }));

    const config: SessionConfig = {
      roomCode,
      selectedGameId: 'testament-sort',
      playMode: 'individuals',
      roundsCount: 12,
      soundEffects: true,
    };

    const { setupTestamentSort, reduceTestamentSort, scoreTestamentSort } = await import('../src/games/testament-sort/reducer');
    const { allTestamentSortItems } = await import('../src/engine/content/loader');

    let gameState = setupTestamentSort(config, players, [], allTestamentSortItems);
    expect(gameState.roundNumber).toBe(1);

    // Start card
    gameState = reduceTestamentSort(
      gameState,
      { type: 'START_CARD', playerId: players[0].id, payload: {}, timestamp: Date.now() },
      players[0].id
    );
    expect(gameState.currentPhaseId).toBe('card');

    const correctAnswer = gameState.currentCard.answer;

    // Player 1 uses hint and locks in correct answer
    gameState = reduceTestamentSort(
      gameState,
      { type: 'USE_HINT', playerId: players[0].id, payload: {}, timestamp: Date.now() },
      players[0].id
    );
    gameState = reduceTestamentSort(
      gameState,
      { type: 'PICK', playerId: players[0].id, payload: { choice: correctAnswer }, timestamp: Date.now() },
      players[0].id
    );
    gameState = reduceTestamentSort(
      gameState,
      { type: 'LOCK', playerId: players[0].id, payload: { elapsedSeconds: 4 }, timestamp: Date.now() },
      players[0].id
    );

    // Remaining players pick and lock
    for (let i = 1; i < 6; i++) {
      const choice = i < 4 ? correctAnswer : (correctAnswer === 'OT' ? 'NT' : 'OT');
      gameState = reduceTestamentSort(
        gameState,
        { type: 'PICK', playerId: players[i].id, payload: { choice }, timestamp: Date.now() },
        players[i].id
      );
      gameState = reduceTestamentSort(
        gameState,
        { type: 'LOCK', playerId: players[i].id, payload: { elapsedSeconds: 6 }, timestamp: Date.now() },
        players[i].id
      );
    }

    // All 6 locked -> transitions to reveal
    expect(gameState.currentPhaseId).toBe('reveal');
    expect(gameState.roundTally[correctAnswer]).toBe(4);

    const leaderboard = scoreTestamentSort(gameState, players, []);
    expect(leaderboard.length).toBe(6);
    expect(leaderboard[0].score).toBeGreaterThan(0);
  });
});
