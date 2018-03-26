import { World } from '../../../World';
import { Sensor } from './Sensor';
import { SensedObject } from './utils/SensedObject';
import { Point2D } from '../../../utils/Point2D';
import { WorldObject } from '../../WorldObject';
import { RLAgent } from '../RLAgent';

export class Sensory {
  public readonly sensors: Array<Sensor>;
  private numberOfStates: number;

  totalItem0Collisions: number = 0;
  totalItem1Collisions: number = 0;

  item0CollisionsPerTick: number = 0;
  item1CollisionsPerTick: number = 0;
  wallDetectionRewardPerTick: number = 0;
  agentDetectionRewardPerTick: number = 0;

  constructor(sensors: Array<Sensor>) {
    this.sensors = sensors;
    this.numberOfStates = this.sensors.length * Sensor.states;
    // 150 = 25 (sensors) * 6 (inputs per sensor)
  }

  public getSensoryState(): Array<number> {
    const sensoryState = new Array<number>(this.numberOfStates);

    for (const [i, sensor] of this.sensors.entries()) {
      const sensedObject: SensedObject = sensor.getSensedObject();
      const baseIndex = i * Sensor.states;
      sensoryState[baseIndex + 0] = 1.0;  // input wall
      sensoryState[baseIndex + 1] = 1.0;  // input item 1
      sensoryState[baseIndex + 2] = 1.0;  // input item 2
      sensoryState[baseIndex + 3] = 1.0;  // input agent
      sensoryState[baseIndex + 4] = sensedObject.velocity.x;
      sensoryState[baseIndex + 5] = sensedObject.velocity.y;
      if (sensedObject.type !== -1) { // object detected
        // 1-of-k encoding into the input array
        sensoryState[baseIndex + sensedObject.type] = sensedObject.proximity / sensor.maxRange; // normalize to [0,1]
      }
    }
    return sensoryState;
  }

  /**
   * Senses WorldObjects in its respective range and relative to the agents (sensor owner) location.
   * @param world Object containing the world and its objects
   * @param agent sensory owner
   */
  public process(world: World, agent: WorldObject): void {
    for (const sensor of this.sensors) {
      sensor.senseObject(world, agent);
    }
  }

  /**
   * Resets the measured Rewards of last Iteration (t-1).
   */
  public reset(): void {
    this.totalItem0Collisions += this.item0CollisionsPerTick;
    this.totalItem1Collisions += this.item1CollisionsPerTick;

    this.item0CollisionsPerTick = 0;
    this.item1CollisionsPerTick = 0;
    this.wallDetectionRewardPerTick = 0;
    this.agentDetectionRewardPerTick = 0;
  }

  /**
   * Determines the sensory Rewards.
   * @param agent sensory owner
   * @returns reward
   */
  public processRewards(agent: WorldObject): number {
    let currentReward = 0;
    for (const sensor of this.sensors) {
      currentReward += this.sensedObjectReward(sensor, agent);
    }
    return currentReward;
  }

  /**
   * Determines the normalized wall Detection Reward and accumulates it with `currentReward`.
   * @param currentReward 
   * @param sensor 
   * @param agentSize 
   */
  private sensedObjectReward(sensor: Sensor, agent: WorldObject): number {
    let reward = 0;
    if (sensor.getSensedObject().type === 0) {
      reward = this.normalizedWallDetectionReward(sensor, agent);
    } else if (sensor.getSensedObject().type === 3) {
      reward = this.normalizedAgentDetectionReward(sensor, agent);
    }
    return reward;
  }

  private normalizedWallDetectionReward(sensor: Sensor, agent: WorldObject): number {
    let reward = 0;
    const proximity = sensor.getSensedObject().proximity - agent.size;

    if (proximity <= 0) {
      reward = sensor.getSensedObject().getValue();
    } else {
      reward = sensor.getSensedObject().getValue() * Math.pow((sensor.maxRange - proximity) / sensor.maxRange, 2);
    }

    reward /= this.sensors.length;

    this.recordWallReward(reward);
    return reward;
  }

  private recordWallReward(reward: number): void {
    this.wallDetectionRewardPerTick += reward;
  }

  private normalizedAgentDetectionReward(sensor: Sensor, agent: WorldObject): number {
    let reward = 0;
    const proximity = sensor.getSensedObject().proximity - agent.size * 2;

    if (proximity <= 0) {
      reward = sensor.getSensedObject().getValue();
    } else {
      reward = sensor.getSensedObject().getValue() * (sensor.maxRange - proximity) / sensor.maxRange;
    }

    reward /= this.sensors.length;

    this.recordAgentReward(reward);
    return reward;
  }

  private recordAgentReward(reward: number): void {
    this.agentDetectionRewardPerTick += reward;
  }
}
