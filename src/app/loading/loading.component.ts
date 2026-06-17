import { Component, effect, inject, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { PreloadService } from '../game/services/preload.service';
import { GameStateService } from '../game-state.service';

@Component({
  selector: 'app-loading',
  imports: [DecimalPipe],
  templateUrl: './loading.component.html',
  styleUrl: './loading.component.scss',
})
export class LoadingComponent implements OnInit {
  readonly preload = inject(PreloadService);
  private readonly gameState = inject(GameStateService);

  constructor() {
    effect(() => {
      if (this.preload.done()) {
        this.gameState.navigate('game');
      }
    });
  }

  ngOnInit(): void {
    this.preload.preload();
  }
}
