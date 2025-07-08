export function decideAndAct(citizen) {
    const { desire } = citizen;
  
    if (desire.eat > 0.8) {
      console.log(`${citizen.name} decides to eat.`);
      citizen.state.hunger -= 30;
      citizen.money -= 10;
    } else if (desire.rest > 0.8) {
      console.log(`${citizen.name} decides to rest.`);
      citizen.state.energy += 20;
    } else if (citizen.isWorkingAge() && citizen.job) {
      console.log(`${citizen.name} goes to work.`);
      citizen.money += 20;
      citizen.state.energy -= 10;
    } else {
      console.log(`${citizen.name} idles.`);
    }
  }
  