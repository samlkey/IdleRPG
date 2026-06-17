import { GameLocation } from '../services/location.service';

export const LOCATIONS: GameLocation[] = [
  {
    id: 'tutorial-island',
    name: 'Tutorial Island',
    description:
      'A small, isolated island with basic resources to get you started on your adventure.',
    background: 'assets/backgrounds/woodcutting.png',
    travelReq: 1,
    activities: {
      //TODO: Change these to IDs instead of names, and make sure the names are unique
      woodcutting: ['Normal Tree'],
      mining: ['Copper Ore', 'Tin Ore', 'Water Crystal Core'],
      fishingSpot: ['Tutorial Pond'],
      thievingArea: ['Tutorial Market'],
      agilityCourse: ['Tutorial Course'],
      quests: ['tutorial-island'],
    },
  },
  {
    id: 'mainland',
    name: 'Mainland',
    description:
      'A quiet starting village with basic resources and easy pickings.',
    background: 'assets/backgrounds/woodcutting.png',
    travelReq: 1,
    activities: {
      woodcutting: ['Normal Tree', 'Oak Tree'],
      mining: ['Copper Ore', 'Tin Ore', 'Iron Ore'],
      fishingSpot: ['Mainland Shores'],
      thievingArea: ['Mainland Square', 'Mainland Market'],
      quests: [
        'honest-work',
        'running-man',
        'druids-circle',
        'what-you-can-how-you-can',
        'no-place-like-home',
        'dwarfs-dilemma',
      ],
    },
  },
  {
    id: 'varrock',
    name: 'Varrock',
    description:
      'A bustling city with markets ripe for the picking and denser forests.',
    background: 'assets/backgrounds/thieving.png',
    travelReq: 15,
    activities: {
      woodcutting: ['Oak Tree', 'Willow Tree'],
      mining: ['Iron Ore', 'Coal Ore'],
      fishingSpot: ['Muddy Lake'],
      thievingArea: ['Varrock Market'],
      quests: ['dwarfs-dilemma', 'a-bounty-in-blood'],
    },
  },
  {
    id: 'catherby',
    name: 'Catherby',
    description:
      'A coastal town with rich fishing waters and dense maple forests.',
    background: 'assets/backgrounds/fishing.png',
    travelReq: 30,
    activities: {
      woodcutting: ['Willow Tree', 'Maple Tree'],
      mining: ['Coal Ore', 'Mithril Ore'],
      fishingSpot: ['Salty Cove'],
      thievingArea: ['Ardougne'],
      quests: ['dragon-slayer', 'no-place-like-home'],
    },
  },
  {
    id: 'ardougne',
    name: 'Ardougne',
    description:
      'A wealthy city of merchants and knights. High risk, high reward.',
    background: 'assets/backgrounds/thieving_town_1.png',
    travelReq: 55,
    activities: {
      woodcutting: ['Maple Tree', 'Yew Tree'],
      mining: ['Mithril Ore', 'Adamant Ore'],
      fishingSpot: ['Deep Sea Dock'],
      thievingArea: ['Ardougne'],
      quests: ['no-place-like-home', 'a-bounty-in-blood'],
    },
  },
  {
    id: 'wilderness',
    name: 'Wilderness',
    description:
      'The lawless frontier. Elite resources await those skilled enough to survive.',
    background: 'assets/backgrounds/fishing_spot_1.png',
    travelReq: 75,
    activities: {
      woodcutting: ['Yew Tree', 'Magic Tree'],
      mining: ['Adamant Ore', 'Runite Ore'],
      fishingSpot: ['Deep Sea Dock'],
      thievingArea: ['Ardougne'],
      quests: ['dragon-slayer', 'a-bounty-in-blood'],
    },
  },
];
