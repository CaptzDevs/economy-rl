import { citizens } from './data/sampleAgents.js';
import { tick } from './sim/tick.js';  // ต้องเป็น async function
import { initDQN } from './strategy/dqn.js';
import { trainFromLogs, setTrainedModel } from './strategy/neuralTf.js';
import fs from 'fs';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runSimulation(steps = 10, delay = 500, callback) {
  let i = 0
  for (i; i < steps; i++) {
    const aliveCitizens = citizens.filter(c => c.alive);

    if (aliveCitizens.length === 0) {
      console.log(`\n❌ ทุกคนเสียชีวิตแล้ว หยุด simulation ที่ Tick ${i + 1}`);
      break;
    }

    console.clear();
    callback(i)
    console.log(`📆 Tick ${i + 1} | เหลือ ${aliveCitizens.length} คน`);
    await tick(aliveCitizens);  // รอ tick ทำงานเสร็จ (รองรับ async)
    await sleep(delay);
  }

  return i

  /* console.log('\n🧠 Logs ของ Agent แรก:', citizens[0]?.memory.logs || 'ไม่มีข้อมูล'); */
}




async function runDQN() {
  initDQN();  // เริ่มด้วยการสร้างโมเดล DQN ก่อนใช้
  const sum = []
  const rewards = []
  let oldMoney = 0
  for (let index = 0; index < 5; index++) {

  citizens.forEach(c => {
    c.strategy = 'dqn'; // ตอนนี้ใช้โมเดลแล้ว
    c.state.hunger = 100;
    c.state.energy = 100;
    c.state.happiness = 100;
    c.state.health = 100;
    c.money = index === 0 ? 100 : oldMoney;
    c.inventory.food = 1;
    c.alive = true;
    c.memory.logs = [];
    c.actionIndex = 0;
    c.totalReward = 0;  // 👈 reset reward
    c.epsilon = 0.5//1.0 - index * 0.2;
    c.age = 1
  });

  console.log('🚀 เริ่ม simulation ด้วย DQN');
   const trainedTick = await runSimulation(1000, 0 , (tick)=>{
    console.log(`🧬 Gen : ${index+1}`)
    citizens.forEach(c => {
      c.age += tick%10 === 0 ? 1 : 0
    });
   });
   sum.push(citizens[0].age)
   rewards.push(citizens[0].totalReward)
   oldMoney = citizens[0].money


  }
  
  citizens.forEach(c => {
    console.log(`${c.name} action summary:`, summarizeActions(c.memory.logs));
  });
  
  console.log("\n\n-------------------")
  console.log('\n\n🤖 จบเรียบร้อยแล้ว')
  console.log('📈 รวมเรียบร้อยแล้ว', sum)
  console.log('🥇 จบเรียบร้อยแล้ว', rewards)



}

runDQN()


async function runNN() {
  // 0. ใช้ behavior tree ก่อนเพื่อให้มี log
  const sum = []
  const logs = []
  citizens.forEach(c => c.strategy = 'dqn');

  // 1. เก็บ logs
  const trainedTick = await runSimulation(1000, 0);
  sum.push(trainedTick)

  const trainedLogs = citizens[0].memory.logs;
  for (let index = 0; index < 5; index++) {
      
    
    const logs = citizens[0].memory.logs;
    const result = await trainFromLogs(trainedLogs);

    if (!result) {
      console.error('❌ เทรนโมเดลไม่สำเร็จ (log อาจไม่พอ)');
      return;
    }

    const { model, ACTIONS } = result;
    // 3. ตั้งโมเดล
    setTrainedModel(model, ACTIONS);

    // 4. รีเซ็ต agent
    citizens.forEach(c => {
      c.strategy = 'nn'; // ตอนนี้ใช้โมเดลแล้ว
      c.state.hunger = 100;
      c.state.energy = 100;
      c.state.happiness = 100;
      c.state.health = 100;
      c.money = 100;
      c.inventory.food = 1;
      c.alive = true;
      c.memory.logs = [];
      c.actionIndex = 0;
    });

    // 5. จำลองรอบใหม่ด้วยโมเดล
    console.log(`\n🤖 เริ่มใช้โมเดลที่ฝึกแล้ว`);
    sum.push( await runSimulation(1000, 0))
    

  }
  console.log('\n\n🤖 จบเรียบร้อยแล้ว', sum)
  console.log('\n\n🤖 AGV.',( sum.reduce((a, b) => a + b, 0) / sum.length).toFixed(2))


  console.log(summarizeActions(trainedLogs))
}

/* runNN(); */

function summarizeActions(logs) {
  const summary = {};

  for (const log of logs) {
    const action = log.action;
    if (!action) continue;

    if (!summary[action]) {
      summary[action] = 0;
    }

    summary[action]++;
  }

  return summary;
}

