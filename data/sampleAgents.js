import { Citizen } from '../models/Citizen.js';

export const citizens = [
  new Citizen({
    id: 'agent-001',
    role: 'citizen',
    job: 'worker',
    age: 23,
    name: 'Alice',
    money: 100,
    state: { hunger: 60 },
    inventory: { food: 1 },
    personality: { laziness: 0.4, greed: 0.7, thriftiness: 0.2 },
    strategy: 'bt'
  })
];