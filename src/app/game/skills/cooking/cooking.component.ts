import { Component, inject, input, signal } from '@angular/core';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { ActivityBadgeComponent } from '../../shared/components/activity-badge/activity-badge.component';
import { DecimalPipe } from '@angular/common';
import { PlayerService } from '../../services/player.service';
import { ActivityService } from '../../services/activity.service';
import {
  CookingActivityComponent,
  CookingRecipe,
} from './cooking-activity/cooking-activity.component';
import { ItemService } from '../../services/item.service';

@Component({
  selector: 'app-cooking',
  imports: [DecimalPipe, ModalComponent, CookingActivityComponent, ActivityBadgeComponent],
  templateUrl: './cooking.component.html',
  styleUrl: './cooking.component.scss',
})
export class CookingComponent {
  pixelIcon = input<string>('');
  helpOpen = signal(false);

  readonly playerService = inject(PlayerService);
  readonly activityService = inject(ActivityService);
  readonly itemService = inject(ItemService);

  readonly RECIPES: Record<string, CookingRecipe> = {
    'raw-shrimp': {
      output: this.itemService.searchItemById('cooked-shrimp')!,
      burnedOutput: this.itemService.searchItemById('burnt-shrimp')!,
      chanceToFail: 0.1,
      level: 1,
      xp: 30,
      duration: 3,
    },
    'raw-anchovies': {
      output: this.itemService.searchItemById('cooked-anchovies')!,
      burnedOutput: this.itemService.searchItemById('burnt-anchovies')!,
      chanceToFail: 0.4,
      level: 1,
      xp: 30,
      duration: 3,
    },
    'raw-trout': {
      output: this.itemService.searchItemById('cooked-trout')!,
      burnedOutput: this.itemService.searchItemById('burned-trout')!,
      chanceToFail: 0.3,
      level: 15,
      xp: 70,
      duration: 4,
    },
    'raw-salmon': {
      output: this.itemService.searchItemById('cooked-salmon')!,
      burnedOutput: this.itemService.searchItemById('burned-salmon')!,
      chanceToFail: 0.3,
      level: 25,
      xp: 90,
      duration: 4,
    },
    'raw-tuna': {
      output: this.itemService.searchItemById('cooked-tuna')!,
      burnedOutput: this.itemService.searchItemById('burned-tuna')!,
      chanceToFail: 0.25,
      level: 30,
      xp: 100,
      duration: 5,
    },
    'raw-lobster': {
      output: this.itemService.searchItemById('cooked-lobster')!,
      burnedOutput: this.itemService.searchItemById('burned-lobster')!,
      chanceToFail: 0.25,
      level: 40,
      xp: 120,
      duration: 5,
    },
    'raw-swordfish': {
      output: this.itemService.searchItemById('cooked-swordfish')!,
      burnedOutput: this.itemService.searchItemById('burned-swordfish')!,
      chanceToFail: 0.2,
      level: 45,
      xp: 140,
      duration: 6,
    },
    'raw-shark': {
      output: this.itemService.searchItemById('cooked-shark')!,
      burnedOutput: this.itemService.searchItemById('burned-shark')!,
      chanceToFail: 0.15,
      level: 80,
      xp: 210,
      duration: 7,
    },
  };

  get skillData() {
    return this.playerService.skill('cooking');
  }
}
