import { Component, computed, inject, input, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { ActivityBadgeComponent } from '../../shared/components/activity-badge/activity-badge.component';
import { PlayerService } from '../../services/player.service';
import { ActivityService } from '../../services/activity.service';
import { LocationService } from '../../services/location.service';
import { PassiveActivityComponent } from '../../shared/components/passive-activity/passive-activity.component';
import { SlotMap } from '../../services/passive.service';
import { ItemService } from '../../services/item.service';

interface FarmTab {
  id: string;
  name: string;
  icon: string;
  levelReq: number;
}

@Component({
  selector: 'app-farming',
  imports: [DecimalPipe, ModalComponent, PassiveActivityComponent, ActivityBadgeComponent],
  templateUrl: './farming.component.html',
  styleUrl: './farming.component.scss',
})
export class FarmingComponent {
  pixelIcon = input<string>('');
  helpOpen = signal(false);

  readonly playerService = inject(PlayerService);
  readonly itemService = inject(ItemService);
  readonly activityService = inject(ActivityService);
  readonly locationService = inject(LocationService);

  readonly TABS: FarmTab[] = [
    {
      id: 'allotments',
      name: 'Allotments',
      icon: 'assets/objects/tomato.png',
      levelReq: 1,
    },
    {
      id: 'herbs',
      name: 'Herbs',
      icon: 'assets/icons/herblore.png',
      levelReq: 9,
    },
    {
      id: 'trees',
      name: 'Trees',
      icon: 'assets/icons/woodcutting.png',
      levelReq: 15,
    },
  ];

  public readonly FarmingTabMap: SlotMap[] = [
    {
      input: this.itemService.searchItemById('normal-seed'),
      output: this.itemService.searchItemById('tomato'),
      duration: 10,
      quantity: 10,
    },
  ];

  public readonly HerbTabMap: SlotMap[] = [
    {
      input: this.itemService.searchItemById('normal-seed'),
      output: this.itemService.searchItemById('tomato'),
      duration: 10,
      quantity: 10,
    },
  ];

  public readonly TreeTabMap: SlotMap[] = [
    {
      input: this.itemService.searchItemById('normal-seed'),
      output: this.itemService.searchItemById('tomato'),
      duration: 10,
      quantity: 10,
    },
  ];

  readonly selectedTabId = signal(this.TABS[0].id);

  get skillData() {
    return this.playerService.skill('farming');
  }

  selectTab(id: string): void {
    this.selectedTabId.set(id);
  }

  readonly farmingSlots = computed(() => {
    const id = this.selectedTabId();
    const count = this.locationService.current().activities.farming?.[id] ?? 0;
    return Array.from({ length: count }, (_, i) => i);
  });
}
