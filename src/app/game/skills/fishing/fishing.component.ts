import { Component, input, signal } from '@angular/core';
import { ModalComponent } from '../../shared/components/modal/modal.component';

@Component({
  selector: 'app-fishing',
  imports: [ModalComponent],
  templateUrl: './fishing.component.html',
  styleUrl: './fishing.component.scss',})
export class FishingComponent {
  pixelIcon = input<string>('');
  helpOpen  = signal(false);
}
