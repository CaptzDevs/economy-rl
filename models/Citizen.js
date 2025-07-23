import { createBehaviorTree } from '../strategy/behaviorTree.js';
import { createBehaviorTreeWithNN } from '../strategy/behaviorTree_NN.js';
import { decideWithTrainedNN } from '../strategy/neuralTf.js';
import { createBehaviorTreeWithDQN } from '../strategy/behaviorTree_DQN.js'

import { ACTIONS, selectAction, remember, trainFromBuffer, getActionName, calculateReward, decideWithDQN, getActionIndex } from '../strategy/dqn.js';
import { loadJSON, saveJSON } from '../utils/file.js';
import { AGENT_MEMORY_PATH } from '../config/constant.js';
import dotenv from 'dotenv';
import chalk from "chalk";

dotenv.config();

const agentMemoryPath = AGENT_MEMORY_PATH

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
      weight = 60,
      height = 170,
    }) {
      this.id = id;
      this.role = role;
      this.job = job;
      this.age = age;
      this.name = name;
      this.money = money;
      this.weight = weight
      this.height = height
      this.bmi = this.height > 0 ? this.weight / ((this.height / 100) ** 2) : 0;


  
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
      this._decidedBy = null; // ตัดสินใจโดย
      this._decision = null; // <- สำหรับ hybrid strategy
      this._action = null; // <- Actual action
      this.epsilon = 1
      this.totalReward = 0;

      this.model = null
      this.replayBuffer = []

      this.learningRate = 0.001; // หรือจะให้สุ่ม หรือ set จาก personality ก็ได้

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
          // 1. เตรียม state
          

          const { action,actionIndex, state} = await decideWithDQN(this);

          // 3. เก็บ decision ให้ behavior tree ใช้
          this._decision = action;

          // 4. ตัดสินใจโดย behavior tree
           await btTreeDQN.tick(this, market);
          // 5. ประเมินรางวัลหลัง action
          const reward = calculateReward(this , action, this._action);
          this.totalReward += reward;

          console.log(`🏆 Reward: ${ chalk.yellow(reward) }`);
          // 6. สร้าง nextState
          const nextState = [
                  this.state.hunger / 100,
                  this.state.energy / 100,
                  this.state.health / 100,
                  this.state.happiness / 100,
                  this.money / 1_000_000_000,
                  this.age / 200,
                  this.weight / 200,
                  this.height / 200,
                  this.bmi / 100,
                  this.inventory.food / 100,
          ];
          // 7. เก็บลง buffer ของตัวเอง
         process.env.IS_TRAINING_MODEL.trim() === 'true' &&  remember(this.replayBuffer, {
            state,
            action: actionIndex,
            actualAction: getActionIndex(this._action), // สิ่งที่ทำจริง (optional)
            reward,
            nextState,
            done: this.state.health <= 0 || !this.alive,
          },100000);

          // 8. ฝึกโมเดลของตัวเอง
        process.env.IS_TRAINING_MODEL.trim() === 'true' && await trainFromBuffer(this.model, this.replayBuffer);


      } else if (this.strategy === 'nn') {
        // ใช้ NN ตัดสินใจเหมือนเดิม
        this._decision = await decideWithTrainedNN(this);
        await btTreeNN.tick(this, market);

      } else if (this.strategy === 'bt') {
         btTree.tick(this, market);
      }
    }
    
    saveMemory(){
      console.log("Save Memory")
      saveJSON(agentMemoryPath,this.replayBuffer)
    }

    async loadMemory(){
      try {
          const memory = await loadJSON(agentMemoryPath)
          return memory
      } catch (error) {
        console.log("Error :" , error)
        return []
      }
    }


    logAgentState(){
       const query = {
        ...this.state,
     age : this.age,
      
       inventory: this.inventory,
       weight : this.weight,
       height : this.height,
        bmi : this.bmi,
         money: this.money,
       reward : this.totalReward,
       _decidedBy : this._decidedBy,
      // mem : this.replayBuffer.length,
        };
        console.log(query)
    }

   

  }
  