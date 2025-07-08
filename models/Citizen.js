import { createBehaviorTree } from '../strategy/behaviorTree.js';

const btTree = createBehaviorTree();

export class Citizen {
    constructor({
      id = '',
      role = 'citizen',
      job = 'none',
      age = 0,
      name = 'Unnamed',
      money = 0,
      state = {},
      inventory = {},
      personality = {},
      memory = {},
      strategy = 'manual',
    }) {
      this.id = id;
      this.role = role;
      this.job = job;
      this.age = age;
      this.name = name;
      this.money = money;
  
      this.alive = true
      this.state = {
        energy: 100,
        hunger: 100,
        health: 100,
        happiness: 100,
        ...state
      };
  
      this.inventory = {
        food: 0,
        rawMaterial: 0,
        product: 0,
        ...inventory
      };
  
      this.personality = {
        laziness: 0.5,
        greed: 0.5,
        thriftiness: 0.5,
        ...personality
      };
  
      /* System */
      this.memory = {
        logs : [],
        lastActions: [],
        hungerLog: [],
        tradeHistory: [],
        ...memory
      };
      
      this.strategy = strategy;
      this.actionIndex = 0; // เพิ่มตัวนับลำดับ
      this._decision = null; // <- สำหรับ hybrid strategy
    }
  
    logAction(action) {
      const cell = {
        index: this.actionIndex++,
        action,
        decision : this._decision,
        timestamp: new Date().toISOString()
      }

      this.memory.logs.push(cell);
      this.memory.lastActions.push(cell);

      if (this.memory.lastActions.length > 20) {
        this.memory.lastActions.shift();
      }
    }
    
      
  
    decideAndAct(market) {
      // Basic BT-style logic
        if (this.strategy === 'bt') {
          btTree.tick(this, market);
        }   
    }
  }
  