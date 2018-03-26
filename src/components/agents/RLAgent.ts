import { Env, Opt } from 'reinforce-js';

import { SensedObject } from './components/utils/SensedObject';

import { Point2D } from './../../utils/Point2D';

import { World } from './../../World';
import { Agent } from '../Agent';
import { Item } from '../Item';

import { DQNBrain } from './components/DQNBrain';
import { Sensory } from './components/Sensory';
import { WorldObject } from '../WorldObject';


export class RLAgent extends WorldObject implements Agent {

  public readonly sensory: Sensory;
  public readonly brain: DQNBrain;

  private actionIndex: number;

  private consumptionReward: number;
  private sensoryReward: number;
  private totalReward: number;

  private readonly velocityDiscountFactor: number = 0.95;

  constructor(id: number, brain: DQNBrain, sensory: Sensory, location: Point2D) {
    super(id, 3, 10, location, new Point2D(0, 0));

    this.sensory = sensory;
    this.brain = brain;
    this.actionIndex = 0;

    this.reset();
  }

  public reset(): void {
    this.totalReward = 0;
    this.consumptionReward = 0;
    this.sensoryReward = 0;

    this.sensory.reset();
  }

  public setTrainingModeTo(trainingMode: boolean): any {
    this.brain.setTrainingModeTo(trainingMode);
  }


  public getOpt(): Opt {
    return this.brain.getOpt();
  }

  public getEnv(): Env {
    return this.brain.getEnv();
  }

  public observe(world: World): void {
    this.sensory.process(world, this);
  }

  /**
   * Make a decision based on SensoryState
   */
  public decide(): void {
    const states = this.sensory.getSensoryState();

    // add proprioception and orientation
    states.push(this.velocity.x);
    states.push(this.velocity.y);

    this.actionIndex = this.brain.decide(states);
  }

  /**
   * Act according to the decision made
   */
  public act(world: World): void {
    this.prepareAction();

    this.determineNextLocation();

    this.onWallCollision(world);
  }

  /**
   * 
   */
  private prepareAction(): void {
    const speed = 1;
    if (this.actionIndex === 0) {
      this.velocity.x += -speed;
    }
    else if (this.actionIndex === 1) {
      this.velocity.x += speed;
    }
    else if (this.actionIndex === 2) {
      this.velocity.y += -speed;
    }
    else if (this.actionIndex === 3) {
      this.velocity.y += speed;
    }
  }

  private determineNextLocation(): void {
    this.velocity.x *= this.velocityDiscountFactor;
    this.velocity.y *= this.velocityDiscountFactor;
    this.location.x += this.velocity.x;
    this.location.y += this.velocity.y;
  }

  private onWallCollision(world: World): void {
    if (this.location.x < 1) {
      this.location.x = 1;
      this.velocity.x = 0;
      this.velocity.y = 0;
    }
    else if (this.location.x > world.width - 1) {
      this.location.x = world.width - 1;
      this.velocity.x = 0;
      this.velocity.y = 0;
    }
    if (this.location.y < 1) {
      this.location.y = 1;
      this.velocity.x = 0;
      this.velocity.y = 0;
    }
    else if (this.location.y > world.height - 1) {
      this.location.y = world.height - 1;
      this.velocity.x = 0;
      this.velocity.y = 0;
    }
  }

  /**
   * Get rewards from collision and return true if collided.
   * Collisions are interpreted as Consumption.
   * @param Item to be evaluated
   * @returns true if collision happend
   */
  public processCollision(item: Item): boolean {
    const distance = this.location.getDistanceTo(item.location);
    if (this.isColliding(distance, item)) {
      this.recordCollision(item);
      return true;
    }
    return false;
  }

  private isColliding(distance: number, item: Item) {
    return distance < (this.size + item.size);
  }

  private recordCollision(item: Item): void {
    this.consumptionReward += item.getValue();
    if (item.type === 1) {
      this.sensory.item0CollisionsPerTick++;
    }
    else if (item.type === 2) {
      this.sensory.item1CollisionsPerTick++;
    }
  }

  /**
   * Learning
   */
  public learn(): void {
    this.processSensoryRewards();
    this.totalReward = this.consumptionReward + this.sensoryReward;
    this.brain.learn(this.totalReward);
  }

  /**
   * Sensation-Rewards
   */
  private processSensoryRewards(): void {
    this.sensoryReward = this.sensory.processRewards(this);
  }
}
