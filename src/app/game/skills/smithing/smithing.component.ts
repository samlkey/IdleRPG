import { Component, computed, inject, input, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ActivityComponent } from '../../shared/components/activity/activity.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { ActivityBadgeComponent } from '../../shared/components/activity-badge/activity-badge.component';
import { PlayerService } from '../../services/player.service';
import { ActivityService } from '../../services/activity.service';
import { GameItem, DropTable, ItemService } from '../../services/item.service';

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

// ── Categories ────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-smithing',
  imports: [ActivityComponent, DecimalPipe, ModalComponent, ActivityBadgeComponent],
  templateUrl: './smithing.component.html',
  styleUrl: './smithing.component.scss',
})
export class SmithingComponent {
  pixelIcon = input<string>('');
  helpOpen  = signal(false);

  readonly playerService   = inject(PlayerService);
  readonly itemService     = inject(ItemService);
  readonly activityService = inject(ActivityService);

  get skillData() { return this.playerService.skill('smithing'); }

  readonly CATEGORIES: SmithingCategory[] = [
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
          dropTable: { id: 'bronze-bar', name: 'Bronze Bar', drops: [{ item: this.itemService.searchItemById('bronze-bar')!, chance: 1, qty: 1 }] },
          inputItems: [
            { item: this.itemService.searchItemById('copper-ore')!, qty: 1 },
            { item: this.itemService.searchItemById('tin-ore')!,    qty: 1 },
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
        {
          id: 'smelt-bronze-bar',
          name: 'Bronze Bar',
          levelReq: 1,
          xp: 6.2,
          duration: 4,
          image: 'assets/objects/bronze_bar.png',
          type: 'smelting',
          dropTable: { id: 'bronze-bar', name: 'Bronze Bar', drops: [{ item: this.itemService.searchItemById('bronze-bar')!, chance: 1, qty: 1 }] },
          inputItems: [
            { item: this.itemService.searchItemById('copper-ore')!, qty: 1 },
            { item: this.itemService.searchItemById('tin-ore')!,    qty: 1 },
          ],
        },
      ],
    },
  ];

  readonly selectedCategoryId = signal(this.CATEGORIES[0].id);

  readonly selectedCategory = computed(() =>
    this.CATEGORIES.find(c => c.id === this.selectedCategoryId()) ?? this.CATEGORIES[0]
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
