import { Component, input, signal } from '@angular/core';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { ActivityBadgeComponent } from '../../shared/components/activity-badge/activity-badge.component';

@Component({
  selector: 'app-hunter',
  imports: [ModalComponent, ActivityBadgeComponent],
  templateUrl: './hunter.component.html',
  styleUrl: './hunter.component.scss',
})
export class HunterComponent {
  pixelIcon = input<string>('');
  helpOpen  = signal(false);
}
