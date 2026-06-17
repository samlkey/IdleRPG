import { Component, input, signal } from '@angular/core';
import { ModalComponent } from '../../shared/components/modal/modal.component';

@Component({
  selector: 'app-crystallisation',
  imports: [ModalComponent],
  templateUrl: './crystallisation.component.html',
  styleUrl: './crystallisation.component.scss',
})
export class CrystallisationComponent {
  pixelIcon = input<string>('');
  helpOpen = signal(false);
}
