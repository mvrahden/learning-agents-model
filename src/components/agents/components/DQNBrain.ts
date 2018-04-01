import { DQNSolver, Env, DQNOpt } from 'reinforce-js';

export class DQNBrain extends DQNSolver {
  constructor(env: Env, opt: DQNOpt) {
    super(env, opt);
  }

  /**
   * Load brain State into current solver
   * @param brainState - as JSON string
   */
  public load(brainState: string): void {
    const brain = JSON.parse(brainState);
    this.fromJSON(brain);
  }
}
