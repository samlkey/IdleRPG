import { Component, effect, inject, input, output, signal, OnDestroy } from '@angular/core';
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
/** Default chance of a crit occurring per cycle (0–1) */
const DEFAULT_CRIT_CHANCE = 0.4;

@Component({
  selector: 'app-activity',
  imports: [DecimalPipe],
  templateUrl: './activity.component.html',
  styleUrl: './activity.component.scss',
})
export class ActivityComponent implements OnDestroy {
  /** e.g. "Cut" */
  action       = input<string>('');
  /** e.g. "Normal Tree" */
  target       = input<string>('');
  /** XP rewarded per completed cycle */
  xp           = input<number>(0);
  /** Seconds per cycle */
  duration     = input<number>(0);
  /** Path to the activity image */
  image        = input<string>('');
  /** Skill to award XP to on each completion */
  skillId      = input<SkillId | null>(null);
  /** Whether this activity is currently active */
  active       = input<boolean>(false);
  /** Skill level requirements */
  requirements = input<SkillRequirement[]>([]);
  /** Probability of a crit spawning each cycle (0–1, default 0.4) */
  critChance   = input<number>(DEFAULT_CRIT_CHANCE);
  /** When true the card is greyed out and non-interactive */
  disabled     = input<boolean>(false);
  /** Emitted when the card is clicked (not emitted when disabled) */
  selected     = output<void>();

  /** 0–100 progress for the current cycle */
  readonly progressPct = signal(0);
  /** True while the crit window is open */
  readonly isCrit = signal(false);
  /** Remaining crit time 0–1 (1 = just opened, 0 = expired) */
  readonly critRemaining = signal(1);

  private readonly playerService = inject(PlayerService);
  private timer: ReturnType<typeof setInterval> | null = null;
  private critOpenTimer:  ReturnType<typeof setTimeout> | null = null;
  private critCloseTimer: ReturnType<typeof setTimeout> | null = null;
  private startTime: number | null = null;
  private critCloseAt: number | null = null;
  private critWindowDuration = 0;

  /** SVG arc dash-offset for the crit countdown ring (circumference = 2π×22 ≈ 138.2) */
  readonly RING_C = 2 * Math.PI * 22;
  readonly CRIT_WINDOW_S = CRIT_WINDOW_MS / 1000;

  get critDashOffset(): number {
    return this.RING_C * (1 - this.critRemaining());
  }

  get critSecondsLeft(): number {
    return this.critRemaining() * this.CRIT_WINDOW_S;
  }

  constructor() {
    effect(() => {
      if (this.active()) {
        this.startCycle();
      } else {
        this.stopAll();
        this.progressPct.set(0);
        this.isCrit.set(false);
      }
    });
  }

  onClick(): void {
    if (this.active() && this.isCrit()) {
      // Crit click — instant complete
      this.completeCycle();
    } else {
      // Normal click — toggle active state via parent
      this.selected.emit();
    }
  }

  // ── Cycle management ────────────────────────────────────────────────────────

  private startCycle(): void {
    this.stopAll();
    this.startTime = Date.now();
    this.isCrit.set(false);
    this.critRemaining.set(1);
    this.critCloseAt = null;
    this.scheduleCritWindow();

    this.timer = setInterval(() => {
      const now = Date.now();
      const elapsed = now - this.startTime!;
      const durationMs = this.duration() * 1000;
      const pct = Math.min((elapsed / durationMs) * 100, 100);
      this.progressPct.set(pct);

      // Update crit countdown while window is open
      if (this.isCrit() && this.critCloseAt !== null) {
        const remaining = Math.max(0, this.critCloseAt - now) / this.critWindowDuration;
        this.critRemaining.set(remaining);
      }

      if (pct >= 100) {
        this.completeCycle();
      }
    }, 50);
  }

  private completeCycle(): void {
    const id = this.skillId();
    if (id) this.playerService.addXp(id, this.xp());
    // Reset and immediately begin the next cycle
    this.startCycle();
  }

  private scheduleCritWindow(): void {
    if (Math.random() > this.critChance()) return;

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

  private stopAll(): void {
    if (this.timer)          { clearInterval(this.timer);         this.timer = null; }
    if (this.critOpenTimer)  { clearTimeout(this.critOpenTimer);  this.critOpenTimer = null; }
    if (this.critCloseTimer) { clearTimeout(this.critCloseTimer); this.critCloseTimer = null; }
    this.startTime = null;
    this.critCloseAt = null;
  }

  ngOnDestroy(): void {
    this.stopAll();
  }
}
