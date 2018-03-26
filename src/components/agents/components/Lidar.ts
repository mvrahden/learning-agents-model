import { SensedObject } from './utils/SensedObject';

import { Sensor } from './Sensor';

import { World } from '../../../World';
import { Point2D } from './../../../utils/Point2D';
import { GeoMath } from './../../../utils/GeoMath';
import { WorldObject } from '../../WorldObject';

/**
 * Eye sensor has a maximum range and senses objects in it's ray
 */
export class Lidar extends Sensor {
  public readonly angle: number;
  public readonly maxRange: number;

  private readonly checkWalls: boolean = true;
  private readonly checkItems: boolean = true;
  private readonly checkAgents: boolean = true;

  constructor(id: number, angle: number, maxRange: number) {
    super(id, 0); // type 0

    this.angle = angle;
    this.maxRange = maxRange;

    this.reset();
  }

  /**
   * Determines whether agent colides with either walls, items or other objects
   * @param world World Environment
   * @param owner Sensor Owning Object
   * @param p2 
   */
  protected detectObject(world: World, owner: WorldObject): void {
    const endOfRange = this.determineEndOfEyeViewPoint(owner.location);

    this.checkWallCollision(world, owner, endOfRange);

    this.checkItemCollision(world, owner, endOfRange);

    this.checkAgentCollision(world, owner, endOfRange);
  }

  private determineEndOfEyeViewPoint(agentPosition: Point2D): Point2D {
    return new Point2D(agentPosition.x + this.maxRange * Math.sin(this.angle), agentPosition.y + this.maxRange * Math.cos(this.angle));
  }

  private checkWallCollision(world: World, owner: WorldObject, endOfRange: Point2D): void {
    for (const wall of world.getWalls()) {
      const result = GeoMath.lineIntersect(owner.location, endOfRange, wall.p1, wall.p2);
      if (result) {
        const proximity = this.getAbsoluteProximity(result);
        if (this.isFirstSensedObject()) {
          this.sensedObject.fromWorldObject(wall, proximity);
        } else if (proximity < this.sensedObject.proximity) {
          this.sensedObject.fromWorldObject(wall, proximity);
        }
      }
    }
  }

  private getAbsoluteProximity(relativeProximity: number): number {
    return relativeProximity * this.maxRange;
  }

  private checkItemCollision(world: World, owner: WorldObject, endOfRange: Point2D): void {
    for (const item of world.getItems()) {
      this.checkWorldObjectCollision(item, owner, endOfRange);
    }
  }

  private checkAgentCollision(world: World, owner: WorldObject, endOfRange: Point2D): void {
    for (const [i, agent] of world.getAgents().entries()) {
      if (i === owner.id) { continue; }
      this.checkWorldObjectCollision(agent, owner, endOfRange);
    }
  }

  private checkWorldObjectCollision(worldObject: WorldObject, owner: WorldObject, endOfRange: Point2D): void {
    const orthogonalDistance = GeoMath.linePointOrthogonalDistance(owner.location, endOfRange, worldObject.location);
    if (worldObject.size < orthogonalDistance) { return; }
    const projectedProximity = GeoMath.absoluteLinePointProjectionProximity(owner.location, endOfRange, worldObject.location);
    if (projectedProximity < 0 || projectedProximity > this.maxRange) { return; }
    const proximity = projectedProximity;
    if (proximity) {
      if (this.isFirstSensedObject()) {
        this.sensedObject.fromWorldObject(worldObject, proximity);
      }
      else {
        if (proximity < this.sensedObject.proximity) {
          this.sensedObject.fromWorldObject(worldObject, proximity);
        }
      }
    }
  }

  private isFirstSensedObject(): boolean {
    return this.sensedObject.type === -1;
  }
}
