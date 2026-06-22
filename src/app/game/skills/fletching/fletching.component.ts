import { Component, input, signal } from '@angular/core';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { ActivityBadgeComponent } from '../../shared/components/activity-badge/activity-badge.component';

@Component({
  selector: 'app-fletching',
  imports: [ModalComponent, ActivityBadgeComponent],
  templateUrl: './fletching.component.html',
  styleUrl: './fletching.component.scss',
})
export class FletchingComponent {
  pixelIcon = input<string>('');
  helpOpen  = signal(false);
}
