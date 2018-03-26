import { Point2D } from './../../../../utils/Point2D';
import { WorldObject } from '../../../WorldObject';

export class SensedObject extends WorldObject {
  public id: number;
  public type: number;
  public proximity: number;

  constructor(id: number = -1, type: number = -1, size: number = 0, velocity: Point2D = new Point2D(0, 0), proximity: number = Number.POSITIVE_INFINITY) {
    super(id, type, size, null, velocity);
    this.id = id;
    this.type = type;
    this.proximity = proximity;
  }

  public fromWorldObject(sensedObject: WorldObject, sensedProximity: number): void {
    this.id = sensedObject.id;
    this.type = sensedObject.type;
    this.velocity.x = sensedObject.velocity.x;
    this.velocity.y = sensedObject.velocity.y;
    this.proximity = sensedProximity;
  }

}
