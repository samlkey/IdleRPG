import { Component, computed, input, output } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ActivityBadgeComponent } from '../activity-badge/activity-badge.component';
import { SkillData, XP_TABLE } from '../../../services/player.service';

@Component({
  selector: 'app-skill-top-bar',
  imports: [DecimalPipe, ActivityBadgeComponent],
  templateUrl: './skill-top-bar.component.html',
  styleUrl: './skill-top-bar.component.scss',
})
export class SkillTopBarComponent {
  title = input.required<string>();
  subtitle = input<string>('');
  pixelIcon = input.required<string>();
  skillData = input.required<SkillData>();
  badgeType = input<'active' | 'passive'>('active');
  showHelp = input<boolean>(true);

  helpClick = output<void>();

  readonly XP_TABLE = XP_TABLE;
  readonly XP_CIRCLE_CIRCUMFERENCE = 2 * Math.PI * 18;

  readonly xpProgress = computed(() => {
    const skill = this.skillData();
    return skill.xpForLevel > 0 ? skill.xpIntoLevel / skill.xpForLevel : 1;
  });
}
