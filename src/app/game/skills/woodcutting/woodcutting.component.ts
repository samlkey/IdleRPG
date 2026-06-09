import { Component, input, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ActivityComponent } from '../../shared/components/activity/activity.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';

@Component({
  selector: 'app-woodcutting',
  imports: [ActivityComponent, DecimalPipe, ModalComponent],
  templateUrl: './woodcutting.component.html',
  styleUrl: './woodcutting.component.scss',
})
export class WoodcuttingComponent {
  pixelIcon   = input<string>('');
  helpOpen    = signal(false);

  skillLevel = 1;
  skillXp    = 0;
  xpToNext   = 10_000;
  currentAxe = 'Iron';

  readonly trees = [
    { name: 'Normal Tree',   src: 'assets/objects/tree.png',            level: 1,  xp: 25,   time: 5,   disabled: false, },
    { name: 'Oak Tree',      src: 'assets/objects/oak_tree.png',        level: 15, xp: 37.5, time: 10,  disabled: true, },
    { name: 'Willow Tree',   src: 'assets/objects/willow_tree.png',     level: 30, xp: 67.5, time: 15,  disabled: true, },
    { name: 'Maple Tree',    src: 'assets/objects/maple_tree.png',      level: 45, xp: 100,  time: 20,  disabled: true, },
    { name: 'Yew Tree',      src: 'assets/objects/yew_tree.png',        level: 60, xp: 175,  time: 30,  disabled: true, },
    { name: 'Magic Tree',    src: 'assets/objects/magic_tree.png',      level: 75, xp: 250,  time: 60,  disabled: true, },
  ];
}
