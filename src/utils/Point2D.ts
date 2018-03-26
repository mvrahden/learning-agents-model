export class Point2D {
  public x: number = 0;
  public y: number = 0;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  // utilities
  public getDistanceTo(v: Point2D): number {
    return Math.sqrt(Math.pow(this.x - v.x, 2) + Math.pow(this.y - v.y, 2));
  }

  public length(): number {
    return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
  }

  public dot(p: Point2D): number {
    return this.x * p.x + this.y * p.y;
  }

  public angle(p: Point2D): number {
    return Math.acos(this.dot(p) / (this.length() * p.length()));
  }

  // new vector returning operations
  public add(p: Point2D): Point2D {
    return new Point2D(this.x + p.x, this.y + p.y);
  }

  public sub(p: Point2D): Point2D {
    return new Point2D(this.x - p.x, this.y - p.y);
  }

  public rotate(angle: number): Point2D {  // CLOCKWISE
    return new Point2D(this.x * Math.cos(angle) + this.y * Math.sin(angle),
      -this.x * Math.sin(angle) + this.y * Math.cos(angle));
  }

  public normalize(): void {
    const d = this.length();
    this.scale(1.0 / d);
  }

  // in place operations
  public scale(s: number): void {
    this.x *= s;
    this.y *= s;
  }
}
