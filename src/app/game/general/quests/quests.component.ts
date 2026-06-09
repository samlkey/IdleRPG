import { Component, input, signal } from '@angular/core';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { QuestCardComponent, Quest } from '../../shared/components/quest-card/quest-card.component';

@Component({
  selector: 'app-quests',
  imports: [ModalComponent, QuestCardComponent],
  templateUrl: './quests.component.html',
  styleUrl: './quests.component.scss',
})
export class QuestsComponent {
  pixelIcon = input<string>('');
  helpOpen  = signal(false);

  get inProgressQuests() { return this.quests.filter(q => q.status === 'in-progress'); }
  get availableQuests()  { return this.quests.filter(q => q.status === 'not-started'); }
  get completedQuests()  { return this.quests.filter(q => q.status === 'completed'); }

  readonly quests: Quest[] = [
    {
      id: 'tutorial-island',
      name: 'Tutorial Island',
      description: "You find yourself on a mysterious island with no memory of how you got there. Complete a series of tasks to learn the basics and earn your freedom.",
      icon: 'assets/quests/tutorial_island.png',
      questPoints: 1,
      status: 'in-progress',
      requirements: [],
      rewards: [
        { type: 'coins', amount: 500 },
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
      id: 'cooks-assistant',
      name: "Cook's Assistant",
      description: "The head chef at Lumbridge Castle is in a panic — the Duke's birthday cake needs baking but he's missing key ingredients. Help him gather what's needed.",
      icon: 'assets/icons/cooking.png',
      questPoints: 1,
      status: 'not-started',
      requirements: [],
      rewards: [
        { type: 'skill', skill: 'cooking', icon: 'assets/icons/cooking.png', xp: 300 },
        { type: 'coins', amount: 500 },
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
