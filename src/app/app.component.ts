import { Component, inject } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { GameStateService } from './game-state.service';

@Component({
  selector: 'app-root',
  imports: [NgComponentOutlet],
  template: `<ng-container *ngComponentOutlet="gameState.screenComponent()" />`,
  styles: [`:host { display: block; width: 100vw; height: 100vh; overflow: hidden; }`]
})
export class AppComponent {
  gameState = inject(GameStateService);
}
