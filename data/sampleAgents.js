import { model } from '@tensorflow/tfjs';
import { Citizen } from '../models/Citizen.js';
import { createQModel } from '../strategy/dqn.js';

const totalAgents = 10;

const initialAgentData = {
  id: 'agent',
  role: 'citizen',
  job: 'worker',
  age: 0,
  name: 'Agent',
  money: 100,
  state: { hunger: 100 },
  inventory: { food: 1 },
  personality: { laziness: 0.4, greed: 0.7, thriftiness: 0.2 },
  strategy: 'dqn',
  model: createQModel(),
};

const citizens = [new Citizen(initialAgentData)];

export { citizens, initialAgentData };
