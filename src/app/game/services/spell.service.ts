import { computed, inject, Injectable, signal } from '@angular/core';
import { PlayerService, SkillId } from './player.service';
import { ItemService } from './item.service';
import { NotificationService } from './notification.service';

export type SpellTarget = 'combat' | SkillId;

export interface RuneCost {
  itemId: string;
  name: string;
  qty: number;
}

export type SpellEffect =
  | { type: 'catch-boost'; amount: number; durationSec: number }
  | { type: 'xp-boost';    amount: number; durationSec: number }
  | { type: 'combat' };

export interface Spell {
  id: string;
  name: string;
  icon: string;
  description: string;
  levelRequired: number;
  xp: number;
  appliesTo: SpellTarget;
  runeCost: RuneCost[];
  effect: SpellEffect;
}

export interface ActiveBuff {
  spellId: string;
  spellName: string;
  icon: string;
  appliesTo: SpellTarget;
  effect: SpellEffect;
  durationSec: number;
  startedAt: number;
  expiresAt: number;
}

export const SPELLS: Spell[] = [
  // ── Combat ──────────────────────────────────────────────────────────────────
  {
    id: 'wind-strike', name: 'Wind Strike', icon: 'assets/icons/magic.png',
    description: 'A basic air-element combat spell.',
    levelRequired: 1, xp: 5.5, appliesTo: 'combat',
    runeCost: [{ itemId: 'air-rune', name: 'Air Rune', qty: 1 }, { itemId: 'mind-rune', name: 'Mind Rune', qty: 1 }],
    effect: { type: 'combat' },
  },
  {
    id: 'water-strike', name: 'Water Strike', icon: 'assets/icons/magic.png',
    description: 'A water-element combat spell.',
    levelRequired: 5, xp: 7.5, appliesTo: 'combat',
    runeCost: [{ itemId: 'air-rune', name: 'Air Rune', qty: 1 }, { itemId: 'water-rune', name: 'Water Rune', qty: 1 }, { itemId: 'mind-rune', name: 'Mind Rune', qty: 1 }],
    effect: { type: 'combat' },
  },
  {
    id: 'earth-strike', name: 'Earth Strike', icon: 'assets/icons/magic.png',
    description: 'An earth-element combat spell.',
    levelRequired: 9, xp: 9.5, appliesTo: 'combat',
    runeCost: [{ itemId: 'air-rune', name: 'Air Rune', qty: 1 }, { itemId: 'earth-rune', name: 'Earth Rune', qty: 2 }, { itemId: 'mind-rune', name: 'Mind Rune', qty: 1 }],
    effect: { type: 'combat' },
  },
  {
    id: 'fire-strike', name: 'Fire Strike', icon: 'assets/icons/magic.png',
    description: 'A fire-element combat spell.',
    levelRequired: 13, xp: 11.5, appliesTo: 'combat',
    runeCost: [{ itemId: 'air-rune', name: 'Air Rune', qty: 2 }, { itemId: 'fire-rune', name: 'Fire Rune', qty: 3 }, { itemId: 'mind-rune', name: 'Mind Rune', qty: 1 }],
    effect: { type: 'combat' },
  },
  // ── Thieving ────────────────────────────────────────────────────────────────
  {
    id: 'pickpocket-boost', name: 'Pickpocket Boost', icon: 'assets/icons/thieving.png',
    description: 'Increases pickpocket success chance by 10% for 60 seconds.',
    levelRequired: 1, xp: 15, appliesTo: 'thieving',
    runeCost: [],
    effect: { type: 'catch-boost', amount: 0.10, durationSec: 60 },
  },
  // ── Farming ─────────────────────────────────────────────────────────────────
  {
    id: 'water-crops', name: 'Water Crops', icon: 'assets/icons/farming.png',
    description: 'Waters your crops, granting +20% bonus XP for 2 minutes.',
    levelRequired: 10, xp: 20, appliesTo: 'farming',
    runeCost: [{ itemId: 'water-rune', name: 'Water Rune', qty: 3 }],
    effect: { type: 'xp-boost', amount: 0.20, durationSec: 120 },
  },
];

@Injectable({ providedIn: 'root' })
export class SpellService {
  private readonly playerService       = inject(PlayerService);
  private readonly itemService         = inject(ItemService);
  private readonly notificationService = inject(NotificationService);

  readonly spells = SPELLS;

  private readonly _activeBuffs = signal<ActiveBuff[]>([]);
  readonly activeBuffs = this._activeBuffs.asReadonly();

  /** All spells for a given target context. */
  spellsFor(target: SpellTarget): Spell[] {
    return this.spells.filter(s => s.appliesTo === target);
  }

  /** The active buff for a target if one exists and hasn't expired. */
  activeBuff(target: SpellTarget): ActiveBuff | null {
    const now = Date.now();
    return this._activeBuffs().find(b => b.appliesTo === target && b.expiresAt > now) ?? null;
  }

  canCast(spell: Spell): boolean {
    if (this.playerService.player().skills.magic.level < spell.levelRequired) return false;
    return spell.runeCost.every(r => this.itemService.has(r.itemId, r.qty));
  }

  cast(spell: Spell): void {
    if (!this.canCast(spell)) return;
    spell.runeCost.forEach(r => this.itemService.remove(r.itemId, r.qty));
    this.playerService.addXp('magic', spell.xp);
    this.notificationService.xp(spell.xp, 'magic', 'assets/icons/magic.png');

    if (spell.effect.type !== 'combat') {
      const now = Date.now();
      const buff: ActiveBuff = {
        spellId:     spell.id,
        spellName:   spell.name,
        icon:        spell.icon,
        appliesTo:   spell.appliesTo,
        effect:      spell.effect,
        durationSec: spell.effect.durationSec,
        startedAt:   now,
        expiresAt:   now + spell.effect.durationSec * 1000,
      };
      // Replace any existing buff from the same spell
      this._activeBuffs.update(bs => [...bs.filter(b => b.spellId !== spell.id), buff]);
      this.notificationService.show({
        type: 'success',
        message: spell.name,
        detail: 'Spell active!',
        icon: spell.icon,
      });
    }
  }

  /** Call periodically to evict expired buffs from the signal. */
  pruneExpired(): void {
    const now = Date.now();
    this._activeBuffs.update(bs => bs.filter(b => b.expiresAt > now));
  }
}
