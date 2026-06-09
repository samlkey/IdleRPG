import { Component, input, signal } from '@angular/core';
import { ModalComponent } from '../../shared/components/modal/modal.component';

@Component({
  selector: 'app-house',
  imports: [ModalComponent],
  templateUrl: './house.component.html',
  styleUrl: './house.component.scss',
})
export class HouseComponent {
  pixelIcon = input<string>('');
  helpOpen  = signal(false);
}
