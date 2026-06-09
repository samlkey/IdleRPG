import { Component, inject } from '@angular/core';
import { GameStateService } from '../game-state.service';

interface CharacterSlot {
  id: number;
  name: string;
  level: number;
  class: string;
  occupied: boolean;
}

@Component({
  selector: 'app-character-select',
  imports: [],
  templateUrl: './character-select.component.html',
  styleUrl: './character-select.component.scss'
})
export class CharacterSelectComponent {
  slots: CharacterSlot[] = [
    { id: 1, name: 'Aldric', level: 14, class: 'Warrior', occupied: true },
    { id: 2, name: '', level: 0, class: '', occupied: false },
    { id: 3, name: '', level: 0, class: '', occupied: false },
  ];

  selectedSlot: number | null = null;

  private gameState = inject(GameStateService);

  select(id: number) {
    this.selectedSlot = id;
  }

  enter() {
    if (this.selectedSlot == null) return;
    this.gameState.navigate('game');
  }

  back() {
    this.gameState.navigate('landing');
  }
}
