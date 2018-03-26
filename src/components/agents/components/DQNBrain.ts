import { DQNSolver, Env, DQNOpt } from 'reinforce-js';

export class DQNBrain extends DQNSolver {
  constructor(env: Env, opt: DQNOpt) {
    super(env, opt);
  }
}
