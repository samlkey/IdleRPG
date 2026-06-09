import { Component, input, signal } from '@angular/core';
import { ModalComponent } from '../../shared/components/modal/modal.component';

@Component({
  selector: 'app-hunter',
  imports: [ModalComponent],
  templateUrl: './hunter.component.html',
  styleUrl: './hunter.component.scss',
})
export class HunterComponent {
  pixelIcon = input<string>('');
  helpOpen  = signal(false);
}
