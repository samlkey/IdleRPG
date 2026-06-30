import { Component, computed, effect, inject, input, output, signal, OnDestroy } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { PlayerService } from '../../../services/player.service';
import { ActivityService } from '../../../services/activity.service';
import { DropTable, GameItem, ItemService } from '../../../services/item.service';
import { NotificationService } from '../../../services/notification.service';

export interface SkillRequirement {
  icon: string;
  level: number;
  skill?: string;
}

const CRIT_WINDOW_MS = 1500;

@Component({
  selector: 'app-activity',
  imports: [DecimalPipe],
  templateUrl: './activity.component.html',
  styleUrl: './activity.component.scss',
})
export class ActivityComponent implements OnDestroy {
  action        = input<string>('');
  target        = input<string>('');
  xp            = input<number>(0);
  duration      = input<number>(0);
  image         = input<string>('');
  active        = input<boolean>(false);
  requirements  = input<SkillRequirement[]>([]);
  disabled      = input<boolean>(false);
  type          = input<'normal' | 'depletion' | 'consumption' | 'bonus' | 'smelting'>('normal');
  inputItems    = input<{ item: GameItem; qty: number }[]>([]);
  maxCharges    = input<number>(6);
  replenishTime = input<number>(60);
  caughtDamage  = input<number>(2);
  bonusSteps    = input<number>(5);
  bonusXp       = input<number>(0);
  bonusChance   = input<number>(0.5);
  bonusDamage   = input<number>(2);
  dropTable     = input<DropTable | null>(null);
  inputItem     = input<GameItem | null>(null);
  selected      = output<void>();

  readonly progressPct   = signal(0);
  readonly isCrit        = signal(false);
  readonly critRemaining = signal(1);
  readonly isCaught      = signal(false);

  readonly fillClipPath = computed(() => {
    const top = Math.max(0, 100 - this.progressPct());
    return `inset(${top}% 0 0 0)`;
  });

  readonly chargeSegments = computed(() =>
    Array.from({ length: this.maxCharges() }, (_, i) => i)
  );

  readonly bonusSegments = computed(() =>
    Array.from({ length: this.bonusSteps() }, (_, i) => i)
  );

  readonly displayBonusStep = computed(() =>
    this.active() ? this.activityService.bonusStep() : 0
  );

  // When active read live values from service; otherwise show persisted or max charges
  readonly displayCharges = computed(() => {
    if (this.active()) return this.activityService.charges();
    return this.activityService.savedCharges.get(this.target()) ?? this.maxCharges();
  });
  readonly displayReplenishPct = computed(() =>
    this.active() ? this.activityService.replenishPct() : 0
  );
  readonly isFullReplenishing = computed(() =>
    this.active() && this.activityService.isFullReplenishing()
  );
  readonly inputItemCount = computed(() => {
    const it = this.inputItem();
    if (!it || this.type() !== 'consumption') return null;
    return this.itemService.count(it.id);
  });

  readonly setsAvailable = computed(() => {
    const reqs = this.inputItems();
    if (!reqs.length || this.type() !== 'smelting') return null;
    return Math.min(...reqs.map(r => Math.floor(this.itemService.count(r.item.id) / r.qty)));
  });

  ingredientCount(itemId: string): number {
    return this.itemService.count(itemId);
  }

  private readonly playerService       = inject(PlayerService);
  private readonly activityService     = inject(ActivityService);
  private readonly itemService         = inject(ItemService);
  private readonly notificationService = inject(NotificationService);

  private displayTimer:   ReturnType<typeof setInterval> | null = null;
  private critOpenTimer:  ReturnType<typeof setTimeout>  | null = null;
  private critCloseTimer: ReturnType<typeof setTimeout>  | null = null;
  private critCloseAt:    number | null = null;
  private critWindowDuration = 0;
  private wasDelayed = false;

  readonly RING_C       = 2 * Math.PI * 22;
  readonly CRIT_WINDOW_S = CRIT_WINDOW_MS / 1000;

  get critDashOffset(): number { return this.RING_C * (1 - this.critRemaining()); }
  get critSecondsLeft(): number { return this.critRemaining() * this.CRIT_WINDOW_S; }

