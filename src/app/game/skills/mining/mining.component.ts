import { Component, input, signal } from '@angular/core';
import { ModalComponent } from '../../shared/components/modal/modal.component';

@Component({
  selector: 'app-mining',
  imports: [ModalComponent],
  templateUrl: './mining.component.html',
  styleUrl: './mining.component.scss',
})
export class MiningComponent {
  pixelIcon = input<string>('');
  helpOpen  = signal(false);
}
