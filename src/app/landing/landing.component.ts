import { Component, inject } from '@angular/core';
import { GameStateService } from '../game-state.service';

@Component({
  selector: 'app-landing',
  imports: [],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss'
})
export class LandingComponent {
  isLoading = false;

  particles = Array.from({ length: 30 }, () => {
    const left = Math.random() * 100;
    const delay = Math.random() * 12;
    const duration = 8 + Math.random() * 10;
    const size = 1 + Math.random() * 2;
    return `left:${left}%;animation-delay:${delay}s;animation-duration:${duration}s;width:${size}px;height:${size}px`;
  });

  private gameState = inject(GameStateService);

  onPlay() {
    this.isLoading = true;
    setTimeout(() => this.gameState.navigate('character-select'), 600);
  }
}
