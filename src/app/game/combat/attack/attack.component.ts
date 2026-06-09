import { Component, input, signal } from '@angular/core';
import { ModalComponent } from '../../shared/components/modal/modal.component';

@Component({
  selector: 'app-attack',
  imports: [ModalComponent],
  templateUrl: './attack.component.html',
})
export class AttackComponent {
  pixelIcon = input<string>('');
  helpOpen  = signal(false);
}
