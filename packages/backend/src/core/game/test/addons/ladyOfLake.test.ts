import { generateNewGame } from '@/core/game/test/const';
import * as _ from 'lodash';

let { game, gameHelper } = generateNewGame();

describe('Lady of the lake', () => {
  beforeAll(() => {
    const restart = generateNewGame({ ladyOfLake: true });
    game = restart.game;
    gameHelper = restart.gameHelper;
  });

  test('Last player have lady of lake card', () => {
    expect(game.addons.ladyOfLake).toBeTruthy();

    const player = game.players.find((player) => player.features.ladyOfLake === 'has');
    expect(player).toBeTruthy();

    const leader = player?.next;
    expect(leader?.features.isLeader).toBeTruthy();
  });

  test('After second mission you can state lady of lake', () => {
    gameHelper
      .selectPlayersOnMission(1)
      .sentSelectedPlayers()
      .makeVotes()
      .makeActions(1)
      .selectPlayersOnMission(1)
      .sentSelectedPlayers()
      .makeVotes()
      .makeActions(1);

    for (let i = 0; i < 3; i += 1) {
      expect(game.stage).toBe('checkLoyalty');

      gameHelper.useLadyOfLake();

      expect(game.stage).toBe('announceLoyalty');

      gameHelper.announceLoyalty('evil');

      const lastHistoryEl = _.last(game.history)!;

      expect(lastHistoryEl.type).toBe('checkLoyalty');
      expect(lastHistoryEl.data.result).toBe('evil');

      gameHelper.selectPlayersOnMission().sentSelectedPlayers().makeVotes().makeActions();
    }
  });

  test('Shouldnt start after last mission session', () => {
    expect(game.stage === 'checkLoyalty').toBeFalsy();
  });

  test('Lancelots should switch before lady of lake', () => {
    const restart = generateNewGame({ ladyOfLake: true }, { goodLancelot: 1, evilLancelot: 1 });
    game = restart.game;
    gameHelper = restart.gameHelper;

    gameHelper
      .selectPlayersOnMission(1)
      .sentSelectedPlayers()
      .makeVotes()
      .makeActions(1)
      .selectPlayersOnMission(1)
      .sentSelectedPlayers()
      .makeVotes()
      .makeActions(1);

    expect(game.stage).toBe('checkLoyalty');
    expect(_.last(game.history)!.type).toBe('switchLancelots');
  });
});
