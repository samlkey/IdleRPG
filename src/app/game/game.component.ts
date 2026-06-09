import { Component, inject, signal, Type } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
// General
import { QuestsComponent } from './general/quests/quests.component';
import { BankComponent } from './general/bank/bank.component';
import { HouseComponent } from './general/house/house.component';
import { ShopComponent } from './general/shop/shop.component';
// Combat
import { AttackComponent } from './combat/attack/attack.component';
import { StrengthComponent } from './combat/strength/strength.component';
import { DefenceComponent } from './combat/defence/defence.component';
import { RangedComponent } from './combat/ranged/ranged.component';
import { MagicComponent } from './combat/magic/magic.component';
import { HitpointsComponent } from './combat/hitpoints/hitpoints.component';
import { SlayerComponent } from './combat/slayer/slayer.component';
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
import { ConstructionComponent } from './skills/construction/construction.component';
// Service
import { PlayerService, SkillId } from './services/player.service';

export type { SkillId };
export type PanelId = SkillId | 'shop' | 'quests' | 'bank' | 'house' | 'settings';

interface NavItem {
  id: PanelId;
  label: string;
  pixelIcon: string;
  /** 'skill' → reads level from PlayerService; 'qp' → quest points; 'none' → no badge */
  badgeType?: 'skill' | 'qp' | 'house-level' | 'bank-space' | 'gold' | 'none';
  component?: Type<unknown>;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

@Component({
  selector: 'app-game',
  imports: [NgComponentOutlet],
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss',
})
export class GameComponent {
  readonly playerService = inject(PlayerService);

  activePanel = signal<PanelId>('quests');

  readonly sections: NavSection[] = [
    {
      label: 'General',
      items: [
        { id: 'quests', label: 'Quests', pixelIcon: 'assets/icons/quests.png', badgeType: 'qp',   component: QuestsComponent },
        { id: 'bank',   label: 'Bank',   pixelIcon: 'assets/icons/bank.png',   badgeType: 'bank-space', component: BankComponent },
        { id: 'house',  label: 'House',  pixelIcon: 'assets/icons/house.png',  badgeType: 'house-level', component: HouseComponent },
        { id: 'shop',  label: 'General Store',  pixelIcon: 'assets/icons/shop.png',  badgeType: 'gold', component: ShopComponent },
      ],
    },
    {
      label: 'Combat',
      items: [
        { id: 'attack',    label: 'Attack',    pixelIcon: 'assets/icons/attack.png',    badgeType: 'skill', component: AttackComponent },
        { id: 'strength',  label: 'Strength',  pixelIcon: 'assets/icons/strength.png',  badgeType: 'skill', component: StrengthComponent },
        { id: 'defence',   label: 'Defence',   pixelIcon: 'assets/icons/defence.png',   badgeType: 'skill', component: DefenceComponent },
        { id: 'ranged',    label: 'Ranged',    pixelIcon: 'assets/icons/ranged.png',    badgeType: 'skill', component: RangedComponent },
        { id: 'magic',     label: 'Magic',     pixelIcon: 'assets/icons/magic.png',     badgeType: 'skill', component: MagicComponent },
        { id: 'prayer',    label: 'Prayer',    pixelIcon: 'assets/icons/prayer.png',    badgeType: 'skill', component: PrayerComponent },
        { id: 'hitpoints', label: 'Hitpoints', pixelIcon: 'assets/icons/hitpoints.png', badgeType: 'skill', component: HitpointsComponent },
        { id: 'slayer',    label: 'Slayer',    pixelIcon: 'assets/icons/slayer.png',    badgeType: 'skill', component: SlayerComponent },
      ],
    },
    {
      label: 'Non-Combat',
      items: [
        { id: 'mining',       label: 'Mining',       pixelIcon: 'assets/icons/mining.png',       badgeType: 'skill', component: MiningComponent },
        { id: 'woodcutting',  label: 'Woodcutting',  pixelIcon: 'assets/icons/woodcutting.png',  badgeType: 'skill', component: WoodcuttingComponent },
        { id: 'fishing',      label: 'Fishing',      pixelIcon: 'assets/icons/fishing.png',      badgeType: 'skill', component: FishingComponent },
        { id: 'firemaking',   label: 'Firemaking',   pixelIcon: 'assets/icons/firemaking.png',   badgeType: 'skill', component: FiremakingComponent },
        { id: 'farming',      label: 'Farming',      pixelIcon: 'assets/icons/farming.png',      badgeType: 'skill', component: FarmingComponent },
        { id: 'cooking',      label: 'Cooking',      pixelIcon: 'assets/icons/cooking.png',      badgeType: 'skill', component: CookingComponent },
        { id: 'smithing',     label: 'Smithing',     pixelIcon: 'assets/icons/smithing.png',     badgeType: 'skill', component: SmithingComponent },
        { id: 'agility',      label: 'Agility',      pixelIcon: 'assets/icons/agility.png',      badgeType: 'skill', component: AgilityComponent },
        { id: 'herblore',     label: 'Herblore',     pixelIcon: 'assets/icons/herblore.png',     badgeType: 'skill', component: HerbloreComponent },
        { id: 'thieving',     label: 'Thieving',     pixelIcon: 'assets/icons/thieving.png',     badgeType: 'skill', component: ThievingComponent },
        { id: 'crafting',     label: 'Crafting',     pixelIcon: 'assets/icons/crafting.png',     badgeType: 'skill', component: CraftingComponent },
        { id: 'fletching',    label: 'Fletching',    pixelIcon: 'assets/icons/fletching.png',    badgeType: 'skill', component: FletchingComponent },
        { id: 'hunter',       label: 'Hunter',       pixelIcon: 'assets/icons/hunter.png',       badgeType: 'skill', component: HunterComponent },
        { id: 'construction', label: 'Construction', pixelIcon: 'assets/icons/construction.png', badgeType: 'skill', component: ConstructionComponent },
      ],
    },
    {
      label: 'Other',
      items: [
        { id: 'settings', label: 'Settings', pixelIcon: 'assets/icons/settings.png', badgeType: 'none' },
      ],
    },
  ];

  get activeItem(): NavItem | null {
    for (const section of this.sections) {
      const found = section.items.find(i => i.id === this.activePanel());
      if (found) return found;
    }
    return null;
  }

  /** Badge text for a nav item — fully derived from PlayerService. */
  badgeFor(item: NavItem): string | null {
    const p = this.playerService.player();
    switch (item.badgeType) {
      case 'skill': return `${p.skills[item.id as SkillId].level}/99`;
      case 'qp':    return `QP: ${p.questPoints}`;
      case 'house-level': return `Level - ${p.houseLevel}`;
      case 'bank-space': return `${p.bankSpace}/500`;
      case 'gold': return `${p.gold}G`;
      default:      return null;
    }
  }

  select(item: NavItem) {
    this.activePanel.set(item.id);
  }

  navigateToTrackedQuest(): void {
    const tq = this.playerService.trackedQuest();
    if (!tq) return;
    this.activePanel.set('quests');
    this.playerService.requestExpandQuest(tq.questId);
  }
}
