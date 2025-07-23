import { citizens } from "./data/sampleAgents.js";
import { tick } from "./sim/tick.js"; // ต้องเป็น async function
import {  createQModel, loadModel, loadShareMemory, saveModel, saveSharedMemory } from "./strategy/dqn.js";
import { loadJSON, saveJSON } from "./utils/file.js";
import chalk from "chalk";
import { waitWithSpinner } from "./utils/loading.js";
import { compareMultipleModelPerformance , summarizeActions } from "./utils/calculation.js";
import { runSimulation } from "./index.js";
import { sleep } from "./utils/timer.js";


import dotenv from 'dotenv';
dotenv.config();


const result_path = "./model/modelResult.json";


async function run(epochs = 3) {
    const sum = [];
    const rewards = [];

   for (let epoch = 0; epoch < epochs; epoch++) {

    const sharedMemory = await loadShareMemory()
    const loadBestTrainedModel =  await loadModel('file://./model/bestModel/model.json');
    const trainedModel = loadBestTrainedModel ?  loadBestTrainedModel : await loadModel() 

    const epsilon = 0

      for (const c of citizens) {
        c.strategy = "dqn";
        c.state.hunger = 100;
        c.state.energy = 100;
        c.state.happiness = 100;
        c.state.health = 100;
        c.money = 100;
        c.inventory.food = 1;
        c.alive = true;
        c.memory.logs = [];
        c.actionIndex = 0;
        c.totalReward = 0;
        c.epsilon = epsilon;
        c.age = 1;
        c.model = trainedModel
        c.weight = 60;
        c.replayBuffer =  [];
        // ถ้าอยากโหลดโมเดลแยก: await loadModel(`file://./model/${c.name}/model.json`)
      }

   
      const trainedTick = await runSimulation(1000, 1, (tick) => {
        console.log("epoch :", epoch+1)
        if (tick % 10 === 0 && tick > 0) {
          citizens.forEach((c) => c.age++);
        }
         console.log(
        `🚀 เริ่ม Simulation [${process.env.IS_TRAINING_MODEL.trim()}] รอบที่ ${epoch + 1} (ε = ${epsilon.toFixed(2)})` 
      );
      console.log(`🔄 Memory Size : ${citizens[0].replayBuffer.length }`)

         citizens.forEach((c) => {
            c.logAgentState()
          });
    console.log(summarizeActions(citizens[0].memory.logs));

      });

      sum.push(citizens[0].age);
      rewards.push(citizens[0].totalReward);
      //oldMoney = citizens[0].money;

    citizens.forEach((c) => {
      //console.log(`${c.name} action summary:`, summarizeActions(c.memory.logs));
    });

    // ถ้าคุณมีระบบ compareModelPerformance แบบรวม:
    const bestAgent = await compareMultipleModelPerformance(citizens, true);
    if (bestAgent) {
      // ถ้าอยาก save model แยก per agent:
     // await saveModel(citizens[bestAgent.index].model, `file://./model`);
    }
 
  }
    console.log('🏁 Simulation completed!');
    // 📊 แสดงผลรวม
    console.log("\n\n-----------Result-----------");
    console.log("🤖 จบเรียบร้อยแล้ว");
    console.log("📈 อายุรวมแต่ละรอบ:", sum);
    console.log("🥇 Reward รวมแต่ละรอบ:", rewards);
    console.log("📈 Age Avg.:", sum.reduce((a, b) => a + b, 0) / sum.length);
    console.log(summarizeActions(citizens[0].memory.logs));
    
}

run(1);



