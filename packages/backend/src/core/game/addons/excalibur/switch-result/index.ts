import type { HistoryElement, THistoryData } from '@/core/game/history';
import type { THistoryStage, TMissionResult } from '@avalon/types';
import type { IPlayerInGame } from '@/core/game';
import type { TDataForManagerOptions } from '@/core/game/history';

export class SwitchResult implements HistoryElement<'switchResult'> {
  type = 'switchResult' as const;
  data: THistoryData['switchResult'];
  stage: THistoryStage;
  canBeHidden: boolean = true;

  constructor(switcher: IPlayerInGame, target?: IPlayerInGame, result?: TMissionResult) {
    this.data = {
      switcher,
      target,
      result,
    };

    this.stage = 'finished';
  }

  dataForManager(options: TDataForManagerOptions) {
    const switcherID = this.data.switcher.userID;
    const targetID = this.data.target?.userID;

    const switchData = {
      type: this.type,
      result: this.data.result,
      switcherID: this.data.switcher.userID,
      targetID: this.data.target?.userID,
    };

    if (options.game.stage === 'end' || options.userID === targetID || options.userID === switcherID) {
      return switchData;
    }

    delete switchData['result'];

    return switchData;
  }
}
