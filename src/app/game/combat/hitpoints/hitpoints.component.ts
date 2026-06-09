import { Component, input, signal } from '@angular/core';
import { ModalComponent } from '../../shared/components/modal/modal.component';

@Component({
  selector: 'app-hitpoints',
  imports: [ModalComponent],
  templateUrl: './hitpoints.component.html',
})
export class HitpointsComponent {
  pixelIcon = input<string>('');
  helpOpen  = signal(false);
}
