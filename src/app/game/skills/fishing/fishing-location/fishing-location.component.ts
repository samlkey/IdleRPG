import { Component, computed, effect, inject, input, OnDestroy, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { PlayerService } from '../../../services/player.service';
import { ActivityService } from '../../../services/activity.service';

export interface FishEntry {
  name: string;
  src: string;
  level: number;
  xp: number;
  duration: number;
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

  private readonly playerService  = inject(PlayerService);
  private readonly activityService = inject(ActivityService);

  readonly caughtFish    = signal<string | null>(null);
  readonly isCrit        = signal(false);
  readonly critRemaining = signal(1);

  readonly activeFish = computed(() => {
    const current = this.activityService.current();
    if (!current) return null;
    return this.location().fish.find(f => f.name === current.name)?.name ?? null;
  });

  readonly RING_C       = 2 * Math.PI * 22;
  readonly CRIT_WINDOW_S = CRIT_WINDOW_MS / 1000;

  get critDashOffset(): number { return this.RING_C * (1 - this.critRemaining()); }
  get critSecondsLeft(): number { return this.critRemaining() * this.CRIT_WINDOW_S; }

  get isLocationDisabled(): boolean {
    return this.playerService.skill('fishing').level < this.location().levelReq;
  }

  isFishDisabled(fish: FishEntry): boolean {
    return this.playerService.skill('fishing').level < fish.level;
  }

  private flashTimer:     ReturnType<typeof setTimeout>  | null = null;
  private critOpenTimer:  ReturnType<typeof setTimeout>  | null = null;
  private critCloseTimer: ReturnType<typeof setTimeout>  | null = null;
  private critTickTimer:  ReturnType<typeof setInterval> | null = null;
  private critCloseAt:    number | null = null;
  private critWindowDuration = 0;

  constructor() {
    // Start/stop crit scheduling when active fish changes
    effect(() => {
      const fish = this.activeFish();
      if (fish) {
        const entry = this.location().fish.find(f => f.name === fish)!;
        const start = this.activityService.cycleStartedAt();
        if (start !== null && Date.now() - start < 500) {
          this.scheduleCritWindow(entry.duration * 1000);
        }
      } else {
        this.clearCrit();
        this.caughtFish.set(null);
      }
    }, { allowSignalWrites: true });

    // React to each cycle completing — show caught flash and schedule next crit
    effect(() => {
      const result = this.activityService.lastCycleResult();
      if (!result) return;
      const fish = this.activeFish();
      if (!fish) return;
      const entry = this.location().fish.find(f => f.name === fish)!;
      this.clearCrit();
      if (result.caught) this.showCaughtFlash(fish);
      this.scheduleCritWindow(entry.duration * 1000);
    }, { allowSignalWrites: true });
  }

  onRowClick(fish: FishEntry): void {
    if (this.activeFish() === fish.name && this.isCrit()) {
      // Crit click — guaranteed catch
      this.activityService.completeCycleNow();
      this.showCaughtFlash(fish.name);
      this.clearCrit();
    } else if (this.activeFish() === fish.name) {
      this.activityService.stop();
    } else {
      const fishItem = { id: fish.name.toLowerCase().replace(/\s+/g, '-'), name: fish.name, description: '', icon: fish.src, type: 'resource' as const, subType: 'fish' };
      this.activityService.start({
        name: fish.name, xp: fish.xp, duration: fish.duration,
        skillId: 'fishing', skillPanel: 'fishing',
        catchChance: fish.catchChance,
        dropTable: { id: fishItem.id, name: fish.name, drops: [{ item: fishItem, chance: 1 }] },
      });
    }
  }

  private showCaughtFlash(name: string): void {
    if (this.flashTimer) clearTimeout(this.flashTimer);
    this.caughtFish.set(name);
    this.flashTimer = setTimeout(() => this.caughtFish.set(null), 1200);
  }

  private scheduleCritWindow(durationMs: number): void {
    if (Math.random() > this.playerService.player().critChance) return;
    const openAt  = durationMs * (0.2 + Math.random() * 0.5);
    const closeAt = Math.min(openAt + CRIT_WINDOW_MS, durationMs - 200);
    if (closeAt <= openAt) return;

    const windowMs = closeAt - openAt;
    this.critWindowDuration = windowMs;

    this.critOpenTimer = setTimeout(() => {
      this.critCloseAt = Date.now() + windowMs;
      this.critRemaining.set(1);
      this.isCrit.set(true);

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

  ngOnDestroy(): void {
    this.clearCrit();
    if (this.flashTimer) { clearTimeout(this.flashTimer); this.flashTimer = null; }
  }
}
