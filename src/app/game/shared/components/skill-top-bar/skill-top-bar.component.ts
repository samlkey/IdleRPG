import { Component, computed, inject, input, output } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ActivityBadgeComponent } from '../activity-badge/activity-badge.component';
import { SkillData, XP_TABLE } from '../../../services/player.service';
import { LocationService } from '../../../services/location.service';

export interface TopBarMenuItem {
  id: string;
  label: string;
  pixelIcon: string;
  active?: boolean;
  locked?: boolean;
  highlighted?: boolean;
}

@Component({
  selector: 'app-skill-top-bar',
  imports: [DecimalPipe, ActivityBadgeComponent],
  templateUrl: './skill-top-bar.component.html',
  styleUrl: './skill-top-bar.component.scss',
})
export class SkillTopBarComponent {
  readonly locationService = inject(LocationService);

  title = input.required<string>();
  subtitle = input<string>('');
  pixelIcon = input.required<string>();
  skillData = input.required<SkillData>();
  badgeType = input<'active' | 'passive'>('active');
  showHelp = input<boolean>(true);
  menuItems = input<TopBarMenuItem[]>([]);
  gold = input<number>(0);

  helpClick = output<void>();
  locationClick = output<void>();
  menuItemClick = output<string>();

  readonly XP_TABLE = XP_TABLE;
  readonly XP_CIRCLE_CIRCUMFERENCE = 2 * Math.PI * 18;

  readonly xpProgress = computed(() => {
    const skill = this.skillData();
    return skill.xpForLevel > 0 ? skill.xpIntoLevel / skill.xpForLevel : 1;
  });
}
