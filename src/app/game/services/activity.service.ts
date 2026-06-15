import { Injectable, inject, signal } from '@angular/core';
import { PlayerService, SkillId } from './player.service';
import { NotificationService } from './notification.service';
import { GameItem, DropTable, ItemService } from './item.service';
import { QuestService } from './quest.service';
import { SpellService } from './spell.service';

export interface ActivityConfig {
  name: string;
  xp: number;
  /** Seconds per cycle */
  duration: number;
  skillId: SkillId;
  skillPanel: SkillId;
  /** 0–1 success probability per cycle. Omit for guaranteed XP. */
  catchChance?: number;
  type?: 'normal' | 'depletion' | 'delay' | 'consumption' | 'bonus' | 'smelting';
  /** (delay) Seconds the caught animation lasts. Defaults to duration. */
  delayDuration?: number;
  /** (delay) HP lost when caught. Defaults to 2. */
  caughtDamage?: number;
  /** Gold awarded on each successful cycle */
  goldReward?: number;
  /** Item granted on each successful cycle */
  dropTable?: DropTable;
  /** (consumption) Item granted when a cycle fails (e.g. burned food). Input is still consumed. */
  failDropTable?: DropTable;
  /** (consumption) Item consumed on each successful cycle */
  inputItem?: GameItem;
  /** (smelting) Multiple items consumed per cycle to produce an output */
  inputItems?: { item: GameItem; qty: number }[];
  /** (depletion) Total charges */
  maxCharges?: number;
  /** (depletion) Seconds per charge to replenish */
  replenishTime?: number;
  /** (bonus) Number of steps needed to earn bonus XP */
  bonusSteps?: number;
  /** (bonus) Extra XP awarded when all steps are reached */
  bonusXp?: number;
  /** (bonus) 0–1 probability of advancing a step each cycle */
  bonusChance?: number;
  /** (bonus) HP lost when a step fails */
  bonusDamage?: number;
}

const TICK_MS = 100;

@Injectable({ providedIn: 'root' })
export class ActivityService {
  private readonly playerService       = inject(PlayerService);
  private readonly notificationService = inject(NotificationService);
  private readonly itemService         = inject(ItemService);
  private readonly questService        = inject(QuestService);
  private readonly spellService        = inject(SpellService);

  readonly current              = signal<ActivityConfig | null>(null);
  readonly cycleStartedAt       = signal<number | null>(null);
  /** True while the player is in the caught/delay penalty phase */
  readonly isDelayed            = signal(false);
  readonly charges              = signal<number>(0);
  readonly replenishPct         = signal<number>(0);
  /** True while all charges are depleted and recovering */
  readonly isFullReplenishing   = signal(false);
  readonly lastCycleResult      = signal<{ timestamp: number; caught: boolean } | null>(null);
  /** (bonus) Current step progress toward bonus XP */
  readonly bonusStep            = signal<number>(0);

  private cycleTimer:     ReturnType<typeof setInterval> | null = null;
  private replenishTimer: ReturnType<typeof setInterval> | null = null;
  readonly savedCharges:   Map<string, number> = new Map();
  /** Persists per-skill ingredient/target selection across navigation. */
  readonly savedSelections: Map<string, string> = new Map();

  // ── Public API ───────────────────────────────────────────────────────────────

  start(config: ActivityConfig): void {
    const prev = this.current();
    if (prev?.type === 'depletion') {
      this.savedCharges.set(prev.name, this.charges());
    }
    this.stopTimers();
    this.current.set(config);
    this.cycleStartedAt.set(Date.now());
    this.isDelayed.set(false);
    this.isFullReplenishing.set(false);
    if (config.type === 'depletion') {
      const saved = this.savedCharges.get(config.name);
      const charges = saved ?? config.maxCharges ?? 6;
      this.charges.set(charges);
      this.replenishPct.set(0);
      if (charges <= 0) {
        this.startFullReplenish(config);
      }
    }
    if (config.type === 'bonus') {
      this.bonusStep.set(0);
    }
    if (config.type === 'consumption' && config.inputItem) {
      if (this.itemService.count(config.inputItem.id) === 0) {
        this.notificationService.show({ type: 'warning', message: `No ${config.inputItem.name}s`, detail: 'Nothing to burn' });
        return;
      }
    }
    if (config.type === 'smelting' && config.inputItems?.length) {
      const missing = config.inputItems.find(r => this.itemService.count(r.item.id) < r.qty);
      if (missing) {
        this.notificationService.show({ type: 'warning', message: `Not enough ${missing.item.name}`, detail: 'Cannot smelt' });
        return;
      }
    }
    this.lastCycleResult.set(null);
    this.playerService.setMainActivity(config.name, config.skillPanel);
    this.runCycleTimer();
  }

  stop(): void {
    this.stopTimers();
    const cfg = this.current();
    if (cfg?.type === 'depletion') {
      this.savedCharges.set(cfg.name, this.charges());
    }
    const had = cfg !== null;
    this.current.set(null);
    this.cycleStartedAt.set(null);
    this.isDelayed.set(false);
    this.isFullReplenishing.set(false);
    this.bonusStep.set(0);
    if (had) this.playerService.setMainActivity(null);
  }