  constructor() {
    effect(() => {
      if (this.active()) {
        this.startDisplayTimer();
      } else {
        this.stopDisplay();
        this.progressPct.set(0);
        this.isCrit.set(false);
        this.isCaught.set(false);
      }
    });

    // Re-schedule crit after each successful cycle (not during delay)
    effect(() => {
      const result = this.activityService.lastCycleResult();
      if (result && this.active()) {
        this.clearCrit();
        if (!this.activityService.isDelayed()) {
          this.scheduleCritWindow();
        }


      }
    }, { allowSignalWrites: true });

    // Schedule crit when delay phase ends
    effect(() => {
      const delayed = this.activityService.isDelayed();
      if (this.wasDelayed && !delayed && this.active()) {
        this.scheduleCritWindow();
      }
      this.wasDelayed = delayed;
    }, { allowSignalWrites: true });
  }

  get isDepleted(): boolean {
    return this.active() && this.type() === 'depletion' && this.activityService.isFullReplenishing();
  }

  onClick(): void {
    if (this.isDepleted) return;
    if (this.activityService.isDelayed()) return;
    if (!this.active() && this.type() === 'consumption' && (this.inputItemCount() ?? 0) === 0) {
      const it = this.inputItem();
      if (it) this.notificationService.show({ type: 'warning', message: `No ${it.name}s`, detail: 'Nothing to burn' });
      return;
    }
    if (!this.active() && this.type() === 'smelting' && (this.setsAvailable() ?? 0) === 0) {
      this.notificationService.show({ type: 'warning', message: 'Not enough materials', detail: 'Cannot smelt' });
      return;
    }
    if (this.active() && this.isCrit()) {
      this.activityService.completeCycleNow();
      this.clearCrit();
    } else {
      this.selected.emit();
    }
  }

  // ── Display timer ────────────────────────────────────────────────────────────

  private startDisplayTimer(): void {
    this.stopDisplay();

    // Only schedule a crit if this is a fresh cycle (not resuming mid-cycle)
    const start = this.activityService.cycleStartedAt();
    if (start !== null && Date.now() - start < 500) {
      this.scheduleCritWindow();
    }

    this.displayTimer = setInterval(() => {
      const cycleStart = this.activityService.cycleStartedAt();
      if (cycleStart === null) return;

      const elapsed = Date.now() - cycleStart;

      if (this.activityService.isFullReplenishing()) {
        this.isCaught.set(false);
        this.progressPct.set(0);
      } else if (this.activityService.isDelayed()) {
        const cfg = this.activityService.current();
        const delayMs = ((cfg?.delayDuration ?? cfg?.duration) ?? this.duration()) * 1000;
        this.isCaught.set(true);
        this.progressPct.set(Math.max(0, 100 - (elapsed / delayMs) * 100));
      } else {
        this.isCaught.set(false);
        this.progressPct.set(Math.min((elapsed / (this.duration() * 1000)) * 100, 100));
      }

      if (this.isCrit() && this.critCloseAt !== null) {
        const remaining = Math.max(0, this.critCloseAt - Date.now()) / this.critWindowDuration;
        this.critRemaining.set(remaining);
      }
    }, 50);
  }

  private stopDisplay(): void {
    if (this.displayTimer) { clearInterval(this.displayTimer); this.displayTimer = null; }
    this.clearCrit();
  }

  // ── Crit window ──────────────────────────────────────────────────────────────

  private scheduleCritWindow(): void {
    if (Math.random() > this.playerService.player().critChance) return;
    const durationMs = this.duration() * 1000;
    const openAt  = durationMs * (0.2 + Math.random() * 0.5);
    const closeAt = Math.min(openAt + CRIT_WINDOW_MS, durationMs - 200);
    if (closeAt <= openAt) return;

    const windowMs = closeAt - openAt;
    this.critWindowDuration = windowMs;

    this.critOpenTimer = setTimeout(() => {
      this.critCloseAt = Date.now() + windowMs;
      this.critRemaining.set(1);
      this.isCrit.set(true);
      this.critCloseTimer = setTimeout(() => this.clearCrit(), windowMs);
    }, openAt);
  }

  private clearCrit(): void {
    if (this.critOpenTimer)  { clearTimeout(this.critOpenTimer);  this.critOpenTimer  = null; }
    if (this.critCloseTimer) { clearTimeout(this.critCloseTimer); this.critCloseTimer = null; }
    this.critCloseAt = null;
    this.isCrit.set(false);
    this.critRemaining.set(1);
  }

  ngOnDestroy(): void {
    this.stopDisplay();
  }
}
