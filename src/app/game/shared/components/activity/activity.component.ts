import { Component, computed, effect, inject, input, output, signal, OnDestroy } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { PlayerService, SkillId } from '../../../services/player.service';

export interface SkillRequirement {
  /** Path to the skill's pixel icon */
  icon: string;
  /** Level required */
  level: number;
  /** Display name e.g. "Woodcutting" — shown as tooltip */
  skill?: string;
}

/** Duration the crit window stays open (ms) */
const CRIT_WINDOW_MS = 1500;

@Component({
  selector: 'app-activity',
  imports: [DecimalPipe],
  templateUrl: './activity.component.html',
  styleUrl: './activity.component.scss',
})
export class ActivityComponent implements OnDestroy {
  /** e.g. "Cut" */
  action          = input<string>('');
  /** e.g. "Normal Tree" */
  target          = input<string>('');
  /** XP rewarded per completed cycle */
  xp              = input<number>(0);
  /** Seconds per cycle */
  duration        = input<number>(0);
  /** Path to the activity image */
  image           = input<string>('');
  /** Skill to award XP to on each completion */
  skillId         = input<SkillId | null>(null);
  /** Whether this activity is currently active */
  active          = input<boolean>(false);
  /** Skill level requirements */
  requirements    = input<SkillRequirement[]>([]);
  /** When true the card is greyed out and non-interactive */
  disabled        = input<boolean>(false);
  /** 'normal' cycles forever; 'depletion' consumes charges that replenish over time */
  type            = input<'normal' | 'depletion'>('normal');
  /** (depletion only) Total number of charges available */
  maxCharges      = input<number>(6);
  /** (depletion only) Seconds for one charge to replenish */
  replenishTime   = input<number>(60);
  /** Emitted when the card is clicked (not emitted when disabled) */
  selected        = output<void>();

  /** 0–100 progress for the current cycle */
  readonly progressPct    = signal(0);
  /** True while the crit window is open */
  readonly isCrit         = signal(false);
  /** Remaining crit time 0–1 (1 = just opened, 0 = expired) */
  readonly critRemaining  = signal(1);
  /** (depletion) charges currently available */
  readonly charges        = signal(6);
  /** (depletion) 0–100 replenish progress toward the next charge */
  readonly replenishPct   = signal(0);

  /** Array of indices used to render charge segments */
  readonly chargeSegments = computed(() => Array.from({ length: this.maxCharges() }, (_, i) => i));

  private readonly playerService = inject(PlayerService);
  private timer:            ReturnType<typeof setInterval> | null = null;
  private replenishTimer:   ReturnType<typeof setInterval> | null = null;
  private critOpenTimer:    ReturnType<typeof setTimeout>  | null = null;
  private critCloseTimer:   ReturnType<typeof setTimeout>  | null = null;
  private startTime:        number | null = null;
  private critCloseAt:      number | null = null;
  private critWindowDuration = 0;

  /** SVG arc dash-offset for the crit countdown ring (circumference = 2π×22 ≈ 138.2) */
  readonly RING_C      = 2 * Math.PI * 22;
  readonly CRIT_WINDOW_S = CRIT_WINDOW_MS / 1000;

  get critDashOffset(): number {
    return this.RING_C * (1 - this.critRemaining());
  }

  get critSecondsLeft(): number {
    return this.critRemaining() * this.CRIT_WINDOW_S;
  }

  constructor() {
    // Sync initial charges when maxCharges input resolves
    effect(() => { this.charges.set(this.maxCharges()); });

    effect(() => {
      if (this.active()) {
        this.startCycle();
      } else {
        this.stopCycle();
        this.progressPct.set(0);
        this.isCrit.set(false);
      }
    });
  }

  get isDepleted(): boolean {
    return this.type() === 'depletion' && this.charges() <= 0;
  }

  onClick(): void {
    if (this.isDepleted) return;
    if (this.active() && this.isCrit()) {
      this.completeCycle();
    } else {
      this.selected.emit();
    }
  }

  // ── Cycle management ────────────────────────────────────────────────────────

  private startCycle(): void {
    this.stopCycle();
    this.startTime = Date.now();
    this.isCrit.set(false);
    this.critRemaining.set(1);
    this.critCloseAt = null;
    this.scheduleCritWindow();

    this.timer = setInterval(() => {
      const now     = Date.now();
      const elapsed = now - this.startTime!;
      const durationMs = this.duration() * 1000;
      const pct     = Math.min((elapsed / durationMs) * 100, 100);
      this.progressPct.set(pct);

      if (this.isCrit() && this.critCloseAt !== null) {
        const remaining = Math.max(0, this.critCloseAt - now) / this.critWindowDuration;
        this.critRemaining.set(remaining);
      }

      if (pct >= 100) this.completeCycle();
    }, 50);
  }

  private completeCycle(): void {
    const id = this.skillId();
    if (id) this.playerService.addXp(id, this.xp());

    if (this.type() === 'depletion') {
      const next = this.charges() - 1;
      this.charges.set(next);
      this.startReplenishTimer();
      if (next <= 0) {
        // Deplete — stop activity via parent
        this.stopCycle();
        this.progressPct.set(0);
        this.isCrit.set(false);
        this.selected.emit(); // toggles active off in parent
        return;
      }
    }

    this.startCycle();
  }

  // ── Replenishment ────────────────────────────────────────────────────────────

  private startReplenishTimer(): void {
    if (this.replenishTimer) return; // already running
    const tickMs    = 100;
    const totalMs   = this.replenishTime() * 1000;

    this.replenishTimer = setInterval(() => {
      const pct = this.replenishPct() + (tickMs / totalMs) * 100;
      if (pct >= 100) {
        const next = Math.min(this.charges() + 1, this.maxCharges());
        this.charges.set(next);
        this.replenishPct.set(0);

        if (next >= this.maxCharges()) {
          clearInterval(this.replenishTimer!);
          this.replenishTimer = null;
        }
      } else {
        this.replenishPct.set(pct);
      }
    }, tickMs);
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
      this.critCloseTimer = setTimeout(() => {
        this.isCrit.set(false);
        this.critCloseAt = null;
      }, windowMs);
    }, openAt);
  }

  private stopCycle(): void {
    if (this.timer)          { clearInterval(this.timer);         this.timer = null; }
    if (this.critOpenTimer)  { clearTimeout(this.critOpenTimer);  this.critOpenTimer = null; }
    if (this.critCloseTimer) { clearTimeout(this.critCloseTimer); this.critCloseTimer = null; }
    this.startTime = null;
    this.critCloseAt = null;
  }

  ngOnDestroy(): void {
    this.stopCycle();
    if (this.replenishTimer) { clearInterval(this.replenishTimer); this.replenishTimer = null; }
  }
}
