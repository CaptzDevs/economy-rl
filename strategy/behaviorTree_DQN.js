import { selectAction, getActionName, decideWithDQN } from '../strategy/dqn.js'; // ฟังก์ชันจาก DQN


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
        // รองรับทั้ง sync/async node
        const result = child.tick(agent, market);
        if (result instanceof Promise) {
          return result.then(res => {
            if (!res) return false;
            // ถ้าเป็น child ตัวสุดท้าย return true
            if (child === this.children[this.children.length - 1]) return true;
            // ถ้าไม่ใช่ ต้องเช็ค child ถัดไปด้วย (ต้องเขียนใหม่เป็น async loop ถ้าใช้ async node จริง)
            // ง่ายสุดเปลี่ยน tick เป็น async (ดูด้านล่าง)
            throw new Error('Sequence: async children need async tick');
          });
        }
        if (!result) return false;
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
        const result = child.tick(agent, market);
        if (result instanceof Promise) {
          return result.then(res => {
            if (res) return true;
            // ต้องจัดการ async loop เหมือน Sequence (ดูด้านล่าง)
            throw new Error('Selector: async children need async tick');
          });
        }
        if (result) return true;
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
  
  // สำหรับ async action node (เช่น decision neural network)
  export class AsyncAction extends BTNode {
    constructor(actionFn) {
      super('AsyncAction');
      this.actionFn = actionFn;
    }
    async tick(agent, market) {
      return await this.actionFn(agent, market);
    }
  }
  
  // เราจะทำ behavior tree เป็น async function เพื่อรองรับ AsyncAction ได้ง่ายขึ้น
  export class AsyncSequence extends BTNode {
    constructor(children) {
      super('AsyncSequence');
      this.children = children;
    }
    async tick(agent, market) {
      for (const child of this.children) {
        const res = await child.tick(agent, market);
        if (!res) return false;
      }
      return true;
    }
  }
  
  export class AsyncSelector extends BTNode {
    constructor(children) {
      super('AsyncSelector');
      this.children = children;
    }
    async tick(agent, market) {
      for (const child of this.children) {
        const res = await child.tick(agent, market);
        if (res) return true;
      }
      return false;
    }
  }

// เรียก DQN ตัดสินใจ (async)
/* async function chooseStrategyByDQN(agent) {
  const actionName = await decideWithDQN(agent)
    return actionName.action
} */

// สร้าง behavior tree ที่ใช้ DQN ตัดสินใจ
export function createBehaviorTreeWithDQN() {
  return new AsyncSequence([
    new AsyncAction(async (agent) => {
      //agent._decision = await chooseStrategyByDQN(agent);
      console.log('🧠 DQN Decision:', agent._decision);
      return true;
    }),
    new AsyncSelector([
      new AsyncSequence([
        new Condition((a) => a._decision === 'eat' && a.inventory.food > 0),
        new Action((a) => {
          a.inventory.food--;
          
          a.state.hunger = Math.min(100, a.state.hunger + 40);
          a.state.health = Math.min(100, a.state.health + 5);
          a.state.happiness = Math.max(0, a.state.happiness + 15);
          
          a.weight = a.state.hunger > 80 ? a.weight + 1.5 : a.weight;

          a.logAction('eat');
          a._action = 'eat';
          console.log(`🤖 ${a.name} : 🍽️  eats.`);
          return true;
        }),
      ]),
      new AsyncSequence([
        new Condition((a) => a._decision === 'buy' && a.money >= 100),
        new Action((a) => {
          a.money -= 100;
          a.state.happiness = Math.max(0, a.state.happiness + 20);
          a.inventory.food++;
          a.logAction('buy');
          console.log(`🤖 ${a.name} : 🛒 buys food.`);
          a._action = 'buy';
          return true;
        }),
      ]),
      new AsyncSequence([
        new Condition((a) => a._decision === 'work'  && a.job !== 'none'),
        new Action((a) => {
            a.money += a.state.energy*1.5;
            a.state.energy = Math.max(0, a.state.energy/2);
            a.state.hunger = Math.max(0, a.state.hunger - 10);
            a.state.health = Math.max(0, a.state.health - 2);
            a.state.happiness = Math.max(0, a.state.happiness - 5);

          a.logAction('work');
          console.log(`🤖 ${a.name} : 💼 works.`);
          a._action = 'work';
          return true;
        }),
      ]),
      new AsyncSequence([
        new Condition((a) => a._decision === 'rest'),
        new Action((a) => {
          a.state.energy = Math.min(100, a.state.energy + 80);
          a.state.health = Math.min(100, a.state.health + 5);
          a.state.hunger = Math.max(0, a.state.hunger - 5);
          a.state.happiness = Math.max(0, a.state.happiness  +10);

          a.logAction('rest');
          console.log(`🤖 ${a.name} : 😴 rests.`);
          a._action = 'rest';
          return true;
        }),
      ]),
      // fallback ถ้าไม่มี action ตรงกัน
      new Action((a) => {
        console.log(`🤖 ${a.name} : 💤 idle.`);
        a.logAction('idle');
          a._action = 'idle';
        return true;
      }),
    ]),
  ]);
}
