import { Component, inject, input } from '@angular/core';
import { ActivityComponent, SkillRequirement } from '../../../shared/components/activity/activity.component';
import { PlayerService } from '../../../services/player.service';
import { ActivityService } from '../../../services/activity.service';

export interface ThievingTarget {
  name: string;
  src: string;
  level: number;
  xp: number;
  duration: number;
  successChance: number;
  /** HP lost when caught. Defaults to 2. */
  caughtDamage?: number;
  /** Gold awarded on each successful steal. */
  goldReward?: number;
}

export interface ThievingLocation {
  name: string;
  background: string;
  levelReq: number;
  targets: ThievingTarget[];
}

@Component({
  selector: 'app-thieving-location',
  imports: [ActivityComponent],
  templateUrl: './thieving-location.component.html',
  styleUrl: './thieving-location.component.scss',
})
export class ThievingLocationComponent {
  location = input.required<ThievingLocation>();

  private readonly playerService   = inject(PlayerService);
  private readonly activityService = inject(ActivityService);

  get isLocationDisabled(): boolean {
    return this.playerService.skill('thieving').level < this.location().levelReq;
  }

  isActive(target: ThievingTarget): boolean {
    return this.activityService.current()?.name === target.name;
  }

  isTargetDisabled(target: ThievingTarget): boolean {
    return this.isLocationDisabled || this.playerService.skill('thieving').level < target.level;
  }

  requirements(target: ThievingTarget): SkillRequirement[] {
    return target.level > 1
      ? [{ icon: 'assets/icons/thieving.png', level: target.level, skill: 'Thieving' }]
      : [];
  }

  selectTarget(target: ThievingTarget): void {
    if (this.isActive(target)) {
      this.activityService.stop();
    } else {
      this.activityService.start({
        name: target.name, xp: target.xp, duration: target.duration,
        skillId: 'thieving', skillPanel: 'thieving',
        type: 'delay',
        catchChance: target.successChance,
        delayDuration: Math.max(2, target.duration * 0.5),
        caughtDamage: target.caughtDamage ?? 2,
        goldReward: target.goldReward,
      });
    }
  }
}
