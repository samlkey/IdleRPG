import { Component, inject, input, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ActivityComponent } from '../../shared/components/activity/activity.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { PlayerService } from '../../services/player.service';
import { ActivityService } from '../../services/activity.service';

@Component({
  selector: 'app-woodcutting',
  imports: [ActivityComponent, DecimalPipe, ModalComponent],
  templateUrl: './woodcutting.component.html',
  styleUrl: './woodcutting.component.scss',
})
export class WoodcuttingComponent {
  pixelIcon = input<string>('');
  helpOpen  = signal(false);

  readonly playerService   = inject(PlayerService);
  readonly activityService = inject(ActivityService);

  get skillData()  { return this.playerService.skill('woodcutting'); }
  get currentAxe() { return this.playerService.player().equipment.axe; }

  readonly trees = [
    { name: 'Normal Tree',  src: 'assets/objects/tree.png',            level: 1,  xp: 300,   time: 5,   critChance: 0.4, disabled: false },
    { name: 'Oak Tree',     src: 'assets/objects/oak_tree.png',        level: 15, xp: 37.5, time: 10,  critChance: 0.4, disabled: true },
    { name: 'Willow Tree',  src: 'assets/objects/willow_tree.png',     level: 30, xp: 67.5, time: 15,  critChance: 0.4, disabled: true },
    { name: 'Maple Tree',   src: 'assets/objects/maple_tree.png',      level: 45, xp: 100,  time: 20,  critChance: 0.4, disabled: true },
    { name: 'Yew Tree',     src: 'assets/objects/yew_tree.png',        level: 60, xp: 175,  time: 30,  critChance: 0.4, disabled: true },
    { name: 'Magic Tree',   src: 'assets/objects/magic_tree.png',      level: 75, xp: 250,  time: 60,  critChance: 0.4, disabled: true },
  ];

  selectTree(tree: typeof this.trees[0]): void {
    if (this.activityService.current()?.name === tree.name) {
      this.activityService.stop();
    } else {
      this.activityService.start({
        name: tree.name, xp: tree.xp, duration: tree.time,
        skillId: 'woodcutting', skillPanel: 'woodcutting',
      });
    }
  }
}
