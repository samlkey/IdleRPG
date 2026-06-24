import { World } from '../services/location.service';

export const WORLDS: World[] = [
  {
    id: 'tutorial-island',
    locations: [
      {
        id: 'tutorial-town',
        name: 'Tutorial Town',
        description: 'A small town where you can learn the basics of the game.',
        background: 'assets/backgrounds/woodcutting.png',
        travelReq: 1,
        x: 35,
        y: 120,
        connections: [],
        activities: {
          woodcutting: ['Normal Tree'],
          mining: ['Copper Ore', 'Tin Ore', 'Water Crystal Core'],
          fishingSpot: ['Tutorial Pond'],
          thievingArea: ['Tutorial Market'],
          agilityCourse: ['Tutorial Course'],
          quests: ['tutorial-island'],
          farming: { allotments: 1, herbs: 1, trees: 1 },
        },
      },
      {
        id: 'tutorial-forest',
        name: 'Tutorial Forest',
        description: 'A small forest where you can practice your skills.',
        background: 'assets/backgrounds/forest.png',
        travelReq: 1,
        x: 100,
        y: 100,
        connections: ['tutorial-town'],
        activities: {
          woodcutting: ['Oak Tree'],
          fishingSpot: ['Forest Pond'],
        },
        monsters: ['goblin'],
      },
      {
        id: 'tutorial-cavern',
        name: 'Tutorial Cavern',
        description: 'A small cavern where you can find some basic ores.',
        background: 'assets/backgrounds/cavern.png',
        travelReq: 1,
        x: 150,
        y: 80,
        connections: ['tutorial-forest'],
        activities: {
          mining: ['Copper Ore', 'Tin Ore'],
        },
        monsters: ['bat'],
        killReq: 35,
      },
      {
        id: 'tutorial-shores',
        name: 'Tutorial Shores',
        description: 'A small shore where you can practice fishing.',
        background: 'assets/backgrounds/shores.png',
        travelReq: 1,
        x: 250,
        y: 50,
        connections: ['tutorial-cavern'],
        activities: {
          fishingSpot: ['Tutorial Pond'],
        },
      },
    ],
  },
];
