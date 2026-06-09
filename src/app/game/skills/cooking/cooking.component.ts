import { Component, input, signal } from '@angular/core';
import { ModalComponent } from '../../shared/components/modal/modal.component';

@Component({
  selector: 'app-cooking',
  imports: [ModalComponent],
  templateUrl: './cooking.component.html',
  styleUrl: './cooking.component.scss',
})
export class CookingComponent {
  pixelIcon = input<string>('');
  helpOpen  = signal(false);
}
