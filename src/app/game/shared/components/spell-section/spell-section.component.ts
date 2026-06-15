import { Component, computed, inject, OnDestroy, signal } from '@angular/core';
import { SpellService, Spell, SpellTarget } from '../../../services/spell.service';
import { PlayerService } from '../../../services/player.service';
import { ItemService } from '../../../services/item.service';

@Component({
  selector: 'app-spell-section',
  templateUrl: './spell-section.component.html',
  styleUrl: './spell-section.component.scss',
})
export class SpellSectionComponent implements OnDestroy {
  private readonly spellService  = inject(SpellService);
  private readonly playerService = inject(PlayerService);
  private readonly itemService   = inject(ItemService);

  readonly now = signal(Date.now());
  private readonly ticker = setInterval(() => {
    this.spellService.pruneExpired();
    this.now.set(Date.now());
  }, 500);

  readonly allSpells = computed(() =>
    [...this.spellService.spells].sort((a, b) => a.levelRequired - b.levelRequired)
  );

  magicLevel(): number {
    return this.playerService.player().skills.magic.level;
  }

  isActive(spell: Spell): boolean {
    const buff = this.spellService.activeBuff(spell.appliesTo);
    return buff?.spellId === spell.id;
  }

  buffRemainingS(target: SpellTarget): number {
    const buff = this.spellService.activeBuff(target);
    if (!buff) return 0;
    return Math.max(0, Math.ceil((buff.expiresAt - this.now()) / 1000));
  }

  canCast(spell: Spell): boolean {
    return this.spellService.canCast(spell);
  }

  runeCount(itemId: string): number {
    return this.itemService.count(itemId);
  }

  effectLabel(spell: Spell): string {
    const e = spell.effect;
    if (e.type === 'catch-boost') return `+${e.amount * 100}% success · ${e.durationSec}s`;
    if (e.type === 'xp-boost')    return `+${e.amount * 100}% XP · ${e.durationSec}s`;
    return 'Combat';
  }

  cast(spell: Spell): void {
    this.spellService.cast(spell);
  }

  ngOnDestroy(): void {
    clearInterval(this.ticker);
  }
}
