import { citizens } from "./data/sampleAgents.js";
import {  createQModel, loadModel, loadShareMemory, saveModel, saveSharedMemory } from "./strategy/dqn.js";
import { waitWithSpinner } from "./utils/loading.js";
import { compareMultipleModelPerformance } from "./utils/calculation.js";
import { runSimulation } from "./index.js";
import { sleep } from "./utils/timer.js";

import dotenv from 'dotenv';
dotenv.config();

const result_path = "./model/modelResult.json";

async function train(epochs = 3) {
   return new Promise(async (resolve, reject) => {
     for (let epoch = 0; epoch < epochs; epoch++) {
    const sum = [];
    const rewards = [];
    let oldMoney = 0;

        const sharedMemory = await loadShareMemory() ?? []
        const epsilon = Math.max(0.1, 1.0 - epoch * 0.3);

      for (const c of citizens) {
        c.strategy = "dqn";
        c.state.hunger = 100;
        c.state.energy = 100;
        c.state.happiness = 100;
        c.state.health = 100;
        c.money = 100 ;
        c.inventory.food = 1;
        c.alive = true;
        c.memory.logs = [];
        c.actionIndex = 0;
        c.totalReward = 0;
        c.epsilon = epsilon;
        c.age = 1;
        c.model = createQModel();
        
        c.replayBuffer = sharedMemory ?? [];
        // ถ้าอยากโหลดโมเดลแยก: await loadModel(`file://./model/${c.name}/model.json`)
      }
      const trainedTick = await runSimulation(1000, 0, (tick) => {
        console.log("epoch :", epoch+1)
        if (tick % 10 === 0 && tick > 0) {
          citizens.forEach((c) => c.age++);
        }
         console.log(
        `🚀 เริ่ม Train Simulation [${process.env.IS_TRAINING_MODEL.trim()}] รอบที่ ${epoch + 1} (ε = ${epsilon.toFixed(2)})` 
      );
      console.log(`🔄 Memory Size : ${sharedMemory.length }`)

      });


      sum.push(citizens[0].age);
      rewards.push(citizens[0].totalReward);
      oldMoney = citizens[0].money;

    citizens.forEach((c) => {
      //console.log(`${c.name} action summary:`, summarizeActions(c.memory.logs));
    });

    // ถ้าคุณมีระบบ compareModelPerformance แบบรวม:
    const bestAgent = await compareMultipleModelPerformance(citizens);
    if (bestAgent) {
      // ถ้าอยาก save model แยก per agent:
      await saveModel(citizens[bestAgent.index].model, `file://./model`);
    }
    if(epoch < epochs-1 ){
      await waitWithSpinner('Waiting for next epoch...', 3000, '✅ Next epoch started!');
    }
  }
    console.log('🏁 Simulation completed!');
    resolve();
   })
}


train(50);


