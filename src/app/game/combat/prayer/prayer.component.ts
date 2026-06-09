import { Component, input, signal } from '@angular/core';
import { ModalComponent } from '../../shared/components/modal/modal.component';

@Component({
  selector: 'app-prayer',
  imports: [ModalComponent],
  templateUrl: './prayer.component.html',
})
export class PrayerComponent {
  pixelIcon = input<string>('');
  helpOpen  = signal(false);
}
