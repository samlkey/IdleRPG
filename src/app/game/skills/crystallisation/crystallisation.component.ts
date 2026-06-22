import { Component, inject, input, signal } from '@angular/core';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { ActivityBadgeComponent } from '../../shared/components/activity-badge/activity-badge.component';
import { PlayerService } from '../../services/player.service';
import { GameItem, ItemService } from '../../services/item.service';
import { PassiveService, SlotMap } from '../../services/passive.service';
import { DecimalPipe } from '@angular/common';
import { PassiveActivityComponent } from '../../shared/components/passive-activity/passive-activity.component';

@Component({
  selector: 'app-crystallisation',
  imports: [DecimalPipe, ModalComponent, PassiveActivityComponent, ActivityBadgeComponent],
  templateUrl: './crystallisation.component.html',
  styleUrl: './crystallisation.component.scss',
})
export class CrystallisationComponent {
  pixelIcon = input<string>('');
  helpOpen = signal(false);

  readonly playerService = inject(PlayerService);
  readonly itemService = inject(ItemService);
  readonly passiveService = inject(PassiveService);

  public readonly CrystalSlotMap: SlotMap[] = [
    {
      input: this.itemService.searchItemById('water-crystal-core'),
      output: this.itemService.searchItemById('water-crystal'),
      duration: 10,
      quantity: 10,
    },
  ];

  get skillData() {
    return this.playerService.skill('crystallisation');
  }
}
