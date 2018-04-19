import { Utils } from 'recurrent-js';

import { Point2D } from './../utils/Point2D';
import { WorldObject } from './WorldObject';

export class Item extends WorldObject {
  private _isAlive: boolean;

  constructor(x: number, y: number, type: number) {
    super(Number.NaN, type, 10, new Point2D(x, y), new Point2D(Math.random() * 5 - 2.5, Math.random() * 5 - 2.5));

    this._isAlive = true;
  }

  public move(worldWidth: number, worldHeight: number): void {
    this.location.x += this.velocity.x;
    this.location.y += this.velocity.y;
    if (this.location.x < 1) { this.location.x = 1; this.velocity.x *= -1; }
    else if (this.location.x > worldWidth - 1) { this.location.x = worldWidth - 1; this.velocity.x *= -1; }
    if (this.location.y < 1) { this.location.y = 1; this.velocity.y *= -1; }
    else if (this.location.y > worldHeight - 1) { this.location.y = worldHeight - 1; this.velocity.y *= -1; }
  }

  public isAlive(): boolean {
    return this._isAlive;
  }

  public markAsDead(): void {
    this._isAlive = false;
  }

  public shouldDieOfAge(worldClock: number): boolean {
    return this.getAge() > 5000 && worldClock % 100 === 0 && Utils.randf(0, 1) < 0.1;
  }
}
