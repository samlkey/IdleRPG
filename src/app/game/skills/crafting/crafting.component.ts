import { Component, input, signal } from '@angular/core';
import { ModalComponent } from '../../shared/components/modal/modal.component';

@Component({
  selector: 'app-crafting',
  imports: [ModalComponent],
  templateUrl: './crafting.component.html',
  styleUrl: './crafting.component.scss',
})
export class CraftingComponent {
  pixelIcon = input<string>('');
  helpOpen  = signal(false);
}
