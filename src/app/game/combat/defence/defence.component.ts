import { Component, input, signal } from '@angular/core';
import { ModalComponent } from '../../shared/components/modal/modal.component';

@Component({
  selector: 'app-defence',
  imports: [ModalComponent],
  templateUrl: './defence.component.html',
})
export class DefenceComponent {
  pixelIcon = input<string>('');
  helpOpen  = signal(false);
}
