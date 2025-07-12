import { updateState } from '../systems/state.js';

export async function tick(citizens, market = {}) {
  for (const citizen of citizens) {
    updateState(citizen);
    if (citizen.alive) {
      // รอ async action ถ้ามี
      await citizen.decideAndAct();
    }
   /*  const query = { ...citizen.state,
      age : citizen.age,
       money: citizen.money,
        reward : citizen.totalReward,
         inventory: citizen.inventory };
    console.log(query); */
  }
}
