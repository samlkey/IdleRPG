import { Component, computed, inject, input, signal } from '@angular/core';
import { ActivityService } from '../../../services/activity.service';
import { PassiveService } from '../../../services/passive.service';
import {
  CharacterAnimation,
  CharacterAnimationService,
} from '../../../services/character-animation.service';
import { PlayerService } from '../../../services/player.service';
import { ItemService, GameItem } from '../../../services/item.service';

type CharacterState = 'idle' | 'working';

//TODO: change this to be PixiJS based, so we can have smooth animations instead of just frame-by-frame images

@Component({
  selector: 'app-player-character',
  templateUrl: './player-character.component.html',
  styleUrl: './player-character.component.scss',
})
export class PlayerCharacterComponent {
  private readonly activityService = inject(ActivityService);
  private readonly passiveService = inject(PassiveService);
  private readonly anim = inject(CharacterAnimationService);
  private readonly playerService = inject(PlayerService);
  private readonly itemService = inject(ItemService);

  showEquipToggle = input(false);
  large = input(false);
  readonly equipOpen = signal(false);

  readonly equipped = computed(() => {
    const eq = this.playerService.player().equipment;
    const r = (id: string | null): GameItem | null =>
      id ? (this.itemService.searchItemById(id) ?? null) : null;
    return {
      head: r(eq.head),
      cape: r(eq.cape),
      neck: r(eq.neck),
      ammo: r(eq.ammo),
      weapon: r(eq.weapon),
      body: r(eq.body),
      shield: r(eq.shield),
      legs: r(eq.legs),
      hands: r(eq.hands),
      feet: r(eq.feet),
      ring: r(eq.ring),
    };
  });

  readonly state = computed<CharacterState>(() => {
    if (this.activityService.current()) return 'working';
    const slots = this.passiveService.slots();
    if (Object.values(slots).some((s) => s.state === 'processing'))
      return 'working';
    return 'idle';
  });

  readonly activityLabel = computed(() => {
    const act = this.activityService.current();
    if (act) {
      const skill = act.skillPanel as string;
      return skill.charAt(0).toUpperCase() + skill.slice(1);
    }
    const slots = this.passiveService.slots();
    if (Object.values(slots).some((s) => s.state === 'processing'))
      return 'Crafting';
    return 'Idle';
  });

  private readonly currentAnimation = computed<CharacterAnimation>(() => {
    const skill = this.activityService.current()?.skillPanel as
      | string
      | undefined;
    if (skill === 'woodcutting') return 'woodcutting';
    if (skill === 'mining') return 'mining';
    if (skill === 'smithing') return 'smithing';
    if (skill === 'fishing') return 'fishing';
    if (skill === 'firemaking') return 'firemaking';
    return 'idle';
  });

  readonly currentFrame = computed(() => {
    switch (this.currentAnimation()) {
      case 'woodcutting':
        return this.anim.woodcuttingFrame();
      case 'mining':
        return this.anim.miningFrame();
      case 'smithing':
        return this.anim.smithingFrame();
      case 'fishing':
        return this.anim.fishingFrame();
      case 'firemaking':
        return this.anim.firemakingFrame();
      default:
        return this.anim.idleFrame();
    }
  });
}
