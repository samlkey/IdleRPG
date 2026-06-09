import { Component, input, signal } from '@angular/core';
import { ModalComponent } from '../../shared/components/modal/modal.component';

@Component({
  selector: 'app-ranged',
  imports: [ModalComponent],
  templateUrl: './ranged.component.html',
})
export class RangedComponent {
  pixelIcon = input<string>('');
  helpOpen  = signal(false);
}
