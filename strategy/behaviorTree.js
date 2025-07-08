// behavior_tree.js

export class BTNode {
  constructor(name) {
    this.name = name;
  }
  tick(agent, market) {
    throw new Error('tick not implemented');
  }
}

export class Sequence extends BTNode {
  constructor(children) {
    super('Sequence');
    this.children = children;
  }
  
  tick(agent, market) {
    for (let child of this.children) {
      if (!child.tick(agent, market)) return false;
    }
    return true;
  }
}

export class Selector extends BTNode {
  constructor(children) {
    super('Selector');
    this.children = children;
  }
  tick(agent, market) {
    for (let child of this.children) {
      if (child.tick(agent, market)) return true;
    }
    return false;
  }
}

export class Condition extends BTNode {
  constructor(checkFn) {
    super('Condition');
    this.checkFn = checkFn;
  }
  tick(agent, market) {
    return this.checkFn(agent, market);
  }
}

export class Action extends BTNode {
  constructor(actionFn) {
    super('Action');
    this.actionFn = actionFn;
  }
  tick(agent, market) {
    return this.actionFn(agent, market);
  }
}

// Decision Tree Strategy Selector
function chooseStrategyByDecisionTree(agent) {
  if (agent.state.hunger < 50  ) return 'eat';
  if (agent.money < 20 && agent.state.energy > 1) return 'work';
  if (agent.state.energy < 50) return 'rest';
  return 'idle';
}

// Example hybrid tree for 'bt+dt' strategy
export function createBehaviorTree() {
  return new Sequence([
    new Action((a) => {
      a._decision = chooseStrategyByDecisionTree(a);
      console.log('Decision:', a._decision);
      return true;
    }),
    new Selector([
      new Sequence([
        new Condition((a) => a._decision === 'eat' && a.inventory.food > 0),
        new Action((a) => {
          a.inventory.food--;
          a.state.hunger = Math.min(100, a.state.hunger + 30);
          a.logAction('eat');
          console.log(`${a.name} eats.`);
          return true;
        }),
      ]),
      new Sequence([
        new Condition((a) => a._decision === 'eat' && a.inventory.food === 0 && a.money >= 20),
        new Action((a) => {
          a.money -= 20;
          a.inventory.food++;
          a.logAction('buy');
          console.log(`${a.name} buys food.`);
          return true;
        }),
      ]),
      new Sequence([
        new Condition((a) => a._decision === 'work' && a.job !== 'none'),
        new Action((a) => {
          a.money += 5;
          a.state.energy = Math.max(0, a.state.energy - 10);
          a.logAction('work');
          console.log(`${a.name} works.`);
          return true;
        }),
      ]),
      new Sequence([
        new Condition((a) => a._decision === 'rest'),
        new Action((a) => {
          a.state.energy = Math.min(100, a.state.energy + 5);
          a.logAction('rest');
          console.log(`${a.name} rests.`);
          return true;
        }),
      ]),
    ]),
  ]);
}
