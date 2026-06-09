import { Component, signal, Type } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
// General
import { QuestsComponent } from './general/quests/quests.component';
import { BankComponent } from './general/bank/bank.component';
import { HouseComponent } from './general/house/house.component';
// Combat
import { AttackComponent } from './combat/attack/attack.component';
import { StrengthComponent } from './combat/strength/strength.component';
import { DefenceComponent } from './combat/defence/defence.component';
import { RangedComponent } from './combat/ranged/ranged.component';
import { MagicComponent } from './combat/magic/magic.component';
import { HitpointsComponent } from './combat/hitpoints/hitpoints.component';
// Non-Combat
import { MiningComponent } from './skills/mining/mining.component';
import { WoodcuttingComponent } from './skills/woodcutting/woodcutting.component';
import { FishingComponent } from './skills/fishing/fishing.component';
import { FiremakingComponent } from './skills/firemaking/firemaking.component';
import { PrayerComponent } from './skills/prayer/prayer.component';
import { FarmingComponent } from './skills/farming/farming.component';
import { CookingComponent } from './skills/cooking/cooking.component';
import { SmithingComponent } from './skills/smithing/smithing.component';
import { AgilityComponent } from './skills/agility/agility.component';
import { HerbloreComponent } from './skills/herblore/herblore.component';
import { ThievingComponent } from './skills/thieving/thieving.component';
import { CraftingComponent } from './skills/crafting/crafting.component';
import { FletchingComponent } from './skills/fletching/fletching.component';
import { HunterComponent } from './skills/hunter/hunter.component';
import { SlayerComponent } from './combat/slayer/slayer.component';
import { ConstructionComponent } from './skills/construction/construction.component';

export type SkillId = 'attack' | 'strength' | 'defence' | 'ranged' | 'magic' | 'slayer' | 'mining' | 'woodcutting' | 'fishing' | 'firemaking' | 'prayer' | 'hitpoints' | 'farming' | 'cooking' | 'smithing' | 'agility' | 'herblore' | 'thieving' | 'crafting' | 'fletching' | 'hunter' | 'construction';
export type PanelId = SkillId | 'quests' | 'bank' | 'house' | 'settings';

interface NavSkill {
  id: PanelId;
  label: string;
  pixelIcon: string;
  badge?: string;
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
        { id: 'quests', label: 'Quests', pixelIcon: 'assets/icons/quests.png', badge: 'QP: 0', component: QuestsComponent },
        { id: 'bank',   label: 'Bank',   pixelIcon: 'assets/icons/bank.png',                 component: BankComponent },
        { id: 'house',  label: 'House',  pixelIcon: 'assets/icons/house.png',                component: HouseComponent },
      ],
    },
    {
      label: 'Combat',
      items: [
        { id: 'attack',    label: 'Attack',    pixelIcon: 'assets/icons/attack.png',    badge: '1/99', component: AttackComponent },
        { id: 'strength',  label: 'Strength',  pixelIcon: 'assets/icons/strength.png',  badge: '1/99', component: StrengthComponent },
        { id: 'defence',   label: 'Defence',   pixelIcon: 'assets/icons/defence.png',   badge: '1/99', component: DefenceComponent },
        { id: 'ranged',    label: 'Ranged',    pixelIcon: 'assets/icons/ranged.png',    badge: '1/99', component: RangedComponent },
        { id: 'magic',     label: 'Magic',     pixelIcon: 'assets/icons/magic.png',     badge: '1/99', component: MagicComponent },
        { id: 'prayer',    label: 'Prayer',    pixelIcon: 'assets/icons/prayer.png',    badge: '1/99', component: PrayerComponent },
        { id: 'hitpoints', label: 'Hitpoints', pixelIcon: 'assets/icons/hitpoints.png', badge: '10/99', component: HitpointsComponent },
        { id: 'slayer',    label: 'Slayer',    pixelIcon: 'assets/icons/slayer.png',    badge: '1/99',  component: SlayerComponent },
      ],
    },
    {
      label: 'Non-Combat',
      items: [
        { id: 'mining',      label: 'Mining',      pixelIcon: 'assets/icons/mining.png',      badge: '1/99', component: MiningComponent },
        { id: 'woodcutting', label: 'Woodcutting', pixelIcon: 'assets/icons/woodcutting.png', badge: '1/99', component: WoodcuttingComponent },
        { id: 'fishing',     label: 'Fishing',     pixelIcon: 'assets/icons/fishing.png',     badge: '1/99', component: FishingComponent },
        { id: 'firemaking',  label: 'Firemaking',  pixelIcon: 'assets/icons/firemaking.png',  badge: '1/99', component: FiremakingComponent },
        { id: 'farming',     label: 'Farming',     pixelIcon: 'assets/icons/farming.png',     badge: '1/99', component: FarmingComponent },
        { id: 'cooking',     label: 'Cooking',     pixelIcon: 'assets/icons/cooking.png',     badge: '1/99', component: CookingComponent },
        { id: 'smithing',   label: 'Smithing',   pixelIcon: 'assets/icons/smithing.png',   badge: '1/99', component: SmithingComponent },
        { id: 'agility',   label: 'Agility',    pixelIcon: 'assets/icons/agility.png',    badge: '1/99', component: AgilityComponent },
        { id: 'herblore',  label: 'Herblore',   pixelIcon: 'assets/icons/herblore.png',   badge: '1/99', component: HerbloreComponent },
        { id: 'thieving',  label: 'Thieving',   pixelIcon: 'assets/icons/thieving.png',   badge: '1/99', component: ThievingComponent },
        { id: 'crafting',  label: 'Crafting',   pixelIcon: 'assets/icons/crafting.png',   badge: '1/99', component: CraftingComponent },
        { id: 'fletching', label: 'Fletching',  pixelIcon: 'assets/icons/fletching.png',  badge: '1/99', component: FletchingComponent },
        { id: 'hunter',       label: 'Hunter',       pixelIcon: 'assets/icons/hunter.png',       badge: '1/99', component: HunterComponent },
        { id: 'construction', label: 'Construction', pixelIcon: 'assets/icons/construction.png', badge: '1/99', component: ConstructionComponent },
      ],
    },
    {
      label: 'Other',
      items: [
        { id: 'settings', label: 'Settings', pixelIcon: 'assets/icons/settings.png' },
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
