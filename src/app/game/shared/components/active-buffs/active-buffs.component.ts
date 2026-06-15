import { Component, computed, inject, OnDestroy, signal } from '@angular/core';
import { SpellService, ActiveBuff } from '../../../services/spell.service';

@Component({
  selector: 'app-active-buffs',
  templateUrl: './active-buffs.component.html',
  styleUrl: './active-buffs.component.scss',
})
export class ActiveBuffsComponent implements OnDestroy {
  private readonly spellService = inject(SpellService);

  readonly now = signal(Date.now());
  private readonly ticker = setInterval(() => {
    this.spellService.pruneExpired();
    this.now.set(Date.now());
  }, 500);

  readonly buffs = computed(() => {
    const now = this.now();
    return this.spellService.activeBuffs().filter(b => b.expiresAt > now);
  });

  remainingS(buff: ActiveBuff): number {
    return Math.max(0, Math.ceil((buff.expiresAt - this.now()) / 1000));
  }

  remainingPct(buff: ActiveBuff): number {
    return Math.max(0, 100 - ((this.now() - buff.startedAt) / (buff.durationSec * 1000)) * 100);
  }

  ngOnDestroy(): void {
    clearInterval(this.ticker);
  }
}
