import { Injectable, signal, computed, Type } from '@angular/core';
import { LandingComponent } from './landing/landing.component';
import { CharacterSelectComponent } from './character-select/character-select.component';
import { CharacterCreationComponent } from './character-creation/character-creation.component';
import { LoadingComponent } from './loading/loading.component';
import { GameComponent } from './game/game.component';

export type GameScreen = 'landing' | 'character-select' | 'character-creation' | 'loading' | 'game';

const SCREEN_MAP: Record<GameScreen, Type<unknown>> = {
  'landing': LandingComponent,
  'character-select': CharacterSelectComponent,
  'character-creation': CharacterCreationComponent,
  'loading': LoadingComponent,
  'game': GameComponent,
};

@Injectable({ providedIn: 'root' })
export class GameStateService {
  readonly screen = signal<GameScreen>('landing');
  readonly screenComponent = computed(() => SCREEN_MAP[this.screen()]);

  navigate(screen: GameScreen) {
    this.screen.set(screen);
  }
}
