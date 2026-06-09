import { Component, input, signal } from '@angular/core';
import { ModalComponent } from '../../shared/components/modal/modal.component';

@Component({
  selector: 'app-quests',
  imports: [ModalComponent],
  templateUrl: './quests.component.html',
})
export class QuestsComponent {
  pixelIcon = input<string>('');
  helpOpen  = signal(false);
}
