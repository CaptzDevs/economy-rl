export function updateDesire(citizen) {
    citizen.desire.eat = normalize(citizen.state.hunger);
    citizen.desire.rest = 1 - normalize(citizen.state.energy);
    citizen.desire.socialize = 1 - normalize(citizen.state.happiness); // assuming social = part of happiness
    citizen.desire.earnMoney = 1 - citizen.state.happiness / 100;
  }
  
  function normalize(value, max = 100) {
    return Math.min(1, Math.max(0, value / max));
  }
  