import { citizens } from "./data/sampleAgents.js";
import { tick } from "./sim/tick.js"; // ต้องเป็น async function
import {  createQModel, loadModel, loadShareMemory, saveModel, saveSharedMemory } from "./strategy/dqn.js";
import { trainFromLogs, setTrainedModel } from "./strategy/neuralTf.js";
import fs from "fs";
import { loadJSON, saveJSON } from "./utils/file.js";
import chalk from "chalk";
import ora from 'ora';
import { waitWithSpinner } from "./utils/loading.js";
import { compareMultipleModelPerformance } from "./utils/calculation.js";
import { sleep } from "./utils/timer.js";


const result_path = "./model/modelResult.json";

export async function runSimulation(steps = 10, delay = 500, callback) {
  let i = 0;
  for (i; i < steps; i++) {
    const aliveCitizens = citizens.filter((c) => c.alive);

    if (aliveCitizens.length === 0) {
      console.log(`\n❌ ทุกคนเสียชีวิตแล้ว หยุด simulation ที่ Tick ${i + 1}`);
      break;
    }

    console.log(`📆 Tick ${i + 1} | เหลือ ${aliveCitizens.length} คน`);
    callback(i);
    await tick(aliveCitizens); // รอ tick ทำงานเสร็จ (รองรับ async)
    await sleep(delay);
    console.clear();
  }

  return i;

  /* console.log('\n🧠 Logs ของ Agent แรก:', citizens[0]?.memory.logs || 'ไม่มีข้อมูล'); */
}


async function runIndividalDQN(epochs = 5) {
  await train(epochs)
  await waitWithSpinner('Waiting for run...', 3000, '✅ Next run started!');
  run(epochs)

}

/* runIndividalDQN(50); */

