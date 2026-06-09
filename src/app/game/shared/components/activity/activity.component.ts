import { Component, input, output } from '@angular/core';

export interface SkillRequirement {
  /** Path to the skill's pixel icon */
  icon: string;
  /** Level required */
  level: number;
  /** Display name e.g. "Woodcutting" — shown as tooltip */
  skill?: string;
}

@Component({
  selector: 'app-activity',
  imports: [],
  templateUrl: './activity.component.html',
  styleUrl: './activity.component.scss',
})
export class ActivityComponent {
  /** e.g. "Cut" */
  action      = input<string>('');
  /** e.g. "Normal Tree" */
  target      = input<string>('');
  /** XP rewarded per action */
  xp          = input<number>(0);
  /** Seconds per action */
  duration    = input<number>(0);
  /** Path to the activity image */
  image       = input<string>('');
  /** Current progress value */
  progress    = input<number>(0);
  /** Max progress value */
  maxProgress = input<number>(100);
  /** Skill level requirements — supports multiple skills */
  requirements = input<SkillRequirement[]>([]);
  /** When true the card is greyed out and non-interactive */
  disabled = input<boolean>(false);
  /** Emitted when the card is clicked (not emitted when disabled) */
  selected = output<void>();
}
