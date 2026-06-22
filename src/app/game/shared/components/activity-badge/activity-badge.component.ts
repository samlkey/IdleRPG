import { Component, input } from '@angular/core';

@Component({
  selector: 'app-activity-badge',
  standalone: true,
  template: `
    <span class="activity-badge" [class.activity-badge--active]="type() === 'active'" [class.activity-badge--passive]="type() === 'passive'">
      {{ type() === 'active' ? 'Active' : 'Passive' }}
    </span>
  `,
  styleUrl: './activity-badge.component.scss',
})
export class ActivityBadgeComponent {
  readonly type = input.required<'active' | 'passive'>();
}
