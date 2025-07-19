import { loadJSON, saveJSON } from "./file.js";
const result_path = "./model/modelResult.json";
import { saveSharedMemory } from "../strategy/dqn.js";
import chalk from "chalk";

export const compareMultipleModelPerformance = async (agents , isTestModel = false) => {
  console.log(
    agents.map((item) => ({ age: item.age, reward: item.totalReward }))
  );

  const bestIndex = agents.reduce(
    (bestIdx, agent, idx, arr) =>
      agent.totalReward > arr[bestIdx].totalReward ? idx : bestIdx,
    0
  );

  const bestAgent = agents[bestIndex];
  const queryBestAgent = {
    index: bestIndex,
    name: bestAgent.name,
    age: bestAgent.age,
    reward: bestAgent.totalReward,
  };
  
  try {
    console.log("\n---------Compare Model Performance-----------");
    console.log("🏆 Best Agent:", queryBestAgent.name);
    const savedResult = await loadJSON(result_path);
    if (savedResult) {
      
        const ageColor = queryBestAgent.age >= savedResult.age ? chalk.green : chalk.red;
        const rewardColor = queryBestAgent.reward >= savedResult.reward ? chalk.green : chalk.red;

        console.log(`📈 Age: ${savedResult.age.toFixed(2)} -> ${ageColor(queryBestAgent.age.toFixed(2))}`);
        console.log(`🥇 Reward: ${savedResult.reward.toFixed(2)} -> ${rewardColor(queryBestAgent.reward.toFixed(2))}`);
         !isTestModel && saveSharedMemory(bestAgent.replayBuffer)

      if (
        queryBestAgent.age > savedResult.age 
      ) {
        !isTestModel && saveJSON(result_path, queryBestAgent);
        console.log(chalk.green("✅ Model result : Better"));
        return queryBestAgent;
      } else if( queryBestAgent.age === savedResult.age && queryBestAgent.reward > savedResult.reward) {
        !isTestModel && saveJSON(result_path, queryBestAgent);
        console.log(chalk.green("✅ Model result : Better"));
        return queryBestAgent;
      }
    else {
        console.log(chalk.red("❌ Model result : Bad"));
        return false;
      }

    } else {
      throw Error("No Save Model Result");
    }
  } catch (err) {
    // กรณีไฟล์ performance เดิมไม่มี => สร้างใหม่
    console.log("❌ Err :", err.message);
     !isTestModel &&saveJSON(result_path, queryBestAgent);
     !isTestModel &&saveSharedMemory(bestAgent.replayBuffer)
    console.log("📄 No Model Result : Create new ");
    return queryBestAgent;
  }
};

export function summarizeActions(logs) {
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
