import * as tf from '@tensorflow/tfjs-node';
import { AGENT_MEMORY_PATH } from '../config/constant.js';
import { loadJSON, saveJSON } from '../utils/file.js';
import chalk from 'chalk';

export const ACTIONS = ['eat', 'buy', 'rest', 'work', 'idle'];
const GAMMA = 0.9;
const STATE = []

// ✅ ใช้แทน global model
export function createQModel(learningRate = 0.001) {
  const m = tf.sequential();
  m.add(tf.layers.dense({ inputShape: [10], units: 32, activation: 'relu' }));
  m.add(tf.layers.dense({ units: 32, activation: 'relu' }));
  m.add(tf.layers.dense({ units: ACTIONS.length, activation: 'linear' }));
  
  const optimizer = tf.train.adam(learningRate);
  m.compile({ optimizer, loss: 'meanSquaredError' });
  return m;
}

export function getActionIndex(action) {
  return ACTIONS.indexOf(action);
}

export function getActionName(index) {
  return ACTIONS[index];
}


// ✅ รับ model เข้ามา
export async function decideWithDQN(agent) {
  const state = [
    agent.state.hunger / 100,
    agent.state.energy / 100,
    agent.state.health / 100,
    agent.state.happiness / 100,
    agent.money / 1_000_000_000,
    agent.age / 200,
    agent.weight / 200,
    agent.height / 200,
    agent.bmi / 100,
    agent.inventory.food / 100,
  ];
  const epsilon = agent.epsilon;
  const actionIndex = await selectAction(agent.model, state, epsilon);

  return {
    action: getActionName(actionIndex),
    actionIndex,
    state,
  };
}

// ✅ รับ model และ state เข้าไป
export async function selectAction(model, state, epsilon = 0.1) {
  if (Math.random() < epsilon) {
    return Math.floor(Math.random() * ACTIONS.length);
  }

  const input = tf.tensor2d([state]);
  const qValues = await model.predict(input).data();
  input.dispose();
  return qValues.indexOf(Math.max(...qValues));
}

// ✅ แยก buffer per agent
export function remember(agentBuffer, experience, maxSize = 1000) {
  agentBuffer.push(experience);
  if (agentBuffer.length > maxSize) agentBuffer.shift();
}

// ✅ ฝึกโดยรับ model และ buffer ของแต่ละ agent
export async function trainFromBuffer(model, agentBuffer, batchSize = 64) {
  if (agentBuffer.length < batchSize) return;

  const batch = [];
  while (batch.length < batchSize) {
    const index = Math.floor(Math.random() * agentBuffer.length);
    batch.push(agentBuffer[index]);
  }

  const states = [];
  const targets = [];

  for (const { state, action,actualAction, reward, nextState, done } of batch) {
    const qTensor = model.predict(tf.tensor2d([state]));
    const qNextTensor = model.predict(tf.tensor2d([nextState]));

    const q = await qTensor.array();
    const qNext = await qNextTensor.array();

    qTensor.dispose();
    qNextTensor.dispose();

    const updatedQ = q[0];
    const maxNextQ = Math.max(...qNext[0]);
    const targetQ = reward + (done ? 0 : GAMMA * maxNextQ);

    updatedQ[actualAction] = targetQ;

    states.push(state);
    targets.push(updatedQ);
  }

  await model.fit(tf.tensor2d(states), tf.tensor2d(targets), {
    epochs: 25,
    shuffle: true,
    verbose: 0
  });
}


export function calculateReward(agent, action , actualAction) {
  let reward = 0;

   const avgState = (
    agent.state.hunger +
    agent.state.energy +
    agent.state.health +
    agent.state.happiness
  ) / 4;

  if (avgState > 90) reward += 0.1; // ร่างกายดี → ให้รางวัลเพิ่ม
  reward += (agent.age * 0.5); // เพิ่ม reward ตามอายุ

  if(agent._decision != actualAction){
      reward -= .5;
      console.log(`❌ ${chalk.red("Invalid Action")}`);
      return reward
    }else{
    console.log(`✅ ${chalk.green("Valid Action")}`)
  }

  switch (actualAction) {
    case 'eat':
    if (agent.bmi >= 18.5 && agent.bmi <= 22.9) {
      reward += agent.state.hunger < 80 ? 1.5 : 0.5;
    } else if (agent.bmi < 18.5 && agent.state.hunger < 90) {
      reward += 1.2; // กรณีผอมมาก → ควรกิน
    } else {
      reward = -0.5; // อ้วนแล้วไม่ควรกิน
    }
    break;
    case 'buy':
      if( agent.inventory.food === 0 && agent.state.hunger < 40){
        reward += 1.2
      }else{
        reward += 0.5
      }
      break;

    case 'rest':
      reward = agent.state.energy < 40 ? 1.2 : 0.5;
      break;

    case 'work':
      if (agent.state.energy < 30 || agent.state.health < 40) {
        reward += -1.0;
      } else if (agent.money > 1000) {
        reward += 0.4;
      } else {
        reward += 1.2;
      }
      break;

    case 'idle':
      reward = -2.0;
      break;

    default:
      reward = 0;
  }


 

  return reward;
}



// ✅ save และ load แยก model path ต่อ agent ได้
export async function saveModel(model, path = 'file://./model') {
  await model.save(path);
  console.log('✅ Model saved at', path);
}

export async function loadModel(path = 'file://./model/model.json') {
  try {
    
    const model = await tf.loadLayersModel(path);
    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError'
    });
    console.log(model.stateful)
    return model;
  } catch (error) {
    console.log("Error :" , error)
    return null
  }
}

export async function loadShareMemory(){
    try {
          console.log("Load Memory")
          const memory = await loadJSON(AGENT_MEMORY_PATH)
          return memory
        } catch (error) {
          console.log("Error :" , error)
          return []
  }
}

export async function saveSharedMemory(buffer) {
          console.log("Save Memory")
          saveJSON(AGENT_MEMORY_PATH,buffer)
}
