import { Injectable, inject, signal } from '@angular/core';
import { PlayerService, SkillId } from './player.service';
import { NotificationService } from './notification.service';

export interface ActivityConfig {
  name: string;
  xp: number;
  /** Seconds per cycle */
  duration: number;
  skillId: SkillId;
  skillPanel: SkillId;
  /** 0–1 success probability per cycle. Omit for guaranteed XP. */
  catchChance?: number;
  type?: 'normal' | 'depletion' | 'delay';
  /** (delay) Seconds the caught animation lasts. Defaults to duration. */
  delayDuration?: number;
  /** (delay) HP lost when caught. Defaults to 2. */
  caughtDamage?: number;
  /** Gold awarded on each successful cycle */
  goldReward?: number;
  /** (depletion) Total charges */
  maxCharges?: number;
  /** (depletion) Seconds per charge to replenish */
  replenishTime?: number;
}

const TICK_MS = 100;

@Injectable({ providedIn: 'root' })
export class ActivityService {
  private readonly playerService       = inject(PlayerService);
  private readonly notificationService = inject(NotificationService);

  readonly current         = signal<ActivityConfig | null>(null);
  readonly cycleStartedAt  = signal<number | null>(null);
  /** True while the player is in the caught/delay penalty phase */
  readonly isDelayed       = signal(false);
  readonly charges         = signal<number>(0);
  readonly replenishPct    = signal<number>(0);
  readonly lastCycleResult = signal<{ timestamp: number; caught: boolean } | null>(null);

  private cycleTimer:     ReturnType<typeof setInterval> | null = null;
  private replenishTimer: ReturnType<typeof setInterval> | null = null;

  // ── Public API ───────────────────────────────────────────────────────────────

  start(config: ActivityConfig): void {
    this.stopTimers();
    this.current.set(config);
    this.cycleStartedAt.set(Date.now());
    this.isDelayed.set(false);
    if (config.type === 'depletion') {
      this.charges.set(config.maxCharges ?? 6);
      this.replenishPct.set(0);
    }
    this.playerService.setMainActivity(config.name, config.skillPanel);
    this.runCycleTimer();
  }

  stop(): void {
    this.stopTimers();
    const had = this.current() !== null;
    this.current.set(null);
    this.cycleStartedAt.set(null);
    this.isDelayed.set(false);
    if (had) this.playerService.setMainActivity(null);
  }

  completeCycleNow(): void {
    const cfg = this.current();
    if (!cfg) return;
    this.playerService.addXp(cfg.skillId, cfg.xp);
    this.notificationService.xp(cfg.xp, cfg.skillPanel, `assets/icons/${cfg.skillPanel}.png`);
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

      const success = cfg.catchChance == null || Math.random() < cfg.catchChance;

      if (!success && cfg.type === 'delay') {
        // Player caught — deal damage and enter delay phase
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

      if (success) {
        this.playerService.addXp(cfg.skillId, cfg.xp);
        this.notificationService.xp(cfg.xp, cfg.skillPanel, `assets/icons/${cfg.skillPanel}.png`);
        if (cfg.goldReward) {
          this.playerService.addGold(cfg.goldReward);
          this.notificationService.gold(cfg.goldReward);
        }
      }
      this.lastCycleResult.set({ timestamp: Date.now(), caught: success });

      if (cfg.type === 'depletion') {
        const next = this.charges() - 1;
        this.charges.set(next);
        this.startReplenishTimer(cfg);
        if (next <= 0) { this.stop(); return; }
      }

      this.cycleStartedAt.set(Date.now());
    }, TICK_MS);
  }

  private startReplenishTimer(cfg: ActivityConfig): void {
    if (this.replenishTimer) return;
    const totalMs = (cfg.replenishTime ?? 60) * 1000;
    this.replenishTimer = setInterval(() => {
      const pct = this.replenishPct() + (TICK_MS / totalMs) * 100;
      if (pct >= 100) {
        const next = Math.min(this.charges() + 1, cfg.maxCharges ?? 6);
        this.charges.set(next);
        this.replenishPct.set(0);
        if (next >= (cfg.maxCharges ?? 6)) {
          clearInterval(this.replenishTimer!);
          this.replenishTimer = null;
        }
      } else {
        this.replenishPct.set(pct);
      }
    }, TICK_MS);
  }

  private stopTimers(): void {
    if (this.cycleTimer)     { clearInterval(this.cycleTimer);     this.cycleTimer     = null; }
    if (this.replenishTimer) { clearInterval(this.replenishTimer); this.replenishTimer = null; }
  }
}
