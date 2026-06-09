import { Component, input, signal } from '@angular/core';
import { ModalComponent } from '../../shared/components/modal/modal.component';

@Component({
  selector: 'app-fletching',
  imports: [ModalComponent],
  templateUrl: './fletching.component.html',
  styleUrl: './fletching.component.scss',
})
export class FletchingComponent {
  pixelIcon = input<string>('');
  helpOpen  = signal(false);
}
