import { Component, input, signal } from '@angular/core';
import { ModalComponent } from '../../shared/components/modal/modal.component';

@Component({
  selector: 'app-farming',
  imports: [ModalComponent],
  templateUrl: './farming.component.html',
  styleUrl: './farming.component.scss',
})
export class FarmingComponent {
  pixelIcon = input<string>('');
  helpOpen  = signal(false);
}
