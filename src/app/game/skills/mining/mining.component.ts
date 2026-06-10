import { Component, inject, input, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ActivityComponent } from '../../shared/components/activity/activity.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { PlayerService } from '../../services/player.service';
import { ActivityService } from '../../services/activity.service';

@Component({
  selector: 'app-mining',
  imports: [ActivityComponent, ModalComponent, DecimalPipe],
  templateUrl: './mining.component.html',
  styleUrl: './mining.component.scss',
})
export class MiningComponent {
  pixelIcon = input<string>('');
  helpOpen  = signal(false);

  readonly playerService   = inject(PlayerService);
  readonly activityService = inject(ActivityService);

  get skillData()  { return this.playerService.skill('mining'); }
  get currentPickaxe() { return this.playerService.player().equipment.pickaxe; }

  readonly rocks = [
    { name: 'Copper Ore',  src: 'assets/objects/copper_ore.png',  level: 1,  xp: 17.5, time: 5,   disabled: false, type: 'depletion' as const, maxCharges: 6, replenishTime: 20  },
    { name: 'Tin Ore',     src: 'assets/objects/tin_ore.png',     level: 1,  xp: 17.5, time: 5,   disabled: false, type: 'depletion' as const, maxCharges: 6, replenishTime: 20  },
    { name: 'Iron Ore',    src: 'assets/objects/iron_ore.png',    level: 15, xp: 35,   time: 10,  disabled: true,  type: 'depletion' as const, maxCharges: 5, replenishTime: 40  },
    { name: 'Coal Ore',    src: 'assets/objects/coal.png',        level: 30, xp: 50,   time: 15,  disabled: true,  type: 'depletion' as const, maxCharges: 5, replenishTime: 60  },
    { name: 'Mithril Ore', src: 'assets/objects/mithril_ore.png', level: 55, xp: 80,   time: 30,  disabled: true,  type: 'depletion' as const, maxCharges: 4, replenishTime: 90  },
    { name: 'Adamant Ore', src: 'assets/objects/adamant_ore.png', level: 70, xp: 125,  time: 60,  disabled: true,  type: 'depletion' as const, maxCharges: 3, replenishTime: 120 },
    { name: 'Runite Ore',  src: 'assets/objects/runite_ore.png',  level: 85, xp: 200,  time: 120, disabled: true,  type: 'depletion' as const, maxCharges: 3, replenishTime: 180 },
  ];
  
  selectRock(rock: typeof this.rocks[0]): void {
    if (this.activityService.current()?.name === rock.name) {
      this.activityService.stop();
    } else {
      this.activityService.start({
        name: rock.name, xp: rock.xp, duration: rock.time,
        skillId: 'mining', skillPanel: 'mining',
        type: rock.type, maxCharges: rock.maxCharges, replenishTime: rock.replenishTime,
      });
    }
  }
}
