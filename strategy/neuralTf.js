import * as tf from '@tensorflow/tfjs';

let trainedModel = null;
let trainedActions = ['eat', 'rest', 'work', 'idle'];

// สร้างโมเดล
function createModel() {
  const model = tf.sequential();
  model.add(tf.layers.dense({ units: 16, inputShape: [3], activation: 'relu' }));
  model.add(tf.layers.dense({ units: 8, activation: 'relu' }));
  model.add(tf.layers.dense({ units: 4, activation: 'softmax' }));

  model.compile({
    optimizer: 'adam',
    loss: 'categoricalCrossentropy',
    metrics: ['accuracy']
  });

  return model;
}

// ฝึกด้วยชุดข้อมูลเริ่มต้นที่สะท้อนความเป็นจริง (0 = หิวมาก, 1 = อิ่ม)
export async function trainModel() {
  const model = createModel();

  const trainingData = tf.tensor2d([
    [0.1, 0.2, 0.1],  // หิวมาก, พลังน้อย, เงินน้อย → eat
    [0.9, 0.95, 0.2], // อิ่ม, พลังเต็ม → work
    [0.6, 0.2, 0.5],  // พลังต่ำ → rest
    [0.05, 0.1, 0.1], // ทุกอย่างแย่ → eat
    [0.4, 0.6, 0.05], // พลังพอ, เงินน้อย → work
  ]);

  const outputData = tf.tensor2d([
    [1, 0, 0, 0], // eat
    [0, 0, 1, 0], // work
    [0, 1, 0, 0], // rest
    [1, 0, 0, 0], // eat
    [0, 0, 1, 0], // work
  ]);

  await model.fit(trainingData, outputData, {
    epochs: 100,
    shuffle: true
  });

  trainedModel = model;
  console.log('✅ Neural network trained (default)');
}

// ใช้โมเดลตัดสินใจ
export async function decideWithTrainedNN(agent) {
  if (!trainedModel) {
    console.warn('⚠️ Neural model is not trained');
    return 'idle';
  }

  const input = tf.tensor2d([[
    agent.state.hunger / 100,  // 0 = หิว, 1 = อิ่ม
    agent.state.energy / 100,  // 0 = หมดแรง, 1 = เต็มแรง
    agent.money / 100          // 0 = จน, 1 = รวย
  ]]);

  const prediction = trainedModel.predict(input);
  const result = await prediction.data();

  const maxIndex = result.indexOf(Math.max(...result));
  return trainedActions[maxIndex];
}

// สำหรับเซ็ตโมเดลจากภายนอก
export function setTrainedModel(model, actions = ['eat', 'rest', 'work', 'idle']) {
  trainedModel = model;
  trainedActions = actions;
}

// ฝึกจาก logs จริง
export async function trainFromLogs(logs) {

  const trainingInputs = [];
  const trainingOutputs = [];

  const ACTIONS = ['eat', 'rest', 'work', 'idle'];

  for (const log of logs) {
    if (!log.decision || !ACTIONS.includes(log.action)) continue;
    if (!log.state || log.state.health <= 0) continue;
    // ให้ความสำคัญกับคนใกล้ตายแต่รอด
    if (log.state.health < 30 && log.action !== 'eat') continue;

    const input = [
      (log.state.hunger ?? 100) / 100,
      (log.state.energy ?? 100) / 100,
      (log.money ?? 100) / 100,
    ];

    const output = ACTIONS.map(a => (a === log.action ? 1 : 0));

    trainingInputs.push(input);
    trainingOutputs.push(output);
  }

  if (trainingInputs.length === 0) {
    console.warn('⚠️ No valid logs to train from');
    return null;
  }

  const inputTensor = tf.tensor2d(trainingInputs);
  const outputTensor = tf.tensor2d(trainingOutputs);

  const model = createModel();

  await model.fit(inputTensor, outputTensor, {
    epochs: 100,
    shuffle: true
  });

  console.log('✅ Neural network trained from logs');

  trainedModel = model;
  trainedActions = ACTIONS;

  return { model, ACTIONS };
}
