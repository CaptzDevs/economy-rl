

async function runDQN(epochs = 3) {
  for (let epoch = 0; epoch < epochs; epoch++) {
    const sum = [];
    const rewards = [];
    let oldMoney = 0;
    let isFirstTrain = true;
    try {
      console.log("💾 Loading Exist model...");
      await sleep(3000);
      await loadModel(); // ✅ โหลดโมเดลเดิม ถ้ามี
      isFirstTrain = false;
    } catch {
      console.log("📦 No Existing Model => Create New");
      await sleep(3000);
      initDQN(); // ✅ สร้างโมเดลใหม่ถ้าโหลดไม่เจอ
    }

    for (let index = 0; index < 1; index++) {
      const epsilon = Math.max(0.1, 1.0 - index * 0.2); // 🔻 ลด epsilon

      citizens.forEach((c) => {
        c.strategy = "dqn";
        c.state.hunger = 100;
        c.state.energy = 100;
        c.state.happiness = 100;
        c.state.health = 100;
        c.money = index === 0 ? 100 : oldMoney;
        c.inventory.food = 1;
        c.alive = true;
        c.memory.logs = [];
        c.actionIndex = 0;
        c.totalReward = 0;
        c.epsilon = epsilon;
        c.age = 1;
      });

      console.log(
        `🚀 เริ่ม Simulation รอบที่ ${index + 1} (ε = ${epsilon.toFixed(2)})`
      );

      const trainedTick = await runSimulation(1000, 0, (tick) => {
        if (tick % 10 === 0) {
          citizens.forEach((c) => c.age++);
        }
      });

      sum.push(citizens[0].age);
      rewards.push(citizens[0].totalReward);
      oldMoney = citizens[0].money;
    }

    // 📊 แสดงผลรวม
    console.log("\n\n-----------Result-----------");
    console.log("🤖 จบเรียบร้อยแล้ว");
    console.log("📈 อายุรวมแต่ละรอบ:", sum);
    console.log("🥇 Reward รวมแต่ละรอบ:", rewards);
    if ((await compareModelPerformance({ sum, rewards })) || isFirstTrain) {
      // 💾 Save Model
      await saveModel();
      console.log("🤖 Saved Model");
    }

    // 🧠 สรุปผลแต่ละ agent
    citizens.forEach((c) => {
      console.log(`${c.name} age: ${c.age} reword : ${c.totalReward}`);
      /* console.log(`${c.name} action summary:`, summarizeActions(c.memory.logs)); */
    });
    await sleep(5000);
  }
}

/* runDQN(20); */

const compareModelPerformance = async (newResult) => {
  try {
    const result = await loadJSON(result_path);

    console.log(newResult.map((item) => item.age));
    console.log(newResult.map((item) => item.totalReward));

    const totalAge = result.sum.reduce((a, b) => a + b, 0);
    const totalNewAge = newResult.sum.reduce((a, b) => a + b, 0);
    const totalReward = result.rewards.reduce((a, b) => a + b, 0);
    const totalNewReward = newResult.rewards.reduce((a, b) => a + b, 0);

    console.log("\n\n---------Compare Model Performance-----------");

    console.log("📈 Old Age:", result.sum);
    console.log("🥇 Old Reward:", result.rewards);
    // เปรียบเทียบ performance เดิมกับใหม่

    if (totalNewAge > totalAge && totalNewReward > totalReward) {
      saveJSON(result_path, newResult);
      console.log(chalk.green("✅ Model result : Better"));
      return true;
    } else {
      console.log(chalk.red("❌ Model result : Bad"));

      return false;
    }
  } catch (err) {
    // กรณีไฟล์ performance เดิมไม่มี => สร้างใหม่
    saveJSON(result_path, newResult);
    console.log("📄 No Model Result : Create new ");
    return false;
  }
};

async function runNN() {
  // 0. ใช้ behavior tree ก่อนเพื่อให้มี log
  const sum = [];
  const logs = [];
  citizens.forEach((c) => (c.strategy = "dqn"));

  // 1. เก็บ logs
  const trainedTick = await runSimulation(1000, 0);
  sum.push(trainedTick);

  const trainedLogs = citizens[0].memory.logs;
  for (let index = 0; index < 5; index++) {
    const logs = citizens[0].memory.logs;
    const result = await trainFromLogs(trainedLogs);

    if (!result) {
      console.error("❌ เทรนโมเดลไม่สำเร็จ (log อาจไม่พอ)");
      return;
    }

    const { model, ACTIONS } = result;
    // 3. ตั้งโมเดล
    setTrainedModel(model, ACTIONS);

    // 4. รีเซ็ต agent
    citizens.forEach((c) => {
      c.strategy = "nn"; // ตอนนี้ใช้โมเดลแล้ว
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
    sum.push(await runSimulation(1000, 0));
  }
  console.log("\n\n🤖 จบเรียบร้อยแล้ว", sum);
  console.log(
    "\n\n🤖 AGV.",
    (sum.reduce((a, b) => a + b, 0) / sum.length).toFixed(2)
  );

  console.log(summarizeActions(trainedLogs));
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
