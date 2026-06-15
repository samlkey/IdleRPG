import { Component, computed, inject, input, OnDestroy, signal } from '@angular/core';
import { SpellService, SpellTarget } from '../../../services/spell.service';

@Component({
  selector: 'app-spell-buff-indicator',
  templateUrl: './spell-buff-indicator.component.html',
  styleUrl: './spell-buff-indicator.component.scss',
})
export class SpellBuffIndicatorComponent implements OnDestroy {
  target = input.required<SpellTarget>();

  private readonly spellService = inject(SpellService);

  readonly now = signal(Date.now());
  private readonly ticker = setInterval(() => {
    this.spellService.pruneExpired();
    this.now.set(Date.now());
  }, 500);

  readonly activeBuff  = computed(() => this.spellService.activeBuff(this.target()));

  readonly remainingS  = computed(() => {
    const buff = this.activeBuff();
    if (!buff) return 0;
    return Math.max(0, Math.ceil((buff.expiresAt - this.now()) / 1000));
  });

  readonly remainingPct = computed(() => {
    const buff = this.activeBuff();
    if (!buff) return 0;
    return Math.max(0, 100 - ((this.now() - buff.startedAt) / (buff.durationSec * 1000)) * 100);
  });

  ngOnDestroy(): void {
    clearInterval(this.ticker);
  }
}
