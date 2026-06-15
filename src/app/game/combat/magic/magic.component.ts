import { Component, inject, input, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { SpellSectionComponent } from '../../shared/components/spell-section/spell-section.component';
import { PlayerService } from '../../services/player.service';

@Component({
  selector: 'app-magic',
  imports: [DecimalPipe, ModalComponent, SpellSectionComponent],
  templateUrl: './magic.component.html',
})
export class MagicComponent {
  pixelIcon = input<string>('');
  helpOpen  = signal(false);

  readonly playerService = inject(PlayerService);

  get skillData() { return this.playerService.skill('magic'); }
}
