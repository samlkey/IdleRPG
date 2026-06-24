import {
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { PlayerService } from '../../services/player.service';
import { LocationService, GameLocation } from '../../services/location.service';
import { MonsterService, Monster } from '../../services/monster.service';
import { ItemService, GameItem } from '../../services/item.service';
import { WORLDS } from '../../data/world.data';
import { CombatArenaComponent } from '../combat-arena/combat-arena.component';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-combat-level',
  imports: [DecimalPipe, CombatArenaComponent],
  templateUrl: './combat-level.component.html',
  styleUrl: './combat-level.component.scss',
})
export class CombatLevelComponent {
  pixelIcon = input<string>('');

  readonly playerService = inject(PlayerService);
  readonly locationService = inject(LocationService);
  readonly monsterService = inject(MonsterService);
  readonly itemService = inject(ItemService);
  readonly notificationService = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  readonly selectedMonster = signal<Monster | null>(null);
  readonly combatMode = signal<'passive' | 'active' | 'null'>('null');
  readonly attackInterval = signal(2.4);
  readonly attackProgress = signal(0);
  readonly enemyAttackInterval = signal(3.0);
  readonly enemyAttackProgress = signal(0);
  readonly enemyHp = signal(0);

  readonly enemyHpPct = computed(() => {
    const m = this.selectedMonster();
    if (!m) return 0;
    return Math.round((this.enemyHp() / m.stats.health) * 100);
  });

  readonly remainingAttackTime = computed(() =>
    ((1 - this.attackProgress() / 100) * this.attackInterval()).toFixed(1),
  );
  readonly remainingEnemyAttackTime = computed(() =>
    (
      (1 - this.enemyAttackProgress() / 100) *
      this.enemyAttackInterval()
    ).toFixed(1),
  );

  private combatTimer: ReturnType<typeof setInterval> | null = null;
  private static readonly TICK_MS = 100;

  constructor() {
    effect(() => {
      const mode = this.combatMode();
      if (mode === 'passive' || mode === 'active') {
        this.startCombat();
      } else {
        this.stopCombat();
      }
    });
    this.destroyRef.onDestroy(() => this.stopCombat());
  }

  private pickRandomMonster(): Monster | null {
    const monsters = this.locationMonsters();
    if (!monsters.length) return null;
    return monsters[Math.floor(Math.random() * monsters.length)];
  }

  private spawnNextMonster(): void {
    const monster = this.pickRandomMonster();
    if (!monster) return;
    this.selectedMonster.set(monster);
    this.enemyHp.set(monster.stats.health);
    this.enemyAttackProgress.set(0);
  }

  private startCombat(): void {
    this.stopCombat();
    this.spawnNextMonster();
    this.attackProgress.set(0);

    const tick = CombatLevelComponent.TICK_MS;

    this.combatTimer = setInterval(() => {
      // ── Player attack ───────────────────────────────────────────────────
      const playerStep = 100 / ((this.attackInterval() * 1000) / tick);
      const newPlayerProg = this.attackProgress() + playerStep;
      if (newPlayerProg >= 100) {
        this.attackProgress.set(0);
        const dmg = Math.max(1, Math.floor(Math.random() * 10) + 1);
        const newHp = Math.max(0, this.enemyHp() - dmg);
        this.enemyHp.set(newHp);
        if (newHp <= 0) {
          const drops = this.monsterService.rollDrop(
            this.selectedMonster()!.id,
          );
          if (drops) {
            for (const itemId of drops) {
              const item = this.itemService.searchItemById(itemId);
              if (item) {
                this.itemService.add(item, 1);
                this.notificationService.item(item.name, item.icon, 1);
                console.log(`You received: ${item.name}`);
              }
            }
          }
          //TODO: Add further enemy death logic like the killReq counter, etc.

          this.spawnNextMonster();
        }
      } else {
        this.attackProgress.set(newPlayerProg);
      }

      // ── Enemy attack ────────────────────────────────────────────────────
      const enemyStep = 100 / ((this.enemyAttackInterval() * 1000) / tick);
      const newEnemyProg = this.enemyAttackProgress() + enemyStep;
      if (newEnemyProg >= 100) {
        this.enemyAttackProgress.set(0);
        if (this.selectedMonster()) {
          const dmg = Math.max(1, Math.floor(Math.random() * 5) + 1);
          this.playerService.takeDamage(dmg);
        }
      } else {
        this.enemyAttackProgress.set(newEnemyProg);
      }
    }, tick);
  }

  private stopCombat(): void {
    if (this.combatTimer) {
      clearInterval(this.combatTimer);
      this.combatTimer = null;
    }
    this.attackProgress.set(0);
    this.enemyAttackProgress.set(0);
    this.selectedMonster.set(null);
  }

  readonly locationMonsters = computed(() => {
    const ids = this.locationService.current().monsters ?? [];
    return ids
      .map((id) => this.monsterService.searchItemById(id))
      .filter((m): m is Monster => !!m);
  });

  readonly upcomingKillReqs = computed((): GameLocation[] => {
    const currentId = this.locationService.current().id;
    for (const world of WORLDS) {
      const idx = world.locations.findIndex((l) => l.id === currentId);
      if (idx !== -1) {
        return world.locations
          .slice(idx + 1)
          .filter((l) => l.killReq !== undefined);
      }
    }
    return [];
  });

  readonly lootForSelected = computed(() => {
    const m = this.selectedMonster();
    if (!m) return [];
    return m.drops
      .map((d) => ({ ...d, item: this.itemService.searchItemById(d.itemId) }))
      .filter((d): d is typeof d & { item: GameItem } => d.item !== undefined)
      .sort((a, b) => b.chance - a.chance);
  });

  dropPct(chance: number): string {
    if (chance >= 1) return 'Always';
    const pct = chance * 100;
    return pct >= 1 ? `${Math.round(pct)}%` : `${pct.toFixed(1)}%`;
  }

  dropColor(chance: number): string {
    if (chance >= 1) return '#86efac';
    if (chance >= 0.5) return '#cbd5e1';
    if (chance >= 0.15) return '#67e8f9';
    if (chance >= 0.05) return '#c084fc';
    return '#fbbf24';
  }
}
