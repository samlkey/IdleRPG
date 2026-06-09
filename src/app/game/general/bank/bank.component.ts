import { Component, input, signal } from '@angular/core';
import { ModalComponent } from '../../shared/components/modal/modal.component';

@Component({
  selector: 'app-bank',
  imports: [ModalComponent],
  templateUrl: './bank.component.html',
})
export class BankComponent {
  pixelIcon = input<string>('');
  helpOpen  = signal(false);
}
