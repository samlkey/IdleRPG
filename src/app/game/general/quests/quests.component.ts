import { Component, inject, input, signal } from '@angular/core';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { QuestCardComponent, Quest } from '../../shared/components/quest-card/quest-card.component';
import { LocationService } from '../../services/location.service';

@Component({
  selector: 'app-quests',
  imports: [ModalComponent, QuestCardComponent],
  templateUrl: './quests.component.html',
  styleUrl: './quests.component.scss',
})
export class QuestsComponent {
  pixelIcon = input<string>('');
  helpOpen  = signal(false);

  readonly locationService = inject(LocationService);

  get inProgressQuests() { return this.quests.filter(q => q.status === 'in-progress'); }
  get completedQuests()  { return this.quests.filter(q => q.status === 'completed'); }

  get availableQuests() {
    const locationQuestIds = this.locationService.current().activities.quests ?? [];
    return this.quests.filter(q =>
      q.status === 'not-started' && locationQuestIds.includes(q.id)
    );
  }

  get unavailableQuests() {
    const locationQuestIds = this.locationService.current().activities.quests ?? [];
    return this.quests.filter(q =>
      q.status === 'not-started' && !locationQuestIds.includes(q.id)
    );
  }

  readonly quests: Quest[] = [
    {
      id: 'tutorial-island',
      name: 'Tutorial Island',
      description: "You find yourself on a mysterious island with no memory of how you got there. Complete a series of tasks to learn the basics and earn your freedom.",
      icon: 'assets/objects/map.png',
      questPoints: 1,
      status: 'in-progress',
      requirements: [],
      rewards: [
        { type: 'coins', amount: 500 },
        { type: 'location', locationId: 'mainland', label: 'Mainland', icon: 'assets/objects/map.png' },
      ],
      steps: [
        {
          action: 'Cut 5 Normal Logs',
          icon: 'assets/icons/woodcutting.png',
          description: 'Woodcutting is a basic skill, providing logs to create various weaponry and items.',
          completed: false,
          dialog: [
            { speaker: 'Manuel', text: "Ah, a newcomer! My name is Manuel. Before you venture out into the world you'll need to survive in the wild. Trees are your first resource — let's start there." },
            { speaker: 'Manuel', text: "Select the Woodcutting section in the Navigation Panel, let's see if you can cut 5 Normal Logs. You can track your currect objective by clicking on the 'Tracking Icon' at the top of this quest!" },
          ],
        },
        {
          action: 'Burn 5 Normal Logs',
          icon: 'assets/icons/firemaking.png',
          description: 'Firemaking provides buffs and bonuses to other parts of the game.',
          completed: false,
          dialog: [
            { speaker: 'Survival Expert', text: "Well done! Those logs are useless if you can't keep warm at night. A tinderbox and some logs is all you need to start a fire." },
            { speaker: 'Survival Expert', text: "Select the tinderbox in your inventory, then click the logs. Light 5 fires and I'll teach you how to cook your first meal." },
          ],
        },
      ],
    },
    {
      id: 'no-place-like-home',
      name: 'No Place Like Home',
      description: "A travelling architect offers to build you a home on a quiet plot of land — but first you'll need to prove you can handle a hammer.",
      icon: 'assets/icons/house.png',
      questPoints: 1,
      status: 'not-started',
      requirements: [
        { type: 'skill', skill: 'construction', level: 30, icon: 'assets/icons/construction.png' },
      ],
      rewards: [
        { type: 'unlock', tab: 'house', label: 'House', icon: 'assets/icons/house.png' },
        { type: 'skill', skill: 'construction', icon: 'assets/icons/construction.png', xp: 1000 },
        { type: 'coins', amount: 500 },
      ],
    },
    {
      id: 'a-bounty-in-blood',
      name: 'A Bounty in Blood',
      description: "A local monster has been terrorizing the nearby village. A mysterious figure is offering a reward to anyone brave enough to take on the challenge and eliminate the threat.",
      icon: 'assets/icons/slayer.png',
      questPoints: 2,
      status: 'not-started',
      requirements: [
        { type: 'skill', skill: 'hitpoints', level: 40, icon: 'assets/icons/hitpoints.png' },
        { type: 'skill', skill: 'attack', level: 40, icon: 'assets/icons/attack.png' },
        { type: 'skill', skill: 'strength', level: 40, icon: 'assets/icons/strength.png' },
        { type: 'skill', skill: 'defence', level: 40, icon: 'assets/icons/defence.png' },
      ],
      rewards: [
        { type: 'unlock', tab: 'slayer', label: 'Slayer', icon: 'assets/icons/slayer.png' },
        { type: 'skill', skill: 'slayer', icon: 'assets/icons/construction.png', xp: 500 },
        { type: 'coins', amount: 1500 },
      ],
    },
    {
      id: 'dwarfs-dilemma',
      name: 'Dwarf\'s Dilemma',
      description: "A local dwarf is in need of assistance. He's found a rich vein of ore but can't mine it himself. Help him out and he'll reward you handsomely.",
      icon: 'assets/icons/mining.png',
      questPoints: 1,
      status: 'not-started',
      requirements: [
        { type: 'skill', skill: 'mining', level: 5, icon: 'assets/icons/mining.png' },
      ],
      rewards: [
        { type: 'skill', skill: 'mining', icon: 'assets/icons/mining.png', xp: 200 },
        { type: 'coins', amount: 500 },
      ],
      steps: [
        {
          action: 'Travel to the Barbarian Outpost',
          icon: 'assets/objects/map.png',
          description: 'Use the map to travel to the Barbarian Outpost',
          completed: false,
          dialog: [
            { speaker: 'Tuznock', text: "Hey there! Perhaps you could assist me with a problem I've been facing." },
            { speaker: 'Tuznock', text: "" },
          ],
        },
      ]
    },
    {
      id: 'a-bounty-in-blood',
      name: 'A Bounty in Blood',
      description: "A local monster has been terrorizing the nearby village. A mysterious figure is offering a reward to anyone brave enough to take on the challenge and eliminate the threat.",
      icon: 'assets/icons/slayer.png',
      questPoints: 2,
      status: 'not-started',
      requirements: [
        { type: 'skill', skill: 'hitpoints', level: 40, icon: 'assets/icons/hitpoints.png' },
        { type: 'skill', skill: 'attack', level: 40, icon: 'assets/icons/attack.png' },
        { type: 'skill', skill: 'strength', level: 40, icon: 'assets/icons/strength.png' },
        { type: 'skill', skill: 'defence', level: 40, icon: 'assets/icons/defence.png' },
      ],
      rewards: [
        { type: 'unlock', tab: 'slayer', label: 'Slayer', icon: 'assets/icons/slayer.png' },
        { type: 'skill', skill: 'slayer', icon: 'assets/icons/construction.png', xp: 500 },
        { type: 'coins', amount: 1500 },
      ],
    },
    {
      id: 'dragon-slayer',
      name: 'Dragon Slayer',
      description: "The kingdom is under threat from a fearsome dragon. Prove your worth by slaying the beast and saving the realm.",
      icon: 'assets/quests/dragon_slayer.png',
      questPoints: 2,
      status: 'not-started',
      requirements: [
        { type: 'quest', questId: 'cooks-assistant', questName: "Cook's Assistant" },
        { type: 'skill', skill: 'fishing', level: 20, icon: 'assets/icons/fishing.png' },
      ],
      rewards: [
        { type: 'skill', skill: 'attack',  icon: 'assets/icons/attack.png',  xp: 500 },
        { type: 'skill', skill: 'defence', icon: 'assets/icons/defence.png', xp: 500 },
        { type: 'coins', amount: 2000 },
      ],
    },
  ];
}
