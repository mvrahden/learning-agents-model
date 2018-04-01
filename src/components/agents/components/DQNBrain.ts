import { DQNSolver, Env, DQNOpt } from 'reinforce-js';

export class DQNBrain extends DQNSolver {
  constructor(env: Env, opt: DQNOpt) {
    super(env, opt);
  }

  /**
   * Load brain State into current solver
   * @param brainState - as JSON string
   */
  public load(brainState: object): void {
    this.fromJSON(brainState as { ns, nh, na, net });
  }
}
