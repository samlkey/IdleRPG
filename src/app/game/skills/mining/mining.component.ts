import { Component, computed, inject, input, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ActivityComponent } from '../../shared/components/activity/activity.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { PlayerService } from '../../services/player.service';
import { ActivityService } from '../../services/activity.service';
import { LocationService } from '../../services/location.service';
import { DropTable, GameItem } from '../../services/item.service';

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
  readonly locationService = inject(LocationService);

  get skillData()  { return this.playerService.skill('mining'); }
  get currentPickaxe() { return this.playerService.player().equipment.pickaxe; }

  //TODO: Will have to move these to an item database to prevent repeating code. 
  private readonly allItems: GameItem[] = [
    { id: 'copper-ore', name: 'Copper Ore', description: 'A common ore used for smithing.', icon: 'assets/objects/copper_ore.png', type: 'resource', subType: 'ore' },
    { id: 'tin-ore',    name: 'Tin Ore',    description: 'A common ore used for smithing.', icon: 'assets/objects/tin_ore.png', type: 'resource', subType: 'ore' },
    { id: 'iron-ore',   name: 'Iron Ore',   description: 'A common ore used for smithing.', icon: 'assets/objects/iron_ore.png', type: 'resource', subType: 'ore' },
    { id: 'coal-ore',   name: 'Coal Ore',   description: 'A common ore used for smithing.', icon: 'assets/objects/coal.png', type: 'resource', subType: 'ore' },
    { id: 'mithril-ore',name: 'Mithril Ore',description: 'A rare ore used for smithing.', icon: 'assets/objects/mithril_ore.png', type: 'resource', subType: 'ore' },
    { id: 'adamant-ore',name: 'Adamant Ore',description: 'A rare ore used for smithing.', icon: 'assets/objects/adamant_ore.png', type: 'resource', subType: 'ore' },
    { id: 'runite-ore', name: 'Runite Ore', description: 'A very rare ore used for smithing.', icon: 'assets/objects/runite_ore.png', type: 'resource', subType: 'ore' }
  ]

  private drop(item: GameItem): DropTable {
    return { id: item.id, name: item.name, drops: [{ item, chance: 1 }] };
  }

  private readonly allRocks = [
    { name: 'Copper Ore',  src: 'assets/objects/copper_ore.png',  level: 1,  xp: 17.5, dropTable: this.drop(this.allItems[0]), time: 5,   disabled: false, type: 'depletion' as const, maxCharges: 6, replenishTime: 20  },
    { name: 'Tin Ore',     src: 'assets/objects/tin_ore.png',     level: 1,  xp: 17.5, dropTable: this.drop(this.allItems[1]), time: 5,   disabled: false, type: 'depletion' as const, maxCharges: 6, replenishTime: 20  },
    { name: 'Iron Ore',    src: 'assets/objects/iron_ore.png',    level: 15, xp: 35,   dropTable: this.drop(this.allItems[2]), time: 10,  disabled: true,  type: 'depletion' as const, maxCharges: 5, replenishTime: 40  },
    { name: 'Coal Ore',    src: 'assets/objects/coal.png',        level: 30, xp: 50,   dropTable: this.drop(this.allItems[3]), time: 15,  disabled: true,  type: 'depletion' as const, maxCharges: 5, replenishTime: 60  },
    { name: 'Mithril Ore', src: 'assets/objects/mithril_ore.png', level: 55, xp: 80,   dropTable: this.drop(this.allItems[4]), time: 30,  disabled: true,  type: 'depletion' as const, maxCharges: 4, replenishTime: 90  },
    { name: 'Adamant Ore', src: 'assets/objects/adamant_ore.png', level: 70, xp: 125,  dropTable: this.drop(this.allItems[5]), time: 60,  disabled: true,  type: 'depletion' as const, maxCharges: 3, replenishTime: 120 },
    { name: 'Runite Ore',  src: 'assets/objects/runite_ore.png',  level: 85, xp: 200,  dropTable: this.drop(this.allItems[6]), time: 120, disabled: true,  type: 'depletion' as const, maxCharges: 3, replenishTime: 180 },
  ];

  readonly rocks = computed(() => {
    const available = this.locationService.current().activities.mining ?? [];
    return this.allRocks.filter(r => available.includes(r.name));
  });

  selectRock(rock: typeof this.allRocks[0]): void {
    if (this.activityService.current()?.name === rock.name) {
      this.activityService.stop();
    } else {
      this.activityService.start({
        name: rock.name, xp: rock.xp, duration: rock.time,
        skillId: 'mining', skillPanel: 'mining', dropTable: rock.dropTable,
        type: rock.type, maxCharges: rock.maxCharges, replenishTime: rock.replenishTime,
      });
    }
  }
}
