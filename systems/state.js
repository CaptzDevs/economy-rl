export function updateState(citizen) {
  citizen.state.hunger = citizen._decision !== 'idle' 
        ? Math.max(0, citizen.state.hunger - 0.5) 
        : citizen.state.hunger 
  citizen.state.energy = Math.max(
    0,
    citizen.state.energy - (citizen._decision !== 'idle' && (citizen.job !== 'none' ? 1.5 : 0.5))
  );
  citizen.state.social = Math.max(0, (citizen.state.social ?? 100) - 0.3);
  
  // อัปเดต health ด้วยฟังก์ชันแยก
  citizen.state.health = calculateHealth(citizen);
  citizen.state.happiness = calculateHappiness(citizen);
  citizen.alive = checkIsAlive(citizen)
  
  citizen.weight =  Math.max(0, citizen.weight -  0.3);
  citizen.bmi = calculateBMI(citizen)
}


function calculateBMI (citizen) {
     return citizen.height > 0 ? citizen.weight / ((citizen.height / 100) ** 2) : 0;
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

function calculateHealth(citizen) {
  let health = citizen.state.health ?? 100;
  let baseHealthDecay = 4 * (citizen.age*0.2)
  const hunger = citizen.state.hunger ?? 100;  // 0 = หิวสุด, 100 = อิ่ม
  const energy = citizen.state.energy ?? 100;  // 0 = หมดแรง
  const bmi = citizen.bmi
  const social = citizen.state.social ?? 100;  // 0 = โดดเดี่ยว

  // เงื่อนไขเสื่อมสุขภาพ
  if (hunger < 20) {
    health -= baseHealthDecay; // หิวมาก
  } else if (hunger < 50) {
    health -= baseHealthDecay+.5; // เริ่มหิว
  }

  if (energy < 20) {
    health -= 2; // พลังงานต่ำ
  }

  if(hunger > 0 && energy > 0 ) {
      // เงื่อนไขฟื้นฟูสุขภาพ
    if (hunger > 70 ) {
      health += baseHealthDecay; // สมดุลชีวิตดี
    }
    if (energy > 70) {
      health += baseHealthDecay; // สมดุลชีวิตดี
    } 
    if (hunger > 50 && energy > 50) {
      health += baseHealthDecay;
    }
  }

  if(bmi >= 18.5 && bmi <= 22.9 ){
    health += baseHealthDecay;
  }else{
    health -= baseHealthDecay;
  }

  
  // จำกัดค่าให้อยู่ในช่วง 0-100
  health = Math.max(0, Math.min(100, health));

  return health;
}


function calculateHappiness(citizen) {
  const hungerPenalty = citizen.state.hunger > 70 ? -20 : 0;
  const energyBonus = citizen.state.energy > 60 ? 10 : -10;
  const socialBonus = citizen.state.social > 50 ? 10 : 0;

  return Math.max(0, Math.min(100, 50 + hungerPenalty + energyBonus + socialBonus));
}
