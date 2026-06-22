import { Component, computed, inject, input, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { ActivityBadgeComponent } from '../../shared/components/activity-badge/activity-badge.component';
import { PlayerService } from '../../services/player.service';
import { ActivityService } from '../../services/activity.service';
import { LocationService } from '../../services/location.service';
import { ThievingLocationComponent, ThievingLocation } from './thieving-location/thieving-location.component';

@Component({
  selector: 'app-thieving',
  imports: [DecimalPipe, ModalComponent, ThievingLocationComponent, ActivityBadgeComponent],
  templateUrl: './thieving.component.html',
  styleUrl: './thieving.component.scss',
})
export class ThievingComponent {
  pixelIcon = input<string>('');
  helpOpen  = signal(false);

  readonly playerService   = inject(PlayerService);
  readonly activityService = inject(ActivityService);
  readonly locationService = inject(LocationService);

  get skillData() { return this.playerService.skill('thieving'); }

  private readonly allLocations: ThievingLocation[] = [
    {
      name: 'Tutorial Market',
      background: 'assets/backgrounds/thieving_town_1.png',
      levelReq: 1,
      targets: [
        { name: 'Man',    src: 'assets/objects/man.png',    level: 1,  xp: 8,   duration: 4,  successChance: 0.10, goldReward: 3, caughtDamage: 10   },
        { name: 'Woman',  src: 'assets/objects/woman.png',  level: 1,  xp: 8,   duration: 4,  successChance: 0.80, goldReward: 3   },
      ],
    },
    {
      name: 'Mainland Square',
      background: 'assets/backgrounds/thieving_town_1.png',
      levelReq: 1,
      targets: [
        { name: 'Man',    src: 'assets/objects/man.png',    level: 1,  xp: 8,   duration: 4,  successChance: 0.10, goldReward: 3, caughtDamage: 10   },
        { name: 'Woman',  src: 'assets/objects/woman.png',  level: 1,  xp: 8,   duration: 4,  successChance: 0.80, goldReward: 3   },
        { name: 'Farmer', src: 'assets/objects/farmer.png', level: 10, xp: 14,  duration: 5,  successChance: 0.65, goldReward: 9   },
        { name: 'Guard',  src: 'assets/objects/guard.png',  level: 40, xp: 46,  duration: 8,  successChance: 0.65, goldReward: 30  },
      ],
    },
    {
      name: 'Mainland Market',
      background: 'assets/backgrounds/thieving.png',
      levelReq: 5,
      targets: [
        { name: "Food Stall",  src: 'assets/objects/food_stall.png',  level: 5,  xp: 16,  duration: 5,  successChance: 0.90, goldReward: 15  },
        { name: 'Silk Stall',     src: 'assets/objects/silk_stall.png',    level: 20, xp: 24,  duration: 6,  successChance: 0.80, goldReward: 60  },
        { name: 'Gem Stall',      src: 'assets/objects/gem_stall.png',     level: 75, xp: 160, duration: 18, successChance: 0.50, goldReward: 300 },
        { name: 'Fur Stall',      src: 'assets/objects/fur_stall.png',     level: 35, xp: 36,  duration: 8,  successChance: 0.70, goldReward: 100 },
      ],
    },
    {
      name: 'Ardougne',
      background: 'assets/backgrounds/thieving.png',
      levelReq: 25,
      targets: [
        { name: 'Fruit Stall',        src: 'assets/objects/fruit_stall.png',    level: 25, xp: 28,  duration: 6,  successChance: 0.80, goldReward: 75  },
        { name: 'Master Farmer',      src: 'assets/objects/master_farmer.png',  level: 38, xp: 43,  duration: 8,  successChance: 0.65, goldReward: 120 },
        { name: 'Knight of Ardougne', src: 'assets/objects/knight.png',         level: 55, xp: 84,  duration: 12, successChance: 0.55, goldReward: 250 },
        { name: 'Chest',              src: 'assets/objects/chest.png',           level: 72, xp: 140, duration: 20, successChance: 0.45, goldReward: 500 },
      ],
    },
  ];

  readonly activeLocations = computed(() => {
    const area = this.locationService.current().activities.thievingArea;
    return this.allLocations.filter(loc => area?.includes(loc.name));
  });
}
