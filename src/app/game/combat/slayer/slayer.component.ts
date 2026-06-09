import { Component, input, signal } from '@angular/core';
import { ModalComponent } from '../../shared/components/modal/modal.component';

@Component({
  selector: 'app-slayer',
  imports: [ModalComponent],
  templateUrl: './slayer.component.html',
})
export class SlayerComponent {
  pixelIcon = input<string>('');
  helpOpen  = signal(false);
}
