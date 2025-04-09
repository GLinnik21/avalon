import type { TVisibility } from '@/core/roles/interface';
import type { Game } from '@/core/game';
import type { TRoles, TLoyalty, TMissionResult } from '@avalon/types';

export abstract class Character {
  /**
   * Real role of character
   */
  abstract role: TRoles;

  /**
   * The role that the player sees himself
   */
  abstract selfRole: TRoles;

  /**
   * The team the player plays in
   */
  abstract loyalty: TLoyalty;

  /**
   * Visibility of other roles for this character
   */
  abstract visibility: TVisibility;

  /**
   * Instance of game
   */
  protected game: Game;

  constructor(game: Game) {
    this.game = game;
  }

  /**
   * Possible mission results
   */
  get validMissionResult(): TMissionResult[] {
    if (this.loyalty === 'good') {
      return ['success'];
    }

    return ['fail', 'success'];
  }

  /**
   * Loyalty during various checks
   */
  get visibleLoyalty(): TLoyalty {
    return this.loyalty;
  }
}
