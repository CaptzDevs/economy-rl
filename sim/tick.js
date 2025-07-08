import { updateState } from '../systems/state.js';

export function tick(citizens, market = {}) {
  for (const citizen of citizens) {
    updateState(citizen);
    if (citizen.alive) {
      citizen.decideAndAct();
    }
    const query = {...citizen.state, money: citizen.money , inventory: citizen.inventory};
    console.log(query);
  }
}
