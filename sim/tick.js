import { updateState } from '../systems/state.js';

export async function tick(citizens, market = {}) {
  for (const citizen of citizens) {
    updateState(citizen);
    if (citizen.alive) {
      // รอ async action ถ้ามี
      await citizen.decideAndAct();
    }
   
  }
}