  completeCycleNow(): void {
    const cfg = this.current();
    if (!cfg) return;
    if (cfg.type === 'smelting' && cfg.inputItems?.length) {
      cfg.inputItems.forEach(r => this.itemService.remove(r.item.id, r.qty));
    }
    this.playerService.addXp(cfg.skillId, cfg.xp);
    this.notificationService.xp(cfg.xp, cfg.skillPanel, `assets/icons/${cfg.skillPanel}.png`);
    this.questService.onSkillAction(cfg.skillId);
    if (cfg.goldReward) {
      this.playerService.addGold(cfg.goldReward);
      this.notificationService.gold(cfg.goldReward);
    }
    if (cfg.dropTable) this.rollDropTable(cfg.dropTable);
    if (cfg.type === 'bonus') {
      const steps = cfg.bonusSteps ?? 5;
      const next = this.bonusStep() + 1;
      if (next >= steps) {
        const bxp = cfg.bonusXp ?? cfg.xp;
        this.playerService.addXp(cfg.skillId, bxp);
        this.notificationService.show({
          type: 'success',
          message: `+${bxp} Bonus XP`,
          detail: 'Lap complete!',
          icon: `assets/icons/${cfg.skillPanel}.png`,
        });
        this.bonusStep.set(0);
      } else {
        this.bonusStep.set(next);
      }
    }
    this.cycleStartedAt.set(Date.now());
    this.isDelayed.set(false);
    this.lastCycleResult.set({ timestamp: Date.now(), caught: true });
  }

  // ── Internal ─────────────────────────────────────────────────────────────────

