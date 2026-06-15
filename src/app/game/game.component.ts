import { Component, computed, inject, signal, Type } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { NotificationsComponent } from './shared/components/notifications/notifications.component';
import { LevelUpComponent } from './shared/components/level-up/level-up.component';
import { QuestCompleteModalComponent } from './shared/components/quest-complete-modal/quest-complete-modal.component';
// General
import { QuestsComponent } from './general/quests/quests.component';
import { BankComponent } from './general/bank/bank.component';
import { HouseComponent } from './general/house/house.component';
import { ShopComponent } from './general/shop/shop.component';
import { MapComponent } from './general/map/map.component';
// Combat
import { AttackComponent } from './combat/attack/attack.component';
import { StrengthComponent } from './combat/strength/strength.component';
import { DefenceComponent } from './combat/defence/defence.component';
import { RangedComponent } from './combat/ranged/ranged.component';
import { MagicComponent } from './combat/magic/magic.component';
import { HitpointsComponent } from './combat/hitpoints/hitpoints.component';
import { SlayerComponent } from './combat/slayer/slayer.component';
import { CombatLevelComponent } from './combat/combat-level/combat-level.component';
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
import { LocationService } from './services/location.service';
import { ItemService } from './services/item.service';
import { QuestService } from './services/quest.service';
import { ActiveBuffsComponent } from './shared/components/active-buffs/active-buffs.component';
// Settings
import { SettingsComponent } from './settings/settings.component';

export type { SkillId };
export type PanelId = SkillId | 'shop' | 'quests' | 'bank' | 'house' | 'map' | 'settings' | 'combat-level';

interface NavItem {
  id: PanelId;
  label: string;
  pixelIcon: string;
  /** 'skill' → reads level from PlayerService; 'qp' → quest points; 'none' → no badge */
  badgeType?: 'skill' | 'qp' | 'house-level' | 'bank-space' | 'gold' | 'location' | 'combat-level' | 'none';
  component?: Type<unknown> | null;
  /** Child nav items rendered in a grouped block below this item */
  children?: NavItem[];
  /** When clicked, sets activePanel to this id instead of item.id */
  navigateTo?: PanelId;
  /** Permanently locked (e.g. requires its own quest) */
  locked?: boolean;
  /** Locked until the given quest has been started (status is in-progress or completed) */
  unlockedByQuestStart?: { questId: string };
  /** Locked until the given quest step index is marked completed */
  unlockedByQuestStep?: { questId: string; stepIndex: number };
  /** Highlighted while the given quest step is the current active step */
  highlightedByQuestStep?: { questId: string; stepIndex: number };
}

interface NavSection {
  label: string;
  items: NavItem[];
}

@Component({
  selector: 'app-game',
  imports: [NgComponentOutlet, NotificationsComponent, LevelUpComponent, QuestCompleteModalComponent, ActiveBuffsComponent],
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss',
})
export class GameComponent {
  readonly playerService    = inject(PlayerService);
  readonly locationService  = inject(LocationService);
  readonly itemService      = inject(ItemService);
  readonly questService     = inject(QuestService);

  activePanel = signal<PanelId>('quests');

  /** Live current step for the tracked quest, read directly from QuestService. */
  readonly trackedStep = computed(() => {
    const tq = this.playerService.trackedQuest();
    if (!tq) return null;
    const quest = this.questService.quests().find(q => q.id === tq.questId);
    return quest?.steps?.find(s => !s.completed) ?? null;
  });

  /** Progress counter for the tracked step, null if the step has no qty target. */
  readonly trackedProgress = computed(() => {
    const step = this.trackedStep();
    const c = step?.condition;
    if (c?.type === 'gather' || c?.type === 'skill-action') {
      return { current: step!.progress ?? 0, total: c.qty };
    }
    return null;
  });

