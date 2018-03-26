import { R } from 'recurrent-js';
import { DQNOpt, DQNEnv } from 'reinforce-js';

import { RLAgent } from './RLAgent';

import { DQNBrain } from './components/DQNBrain';
import { Sensor } from './components/Sensor';
import { Lidar } from './components/Lidar';
import { Radar } from './components/Radar';
import { Sensory } from './components/Sensory';
import { Point2D } from '../../utils/Point2D';

export class RLAgentFactory {

  private tick: number = -1;
  private readonly width: number;
  private readonly height: number;
  private readonly numberOfActions: number;

  constructor(width: number, height: number, numberOfActions: number = 4) {
    this.width = width;
    this.height = height;
    this.numberOfActions = numberOfActions;
  }

  private creatEyeDQNAgent(x: number, y: number): RLAgent {
    const sensory = this.createEyeSensory();
    const brain = this.tick === 0 ? this.createDefaultBrain(sensory) : this.createRandomSizedBrain(sensory);
    const agent = new RLAgent(this.tick, brain, sensory, new Point2D(x, y));
    return agent;
  }

  private createRadarDQNAgent(x: number, y: number): RLAgent {
    const sensory = this.createRadarSensory();
    const brain = this.tick === 1 ? this.createDefaultBrain(sensory) : this.createRandomSizedBrain(sensory);
    const agent = new RLAgent(this.tick, brain, sensory, new Point2D(x, y));
    return agent;
  }

  private createDefaultBrain(sensory: Sensory): DQNBrain {
    const numberOfStates = this.determineNumberOfStates(sensory);
    const env = new DQNEnv(this.width, this.height, numberOfStates, this.numberOfActions);
    const opt = new DQNOpt();
    opt.setTrainingMode(true); // allows epsilon decay
    opt.setNumberOfHiddenUnits(100); // number of neurons in hidden layer
    opt.setEpsilonDecay(1.0, 0.1, 1e6); // initial epsilon for epsilon-greedy policy, 
    opt.setEpsilon(0.05); // initial epsilon for epsilon-greedy policy, 
    opt.setGamma(0.9);
    opt.setAlpha(0.005); // value function learning rate
    opt.setLossClipping(true); // initial epsilon for epsilon-greedy policy, 
    opt.setLossClamp(1.0); // for robustness
    opt.setRewardClipping(true); // initial epsilon for epsilon-greedy policy, 
    opt.setRewardClamp(1.0); // initial epsilon for epsilon-greedy policy, 
    opt.setExperienceSize(1e6); // size of experience
    opt.setReplayInterval(5); // number of time steps before we add another experience to replay memory
    opt.setReplaySteps(5);
    // outfit brain with environment complexity and specs
    const brain = new DQNBrain(env, opt);
    return brain;
  }

  private createRandomSizedBrain(sensory: Sensory): DQNBrain {
    const numberOfStates = this.determineNumberOfStates(sensory);
    const env = new DQNEnv(this.width, this.height, numberOfStates, this.numberOfActions);
    const opt = new DQNOpt();
    opt.setTrainingMode(true); // allows epsilon decay
    opt.setNumberOfHiddenUnits(R.randi(20, 100)); // number of neurons in hidden layer
    opt.setEpsilonDecay(1.0, 0.1, 1e6); // initial epsilon for epsilon-greedy policy
    opt.setEpsilon(0.05); // initial epsilon for epsilon-greedy policy
    opt.setGamma(0.9);
    opt.setAlpha(0.005); // value function learning rate
    opt.setLossClipping(true); // initial epsilon for epsilon-greedy policy, 
    opt.setLossClamp(1.0); // for robustness
    opt.setRewardClipping(true); // initial epsilon for epsilon-greedy policy, 
    opt.setRewardClamp(1.0); // initial epsilon for epsilon-greedy policy, 
    opt.setExperienceSize(1e6); // size of experience
    opt.setReplayInterval(5); // number of time steps before we add another experience to replay memory
    opt.setReplaySteps(5);
    // outfit brain with environment complexity and specs
    const brain = new DQNBrain(env, opt);
    return brain;
  }

  private determineNumberOfStates(sensory: Sensory): number {
    return sensory.getSensoryState().length + 2;
  }

  private createEyeSensory(): Sensory {
    const sensors = new Array<Sensor>();
    const numOfSensors = 25;
    const sensoryRange = 95;
    for (let i = 0; i < numOfSensors; i++) {
      sensors.push(new Lidar(i, i * (2 * Math.PI) / numOfSensors, sensoryRange));
    }
    return new Sensory(sensors);
  }

  private createRadarSensory(): Sensory {
    const sensors = new Array<Sensor>();
    const numOfSensors = 25;
    const fieldsPerRow = Math.sqrt(numOfSensors);

    const referenceLength = 95;
    const sensoryRange = Math.sqrt(Math.pow(referenceLength, 2) * Math.PI) / 2; // range with same area as circle(radius=referenceLength)
    const fieldLength = sensoryRange * 2 / fieldsPerRow;

    for (let row = 0; row < fieldsPerRow; row++) {
      for (let col = 0; col < fieldsPerRow; col++) {
        const xOffset = - (fieldLength * fieldsPerRow / 2) + (fieldLength * col);
        const yOffset = - (fieldLength * fieldsPerRow / 2) + (fieldLength * row);
        const id = (row * fieldsPerRow) + col;
        sensors.push(new Radar(id, row, col, fieldLength, xOffset, yOffset));
      }
    }

    return new Sensory(sensors);
  }

  public createRandomDQNAgent(): RLAgent {
    const x = R.randf(20, this.width - 20);
    const y = R.randf(20, this.height - 20);
    if (this.tick % 2 !== 0) {
      this.tick++;
      return this.creatEyeDQNAgent(x, y);
    }
    else {
      this.tick++;
      return this.createRadarDQNAgent(x, y);
    }
  }
}
