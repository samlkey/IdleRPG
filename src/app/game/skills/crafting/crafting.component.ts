import { Component, input, signal } from '@angular/core';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { ActivityBadgeComponent } from '../../shared/components/activity-badge/activity-badge.component';

@Component({
  selector: 'app-crafting',
  imports: [ModalComponent, ActivityBadgeComponent],
  templateUrl: './crafting.component.html',
  styleUrl: './crafting.component.scss',
})
export class CraftingComponent {
  pixelIcon = input<string>('');
  helpOpen  = signal(false);
}
