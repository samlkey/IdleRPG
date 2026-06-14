import { Component, inject, input, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { PlayerService } from '../../services/player.service';
import { ActivityService } from '../../services/activity.service';
import { LocationService } from '../../services/location.service';

interface FarmTab {
  id: string;
  name: string;
  icon: string;
  levelReq: number;
}

@Component({
  selector: 'app-farming',
  imports: [DecimalPipe, ModalComponent],
  templateUrl: './farming.component.html',
  styleUrl: './farming.component.scss',
})
export class FarmingComponent {
  pixelIcon = input<string>('');
  helpOpen  = signal(false);

  readonly playerService   = inject(PlayerService);
  readonly activityService = inject(ActivityService);
  readonly locationService = inject(LocationService);

  readonly TABS: FarmTab[] = [
    { id: 'allotments', name: 'Allotments', icon: 'assets/objects/tomato.png', levelReq: 1  },
    { id: 'herbs',      name: 'Herbs',      icon: 'assets/icons/herblore.png', levelReq: 9  },
    { id: 'trees',      name: 'Trees',      icon: 'assets/icons/woodcutting.png', levelReq: 15 },
  ];

  readonly selectedTabId = signal(this.TABS[0].id);

  get skillData() { return this.playerService.skill('farming'); }

  selectTab(id: string): void {
    this.selectedTabId.set(id);
  }
}
