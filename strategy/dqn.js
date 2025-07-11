import * as tf from '@tensorflow/tfjs-node';

export const ACTIONS = ['eat', 'rest', 'work', 'idle'];
const GAMMA = 0.9;
const REPLAY_BUFFER = [];
const MAX_BUFFER_SIZE = 1000;

let model = null;

function createQModel() {
  const m = tf.sequential();
  m.add(tf.layers.dense({ inputShape: [3], units: 16, activation: 'relu' }));
  m.add(tf.layers.dense({ units: 16, activation: 'relu' }));
  m.add(tf.layers.dense({ units: ACTIONS.length, activation: 'linear' }));
  m.compile({ optimizer: tf.train.adam(0.001), loss: 'meanSquaredError' });
  return m;
}

export function initDQN() {
  if (!model) {
    model = createQModel();
  }
}

export function getActionIndex(action) {
  return ACTIONS.indexOf(action);
}

export function getActionName(index) {
  return ACTIONS[index];
}

export async function decideWithDQN(agent) {
   // เตรียม state input (normalize ให้เป็น 0-1)
    const state = [
      agent.state.hunger / 100,
      agent.state.energy / 100,
      agent.money / 100
    ];
  

    /* | สูง (0.9)      | เน้นสุ่มเยอะ (explore) | ช่วงต้นการเรียนรู้ |
    | กลาง (0.3–0.5) | ผสมทั้งสุ่มและใช้โมเดล | ช่วงกลาง           |
    | ต่ำ (0.01–0.1) | เน้นใช้โมเดล (exploit) | ช่วงท้าย/หลังฝึก   | */

    // epsilon น้อยหน่อย เพื่อเน้น exploit โมเดล (ปรับได้)
    const epsilon = agent.epsilon;
    const actionIndex = await selectAction(state, epsilon);
  
    // แปลงกลับเป็นชื่อ action
    const actionName = getActionName(actionIndex);
  
    return actionName;
}

// เลือก action โดยใช้ epsilon-greedy
export async function selectAction(state, epsilon = 0.1) {
  if (!model) {
    throw new Error('Model not initialized. Call initDQN() first.');
  }
  if (Math.random() < epsilon) {
    return Math.floor(Math.random() * ACTIONS.length);
  }

  const input = tf.tensor2d([state]);
  const qValues = await model.predict(input).data();
  input.dispose();
  return qValues.indexOf(Math.max(...qValues));
}

// เพิ่มประสบการณ์ใหม่
export function remember(experience) {
  REPLAY_BUFFER.push(experience);
  if (REPLAY_BUFFER.length > MAX_BUFFER_SIZE) REPLAY_BUFFER.shift();
}

// ฝึกจาก replay buffer
export async function trainFromBuffer(batchSize = 64) {
  if (!model) {
    throw new Error('Model not initialized. Call initDQN() first.');
  }
  if (REPLAY_BUFFER.length < batchSize) return;

  const batch = [];
  while (batch.length < batchSize) {
    const index = Math.floor(Math.random() * REPLAY_BUFFER.length);
    batch.push(REPLAY_BUFFER[index]);
  }

  const states = [];
  const targets = [];

  for (const { state, action, reward, nextState, done } of batch) {
    const qTensor = model.predict(tf.tensor2d([state]));
    const qNextTensor = model.predict(tf.tensor2d([nextState]));

    const q = await qTensor.array();
    const qNext = await qNextTensor.array();

    qTensor.dispose();
    qNextTensor.dispose();

    const updatedQ = q[0];
    updatedQ[action] = reward + (done ? 0 : GAMMA * Math.max(...qNext[0]));

    states.push(state);
    targets.push(updatedQ);
  }

  await model.fit(tf.tensor2d(states), tf.tensor2d(targets), {
    epochs: 1,
    shuffle: true
  });
}

export function getQModel() {
  return model;
}
export function calculateReward(agent, action) {
  // ตัวอย่างง่าย ๆ reward จากความเปลี่ยนแปลงของ hunger, energy และ money
  let reward = 0;

  switch(action) {
    case 'eat':
      reward = agent.state.hunger > 80 ? 1.5 : 1; // ถ้าค่า hunger ดีขึ้นมาก ให้รางวัล
      break;
    case 'rest':
      reward = agent.state.energy > 80 ? 0.8 : 0.6;
      break;
    case 'work':
      reward = agent.money > 500 ? 0.5 : 1;
      break;
    case 'idle':
      reward = -2;
      break;
    default:
      reward = 0;
  }

/*   if(agent.health < 50) {
    reward -= 0.5;
  }else{
    reward += 3;
  }

  if(agent.state.happiness < 50) {
    reward -= 0.5;
  }else{
    reward += 2;
  } */


  return reward;
}

