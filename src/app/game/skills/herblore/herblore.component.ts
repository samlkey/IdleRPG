import { Component, input, signal } from '@angular/core';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { ActivityBadgeComponent } from '../../shared/components/activity-badge/activity-badge.component';

@Component({
  selector: 'app-herblore',
  imports: [ModalComponent, ActivityBadgeComponent],
  templateUrl: './herblore.component.html',
  styleUrl: './herblore.component.scss',
})
export class HerbloreComponent {
  pixelIcon = input<string>('');
  helpOpen  = signal(false);
}
