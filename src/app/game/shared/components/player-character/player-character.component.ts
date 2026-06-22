import { Component, computed, inject } from '@angular/core';
import { ActivityService } from '../../../services/activity.service';
import { PassiveService } from '../../../services/passive.service';
import { CharacterAnimation, CharacterAnimationService } from '../../../services/character-animation.service';

type CharacterState = 'idle' | 'working';

@Component({
  selector: 'app-player-character',
  templateUrl: './player-character.component.html',
  styleUrl: './player-character.component.scss',
})
export class PlayerCharacterComponent {
  private readonly activityService = inject(ActivityService);
  private readonly passiveService  = inject(PassiveService);
  private readonly anim            = inject(CharacterAnimationService);

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

  private readonly currentAnimation = computed<CharacterAnimation>(() => {
    const skill = this.activityService.current()?.skillPanel as string | undefined;
    if (skill === 'woodcutting') return 'woodcutting';
    if (skill === 'mining')      return 'mining';
    if (skill === 'smithing')    return 'smithing';
    if (skill === 'fishing')     return 'fishing';
    return 'idle';
  });

  readonly currentFrame = computed(() => {
    switch (this.currentAnimation()) {
      case 'woodcutting': return this.anim.woodcuttingFrame();
      case 'mining':      return this.anim.miningFrame();
      case 'smithing':    return this.anim.smithingFrame();
      case 'fishing':     return this.anim.fishingFrame();
      default:            return this.anim.idleFrame();
    }
  });
}
