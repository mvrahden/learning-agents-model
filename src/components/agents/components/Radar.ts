import { Sensor } from './Sensor';

import { World } from '../../../World';
import { Point2D } from '../../../utils/Point2D';

import { SensedObject } from './utils/SensedObject';
import { GeoMath } from '../../../utils/GeoMath';
import { WorldObject } from '../../WorldObject';

/**
 * Eye sensor has a width and height and senses objects in it's field
 */
export class Radar extends Sensor {
  public static readonly states: number = 6;
  public readonly maxRange: number;

  public readonly xOffset: number;
  public readonly yOffset: number;
  public readonly maxLength: number;
  public readonly column: number;
  public readonly row: number;

  // Sensed information
  public location: Point2D;  // upper left corner
  public width: number;
  public height: number;
  public id: number;
  public type: number;

  constructor(id: number, row: number, col: number, length: number, xOffset: number, yOffset: number) {
    super(id, 1); // type 1
    this.row = row;
    this.column = col;
    this.maxLength = length;
    this.xOffset = xOffset;
    this.yOffset = yOffset;

    if (this.xOffset < 0 && this.yOffset < 0) {
      this.maxRange = GeoMath.pointToPointDistance(new Point2D(0, 0), new Point2D(0 + this.xOffset, 0 + this.yOffset));
    }
    else if (this.xOffset >= 0 && this.yOffset < 0) {
      this.maxRange = GeoMath.pointToPointDistance(new Point2D(0, 0), new Point2D(0 + this.xOffset + this.maxLength, 0 + this.yOffset));
    }
    else if (this.xOffset < 0 && this.yOffset >= 0) {
      this.maxRange = GeoMath.pointToPointDistance(new Point2D(0, 0), new Point2D(0 + this.xOffset, 0 + this.yOffset + this.maxLength));
    }
    else if (this.xOffset >= 0 && this.yOffset >= 0) {
      this.maxRange = GeoMath.pointToPointDistance(new Point2D(0, 0), new Point2D(0 + this.xOffset + this.maxLength, 0 + this.yOffset + this.maxLength));
    }

    this.reset();
  }

  /**
   * Determines whether agent colides with either walls, items or other objects
   * @param world World Object 
   * @param owner 
   * @param p2 
   */
  protected detectObject(world: World, owner: WorldObject): void {
    this.getCurrentLocation(world, owner);
    this.getCurrentDimensions(world, owner);

    this.checkWallCollision(world, owner);

    this.checkItemCollision(world, owner);

    this.checkAgentCollision(world, owner);
  }

  private getCurrentLocation(world: World, o1: WorldObject): void {
    let x, y;
    if (this.xOffset <= 0) { x = Math.max(0, o1.location.x + this.xOffset); }
    else { x = Math.min(world.width, o1.location.x + this.xOffset); }
    if (this.yOffset <= 0) { y = Math.max(0, o1.location.y + this.yOffset); }
    else { y = Math.min(world.height, o1.location.y + this.yOffset); }
    this.location = new Point2D(x, y);
  }

  private getCurrentDimensions(world: World, o1: WorldObject): void {
    this.width = this.maxLength;
    this.height = this.maxLength;

    const rightX = o1.location.x + this.xOffset + this.maxLength;
    const bottomY = o1.location.y + this.yOffset + this.maxLength;

    // width
    if (rightX <= 0) { this.width = 0; }
    else if (rightX <= o1.location.x && this.location.x <= 0) { this.width = rightX; }
    else if (rightX > o1.location.x && this.location.x <= 0) { this.width = rightX; }
    else if (rightX <= o1.location.x && this.location.x > 0) { this.width = this.maxLength; }
    else if (rightX > o1.location.x && this.location.x >= world.width) { this.width = 0; }
    else if (rightX > o1.location.x && rightX >= world.width) { this.width = world.width - this.location.x; }
    else { this.width = this.maxLength; }

    // height
    if (bottomY <= 0) { this.height = 0; }
    else if (bottomY <= o1.location.y && this.location.y <= 0) { this.height = bottomY; }
    else if (bottomY > o1.location.y && this.location.y <= 0) { this.height = bottomY; }
    else if (bottomY <= o1.location.y && this.location.y > 0) { this.height = this.maxLength; }
    else if (bottomY > o1.location.y && this.location.y >= world.height) { this.height = 0; }
    else if (bottomY > o1.location.y && bottomY >= world.height) { this.height = world.height - this.location.y; }
    else { this.height = this.maxLength; }
  }

  private checkWallCollision(world: World, owner: WorldObject): void {
    if (this.isFoldedByWall()) {
      this.sensedObject.type = 0;
      this.sensedObject.velocity.x = 0;
      this.sensedObject.velocity.y = 0;
      this.sensedObject.proximity = this.sensorCenterToObjectDistance(owner.location);
    }
  }

  private isFoldedByWall() {
    return this.width < this.maxLength || this.height < this.maxLength; // partly folded by wall
  }

  /**
   * Determines the distance from the current sensor center to the given coordinates
   * @param p1
   * @returns proximity between sensor center and p1
   */
  private sensorCenterToObjectDistance(p1: Point2D): number {
    const _width_ = this.width < this.maxLength / 2 ? this.width : this.maxLength / 2;
    const _height_ = this.height < this.maxLength / 2 ? this.height : this.maxLength / 2;
    const centerX = this.location.x + _width_;
    const centerY = this.location.y + _height_;
    return Math.sqrt(Math.pow(centerX - p1.x, 2) + Math.pow(centerY - p1.y, 2));
  }

  private checkItemCollision(world: World, owner: WorldObject): void {
    if (this.width === 0 && this.height === 0) { return; }
    for (const item of world.getItems()) {
      this.determineObjectCollision(item, owner);
    }
  }

  private checkAgentCollision(world: World, owner: WorldObject): void {
    if (this.width === 0 && this.height === 0) { return; }
    for (const [i, agent] of world.getAgents().entries()) {
      if (i !== owner.id) { this.determineObjectCollision(agent, owner); }
    }
  }

  private determineObjectCollision(o1: WorldObject, owner: WorldObject) {
    const deltaX = o1.location.x - this.location.x;
    const deltaY = o1.location.y - this.location.y;

    if (this.isSensingObject(deltaX, deltaY, o1)) {
      const proximity = GeoMath.pointToPointDistance(o1.location, owner.location) - o1.size;
      if (this.sensedObject.type === 0 || proximity < this.sensedObject.proximity) {
        this.sensedObject.fromWorldObject(o1, proximity);
      }
    }
  }

  private isSensingObject(deltaX: number, deltaY: number, worldObject: WorldObject) {
    return ((deltaX < 0 && -deltaX <= worldObject.size)
      || (deltaX > 0 && (deltaX - worldObject.size) <= this.width))
      && ((deltaY < 0 && -deltaY <= worldObject.size)
        || (deltaY > 0 && (deltaY - worldObject.size) <= this.height));
  }

}
