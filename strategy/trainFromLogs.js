import * as tf from '@tensorflow/tfjs';

const ACTIONS = ['eat', 'rest', 'work', 'buy', 'idle'];

export async function trainFromLogs(logs) {
  const inputs = [];
  const outputs = [];

  for (const log of logs) {
    if (!log.state || !ACTIONS.includes(log.action)) continue;

    const { hunger, energy, money } = log.state;

    // 🧠 Normalize input
    inputs.push([
      1 - hunger / 100,
      1 - energy / 100,
      1 - money / 100
    ]);

    // 🎯 One-hot encode action
    const output = Array(ACTIONS.length).fill(0);
    output[ACTIONS.indexOf(log.action)] = 1;
    outputs.push(output);
  }

  const xs = tf.tensor2d(inputs);
  const ys = tf.tensor2d(outputs);

  const model = tf.sequential();
  model.add(tf.layers.dense({ units: 8, inputShape: [3], activation: 'relu' }));
  model.add(tf.layers.dense({ units: ACTIONS.length, activation: 'softmax' }));

  model.compile({
    optimizer: 'adam',
    loss: 'categoricalCrossentropy',
    metrics: ['accuracy']
  });

  console.log('📚 Training model from logs...');
  await model.fit(xs, ys, {
    epochs: 100,
    shuffle: true
  });
  console.log('✅ Done training from logs');

  return { model, ACTIONS };
}
