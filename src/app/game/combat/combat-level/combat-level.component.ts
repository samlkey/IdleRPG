import { Component, computed, inject, input, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { PlayerService, SkillId } from '../../services/player.service';
import { LocationService } from '../../services/location.service';
import { MonsterService, Monster } from '../../services/monster.service';
import { ItemService, GameItem } from '../../services/item.service';
import { GameLocation } from '../../services/location.service';
import { WORLDS } from '../../data/world.data';
import { CombatArenaComponent } from '../combat-arena/combat-arena.component';

interface CombatStat { id: SkillId; label: string; icon: string; color: string; }

@Component({
  selector: 'app-combat-level',
  imports: [DecimalPipe, CombatArenaComponent],
  templateUrl: './combat-level.component.html',
  styleUrl: './combat-level.component.scss',
})
export class CombatLevelComponent {
  pixelIcon = input<string>('');

  readonly playerService   = inject(PlayerService);
  readonly locationService = inject(LocationService);
  readonly monsterService  = inject(MonsterService);
  readonly itemService     = inject(ItemService);

  readonly combatStats: CombatStat[] = [
    { id: 'attack',    label: 'Attack',    icon: 'assets/icons/attack.png',    color: '#f87171' },
    { id: 'strength',  label: 'Strength',  icon: 'assets/icons/strength.png',  color: '#fb923c' },
    { id: 'defence',   label: 'Defence',   icon: 'assets/icons/defence.png',   color: '#60a5fa' },
    { id: 'ranged',    label: 'Ranged',    icon: 'assets/icons/ranged.png',    color: '#4ade80' },
    { id: 'hitpoints', label: 'Hitpoints', icon: 'assets/icons/hitpoints.png', color: '#f43f5e' },
  ];

  readonly selectedMonster   = signal<Monster | null>(null);
  readonly combatMode        = signal<'passive' | 'active'>('passive');
  readonly attackInterval    = signal(2.4);
  readonly attackProgress    = signal(0);
  readonly enemyAttackInterval  = signal(3.0);
  readonly enemyAttackProgress  = signal(0);

  readonly remainingAttackTime = computed(() =>
    ((1 - this.attackProgress() / 100) * this.attackInterval()).toFixed(1)
  );
  readonly remainingEnemyAttackTime = computed(() =>
    ((1 - this.enemyAttackProgress() / 100) * this.enemyAttackInterval()).toFixed(1)
  );

  readonly locationMonsters = computed(() => {
    const ids = this.locationService.current().monsters ?? [];
    return ids
      .map(id => this.monsterService.searchItemById(id))
      .filter((m): m is Monster => !!m);
  });

  readonly upcomingKillReqs = computed((): GameLocation[] => {
    const currentId = this.locationService.current().id;
    for (const world of WORLDS) {
      const idx = world.locations.findIndex(l => l.id === currentId);
      if (idx !== -1) {
        return world.locations.slice(idx + 1).filter(l => l.killReq !== undefined);
      }
    }
    return [];
  });

  readonly lootForSelected = computed(() => {
    const m = this.selectedMonster();
    if (!m) return [];
    return m.drops
      .map(d => ({ ...d, item: this.itemService.searchItemById(d.itemId) }))
      .filter((d): d is typeof d & { item: GameItem } => d.item !== undefined)
      .sort((a, b) => b.chance - a.chance);
  });

  selectMonster(m: Monster): void {
    this.selectedMonster.set(
      this.selectedMonster()?.id === m.id ? null : m
    );
  }

  dropPct(chance: number): string {
    if (chance >= 1) return 'Always';
    const pct = chance * 100;
    return pct >= 1 ? `${Math.round(pct)}%` : `${pct.toFixed(1)}%`;
  }

  dropColor(chance: number): string {
    if (chance >= 1)    return '#86efac';
    if (chance >= 0.5)  return '#cbd5e1';
    if (chance >= 0.15) return '#67e8f9';
    if (chance >= 0.05) return '#c084fc';
    return '#fbbf24';
  }

  skill(id: SkillId) { return this.playerService.skill(id); }

  xpPct(id: SkillId): number {
    const s = this.playerService.skill(id);
    return s.xpForLevel > 0 ? (s.xpIntoLevel / s.xpForLevel) * 100 : 100;
  }
}
