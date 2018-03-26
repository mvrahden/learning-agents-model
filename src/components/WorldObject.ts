import { Point2D } from "../utils/Point2D";

export class WorldObject {
  public readonly id: number;
  public readonly type: number;
  public readonly size: number;

  public readonly location: Point2D;
  public readonly velocity: Point2D;

  private age: number;
  private static values: Array<number> = [-1, 1, -1, -1];

  constructor(id: number, type: number, size: number, location: Point2D, velocity: Point2D) {
    this.id = id;
    this.type = type;
    this.size = size;
    this.location = location;
    this.velocity = velocity;

    this.age = 0;
  }

  public increaseAge(): void {
    this.age++;
  }

  public getAge(): number {
    return this.age;
  }

  public getValue(): number {
    return WorldObject.values[this.type];
  }

  public static getValues(): Array<number> {
    return WorldObject.values;
  }

  public static setValues(values: Array<number>): void {
    WorldObject.values = values;
  }

}
