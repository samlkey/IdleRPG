import { Component, computed, effect, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ActivityComponent, SkillRequirement } from '../../../shared/components/activity/activity.component';
import { ActivityService } from '../../../services/activity.service';
import { GameItem, ItemService } from '../../../services/item.service';
import { PlayerService } from '../../../services/player.service';

interface CookingRecipe {
  output: GameItem;
  burnedOutput: GameItem;
  /** 0–1 base probability of burning per cycle */
  chanceToFail: number;
  level: number;
  xp: number;
  duration: number;
}

const RECIPES: Record<string, CookingRecipe> = {
  'raw-shrimp': {
    output:       { id: 'cooked-shrimp',    name: 'Cooked Shrimp',    description: 'A freshly cooked shrimp.',    icon: 'assets/objects/cooked_shrimp.png',    type: 'consumable', value: 10 },
    burnedOutput: { id: 'burnt-shrimp',    name: 'Burnt Shrimp',    description: 'Completely charred. Utterly inedible.',  icon: 'assets/objects/burnt_shrimp.png',    type: 'misc', value: 1 },
    chanceToFail: 0.40, level: 1,  xp: 30,  duration: 3,
  },
  'raw-anchovies': {
    output:       { id: 'cooked-anchovies', name: 'Cooked Anchovies', description: 'A handful of cooked anchovies.', icon: 'assets/items/cooked-anchovies.png', type: 'consumable', value: 15 },
    burnedOutput: { id: 'burned-anchovies', name: 'Burned Anchovies', description: 'A crispy, inedible handful.',   icon: 'assets/items/burned-anchovies.png', type: 'misc', value: 1 },
    chanceToFail: 0.40, level: 1,  xp: 30,  duration: 3,
  },
  'raw-trout': {
    output:       { id: 'cooked-trout',     name: 'Cooked Trout',     description: 'A freshly cooked trout.',    icon: 'assets/items/cooked-trout.png',     type: 'consumable', value: 70 },
    burnedOutput: { id: 'burned-trout',     name: 'Burned Trout',     description: 'Charred beyond recognition.',  icon: 'assets/items/burned-trout.png',     type: 'misc', value: 1 },
    chanceToFail: 0.30, level: 15, xp: 70,  duration: 4,
  },
  'raw-salmon': {
    output:       { id: 'cooked-salmon',    name: 'Cooked Salmon',    description: 'A freshly cooked salmon.',   icon: 'assets/items/cooked-salmon.png',    type: 'consumable', value: 90 },
    burnedOutput: { id: 'burned-salmon',    name: 'Burned Salmon',    description: 'Charred beyond recognition.', icon: 'assets/items/burned-salmon.png',    type: 'misc', value: 1 },
    chanceToFail: 0.30, level: 25, xp: 90,  duration: 4,
  },
  'raw-tuna': {
    output:       { id: 'cooked-tuna',      name: 'Cooked Tuna',      description: 'A freshly cooked tuna.',     icon: 'assets/items/cooked-tuna.png',      type: 'consumable', value: 130 },
    burnedOutput: { id: 'burned-tuna',      name: 'Burned Tuna',      description: 'Charred beyond recognition.', icon: 'assets/items/burned-tuna.png',      type: 'misc', value: 1 },
    chanceToFail: 0.25, level: 30, xp: 100, duration: 5,
  },
  'raw-lobster': {
    output:       { id: 'cooked-lobster',   name: 'Cooked Lobster',   description: 'A freshly cooked lobster.',  icon: 'assets/items/cooked-lobster.png',   type: 'consumable', value: 160 },
    burnedOutput: { id: 'burned-lobster',   name: 'Burned Lobster',   description: 'Charred beyond recognition.', icon: 'assets/items/burned-lobster.png',   type: 'misc', value: 1 },
    chanceToFail: 0.25, level: 40, xp: 120, duration: 5,
  },
  'raw-swordfish': {
    output:       { id: 'cooked-swordfish', name: 'Cooked Swordfish', description: 'A freshly cooked swordfish.', icon: 'assets/items/cooked-swordfish.png', type: 'consumable', value: 200 },
    burnedOutput: { id: 'burned-swordfish', name: 'Burned Swordfish', description: 'Charred beyond recognition.',  icon: 'assets/items/burned-swordfish.png', type: 'misc', value: 1 },
    chanceToFail: 0.20, level: 45, xp: 140, duration: 6,
  },
  'raw-shark': {
    output:       { id: 'cooked-shark',     name: 'Cooked Shark',     description: 'A freshly cooked shark.',    icon: 'assets/items/cooked-shark.png',     type: 'consumable', value: 400 },
    burnedOutput: { id: 'burned-shark',     name: 'Burned Shark',     description: 'Charred beyond recognition.', icon: 'assets/items/burned-shark.png',     type: 'misc', value: 1 },
    chanceToFail: 0.15, level: 80, xp: 210, duration: 7,
  },
};

@Component({
  selector: 'app-cooking-activity',
  imports: [ActivityComponent, DecimalPipe],
  templateUrl: './cooking-activity.component.html',
  styleUrl: './cooking-activity.component.scss',
})
export class CookingActivityComponent {
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
    return id ? (RECIPES[id] ?? null) : null;
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
    return itemId in RECIPES;
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
