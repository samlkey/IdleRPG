import { Component, computed, inject, input, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ActivityComponent } from '../../shared/components/activity/activity.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { ActivityBadgeComponent } from '../../shared/components/activity-badge/activity-badge.component';
import { PlayerService } from '../../services/player.service';
import { ActivityService } from '../../services/activity.service';
import { LocationService } from '../../services/location.service';
import { GameItem } from '../../services/item.service';

@Component({
  selector: 'app-firemaking',
  imports: [ActivityComponent, DecimalPipe, ModalComponent, ActivityBadgeComponent],
  templateUrl: './firemaking.component.html',
  styleUrl: './firemaking.component.scss',
})
export class FiremakingComponent {
  pixelIcon = input<string>('');
  helpOpen  = signal(false);

  readonly playerService   = inject(PlayerService);
  readonly activityService = inject(ActivityService);
  readonly locationService = inject(LocationService);

  get skillData() { return this.playerService.skill('firemaking'); }

  public readonly allLogs: { item: GameItem; level: number; xp: number; time: number; src: string }[] = [
    { item: { id: 'normal-log',  name: 'Normal Log',  description: 'A basic log.',          icon: 'assets/objects/normal_log.png',  type: 'resource', subType: 'wood' }, level: 1,  xp: 40,    time: 5  , src: 'assets/objects/normal_log.png'  },
    { item: { id: 'oak-log',     name: 'Oak Log',     description: 'A sturdy oak log.',      icon: 'assets/objects/oak_log.png',     type: 'resource', subType: 'wood' }, level: 15, xp: 60,    time: 7  , src: 'assets/objects/oak_log.png'     },
    { item: { id: 'willow-log',  name: 'Willow Log',  description: 'A flexible willow log.', icon: 'assets/objects/willow_log.png',  type: 'resource', subType: 'wood' }, level: 30, xp: 90,    time: 10 , src: 'assets/objects/willow_log.png'  },
    { item: { id: 'maple-log',   name: 'Maple Log',   description: 'A dense maple log.',     icon: 'assets/objects/maple_log.png',   type: 'resource', subType: 'wood' }, level: 45, xp: 135,   time: 15 , src: 'assets/objects/maple_log.png'   },
    { item: { id: 'yew-log',     name: 'Yew Log',     description: 'A rare yew log.',        icon: 'assets/objects/yew_log.png',     type: 'resource', subType: 'wood' }, level: 60, xp: 202.5, time: 20 , src: 'assets/objects/yew_log.png'     },
    { item: { id: 'magic-log',   name: 'Magic Log',   description: 'A magical log.',         icon: 'assets/objects/magic_log.png',   type: 'resource', subType: 'wood' }, level: 75, xp: 303.8, time: 30 , src: 'assets/objects/magic_log.png'   },
  ];

  selectLog(log: typeof this.allLogs[0]): void {
    if (this.activityService.current()?.name === log.item.name) {
      this.activityService.stop();
    } else {
      this.activityService.start({
        name: log.item.name, xp: log.xp, duration: log.time,
        skillId: 'firemaking', skillPanel: 'firemaking',
        type: 'consumption', inputItem: log.item,
      });
    }
  }
}