  private runCycleTimer(): void {
    this.cycleTimer = setInterval(() => {
      const cfg   = this.current();
      const start = this.cycleStartedAt();
      if (!cfg || start === null) return;

      // ── Full replenish phase ───────────────────────────────────────────────
      if (this.isFullReplenishing()) return;

      const elapsed = Date.now() - start;

      // ── Delay phase ────────────────────────────────────────────────────────
      if (this.isDelayed()) {
        const delayMs = (cfg.delayDuration ?? cfg.duration) * 1000;
        if (elapsed >= delayMs) {
          this.isDelayed.set(false);
          this.cycleStartedAt.set(Date.now());
        }
        return;
      }

      // ── Normal cycle ───────────────────────────────────────────────────────
      if (elapsed < cfg.duration * 1000) return;

      const catchBuff = cfg.catchChance != null ? this.spellService.activeBuff(cfg.skillId) : null;
      const catchBoost = catchBuff?.effect.type === 'catch-boost' ? catchBuff.effect.amount : 0;
      const success = cfg.catchChance == null || Math.random() < cfg.catchChance + catchBoost;

      if (!success && cfg.type === 'delay') {
        const dmg = cfg.caughtDamage ?? 2;
        this.playerService.takeDamage(dmg);
        this.notificationService.show({
          type: 'warning',
          message: `-${dmg} HP`,
          detail: 'Caught!',
          icon: `assets/icons/${cfg.skillPanel}.png`,
        });
        this.isDelayed.set(true);
        this.cycleStartedAt.set(Date.now());
        this.lastCycleResult.set({ timestamp: Date.now(), caught: false });
        return;
      }

      // ── Burn / fail branch ─────────────────────────────────────────────────
      if (!success && cfg.type === 'consumption' && cfg.failDropTable && cfg.inputItem) {
        if (this.itemService.count(cfg.inputItem.id) === 0) {
          this.stop();
          this.notificationService.show({ type: 'warning', message: `Out of ${cfg.inputItem.name}s`, detail: 'Activity stopped' });
          return;
        }
        this.itemService.remove(cfg.inputItem.id, 1);
        this.rollDropTable(cfg.failDropTable);
        this.notificationService.show({
          type: 'warning',
          message: 'Burned!',
          detail: cfg.failDropTable.drops[0]?.item.name ?? 'Food burned',
          icon: cfg.failDropTable.drops[0]?.item.icon,
        });
        this.lastCycleResult.set({ timestamp: Date.now(), caught: false });
        this.cycleStartedAt.set(Date.now());
        if (this.itemService.count(cfg.inputItem.id) === 0) {
          this.stop();
          this.notificationService.show({ type: 'warning', message: `Out of ${cfg.inputItem.name}s`, detail: 'Activity stopped' });
        }
        return;
      }

      // ── Smelting branch ────────────────────────────────────────────────────
      if (cfg.type === 'smelting' && cfg.inputItems?.length) {
        const missing = cfg.inputItems.find(r => this.itemService.count(r.item.id) < r.qty);
        if (missing) {
          this.stop();
          this.notificationService.show({ type: 'warning', message: `Out of ${missing.item.name}`, detail: 'Smelting stopped' });
          return;
        }
        cfg.inputItems.forEach(r => this.itemService.remove(r.item.id, r.qty));
        this.playerService.addXp(cfg.skillId, cfg.xp);
        this.notificationService.xp(cfg.xp, cfg.skillPanel, `assets/icons/${cfg.skillPanel}.png`);
        this.questService.onSkillAction(cfg.skillId);
        if (cfg.dropTable) this.rollDropTable(cfg.dropTable);
        const canContinue = cfg.inputItems.every(r => this.itemService.count(r.item.id) >= r.qty);
        if (!canContinue) {
          this.stop();
          this.notificationService.show({ type: 'warning', message: 'Out of materials', detail: 'Smelting stopped' });
          return;
        }
        this.lastCycleResult.set({ timestamp: Date.now(), caught: true });
        this.cycleStartedAt.set(Date.now());
        return;
      }

      if (success && cfg.type !== 'bonus') {
        if (cfg.type === 'consumption' && cfg.inputItem) {
          if (this.itemService.count(cfg.inputItem.id) === 0) {
            this.stop();
            this.notificationService.show({ type: 'warning', message: `Out of ${cfg.inputItem.name}s`, detail: 'Activity stopped' });
            return;
          }
          this.itemService.remove(cfg.inputItem.id, 1);
        }
        this.playerService.addXp(cfg.skillId, cfg.xp);
        this.notificationService.xp(cfg.xp, cfg.skillPanel, `assets/icons/${cfg.skillPanel}.png`);
        this.questService.onSkillAction(cfg.skillId);
        if (cfg.goldReward) {
          this.playerService.addGold(cfg.goldReward);
          this.notificationService.gold(cfg.goldReward);
        }
        if (cfg.dropTable) this.rollDropTable(cfg.dropTable);
        if (cfg.type === 'consumption' && cfg.inputItem && this.itemService.count(cfg.inputItem.id) === 0) {
          this.stop();
          this.notificationService.show({ type: 'warning', message: `Out of ${cfg.inputItem.name}s`, detail: 'Activity stopped' });
          return;
        }
      }
      this.lastCycleResult.set({ timestamp: Date.now(), caught: success });

      if (cfg.type === 'depletion') {
        const next = this.charges() - 1;
        this.charges.set(next);
        if (next <= 0) {
          this.startFullReplenish(cfg);
          return;
        }
      }

      if (cfg.type === 'bonus' && success) {
        const steps = cfg.bonusSteps ?? 5;
        const passed = Math.random() < (cfg.bonusChance ?? 0.5);
        if (passed) {
          this.playerService.addXp(cfg.skillId, cfg.xp);
          this.notificationService.xp(cfg.xp, cfg.skillPanel, `assets/icons/${cfg.skillPanel}.png`);
          const next = this.bonusStep() + 1;
          if (next >= steps) {
            const bxp = cfg.bonusXp ?? cfg.xp;
            this.playerService.addXp(cfg.skillId, bxp);
            this.notificationService.show({
              type: 'success',
              message: `+${bxp} Bonus XP`,
              detail: 'Lap complete!',
              icon: `assets/icons/${cfg.skillPanel}.png`,
            });
            this.bonusStep.set(0);
          } else {
            this.bonusStep.set(next);
          }
        } else {
          const dmg = cfg.bonusDamage ?? 2;
          this.playerService.takeDamage(dmg);
          this.notificationService.show({
            type: 'warning',
            message: `Fell  -${dmg} HP`,
            detail: 'Obstacle failed',
            icon: `assets/icons/${cfg.skillPanel}.png`,
          });
          this.bonusStep.set(0);
        }
      }

      this.cycleStartedAt.set(Date.now());
    }, TICK_MS);
  }

  private startFullReplenish(cfg: ActivityConfig): void {
    this.isFullReplenishing.set(true);
    this.replenishPct.set(0);
    const totalMs = (cfg.replenishTime ?? 60) * 1000;
    this.replenishTimer = setInterval(() => {
      const pct = this.replenishPct() + (TICK_MS / totalMs) * 100;
      if (pct >= 100) {
        clearInterval(this.replenishTimer!);
        this.replenishTimer = null;
        this.charges.set(cfg.maxCharges ?? 6);
        this.replenishPct.set(0);
        this.isFullReplenishing.set(false);
        this.cycleStartedAt.set(Date.now());
      } else {
        this.replenishPct.set(pct);
      }
    }, TICK_MS);
  }

  private rollDropTable(dropTable: DropTable): void {
    for (const drop of dropTable.drops) {
      if (Math.random() < drop.chance) {
        const qty = drop.qty ?? 1;
        this.itemService.add(drop.item, qty);
        this.notificationService.item(drop.item.name, drop.item.icon, qty);
        this.questService.onItemGained(drop.item.id, qty);
      }
    }
  }

  private stopTimers(): void {
    if (this.cycleTimer)     { clearInterval(this.cycleTimer);     this.cycleTimer     = null; }
    if (this.replenishTimer) { clearInterval(this.replenishTimer); this.replenishTimer = null; }
  }
}
