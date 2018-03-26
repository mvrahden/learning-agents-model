import { SensedObject } from './utils/SensedObject';

import { World } from '../../../World';
import { WorldObject } from '../../WorldObject';


export abstract class Sensor {
  public readonly id: number;
  public readonly type: number;
  public readonly maxRange: number;
  protected sensedObject: SensedObject;

  public static readonly states: number = 6;
  // 1:=Wall
  // 2:=Item0
  // 3:=Item1
  // 4:=Agent
  // 5:=sensedObject.Vx
  // 6:=sensedObject.Vy

  constructor(id: number, type: number) {
    this.id = id;
    this.type = type;
  }

  protected reset(): void {
    this.sensedObject = new SensedObject();
  }

  /**
   * Senses WorldObjects in its respective range and relative to the agents (sensor owner) location.
   * @param world Object containing the world and its objects
   * @param agent sensor owner as WorldObject
   */
  public senseObject(world: World, owner: WorldObject): void {
    this.reset();
    this.detectObject(world, owner);
  }

  public getSensedObject(): SensedObject {
    return this.sensedObject;
  }

  protected abstract detectObject(world: World, owner: WorldObject): void;
}
