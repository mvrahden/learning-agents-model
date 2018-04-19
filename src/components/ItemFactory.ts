import { Utils } from 'recurrent-js';

import { Item } from './Item';
import { WorldObject } from './WorldObject';

export class ItemFactory {
  private idTicker: number;
  private conditions = { scarce: 0, stable: 1 };
  protected boundaryCondition: number = 1;
  width: number;
  height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  /**
   * creates an Item of a random type [1,2]
   */
  public createRandomItem(): Item {
    const x = Utils.randf(20, this.width - 20);
    const y = Utils.randf(20, this.height - 20);
    const type = Utils.randi(1, 3); // type 1 or 2
    return new Item(x, y, type);
  }

  /**
   * Takes the current boundary-condition into account 
   * @param items 
   */
  public createItem(items: Array<Item>): Item {
    const type = this.determineItemType(items); // stablizing condition if --> ratioOfFood > random([0.25, 0.50])
    const x = Utils.randf(20, this.width - 20);
    const y = Utils.randf(20, this.height - 20);
    return new Item(x, y, type);
  }

  public setBoundaryCondition(condition: string): void {
    this.boundaryCondition = this.conditions[condition];
  }

  private determineItemType(items: Array<Item>): number {
    if(this.boundaryCondition === 0) { return this.getRandomItemType(); }
    else {
      const item1Amount = this.getItem1Amount(items);
      const item1Ratio = item1Amount / items.length;
      return this.determineTypeDependingOnCurrentValuationTarget(item1Ratio);
    }
  }


  private getItem1Amount(items: Item[]): number {
    return items.reduce((total, item) => {
      return item.type === 1 ? total += 1 : total;
    }, 0);
  }

  private determineTypeDependingOnCurrentValuationTarget(item1Ratio: number): number {
    if (item1Ratio < Utils.randf(0.25, 0.5)) { return 1; }
    else if ((1 - item1Ratio) < Utils.randf(0.25, 0.5)) { return 2; }
    else { return this.getRandomItemType(); }
  }

  private getRandomItemType(): number {
    return Utils.randi(1, 3);
  }
}
