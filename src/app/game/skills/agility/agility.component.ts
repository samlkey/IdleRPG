import { Component, computed, inject, input, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { ActivityComponent } from '../../shared/components/activity/activity.component';
import { ActivityBadgeComponent } from '../../shared/components/activity-badge/activity-badge.component';
import { PlayerService } from '../../services/player.service';
import { ActivityService } from '../../services/activity.service';
import { LocationService } from '../../services/location.service';

@Component({
  selector: 'app-agility',
  imports: [DecimalPipe, ModalComponent, ActivityComponent, ActivityBadgeComponent],
  templateUrl: './agility.component.html',
  styleUrl: './agility.component.scss',
})
export class AgilityComponent {
  pixelIcon = input<string>('');
  helpOpen  = signal(false);

  readonly playerService   = inject(PlayerService);
  readonly activityService = inject(ActivityService);
  readonly locationService = inject(LocationService);

  get skillData() { return this.playerService.skill('agility'); }

  public readonly allCourses = [
    { name: 'Tutorial Course', src: 'assets/icons/agility.png', level: 1, xp: 30, time: 8, bonusSteps: 4, bonusXp: 200, bonusChance: 0.6, bonusDamage: 3, disabled: false },
  ];

  readonly courses = computed(() => {
    const available = this.locationService.current().activities.agilityCourse ?? [];
    return this.allCourses.filter(c => available.includes(c.name));
  });

  selectCourse(course: typeof this.allCourses[0]): void {
    if (this.activityService.current()?.name === course.name) {
      this.activityService.stop();
      return;
    }
    this.activityService.start({
      name: course.name,
      xp: course.xp,
      duration: course.time,
      skillId: 'agility',
      skillPanel: 'agility',
      type: 'bonus',
      bonusSteps: course.bonusSteps,
      bonusXp: course.bonusXp,
      bonusChance: course.bonusChance,
      bonusDamage: course.bonusDamage,
    });
  }
}
