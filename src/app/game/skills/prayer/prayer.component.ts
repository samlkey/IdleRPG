import { Component, input, signal } from '@angular/core';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { ActivityBadgeComponent } from '../../shared/components/activity-badge/activity-badge.component';

@Component({
  selector: 'app-prayer-skill',
  imports: [ModalComponent, ActivityBadgeComponent],
  templateUrl: './prayer.component.html',
})
export class PrayerComponent {
  pixelIcon = input<string>('');
  helpOpen  = signal(false);
}
