import { citizens } from './data/sampleAgents.js';
import { tick } from './sim/tick.js';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runSimulation(steps = 10, delay = 500) {
  for (let i = 0; i < steps; i++) {
    const aliveCitizens = citizens.filter(c => c.alive);

    if (aliveCitizens.length === 0) {
      console.log(`\n❌ ทุกคนเสียชีวิตแล้ว หยุด simulation ที่ Tick ${i + 1}`);
      break;
    }

    console.log(`\n📆 Tick ${i + 1} | เหลือ ${aliveCitizens.length} คน`);
    tick(aliveCitizens);
    await sleep(delay);
  }

  // ตรวจสอบ log
  console.log('\n🧠 Logs ของ Agent แรก:', citizens[0].memory.logs);
  
}


runSimulation(1000, 500); // หน่วง 1 วินาทีระหว่าง tick
