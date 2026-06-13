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
  templateUrl: './character-select.component.html',
  styleUrl: './character-select.component.scss'
})
export class CharacterSelectComponent {
  slots: CharacterSlot[] = [
    { id: 1, name: '', level: 0, class: '', occupied: false },
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
    const slot = this.slots.find(s => s.id === this.selectedSlot);
    this.gameState.navigate(slot?.occupied ? 'loading' : 'character-creation');
  }

  back() {
    this.gameState.navigate('landing');
  }
}