  readonly sections: NavSection[] = [
    {
      label: 'General',
      items: [
        { id: 'quests', label: 'Quests', pixelIcon: 'assets/icons/quests.png', badgeType: 'qp',   component: QuestsComponent },
        { id: 'bank',   label: 'Bank',   pixelIcon: 'assets/icons/bank.png',   badgeType: 'bank-space', component: BankComponent, unlockedByQuestStep: { questId: 'tutorial-island', stepIndex: 0 }, highlightedByQuestStep: { questId: 'tutorial-island', stepIndex: 1 } },
        { id: 'shop',  label: 'General Store',  pixelIcon: 'assets/icons/shop.png',  badgeType: 'gold', component: ShopComponent, locked: true },
        { id: 'map', label: 'Map', pixelIcon: 'assets/objects/map.png', badgeType: 'location', component: MapComponent, locked: true },
        { id: 'house',  label: 'House',  pixelIcon: 'assets/icons/house.png',  badgeType: 'house-level', component: HouseComponent, locked: true },
      ],
    },
    {
      label: 'Combat Stats',
      items: [
        {
          id: 'combat-level', label: 'Combat Level', pixelIcon: 'assets/icons/attack.png',
          badgeType: 'combat-level', component: CombatLevelComponent,
          children: [
            { id: 'attack',    label: 'Attack',    pixelIcon: 'assets/icons/attack.png',    badgeType: 'skill', navigateTo: 'combat-level' },
            { id: 'strength',  label: 'Strength',  pixelIcon: 'assets/icons/strength.png',  badgeType: 'skill', navigateTo: 'combat-level' },
            { id: 'defence',   label: 'Defence',   pixelIcon: 'assets/icons/defence.png',   badgeType: 'skill', navigateTo: 'combat-level' },
            { id: 'ranged',    label: 'Ranged',    pixelIcon: 'assets/icons/ranged.png',    badgeType: 'skill', navigateTo: 'combat-level' },
            { id: 'hitpoints', label: 'Hitpoints', pixelIcon: 'assets/icons/hitpoints.png', badgeType: 'skill', navigateTo: 'combat-level' },
          ],
          locked: true
        },
      ],
    },
    {
      label: 'Hybrid Skills',
      items: [
        { id: 'magic',     label: 'Magic',     pixelIcon: 'assets/icons/magic.png',   badgeType: 'skill', component: MagicComponent,  locked: true },
        { id: 'prayer',    label: 'Prayer',    pixelIcon: 'assets/icons/prayer.png',  badgeType: 'skill', component: PrayerComponent, locked: true },
        { id: 'slayer',    label: 'Slayer',    pixelIcon: 'assets/icons/slayer.png',  badgeType: 'skill', component: SlayerComponent, locked: true },
      ]
    },
    {
      label: 'Non-Combat Skills',
      items: [
        { id: 'woodcutting',  label: 'Woodcutting',  pixelIcon: 'assets/icons/woodcutting.png',  badgeType: 'skill', component: WoodcuttingComponent, unlockedByQuestStart: { questId: 'tutorial-island' }, highlightedByQuestStep: { questId: 'tutorial-island', stepIndex: 0 } },
        { id: 'firemaking',   label: 'Firemaking',   pixelIcon: 'assets/icons/firemaking.png',   badgeType: 'skill', component: FiremakingComponent,  unlockedByQuestStep: { questId: 'tutorial-island', stepIndex: 1 }, highlightedByQuestStep: { questId: 'tutorial-island', stepIndex: 2 } },
        { id: 'fishing',      label: 'Fishing',      pixelIcon: 'assets/icons/fishing.png',      badgeType: 'skill', component: FishingComponent,     unlockedByQuestStep: { questId: 'tutorial-island', stepIndex: 2 }, highlightedByQuestStep: { questId: 'tutorial-island', stepIndex: 3 } },
        { id: 'cooking',      label: 'Cooking',      pixelIcon: 'assets/icons/cooking.png',      badgeType: 'skill', component: CookingComponent,     unlockedByQuestStep: { questId: 'tutorial-island', stepIndex: 3 }, highlightedByQuestStep: { questId: 'tutorial-island', stepIndex: 4 } },
        { id: 'mining',       label: 'Mining',       pixelIcon: 'assets/icons/mining.png',       badgeType: 'skill', component: MiningComponent,      unlockedByQuestStep: { questId: 'tutorial-island', stepIndex: 4 }, highlightedByQuestStep: { questId: 'tutorial-island', stepIndex: 5 } },
        { id: 'smithing',     label: 'Smithing',     pixelIcon: 'assets/icons/smithing.png',     badgeType: 'skill', component: SmithingComponent,    unlockedByQuestStep: { questId: 'tutorial-island', stepIndex: 6 }, highlightedByQuestStep: { questId: 'tutorial-island', stepIndex: 7 } },
        { id: 'crafting',     label: 'Crafting',     pixelIcon: 'assets/icons/crafting.png',     badgeType: 'skill', component: CraftingComponent,    unlockedByQuestStep: { questId: 'tutorial-island', stepIndex: 7 }, highlightedByQuestStep: { questId: 'tutorial-island', stepIndex: 8 } },
        { id: 'fletching',    label: 'Fletching',    pixelIcon: 'assets/icons/fletching.png',    badgeType: 'skill', component: FletchingComponent,   unlockedByQuestStep: { questId: 'tutorial-island', stepIndex: 8 }, highlightedByQuestStep: { questId: 'tutorial-island', stepIndex: 9 } },
        { id: 'farming',      label: 'Farming',      pixelIcon: 'assets/icons/farming.png',      badgeType: 'skill', component: FarmingComponent, locked: true },
        { id: 'agility',      label: 'Agility',      pixelIcon: 'assets/icons/agility.png',      badgeType: 'skill', component: AgilityComponent, locked: true },
        { id: 'herblore',     label: 'Herblore',     pixelIcon: 'assets/icons/herblore.png',     badgeType: 'skill', component: HerbloreComponent, locked: true },
        { id: 'thieving',     label: 'Thieving',     pixelIcon: 'assets/icons/thieving.png',     badgeType: 'skill', component: ThievingComponent, locked: true },
        { id: 'hunter',       label: 'Hunter',       pixelIcon: 'assets/icons/hunter.png',       badgeType: 'skill', component: HunterComponent, locked: true },
        { id: 'construction', label: 'Construction', pixelIcon: 'assets/icons/construction.png', badgeType: 'skill', component: ConstructionComponent, locked: true },
      ],
    },
    {
      label: 'Other',
      items: [
        { id: 'settings', label: 'Settings', pixelIcon: 'assets/icons/settings.png', badgeType: 'none', locked: false, component: SettingsComponent },
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
      case 'bank-space': return (p.bankCapacity - this.itemService.bankCount()).toString();
      case 'gold': return `${p.gold}G`;
      case 'location': return this.locationService.current().name;
      case 'combat-level': return `${p.combatLevel}`;
      default:      return null;
    }
  }

  isItemHighlighted(item: NavItem): boolean {
    const h = item.highlightedByQuestStep;
    if (!h) return false;
    const quest = this.questService.quests().find(q => q.id === h.questId);
    if (!quest || quest.status !== 'in-progress') return false;
    const activeIndex = quest.steps?.findIndex(s => !s.completed) ?? -1;
    return activeIndex === h.stepIndex;
  }

  isItemLocked(item: NavItem): boolean {
    if (item.locked) return true;
    if (item.navigateTo) {
      const parent = this.sections.flatMap(s => s.items).find(i => i.id === item.navigateTo);
      if (parent && this.isItemLocked(parent)) return true;
    }
    if (item.unlockedByQuestStart) {
      const quest = this.questService.quests().find(q => q.id === item.unlockedByQuestStart!.questId);
      if (!quest || quest.status === 'not-started') return true;
    }
    if (item.unlockedByQuestStep) {
      const { questId, stepIndex } = item.unlockedByQuestStep;
      const quest = this.questService.quests().find(q => q.id === questId);
      if (!(quest?.steps?.[stepIndex]?.completed ?? false)) return true;
    }
    return false;
  }

  isItemDisabled(item: NavItem): boolean {
    return this.isItemLocked(item) || (!item.component && !item.navigateTo);
  }

  select(item: NavItem): void {
    if (this.isItemDisabled(item)) return;
    this.activePanel.set(item.navigateTo ?? item.id);
    this.questService.onNavigation(item.id);
  }

  navigateToTrackedQuest(): void {
    const tq = this.playerService.trackedQuest();
    if (!tq) return;
    this.activePanel.set('quests');
    this.playerService.requestExpandQuest(tq.questId);
  }
}
