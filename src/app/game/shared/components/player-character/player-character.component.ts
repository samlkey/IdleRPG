import { Component, computed, inject } from '@angular/core';
import { ActivityService } from '../../../services/activity.service';
import { PassiveService } from '../../../services/passive.service';

type CharacterState = 'idle' | 'working';

@Component({
  selector: 'app-player-character',
  templateUrl: './player-character.component.html',
  styleUrl: './player-character.component.scss',
})
export class PlayerCharacterComponent {
  private readonly activityService = inject(ActivityService);
  private readonly passiveService  = inject(PassiveService);

  readonly state = computed<CharacterState>(() => {
    if (this.activityService.current()) return 'working';
    const slots = this.passiveService.slots();
    if (Object.values(slots).some(s => s.state === 'processing')) return 'working';
    return 'idle';
  });

  readonly activityLabel = computed(() => {
    const act = this.activityService.current();
    if (act) {
      const skill = act.skillPanel as string;
      return skill.charAt(0).toUpperCase() + skill.slice(1);
    }
    const slots = this.passiveService.slots();
    if (Object.values(slots).some(s => s.state === 'processing')) return 'Crafting';
    return 'Idle';
  });
}
