import { loadJSON, saveJSON } from "./file.js";
const result_path = "./model/modelResult.json";
import { loadModel, saveSharedMemory } from "../strategy/dqn.js";
import chalk from "chalk";

function getBestModel(models) {
  if (!models || models.length === 0) return null;

  return models.reduce((best, current) => {
    if (current.reward > best.reward) return current;
    if (current.reward === best.reward && current.age > best.age) return current;
    return best;
  });
}

export const saveModelPerformance = async (agents ,epochs,epsilon, isTestModel = false) => {
  console.log(
    agents.map((item) => ({ age: item.age, reward: item.totalReward }))
  );

  const queryBestAgent = {
    index: epochs,
    name: agents[0].name,
    age: agents[0].age,
    reward: agents[0].totalReward,
  };
  
  let resultSet = [queryBestAgent]
  
  try {
    const savedResult = await loadJSON(result_path);
    if(savedResult){
      const bestAgent = getBestModel(savedResult);

      //Normal save
      resultSet = [queryBestAgent,...savedResult]
      !isTestModel && saveSharedMemory(agents[0].replayBuffer)
      !isTestModel && saveJSON(result_path, resultSet);

      //Campare with best model and save
      if(epsilon <= 0.2){
      const bestTrainedModel = await loadModel('file://./model/bestModel/model.json');

      if(!bestTrainedModel) {
        return queryBestAgent;
      }else{
        const ageColor = queryBestAgent.age >= bestAgent.age ? chalk.green : chalk.red;
        const rewardColor = queryBestAgent.reward >= bestAgent.reward ? chalk.green : chalk.red;
          console.log(`📈 Age: ${bestAgent.age.toFixed(2)} -> ${ageColor(queryBestAgent.age.toFixed(2))}`);
          console.log(`🥇 Reward: ${bestAgent.reward.toFixed(2)} -> ${rewardColor(queryBestAgent.reward.toFixed(2))}`);
          !isTestModel && saveSharedMemory(bestAgent.replayBuffer)
          
          if (queryBestAgent.age > bestAgent.age) {
            console.log(chalk.green("✅ Model result : Better"));
            return queryBestAgent;
          } else if( queryBestAgent.age === bestAgent.age && queryBestAgent.reward > bestAgent.reward) {
            console.log(chalk.green("✅ Model result : Better"));
            return queryBestAgent;
          } else {
            console.log(chalk.red("❌ Model result : Bad"));
            return false;
          }
        }

      }else{
          return false;
      }
     } else {
      throw Error("No Save Model Result");
    }

  } catch (err) {
    // กรณีไฟล์ performance เดิมไม่มี => สร้างใหม่
    console.log("❌ Err :", err.message);
    !isTestModel && saveSharedMemory(agents[0].replayBuffer)
    !isTestModel && saveJSON(result_path, resultSet);
    console.log("📄 No Model Result : Create new ");
    return queryBestAgent;
  }
};


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
      
        const ageColor = queryBestAgent.age >= savedResult[0].age ? chalk.green : chalk.red;
        const rewardColor = queryBestAgent.reward >= savedResult[0].reward ? chalk.green : chalk.red;

        console.log(`📈 Age: ${savedResult[0].age.toFixed(2)} -> ${ageColor(queryBestAgent.age.toFixed(2))}`);
        console.log(`🥇 Reward: ${savedResult[0].reward.toFixed(2)} -> ${rewardColor(queryBestAgent.reward.toFixed(2))}`);
         !isTestModel && saveSharedMemory(bestAgent.replayBuffer)

      if (
        queryBestAgent.age > savedResult[0].age 
      ) {
        !isTestModel && saveJSON(result_path, queryBestAgent);
        console.log(chalk.green("✅ Model result : Better"));
        return queryBestAgent;
      } else if( queryBestAgent.age === savedResult[0].age && queryBestAgent.reward > savedResult[0].reward) {
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
