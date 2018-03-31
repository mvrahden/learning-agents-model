import { R } from 'recurrent-js';
import { Env, Opt } from 'reinforce-js';

import { Wall } from './components/Wall';
import { Item } from './components/Item';
import { RLAgent } from './components/agents/RLAgent';
import { RLAgentFactory } from './components/agents/RLAgentFactory';
import { ItemFactory } from './components/ItemFactory';

export class World {
  
  readonly height: number;
  readonly width: number;
  private _clock: number;
  private agents: RLAgent[];
  private walls: Wall[];
  private items: Item[];
  private agentFactory: RLAgentFactory;
  private itemFactory: ItemFactory;
  
  trainingModeSwitch: number;
  maxAgents: number;
  maxItems: number;

  /**
   * Create a World with given width and height as Walls
   * @param width Width of the Canvas (World)
   * @param height Height of the Canvas (World)
   */
  constructor(width: number, height: number, maxAgents: number = 2, maxItems: number = 50, trainingModeSwitch: number = 2.5e6) {
    this.width = width;
    this.height = height;
    this.maxAgents = maxAgents;
    this.maxItems = maxItems;
    this.trainingModeSwitch = trainingModeSwitch;

    this.init();
  }

  private init(): void {
    this.agentFactory = new RLAgentFactory(this.width, this.height);
    this.itemFactory = new ItemFactory(this.width, this.height);

    this.walls = new Array<Wall>();
    this.agents = new Array<RLAgent>();
    this.items = new Array<Item>();
    this._clock = 0;

    this.spawnWalls();

    for (let i = 0; i < this.maxAgents; i++) {
      this.spawnNewAgent();
    }

    for (let i = 0; i < this.maxItems; i++) {
      this.spawnNewItem();
    }

    this.observeForNextDecision();
  }

  private spawnWalls(): void {
    this.walls.push(new Wall(0, 0, this.width, 0));
    this.walls.push(new Wall(this.width, 0, this.width, this.height));
    this.walls.push(new Wall(this.width, this.height, 0, this.height));
    this.walls.push(new Wall(0, this.height, 0, 0));
  }

  private spawnNewAgent(): void {
    const agent = this.agentFactory.createRandomDQNAgent();
    this.agents.push(agent);
  }

  private spawnNewItem(): void {
    const item = this.itemFactory.createItem(this.getItems());
    this.items.push(item);
  }

  public tick(): void {
    // tick the environment
    this._clock++;

    this.prepareWorldObjects();

    this.makeDecision();

    this.actOnDecision();

    this.tickAllItems();

    this.learnFromDecision();

    this.observeForNextDecision();
  }

  private prepareWorldObjects(): void {
    for (const item of this.items) {
      item.increaseAge();
    }
    for (const agent of this.agents) {
      agent.increaseAge();
      agent.reset();
    }
  }

  public switchTrainingModeOfAgents(trainingsMode: boolean): void {
    for (const agent of this.agents) {
      agent.setTrainingModeTo(trainingsMode);
    }
  }

  /**
   * Process agents sensory
   */
  private observeForNextDecision(): void {
    for (const agent of this.agents) {
      agent.observe(this);
    }
  }

  /**
   * let the agents decide in the world based on their input
   */
  private makeDecision(): void {
    for (const agent of this.agents) {
      agent.decide();
    }
  }

  /**
   * apply outputs of agents on evironment
   */
  private actOnDecision(): void {
    for (const agent of this.agents) {
      agent.act(this);
    }
  }

  /**
   * Tick all items
   */
  private tickAllItems(): void {
    let updateItems = false;

    for (const item of this.items) {

      const wasConsumed = this.checkConsumption(item);
      updateItems = updateItems || wasConsumed; // make sure it stays true if it has been true once already

      item.move(this.width, this.height);

      // die if too old
      if (item.shouldDieOfAge(this._clock)) { item.markAsDead(); }
    }

    if (updateItems) { this.removeDeadItems(); }

    this.spawnNewItemsRandomly();
  }

  private checkConsumption(item: Item): boolean {
    // see if current item gets consumed
    for (const agent of this.agents) {
      const hasConsumedItem = agent.processCollision(item); // collision equals consumption
      if (hasConsumedItem) {
        item.markAsDead();
        return true;
      } // item is marked as dead --> so no further check needed
    }
    return false;
  }

  private removeDeadItems(): void {
    this.items = this.items.filter((item, i) => { return item.isAlive(); });
  }

  private spawnNewItemsRandomly(): void {
    if (this.items.length < this.maxItems && R.randf(0, 1) < 0.25) {
      this.spawnNewItem();
    }
  }

  /**
   * agents are given the opportunity to learn based on feedback of their action on environment
   */
  private learnFromDecision(): void {
    for (const agent of this.agents) { agent.learn(); }
  }

  public reset(): void {
    this.init();
  }

  public clock(): number {
    return this._clock;
  }

  public getAgents(): Array<RLAgent> {
    return this.agents;
  }

  public getWalls(): Array<Wall> {
    return this.walls;
  }

  public getItems(): Array<Item> {
    return this.items;
  }

  /**
   * Sets the population condition to 'stable' or 'scarce'
   * @param condition 
   */
  public setBoundaryCondition(condition: string): void {
    this.itemFactory.setBoundaryCondition(condition);
  }
}
