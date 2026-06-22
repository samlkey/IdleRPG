import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';

const ANIMATIONS = {
  idle: {
    frames: Array.from({ length: 7 }, (_, i) => `assets/character/idle/Idle0${i + 1}.png`),
    ms: 120,
  },
  woodcutting: {
    frames: Array.from({ length: 9 }, (_, i) =>
      `assets/character/woodcutting/chop${String(i + 1).padStart(2, '0')}.png`,
    ),
    ms: 80,
  },
  mining: {
    frames: Array.from({ length: 9 }, (_, i) =>
      `assets/character/mining/mine${String(i + 1).padStart(2, '0')}.png`,
    ),
    ms: 80,
  },
  smithing: {
    frames: Array.from({ length: 9 }, (_, i) =>
      `assets/character/smithing/smith${String(i + 1).padStart(2, '0')}.png`,
    ),
    ms: 80,
  },
  fishing: {
    frames: Array.from({ length: 16 }, (_, i) =>
      `assets/character/fishing/fish${String(i + 1).padStart(2, '0')}.png`,
    ),
    ms: 100,
  },
} as const;

export type CharacterAnimation = keyof typeof ANIMATIONS;

function makeTrack(key: CharacterAnimation, destroyRef: DestroyRef) {
  const { frames, ms } = ANIMATIONS[key];
  const index = signal(0);
  const timer = setInterval(() => index.update(i => (i + 1) % frames.length), ms);
  destroyRef.onDestroy(() => clearInterval(timer));
  return computed(() => frames[index()]);
}

@Injectable({ providedIn: 'root' })
export class CharacterAnimationService {
  private readonly destroyRef = inject(DestroyRef);

  readonly idleFrame        = makeTrack('idle',        this.destroyRef);
  readonly woodcuttingFrame = makeTrack('woodcutting', this.destroyRef);
  readonly miningFrame      = makeTrack('mining',      this.destroyRef);
  readonly smithingFrame    = makeTrack('smithing',    this.destroyRef);
  readonly fishingFrame     = makeTrack('fishing',     this.destroyRef);

  constructor() {
    // Preload every frame so the browser caches them before the intervals fire
    for (const { frames } of Object.values(ANIMATIONS)) {
      for (const src of frames) {
        const img = new Image();
        img.src = src;
      }
    }
  }
}
