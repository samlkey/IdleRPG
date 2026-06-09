import { Component, input, signal } from '@angular/core';
import { ModalComponent } from '../../shared/components/modal/modal.component';

@Component({
  selector: 'app-firemaking',
  imports: [ModalComponent],
  templateUrl: './firemaking.component.html',
  styleUrl: './firemaking.component.scss',})
export class FiremakingComponent {
  pixelIcon = input<string>('');
  helpOpen  = signal(false);
}
