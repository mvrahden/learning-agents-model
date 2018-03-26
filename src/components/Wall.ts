import { Point2D } from './../utils/Point2D';
import { WorldObject } from './WorldObject';

export class Wall extends WorldObject {
  public p1: Point2D;
  public p2: Point2D;

  constructor(p1x: number, p1y: number, p2x: number, p2y: number) {
    super(0, 0, 0, null, new Point2D(0, 0));
    this.p1 = new Point2D(p1x, p1y);
    this.p2 = new Point2D(p2x, p2y);
  }

}
