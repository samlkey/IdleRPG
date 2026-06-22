import { Component, computed, input } from '@angular/core';
import { Monster } from '../../services/monster.service';

@Component({
  selector: 'app-enemy-display',
  standalone: true,
  templateUrl: './enemy-display.component.html',
  styleUrl: './enemy-display.component.scss',
})
export class EnemyDisplayComponent {
  readonly monster  = input<Monster | null>(null);
  readonly background = input<string>('');
  readonly hpPercent  = input<number>(100);

  readonly currentHp = computed(() => {
    const m = this.monster();
    if (!m) return 0;
    return Math.round((this.hpPercent() / 100) * m.stats.health);
  });
}
