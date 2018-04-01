import { World } from './../World';
import { Item } from './Item';
import { Opt, Env } from 'reinforce-js';

export interface Agent {
  reset(): void;
  load(brainState: object): void;

  observe(world: World);
  decide(): void;
  act(world: World): void;
  learn(): void;
  /**
   * Get rewards from collision and return true if collided.
   * @param Item to be evaluated
   * @returns true if item was collided
   */
  processCollision(item: Item): boolean;
  getOpt(): Opt;
  getEnv(): Env;
}
