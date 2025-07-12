import { Citizen } from '../models/Citizen.js';
import { createQModel } from '../strategy/dqn.js';

const totalAgents = 1;

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
  strategy: 'dqn'
};

const citizens = Array.from({ length: totalAgents }).map((_, i) => {
  const data = { ...initialAgentData }; // <- clone ไม่ให้ชี้ object เดียวกัน
  const c = new Citizen(data);
  c.model = createQModel();
  c.replayBuffer = [];
  c.name = `${data.name}-${i+1}`;
  c.id = `${data.id}-${i+1}`;
  return c;
});

export { citizens, initialAgentData };
