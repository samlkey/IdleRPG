import { Component, input, signal } from '@angular/core';
import { ModalComponent } from '../../shared/components/modal/modal.component';

@Component({
  selector: 'app-construction',
  imports: [ModalComponent],
  templateUrl: './construction.component.html',
  styleUrl: './construction.component.scss',
})
export class ConstructionComponent {
  pixelIcon = input<string>('');
  helpOpen  = signal(false);
}
