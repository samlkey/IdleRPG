import { Component, computed, inject, input } from '@angular/core';
import { Monster } from '../../services/monster.service';
import { CharacterAnimationService } from '../../services/character-animation.service';
import { GameLocation } from '../../services/location.service';

@Component({
  selector: 'app-combat-arena',
  standalone: true,
  templateUrl: './combat-arena.component.html',
  styleUrl: './combat-arena.component.scss',
})
export class CombatArenaComponent {
  readonly anim = inject(CharacterAnimationService);
  readonly background    = input<string>('');
  readonly playerName    = input<string>('Adventurer');
  readonly hpPercent     = input<number>(100);
  readonly hp            = input<number>(100);
  readonly maxHp         = input<number>(100);
  readonly monster       = input<Monster | null>(null);
  readonly enemyHpPct    = input<number>(100);
  readonly killReqLocs   = input<GameLocation[]>([]);

  readonly enemyCurrentHp = computed(() => {
    const m = this.monster();
    if (!m) return 0;
    return Math.round((this.enemyHpPct() / 100) * m.stats.health);
  });
}
