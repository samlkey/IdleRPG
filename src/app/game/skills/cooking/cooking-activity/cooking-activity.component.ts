import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ActivityComponent, SkillRequirement } from '../../../shared/components/activity/activity.component';
import { ActivityService } from '../../../services/activity.service';
import { GameItem, ItemService } from '../../../services/item.service';
import { PlayerService } from '../../../services/player.service';

export interface CookingRecipe {
  output: GameItem;
  burnedOutput: GameItem;
  /** 0–1 base probability of burning per cycle */
  chanceToFail: number;
  level: number;
  xp: number;
  duration: number;
}

@Component({
  selector: 'app-cooking-activity',
  imports: [ActivityComponent, DecimalPipe],
  templateUrl: './cooking-activity.component.html',
  styleUrl: './cooking-activity.component.scss',
})
export class CookingActivityComponent {
  readonly recipes = input.required<Record<string, CookingRecipe>>();

  private readonly itemService     = inject(ItemService);
  private readonly activityService = inject(ActivityService);
  private readonly playerService   = inject(PlayerService);

  readonly selectedId = signal<string | null>(
    this.activityService.savedSelections.get('cooking') ?? null
  );

  readonly cookableItems = computed(() =>
    Object.values(this.itemService.inventory()).filter(e => e.item.type === 'consumable')
  );

  readonly selectedItem = computed((): GameItem | null => {
    const id = this.selectedId();
    return id ? (this.itemService.inventory()[id]?.item ?? null) : null;
  });

  readonly activeRecipe = computed((): CookingRecipe | null => {
    const id = this.selectedId();
    return id ? (this.recipes()[id] ?? null) : null;
  });

  readonly isActive = computed(() => {
    const cfg = this.activityService.current();
    return cfg?.skillPanel === 'cooking' && cfg?.name === this.selectedItem()?.name;
  });

  readonly cookingLevel = computed(() => this.playerService.skill('cooking').level);

  readonly cookingReq = computed((): SkillRequirement[] => {
    const recipe = this.activeRecipe();
    if (!recipe) return [];
    return [{ icon: 'assets/icons/cooking.png', level: recipe.level, skill: 'Cooking' }];
  });

  constructor() {
    effect(() => {
      const id = this.selectedId();
      if (id) {
        this.activityService.savedSelections.set('cooking', id);
      } else {
        this.activityService.savedSelections.delete('cooking');
      }
    });
  }

  hasRecipe(itemId: string): boolean {
    return itemId in this.recipes();
  }

  selectIngredient(item: GameItem): void {
    if (!this.hasRecipe(item.id)) return;
    if (this.selectedId() === item.id) return;
    if (this.isActive()) this.activityService.stop();
    this.selectedId.set(item.id);
  }

  startCooking(): void {
    const item   = this.selectedItem();
    const recipe = this.activeRecipe();
    if (!item || !recipe) return;
    if (this.isActive()) {
      this.activityService.stop();
    } else {
      this.activityService.start({
        name: item.name,
        xp: recipe.xp,
        duration: recipe.duration,
        skillId: 'cooking',
        skillPanel: 'cooking',
        type: 'consumption',
        catchChance: 1 - recipe.chanceToFail,
        inputItem: item,
        dropTable: {
          id: recipe.output.id,
          name: recipe.output.name,
          drops: [{ item: recipe.output, chance: 1 }],
        },
        failDropTable: {
          id: recipe.burnedOutput.id,
          name: recipe.burnedOutput.name,
          drops: [{ item: recipe.burnedOutput, chance: 1 }],
        },
      });
    }
  }
}
