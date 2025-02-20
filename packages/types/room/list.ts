import type { IGameOptions, GameResults } from '@avalon/types';

export type TRoomsList = TRoomInfo[];

export type TRoomInfo = {
  host: string;
  players: number;
  state: 'created' | 'started' | 'locked';
  uuid: string;
  options: IGameOptions;
  createTime: string;
  startTime?: string;
  result?: GameResults;
};
