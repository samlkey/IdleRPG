import { Component, input, signal } from '@angular/core';
import { ModalComponent } from '../../shared/components/modal/modal.component';

@Component({
  selector: 'app-magic',
  imports: [ModalComponent],
  templateUrl: './magic.component.html',
})
export class MagicComponent {
  pixelIcon = input<string>('');
  helpOpen  = signal(false);
}
