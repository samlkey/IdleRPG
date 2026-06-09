import { Component, input, signal } from '@angular/core';
import { ModalComponent } from '../../shared/components/modal/modal.component';

@Component({
  selector: 'app-strength',
  imports: [ModalComponent],
  templateUrl: './strength.component.html',
})
export class StrengthComponent {
  pixelIcon = input<string>('');
  helpOpen  = signal(false);
}
