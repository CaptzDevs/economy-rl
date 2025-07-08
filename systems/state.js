export function updateState(citizen) {
  citizen.state.hunger = Math.max(0, citizen.state.hunger - 5);
  citizen.state.energy = Math.max(
    0,
    citizen.state.energy - (citizen._decision !== 'idle' && (citizen.job !== 'none' ? 1.5 : 0.5))
  );
  citizen.state.social = Math.max(0, (citizen.state.social ?? 100) - 0.3);

  // อัปเดต health ด้วยฟังก์ชันแยก
  citizen.state.health = calculateHealth(citizen.state);
  citizen.state.happiness = calculateHappiness(citizen.state);
  citizen.alive = checkIsAlive(citizen)

  
  
}

function checkIsAlive (citizen) {
  if (citizen.state.health <= 0) {
    citizen.logAction('dead');
    console.log(`💀 ${citizen.name} has died.`);
    return false;
  }else{
    return true
  }

}

function calculateHealth(state) {
  let health = state.health ?? 100;

  if (state.hunger > 80 || state.energy < 20 || state.social < 20) {
    health = Math.max(0, health - 1);
  } else if (state.hunger < 50 && state.energy > 70 && state.social > 50) {
    health = Math.min(100, health + 0.5);
  }
  
  return health;
}

function calculateHappiness(state) {
  const hungerPenalty = state.hunger > 70 ? -20 : 0;
  const energyBonus = state.energy > 60 ? 10 : -10;
  const socialBonus = state.social > 50 ? 10 : 0;

  return Math.max(0, Math.min(100, 50 + hungerPenalty + energyBonus + socialBonus));
}
