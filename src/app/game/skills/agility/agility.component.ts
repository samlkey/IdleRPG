import { Component, input, signal } from '@angular/core';
import { ModalComponent } from '../../shared/components/modal/modal.component';

@Component({
  selector: 'app-agility',
  imports: [ModalComponent],
  templateUrl: './agility.component.html',
  styleUrl: './agility.component.scss',
})
export class AgilityComponent {
  pixelIcon = input<string>('');
  helpOpen  = signal(false);
}
