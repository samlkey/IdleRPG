import {
  Component,
  computed,
  HostListener,
  inject,
  input,
  output,
  signal,
  Type,
} from '@angular/core';
import { DecimalPipe, NgComponentOutlet } from '@angular/common';
import { ActivityBadgeComponent } from '../activity-badge/activity-badge.component';
import { SkillData, XP_TABLE } from '../../../services/player.service';
import { LocationService } from '../../../services/location.service';

export interface TopBarMenuItem {
  id: string;
  label: string;
  pixelIcon: string;
  locked?: boolean;
  highlighted?: boolean;
  component?: Type<unknown> | null;
}

@Component({
  selector: 'app-skill-top-bar',
  imports: [DecimalPipe, ActivityBadgeComponent, NgComponentOutlet],
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

  readonly openMenuId = signal<string | null>(null);

  readonly openMenuItem = computed<TopBarMenuItem | null>(() => {
    const id = this.openMenuId();
    return this.menuItems().find((i) => i.id === id) ?? null;
  });

  readonly xpProgress = computed(() => {
    const skill = this.skillData();
    return skill.xpForLevel > 0 ? skill.xpIntoLevel / skill.xpForLevel : 1;
  });

  toggleMenu(item: TopBarMenuItem): void {
    if (item.locked) return;
    const next = this.openMenuId() === item.id ? null : item.id;
    this.openMenuId.set(next);
    if (next) this.menuItemClick.emit(item.id);
  }

  closeMenu(): void {
    this.openMenuId.set(null);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeMenu();
  }
}
