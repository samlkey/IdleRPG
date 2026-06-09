import { Component, input, signal } from '@angular/core';
import { ModalComponent } from '../../shared/components/modal/modal.component';

@Component({
  selector: 'app-thieving',
  imports: [ModalComponent],
  templateUrl: './thieving.component.html',
  styleUrl: './thieving.component.scss',
})
export class ThievingComponent {
  pixelIcon = input<string>('');
  helpOpen  = signal(false);
}
