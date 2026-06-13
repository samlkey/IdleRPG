import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GameStateService } from '../game-state.service';
import { GameMode, PlayerService } from '../game/services/player.service';

@Component({
  selector: 'app-character-creation',
  imports: [FormsModule],
  templateUrl: './character-creation.component.html',
  styleUrl: './character-creation.component.scss',
})
export class CharacterCreationComponent {
  private readonly gameState  = inject(GameStateService);
  private readonly playerService = inject(PlayerService);

  name = signal('');
  mode = signal<GameMode>('classic');

  get canCreate(): boolean {
    return this.name().trim().length >= 2;
  }

  selectMode(m: GameMode): void {
    this.mode.set(m);
  }

  create(): void {
    if (!this.canCreate) return;
    this.playerService.initPlayer(this.name(), this.mode());
    this.gameState.navigate('loading');
  }

  back(): void {
    this.gameState.navigate('character-select');
  }
}

