import { Component, inject, input, signal } from '@angular/core';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { DecimalPipe } from '@angular/common';
import { PlayerService } from '../../services/player.service';
import { ActivityService } from '../../services/activity.service';
import { CookingActivityComponent } from './cooking-activity/cooking-activity.component';

@Component({
  selector: 'app-cooking',
  imports: [DecimalPipe, ModalComponent, CookingActivityComponent],
  templateUrl: './cooking.component.html',
  styleUrl: './cooking.component.scss',
})
export class CookingComponent {
  pixelIcon = input<string>('');
  helpOpen  = signal(false);

  readonly playerService = inject(PlayerService);
  readonly activityService = inject(ActivityService);

  get skillData() { return this.playerService.skill('cooking'); }
}
