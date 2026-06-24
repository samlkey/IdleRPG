import { Quest } from '../shared/components/quest-card/quest-card.component';

export const QUESTS: Quest[] = [
  {
    id: 'tutorial-island',
    name: 'Tutorial Island',
    description:
      'You find yourself on a mysterious island with no memory of how you got there. Complete a series of tasks to learn the basics and earn your freedom.',
    completionText:
      'Manuel gives you a firm handshake and a warm smile. "You\'ve proven yourself capable — the mainland awaits. Safe travels, adventurer."',
    icon: 'assets/objects/map.png',
    questPoints: 1,
    status: 'completed',
    requirements: [],
    rewards: [
      { type: 'coins', amount: 500 },
      {
        type: 'location',
        locationId: 'mainland',
        label: 'Mainland',
        icon: 'assets/objects/map.png',
      },
    ],
    steps: [
      {
        stepIndex: 0,
        completed: false,
        dialog: [
          {
            speaker: 'Manuel',
            text: "Ah, a newcomer! My name is Manuel. Before you venture out into the world you'll need to survive in the wild. Trees are your first resource — let's start there.",
          },
          {
            speaker: 'Manuel',
            text: "Select the Woodcutting section in the Navigation Panel, let's see if you can cut 5 Normal Logs. You can track your current objective by clicking on the 'Tracking Icon' at the top of this quest!",
          },
        ],
        tasks: [
          {
            action: 'Cut 5',
            description: 'Normal Logs',
            icon: 'assets/icons/woodcutting.png',
            condition: {
              type: 'gather',
              skillId: 'woodcutting',
              itemId: 'normal-log',
              qty: 5,
            },
            completed: false,
          },
        ],
      },
      {
        stepIndex: 1,
        completed: false,
        dialog: [
          {
            speaker: 'Manuel',
            text: "You may have noticed you've collected some items from your Woodcutting",
          },
          { speaker: 'Manuel', text: "Let's take a look into your character" },
        ],
        tasks: [
          {
            action: 'Navigate to',
            description: 'Character',
            icon: 'assets/icons/character.png',
            condition: { type: 'navigation', tab: 'character' },
            completed: false,
          },
        ],
      },
      {
        stepIndex: 2,
        completed: false,
        dialog: [
          {
            speaker: 'Manuel',
            text: "Well done! Those logs are useless if you can't keep warm at night. Some logs are all you need to start a fire.",
          },
          {
            speaker: 'Manuel',
            text: "Select the Firemaking section and burn 5 Normal Logs. Light 5 fires and I'll teach you how we can catch some fish!",
          },
        ],
        tasks: [
          {
            action: 'Burn 5',
            description: 'Normal Logs',
            icon: 'assets/objects/normal_log.png',
            condition: { type: 'skill-action', skillId: 'firemaking', qty: 5 },
            completed: false,
          },
        ],
      },
      {
        stepIndex: 3,
        completed: false,
        dialog: [
          { speaker: 'Manuel', text: 'Getting toasty in here!' },
          {
            speaker: 'Manuel',
            text: "Let's see if you can catch some Shrimp. Navigate to the Fishing section and cast away.",
          },
        ],
        tasks: [
          {
            action: 'Catch 10',
            description: 'Raw Shrimp',
            icon: 'assets/objects/shrimp.png',
            condition: {
              type: 'gather',
              skillId: 'fishing',
              itemId: 'raw-shrimp',
              qty: 10,
            },
            completed: false,
          },
        ],
      },
      {
        stepIndex: 4,
        completed: false,
        dialog: [
          { speaker: 'Manuel', text: "Nice catch! Now let's cook them up." },
          {
            speaker: 'Manuel',
            text: "Select the Cooking section and select Raw Shrimp under 'Ingredients'. You might have to fish more Raw Shrimp if you burn too many!",
          },
        ],
        tasks: [
          {
            action: 'Cook 5',
            description: 'Raw Shrimp',
            icon: 'assets/objects/cooked_shrimp.png',
            condition: {
              type: 'gather',
              skillId: 'cooking',
              itemId: 'cooked-shrimp',
              qty: 5,
            },
            completed: false,
          },
        ],
      },
      {
        stepIndex: 5,
        completed: false,
        dialog: [
          {
            speaker: 'Manuel',
            text: "They are looking tasty! Now you have Cooking down, let's take a look at Mining",
          },
          {
            speaker: 'Manuel',
            text: 'Navigate to the Mining section and swing that pickaxe!',
          },
        ],
        tasks: [
          {
            action: 'Mine 6',
            description: 'Copper Ore',
            icon: 'assets/objects/copper_ore.png',
            condition: {
              type: 'gather',
              skillId: 'mining',
              itemId: 'copper-ore',
              qty: 6,
            },
            completed: false,
          },
          {
            action: 'Mine 6',
            description: 'Tin Ore',
            icon: 'assets/objects/tin_ore.png',
            condition: {
              type: 'gather',
              skillId: 'mining',
              itemId: 'tin-ore',
              qty: 6,
            },
            completed: false,
          },
        ],
      },
      {
        stepIndex: 6,
        completed: false,
        dialog: [
          {
            speaker: 'Manuel',
            text: 'You now have all the requirements to create some Bronze Bars.',
          },
          {
            speaker: 'Manuel',
            text: 'Navigate to the Smithing panel and create 6 Bronze Bars.',
          },
        ],
        tasks: [
          {
            action: 'Smith 6',
            description: 'Bronze Bars',
            icon: 'assets/objects/bronze_bar.png',
            condition: {
              type: 'gather',
              skillId: 'smithing',
              itemId: 'bronze-bar',
              qty: 6,
            },
            completed: false,
          },
        ],
      },
    ],
  },
  {
    id: 'no-place-like-home',
    name: 'No Place Like Home',
    description:
      "A travelling architect offers to build you a home on a quiet plot of land — but first you'll need to prove you can handle a hammer.",
    completionText:
      'The architect wipes sawdust from his hands. "Not bad work for a beginner. Your plot is marked — head home whenever you\'re ready."',
    icon: 'assets/icons/house.png',
    questPoints: 1,
    status: 'not-started',
    requirements: [
      {
        type: 'skill',
        skill: 'construction',
        level: 30,
        icon: 'assets/icons/construction.png',
      },
    ],
    rewards: [
      {
        type: 'unlock',
        tab: 'house',
        label: 'House',
        icon: 'assets/icons/house.png',
      },
      {
        type: 'skill',
        skill: 'construction',
        icon: 'assets/icons/construction.png',
        xp: 1000,
      },
      { type: 'coins', amount: 500 },
    ],
  },
  {
    id: 'dwarfs-dilemma',
    name: "Dwarf's Dilemma",
    description:
      "A local dwarf is in need of assistance. He's found a rich vein of ore but can't mine it himself. Help him out and he'll reward you handsomely.",
    completionText:
      "Tuznock slaps you on the back with a meaty fist. \"Aye, that's the good stuff! You've got a future in the mines, friend — I'll spread the word.\"",
    icon: 'assets/icons/mining.png',
    questPoints: 1,
    status: 'not-started',
    requirements: [
      {
        type: 'skill',
        skill: 'mining',
        level: 5,
        icon: 'assets/icons/mining.png',
      },
    ],
    rewards: [
      {
        type: 'skill',
        skill: 'mining',
        icon: 'assets/icons/mining.png',
        xp: 200,
      },
      { type: 'coins', amount: 500 },
    ],
    steps: [
      {
        stepIndex: 0,
        completed: false,
        dialog: [
          {
            speaker: 'Tuznock',
            text: "Hey there! Perhaps you could assist me with a problem I've been facing.",
          },
          {
            speaker: 'Tuznock',
            text: "I've found a rich vein of ore near Varrock but my old legs won't carry me there. Travel to Varrock and I'll meet you there!",
          },
        ],
        tasks: [
          {
            action: 'Travel to',
            description: 'Varrock',
            icon: 'assets/objects/map.png',
            condition: { type: 'location', locationId: 'varrock' },
            completed: false,
          },
        ],
      },
    ],
  },
  {
    id: 'a-bounty-in-blood',
    name: 'A Bounty in Blood',
    description:
      'A local monster has been terrorizing the nearby village. A mysterious figure is offering a reward to anyone brave enough to take on the challenge and eliminate the threat.',
    completionText:
      'The mysterious figure steps from the shadows and presses a coin purse into your hand. "The village is safe. That is all that matters." They vanish before you can ask their name.',
    icon: 'assets/icons/slayer.png',
    questPoints: 2,
    status: 'not-started',
    requirements: [
      {
        type: 'skill',
        skill: 'hitpoints',
        level: 40,
        icon: 'assets/icons/hitpoints.png',
      },
      {
        type: 'skill',
        skill: 'attack',
        level: 40,
        icon: 'assets/icons/attack.png',
      },
      {
        type: 'skill',
        skill: 'strength',
        level: 40,
        icon: 'assets/icons/strength.png',
      },
      {
        type: 'skill',
        skill: 'defence',
        level: 40,
        icon: 'assets/icons/defence.png',
      },
    ],
    rewards: [
      {
        type: 'unlock',
        tab: 'slayer',
        label: 'Slayer',
        icon: 'assets/icons/slayer.png',
      },
      {
        type: 'skill',
        skill: 'slayer',
        icon: 'assets/icons/slayer.png',
        xp: 500,
      },
      { type: 'coins', amount: 1500 },
    ],
  },
  {
    id: 'honest-work',
    name: 'Honest Work',
    description:
      "A local farmer is struggling to keep his farm running. He needs help tending to his crops and livestock. Lend a hand and he'll reward you with some of his finest produce.",
    completionText:
      'The farmer wipes sweat from his brow and hands you a basket of fresh vegetables. "Thanks to you, my farm is thriving again. Take these as a token of my gratitude."',
    icon: 'assets/icons/farming.png',
    questPoints: 1,
    status: 'not-started',
    requirements: [],
    rewards: [
      {
        type: 'unlock',
        tab: 'farming',
        label: 'Farming',
        icon: 'assets/icons/farming.png',
      },
      {
        type: 'skill',
        skill: 'farming',
        icon: 'assets/icons/farming.png',
        xp: 200,
      },
      { type: 'coins', amount: 500 },
    ],
    steps: [],
  },
  {
    id: 'what-you-can-how-you-can',
    name: 'What You Can, How You Can',
    description: '',
    completionText: '',
    icon: 'assets/icons/thieving.png',
    questPoints: 1,
    status: 'not-started',
    requirements: [],
    rewards: [
      {
        type: 'unlock',
        tab: 'thieving',
        label: 'Thieving',
        icon: 'assets/icons/thieving.png',
      },
      {
        type: 'skill',
        skill: 'thieving',
        icon: 'assets/icons/thieving.png',
        xp: 200,
      },
      { type: 'coins', amount: 500 },
    ],
    steps: [],
  },
  {
    id: 'druids-circle',
    name: "Druid's Circle",
    description: '',
    completionText: '',
    icon: 'assets/icons/herblore.png',
    questPoints: 1,
    status: 'not-started',
    requirements: [],
    rewards: [
      {
        type: 'unlock',
        tab: 'herblore',
        label: 'Herblore',
        icon: 'assets/icons/herblore.png',
      },
      {
        type: 'skill',
        skill: 'herblore',
        icon: 'assets/icons/herblore.png',
        xp: 200,
      },
      { type: 'coins', amount: 500 },
    ],
    steps: [],
  },
  {
    id: 'running-man',
    name: 'Running Man',
    description: '',
    completionText: '',
    icon: 'assets/icons/agility.png',
    questPoints: 1,
    status: 'not-started',
    requirements: [],
    rewards: [
      {
        type: 'unlock',
        tab: 'agility',
        label: 'Agility',
        icon: 'assets/icons/agility.png',
      },
      {
        type: 'skill',
        skill: 'agility',
        icon: 'assets/icons/agility.png',
        xp: 200,
      },
      { type: 'coins', amount: 500 },
    ],
    steps: [],
  },
  {
    id: 'dragon-slayer',
    name: 'Dragon Slayer',
    description:
      'The kingdom is under threat from a fearsome dragon. Prove your worth by slaying the beast and saving the realm.',
    completionText:
      'The crowd roars as you return with the dragon\'s scale. The king rises from his throne. "By my decree — you shall be known as Dragon Slayer. The realm owes you a debt it cannot repay."',
    icon: 'assets/quests/dragon_slayer.png',
    questPoints: 2,
    status: 'not-started',
    requirements: [
      {
        type: 'quest',
        questId: 'cooks-assistant',
        questName: "Cook's Assistant",
      },
      {
        type: 'skill',
        skill: 'fishing',
        level: 20,
        icon: 'assets/icons/fishing.png',
      },
    ],
    rewards: [
      {
        type: 'skill',
        skill: 'attack',
        icon: 'assets/icons/attack.png',
        xp: 500,
      },
      {
        type: 'skill',
        skill: 'defence',
        icon: 'assets/icons/defence.png',
        xp: 500,
      },
      { type: 'coins', amount: 2000 },
    ],
  },
];
