import { Component, computed, effect, inject, input, OnDestroy, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { PlayerService } from '../../../services/player.service';

export interface FishEntry {
  name: string;
  src: string;
  level: number;
  xp: number;
  /** Average seconds between catch attempts */
  duration: number;
  /** 0–1 probability of catching on each attempt */
  catchChance: number;
}

export interface FishingLocation {
  name: string;
  background: string;
  levelReq: number;
  fish: FishEntry[];
}

const CRIT_WINDOW_MS = 1500;

@Component({
  selector: 'app-fishing-location',
  imports: [DecimalPipe],
  templateUrl: './fishing-location.component.html',
  styleUrl: './fishing-location.component.scss',
})
export class FishingLocationComponent implements OnDestroy {
  location = input.required<FishingLocation>();

  readonly playerService = inject(PlayerService);

  readonly caughtFish    = signal<string | null>(null);
  readonly isCrit        = signal(false);
  /** 0–1, 1 = just opened, 0 = expired */
  readonly critRemaining = signal(1);

  readonly activeFish = computed(() => {
    const active = this.playerService.mainActivity();
    if (!active) return null;
    return this.location().fish.find(f => f.name === active)?.name ?? null;
  });

  readonly RING_C      = 2 * Math.PI * 22;
  readonly CRIT_WINDOW_S = CRIT_WINDOW_MS / 1000;

  get critDashOffset(): number {
    return this.RING_C * (1 - this.critRemaining());
  }

  get critSecondsLeft(): number {
    return this.critRemaining() * this.CRIT_WINDOW_S;
  }

  get isLocationDisabled(): boolean {
    return this.playerService.skill('fishing').level < this.location().levelReq;
  }

  isFishDisabled(fish: FishEntry): boolean {
    return this.playerService.skill('fishing').level < fish.level;
  }

  private castTimer:      ReturnType<typeof setTimeout>  | null = null;
  private flashTimer:     ReturnType<typeof setTimeout>  | null = null;
  private critOpenTimer:  ReturnType<typeof setTimeout>  | null = null;
  private critCloseTimer: ReturnType<typeof setTimeout>  | null = null;
  private critTickTimer:  ReturnType<typeof setInterval> | null = null;
  private critCloseAt:    number | null = null;
  private critWindowDuration = 0;

  constructor() {
    effect(() => {
      const fish = this.activeFish();
      if (fish) {
        const entry = this.location().fish.find(f => f.name === fish)!;
        this.scheduleCast(entry);
      } else {
        this.stopAll();
        this.caughtFish.set(null);
        this.isCrit.set(false);
      }
    }, { allowSignalWrites: true });
  }

  onRowClick(fish: FishEntry): void {
    if (this.activeFish() === fish.name && this.isCrit()) {
      // Crit click — guaranteed catch, restart cast
      this.clearCrit();
      this.playerService.addXp('fishing', fish.xp);
      this.showCaughtFlash(fish.name);
      this.scheduleCast(fish);
    } else {
      const current = this.playerService.mainActivity();
      this.playerService.setMainActivity(current === fish.name ? null : fish.name);
    }
  }

  // ── Cast cycle ───────────────────────────────────────────────────────────────

  private scheduleCast(entry: FishEntry): void {
    this.stopCastTimers();

    const jitter  = 0.7 + Math.random() * 0.6;
    const waitMs  = entry.duration * 1000 * jitter;

    this.scheduleCritWindow(waitMs);

    this.castTimer = setTimeout(() => {
      if (this.playerService.mainActivity() !== entry.name) return;
      this.clearCrit();

      if (Math.random() < entry.catchChance) {
        this.playerService.addXp('fishing', entry.xp);
        this.showCaughtFlash(entry.name);
      }

      this.scheduleCast(entry);
    }, waitMs);
  }

  private showCaughtFlash(name: string): void {
    if (this.flashTimer) clearTimeout(this.flashTimer);
    this.caughtFish.set(name);
    this.flashTimer = setTimeout(() => this.caughtFish.set(null), 1200);
  }

  // ── Crit window ──────────────────────────────────────────────────────────────

  private scheduleCritWindow(castMs: number): void {
    if (Math.random() > this.playerService.player().critChance) return;

    const openAt  = castMs * (0.2 + Math.random() * 0.5);
    const closeAt = Math.min(openAt + CRIT_WINDOW_MS, castMs - 200);
    if (closeAt <= openAt) return;

    const windowMs = closeAt - openAt;
    this.critWindowDuration = windowMs;

    this.critOpenTimer = setTimeout(() => {
      this.critCloseAt = Date.now() + windowMs;
      this.critRemaining.set(1);
      this.isCrit.set(true);

      // Tick countdown
      this.critTickTimer = setInterval(() => {
        const remaining = Math.max(0, this.critCloseAt! - Date.now()) / this.critWindowDuration;
        this.critRemaining.set(remaining);
      }, 50);

      this.critCloseTimer = setTimeout(() => this.clearCrit(), windowMs);
    }, openAt);
  }

  private clearCrit(): void {
    if (this.critOpenTimer)  { clearTimeout(this.critOpenTimer);   this.critOpenTimer  = null; }
    if (this.critCloseTimer) { clearTimeout(this.critCloseTimer);  this.critCloseTimer = null; }
    if (this.critTickTimer)  { clearInterval(this.critTickTimer);  this.critTickTimer  = null; }
    this.critCloseAt = null;
    this.isCrit.set(false);
    this.critRemaining.set(1);
  }

  // ── Cleanup ──────────────────────────────────────────────────────────────────

  private stopCastTimers(): void {
    if (this.castTimer) { clearTimeout(this.castTimer); this.castTimer = null; }
    this.clearCrit();
  }

  private stopAll(): void {
    this.stopCastTimers();
    if (this.flashTimer) { clearTimeout(this.flashTimer); this.flashTimer = null; }
  }

  ngOnDestroy(): void {
    this.stopAll();
  }
}
