import { createBehaviorTree } from '../strategy/behaviorTree.js';
import { createBehaviorTreeWithNN } from '../strategy/behaviorTree_NN.js';
import { decideWithTrainedNN } from '../strategy/neuralTf.js';
import { createBehaviorTreeWithDQN } from '../strategy/behaviorTree_DQN.js'

import { ACTIONS, selectAction, remember, trainFromBuffer, getActionName, calculateReward } from '../strategy/dqn.js';

const btTree = createBehaviorTree();
const btTreeNN = createBehaviorTreeWithNN();
const btTreeDQN = createBehaviorTreeWithDQN()


export class Citizen {
    constructor({
      id = '',
      role = 'citizen',
      job = 'none',
      age = 1,
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
      this.epsilon = 1
      this.totalReward = 0;

    }
  
    logAction(action) {
      const cell = {
        index: this.actionIndex++,
        action,
        decision: this._decision,
        state: {
          hunger: this.state.hunger,
          energy: this.state.energy,
          money: this.money
        },
        timestamp: new Date().toISOString()
      };
    
      this.memory.logs.push(cell);
      this.memory.lastActions.push(cell);
    
      if (this.memory.lastActions.length > 20) {
        this.memory.lastActions.shift();
      }
    }
    
    
    async decideAndAct(market) {
      if (!this.alive) return;
    
      if (this.strategy === 'dqn') {
        // 1. สร้าง state
        const state = [this.state.hunger / 100, this.state.energy / 100, this.money / 100];
    
        // 2. DQN เลือก action index
        const actionIndex = await selectAction(state, 0.2);
        const action = getActionName(actionIndex);
    
        // 3. เก็บ decision ไว้ให้ BT ใช้
        this._decision = action;
    
        // 4. ให้ BT ทำ action ตาม decision
        await btTreeDQN.tick(this, market); // หรือ btTree.tick ถ้าใช้แบบธรรมดา
    
        // 5. คำนวณ reward จากสถานะหลังทำ action จริงใน BT
        const reward = calculateReward(this, action);
        this.totalReward += reward
        // 6. สร้าง next state ใหม่
        const nextState = [this.state.hunger / 100, this.state.energy / 100, this.money / 100];
    
        // 7. เก็บประสบการณ์
        remember({
          state,
          action: actionIndex,
          reward,
          nextState,
          done: this.state.health <= 0,
        });
    
        // 8. ฝึก DQN จาก replay buffer
        await trainFromBuffer();

      } else if (this.strategy === 'nn') {
        // ใช้ NN ตัดสินใจเหมือนเดิม
        this._decision = await decideWithTrainedNN(this);
        await btTreeNN.tick(this, market);

      } else if (this.strategy === 'bt') {
         btTree.tick(this, market);
      }
    }
    

  }
  