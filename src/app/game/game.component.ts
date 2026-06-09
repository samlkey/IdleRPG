import { Component, signal, Type } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { MiningComponent } from './skills/mining/mining.component';
import { WoodcuttingComponent } from './skills/woodcutting/woodcutting.component';
import { FishingComponent } from './skills/fishing/fishing.component';

export type SkillId = 'attack' | 'strength' | 'defence' | 'ranged' | 'magic' | 'mining' | 'woodcutting' | 'fishing';
export type PanelId = SkillId | 'quests' | 'bank' | 'house' | 'settings';

interface NavSkill {
  id: PanelId;
  label: string;
  icon: string;
  component?: Type<unknown>;
}

interface NavSection {
  label: string;
  items: NavSkill[];
}

@Component({
  selector: 'app-game',
  imports: [NgComponentOutlet],
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss'
})
export class GameComponent {
  character = { name: 'Aldric', level: 14, combatLevel: 32, hp: 74, maxHp: 100 };

  readonly sections: NavSection[] = [
    {
      label: 'General',
      items: [
        { id: 'quests', label: 'Quests', icon: 'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 9 2 2 4-4' },
        { id: 'bank',   label: 'Bank',   icon: 'M3 21h18M3 10h18M3 7l9-4 9 4M4 10v11M20 10v11M8 10v11M12 10v11M16 10v11' },
        { id: 'house',  label: 'House',  icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM9 22V12h6v10' },
      ],
    },
    {
      label: 'Combat',
      items: [
        { id: 'attack',   label: 'Attack',   icon: 'M14.5 10c-.83 0-1.5-.67-1.5-1.5v-5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5zm-5 0c-.83 0-1.5-.67-1.5-1.5v-5C8 2.67 8.67 2 9.5 2S11 2.67 11 3.5v5c0 .83-.67 1.5-1.5 1.5zm-5 5c-.83 0-1.5-.67-1.5-1.5v-5C3 7.67 3.67 7 4.5 7S6 7.67 6 8.5v5c0 .83-.67 1.5-1.5 1.5zm14 0c-.83 0-1.5-.67-1.5-1.5v-5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5zM17 20H7v-2h10v2z' },
        { id: 'strength', label: 'Strength', icon: 'M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7' },
        { id: 'defence',  label: 'Defence',  icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
        { id: 'ranged',   label: 'Ranged',   icon: 'M18 8L22 12L18 16M6 8L2 12L6 16M14 4L10 20' },
        { id: 'magic',    label: 'Magic',    icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' },
      ],
    },
    {
      label: 'Non-Combat',
      items: [
        { id: 'mining',      label: 'Mining',      icon: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5', component: MiningComponent },
        { id: 'woodcutting', label: 'Woodcutting', icon: 'M17 8C8 10 5.9 16.17 3.82 19.82L5.71 21 7 18.93c.78.05 1.53.1 2.29.17A12.36 12.36 0 0 1 12 20c4 0 7-3 7-7a5 5 0 0 0-2-4zM2 2l20 20', component: WoodcuttingComponent },
        { id: 'fishing',     label: 'Fishing',     icon: 'M18 8a6 6 0 0 1-6 6M3 3l18 18M10.88 10.88A3 3 0 1 0 6.12 6.12M6 18h.01M10 20c-2.5-2.5-3-5-3-8', component: FishingComponent },
      ],
    },
    {
      label: 'Other',
      items: [
        { id: 'settings', label: 'Settings', icon: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 0v0M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z' },
      ],
    },
  ];

  activePanel = signal<PanelId>('quests');

  get activeItem(): NavSkill | null {
    for (const section of this.sections) {
      const found = section.items.find(i => i.id === this.activePanel());
      if (found) return found;
    }
    return null;
  }

  get hpPercent(): number {
    return Math.round((this.character.hp / this.character.maxHp) * 100);
  }

  select(item: NavSkill) {
    this.activePanel.set(item.id);
  }
}
