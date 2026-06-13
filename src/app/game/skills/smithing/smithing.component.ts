import { Component, computed, inject, input, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ActivityComponent } from '../../shared/components/activity/activity.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { PlayerService } from '../../services/player.service';
import { ActivityService } from '../../services/activity.service';
import { GameItem, DropTable } from '../../services/item.service';

interface SmithingRecipe {
  id: string;
  name: string;
  levelReq: number;
  xp: number;
  duration: number;
  image: string;
  type: 'smelting' | 'normal';
  dropTable: DropTable;
  inputItems?: { item: GameItem; qty: number }[];
}

interface SmithingCategory {
  id: string;
  name: string;
  icon: string;
  iconFilter: string;
  levelReq: number;
  recipes: SmithingRecipe[];
}

function item(id: string, name: string, icon: string): GameItem {
  return { id, name, icon, type: 'resource', description: `A ${name.toLowerCase()}.` };
}

// ── Shared items ──────────────────────────────────────────────────────────────

const copperOre = item('copper-ore', 'Copper Ore', 'assets/objects/copper_ore.png');
const tinOre    = item('tin-ore',    'Tin Ore',    'assets/objects/tin_ore.png');
const bronzeBar = item('bronze-bar', 'Bronze Bar', 'assets/objects/bronze_bar.png');

// ── Categories ────────────────────────────────────────────────────────────────

const CATEGORIES: SmithingCategory[] = [
  {
    id: 'bars',
    name: 'Standard Bars',
    icon: 'assets/icons/smithing.png',
    iconFilter: 'brightness(0.85) grayscale(0.4)',
    levelReq: 1,
    recipes: [
      {
        id: 'smelt-bronze-bar',
        name: 'Bronze Bar',
        levelReq: 1,
        xp: 6.2,
        duration: 4,
        image: 'assets/objects/bronze_bar.png',
        type: 'smelting',
        dropTable: { id: 'bronze-bar', name: 'Bronze Bar', drops: [{ item: bronzeBar, chance: 1, qty: 1 }] },
        inputItems: [
          { item: copperOre, qty: 1 },
          { item: tinOre,    qty: 1 },
        ],
      },
    ],
  },
  {
    id: 'bronze',
    name: 'Bronze Gear',
    icon: 'assets/icons/smithing.png',
    iconFilter: 'sepia(1) saturate(4) hue-rotate(5deg) brightness(1.1)',
    levelReq: 1,
    recipes: [
      { id: 'bronze-dagger',    name: 'Bronze Dagger',    levelReq: 1,  xp: 12.5, duration: 4, image: 'assets/icons/smithing.png', type: 'normal', dropTable: { id: 'bronze-dagger',    name: 'Bronze Dagger',    drops: [{ item: item('bronze-dagger',    'Bronze Dagger',    'assets/icons/smithing.png'), chance: 1, qty: 1 }] } },
      { id: 'bronze-sword',     name: 'Bronze Sword',     levelReq: 4,  xp: 12.5, duration: 4, image: 'assets/icons/smithing.png', type: 'normal', dropTable: { id: 'bronze-sword',     name: 'Bronze Sword',     drops: [{ item: item('bronze-sword',     'Bronze Sword',     'assets/icons/smithing.png'), chance: 1, qty: 1 }] } },
      { id: 'bronze-full-helm', name: 'Bronze Full Helm', levelReq: 7,  xp: 25,   duration: 5, image: 'assets/icons/smithing.png', type: 'normal', dropTable: { id: 'bronze-full-helm', name: 'Bronze Full Helm', drops: [{ item: item('bronze-full-helm', 'Bronze Full Helm', 'assets/icons/smithing.png'), chance: 1, qty: 1 }] } },
      { id: 'bronze-chainmail', name: 'Bronze Chainmail', levelReq: 11, xp: 37.5, duration: 6, image: 'assets/icons/smithing.png', type: 'normal', dropTable: { id: 'bronze-chainmail', name: 'Bronze Chainmail', drops: [{ item: item('bronze-chainmail', 'Bronze Chainmail', 'assets/icons/smithing.png'), chance: 1, qty: 1 }] } },
      { id: 'bronze-platelegs', name: 'Bronze Platelegs', levelReq: 16, xp: 37.5, duration: 6, image: 'assets/icons/smithing.png', type: 'normal', dropTable: { id: 'bronze-platelegs', name: 'Bronze Platelegs', drops: [{ item: item('bronze-platelegs', 'Bronze Platelegs', 'assets/icons/smithing.png'), chance: 1, qty: 1 }] } },
      { id: 'bronze-platebody', name: 'Bronze Platebody', levelReq: 18, xp: 62.5, duration: 8, image: 'assets/icons/smithing.png', type: 'normal', dropTable: { id: 'bronze-platebody', name: 'Bronze Platebody', drops: [{ item: item('bronze-platebody', 'Bronze Platebody', 'assets/icons/smithing.png'), chance: 1, qty: 1 }] } },
    ],
  },
];

@Component({
  selector: 'app-smithing',
  imports: [ActivityComponent, DecimalPipe, ModalComponent],
  templateUrl: './smithing.component.html',
  styleUrl: './smithing.component.scss',
})
export class SmithingComponent {
  pixelIcon = input<string>('');
  helpOpen  = signal(false);

  readonly playerService   = inject(PlayerService);
  readonly activityService = inject(ActivityService);

  get skillData() { return this.playerService.skill('smithing'); }

  readonly categories = CATEGORIES;
  readonly selectedCategoryId = signal(CATEGORIES[0].id);

  readonly selectedCategory = computed(() =>
    CATEGORIES.find(c => c.id === this.selectedCategoryId()) ?? CATEGORIES[0]
  );

  selectCategory(id: string): void {
    if (this.activityService.current()?.skillPanel === 'smithing') {
      this.activityService.stop();
    }
    this.selectedCategoryId.set(id);
  }

  selectRecipe(r: SmithingRecipe): void {
    if (this.activityService.current()?.name === r.name) {
      this.activityService.stop();
    } else {
      this.activityService.start({
        name: r.name, xp: r.xp, duration: r.duration,
        skillId: 'smithing', skillPanel: 'smithing',
        type: r.type,
        dropTable: r.dropTable,
        inputItems: r.inputItems,
      });
    }
  }
}
