import { Component, inject, input, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { PlayerService } from '../../services/player.service';
import { ActivityService } from '../../services/activity.service';
import { LocationService } from '../../services/location.service';

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

  get skillData()  { return this.playerService.skill('farming'); }
}
