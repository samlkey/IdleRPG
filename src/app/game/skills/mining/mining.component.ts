import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ActivityComponent } from '../../shared/components/activity/activity.component';
import { PlayerService } from '../../services/player.service';
import { ActivityService } from '../../services/activity.service';
import { LocationService } from '../../services/location.service';
import { DropTable, GameItem, ItemService } from '../../services/item.service';

@Component({
  selector: 'app-mining',
  imports: [
    ActivityComponent,
    DecimalPipe,
  ],
  templateUrl: './mining.component.html',
  styleUrl: './mining.component.scss',
})
export class MiningComponent implements OnInit {
  readonly playerService = inject(PlayerService);
  readonly itemService = inject(ItemService);
  readonly activityService = inject(ActivityService);
  readonly locationService = inject(LocationService);

  get skillData() {
    return this.playerService.skill('mining');
  }
  get currentPickaxe() {
    return this.playerService.player().equipment.pickaxe;
  }

  private readonly allDropTables: DropTable[] = [
    {
      id: 'copper-ore',
      name: 'Copper Ore',
      drops: [
        {
          item: this.itemService.searchItemById('copper-ore')!,
          chance: 1,
          qty: 1,
        },
      ],
    },
    {
      id: 'tin-ore',
      name: 'Tin Ore',
      drops: [
        {
          item: this.itemService.searchItemById('tin-ore')!,
          chance: 1,
          qty: 1,
        },
      ],
    },
    {
      id: 'iron-ore',
      name: 'Iron Ore',
      drops: [
        {
          item: this.itemService.searchItemById('iron-ore')!,
          chance: 1,
          qty: 1,
        },
      ],
    },
    {
      id: 'coal-ore',
      name: 'Coal Ore',
      drops: [
        {
          item: this.itemService.searchItemById('coal-ore')!,
          chance: 1,
          qty: 1,
        },
      ],
    },
    {
      id: 'mithril-ore',
      name: 'Mithril Ore',
      drops: [
        {
          item: this.itemService.searchItemById('mithril-ore')!,
          chance: 1,
          qty: 1,
        },
      ],
    },
    {
      id: 'adamant-ore',
      name: 'Adamant Ore',
      drops: [
        {
          item: this.itemService.searchItemById('adamant-ore')!,
          chance: 1,
          qty: 1,
        },
      ],
    },
    {
      id: 'runite-ore',
      name: 'Runite Ore',
      drops: [
        {
          item: this.itemService.searchItemById('runite-ore')!,
          chance: 1,
          qty: 1,
        },
      ],
    },
    {
      id: 'water-crystal-core',
      name: 'Water Crystal Core',
      drops: [
        {
          item: this.itemService.searchItemById('water-crystal-core')!,
          chance: 1,
          qty: 1,
        },
      ],
    },
  ];

  private readonly allRocks = [
    {
      name: 'Copper Ore',
      src: 'assets/objects/copper_ore.png',
      level: 1,
      xp: 17.5,
      dropTable: this.allDropTables[0],
      time: 5,
      disabled: false,
      type: 'depletion' as const,
      maxCharges: 6,
      replenishTime: 20,
    },
    {
      name: 'Tin Ore',
      src: 'assets/objects/tin_ore.png',
      level: 1,
      xp: 17.5,
      dropTable: this.allDropTables[1],
      time: 5,
      disabled: false,
      type: 'depletion' as const,
      maxCharges: 6,
      replenishTime: 20,
    },
    {
      name: 'Water Crystal Core',
      src: 'assets/objects/water_crystal_core.png',
      level: 1,
      xp: 250,
      dropTable: this.allDropTables[7],
      time: 5,
      disabled: true,
      type: 'depletion' as const,
      maxCharges: 10,
      replenishTime: 15,
    },
    {
      name: 'Iron Ore',
      src: 'assets/objects/iron_ore.png',
      level: 15,
      xp: 35,
      dropTable: this.allDropTables[2],
      time: 10,
      disabled: true,
      type: 'depletion' as const,
      maxCharges: 5,
      replenishTime: 40,
    },
    {
      name: 'Coal Ore',
      src: 'assets/objects/coal.png',
      level: 30,
      xp: 50,
      dropTable: this.allDropTables[3],
      time: 15,
      disabled: true,
      type: 'depletion' as const,
      maxCharges: 5,
      replenishTime: 60,
    },
    {
      name: 'Mithril Ore',
      src: 'assets/objects/mithril_ore.png',
      level: 55,
      xp: 80,
      dropTable: this.allDropTables[4],
      time: 30,
      disabled: true,
      type: 'depletion' as const,
      maxCharges: 4,
      replenishTime: 90,
    },
    {
      name: 'Adamant Ore',
      src: 'assets/objects/adamant_ore.png',
      level: 70,
      xp: 125,
      dropTable: this.allDropTables[5],
      time: 60,
      disabled: true,
      type: 'depletion' as const,
      maxCharges: 3,
      replenishTime: 120,
    },
    {
      name: 'Runite Ore',
      src: 'assets/objects/runite_ore.png',
      level: 85,
      xp: 200,
      dropTable: this.allDropTables[6],
      time: 120,
      disabled: true,
      type: 'depletion' as const,
      maxCharges: 3,
      replenishTime: 180,
    },
  ];

  readonly rocks = computed(() => {
    const available = this.locationService.current().activities.mining ?? [];
    return this.allRocks.filter((r) => available.includes(r.name));
  });

  readonly selectedRock = signal<(typeof this.allRocks)[number] | null>(null);

  ngOnInit(): void {
    const current = this.activityService.current();
    if (current?.skillPanel === 'mining') {
      const match = this.allRocks.find(r => r.name === current.name);
      if (match) this.selectedRock.set(match);
    }
  }

  selectRock(rock: (typeof this.allRocks)[0]): void {
    if (this.activityService.current()?.name === rock.name) {
      this.activityService.stop();
    } else {
      this.activityService.start({
        name: rock.name,
        xp: rock.xp,
        duration: rock.time,
        skillId: 'mining',
        skillPanel: 'mining',
        dropTable: rock.dropTable,
        type: rock.type,
        maxCharges: rock.maxCharges,
        replenishTime: rock.replenishTime,
      });
    }
  }
}
