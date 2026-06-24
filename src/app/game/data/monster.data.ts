import { Monster } from '../services/monster.service';

export const MONSTERS: Monster[] = [
  {
    id: 'goblin',
    name: 'Goblin',
    description:
      'A small, green humanoid creature that is known for its mischievous nature.',
    icon: 'assets/monsters/goblin.png',
    level: 1,
    stats: {
      health: 20,
      attack: 5,
      strength: 3,
      defense: 2,
      ranged: 1,
      magic: 0,
    },
    drops: [
      { itemId: 'goblin-ear', chance: 0.5, qty: 1 },
      { itemId: 'copper-ore', chance: 1, qty: 1 },
    ],
  },
];
