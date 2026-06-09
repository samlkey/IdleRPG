import { Component, input, signal } from '@angular/core';
import { ModalComponent } from '../../shared/components/modal/modal.component';

@Component({
  selector: 'app-smithing',
  imports: [ModalComponent],
  templateUrl: './smithing.component.html',
  styleUrl: './smithing.component.scss',
})
export class SmithingComponent {
  pixelIcon = input<string>('');
  helpOpen  = signal(false);
}
