import { Component, input } from '@angular/core';

@Component({
  selector: 'app-player-arena',
  standalone: true,
  templateUrl: './player-arena.component.html',
  styleUrl: './player-arena.component.scss',
})
export class PlayerArenaComponent {
  readonly background = input<string>('');
  readonly name       = input<string>('Adventurer');
  readonly hpPercent  = input<number>(100);
  readonly hp         = input<number>(100);
  readonly maxHp      = input<number>(100);
}
