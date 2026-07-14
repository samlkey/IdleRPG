import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ActivityComponent } from '../../shared/components/activity/activity.component';
import { PlayerService } from '../../services/player.service';
import { ActivityService } from '../../services/activity.service';
import { LocationService } from '../../services/location.service';
import { DropTable, GameItem } from '../../services/item.service';

interface FishEntry {
  name: string;
  src: string;
  level: number;
  xp: number;
  duration: number;
  catchChance: number;
  dropTable: DropTable;
}

interface FishingSpot {
  name: string;
  background: string;
  levelReq: number;
  fish: FishEntry[];
}

@Component({
  selector: 'app-fishing',
  imports: [ActivityComponent, DecimalPipe],
  templateUrl: './fishing.component.html',
  styleUrl: './fishing.component.scss',
})
export class FishingComponent implements OnInit {
  readonly playerService = inject(PlayerService);
  readonly activityService = inject(ActivityService);
  readonly locationService = inject(LocationService);

  get skillData() {
    return this.playerService.skill('fishing');
  }

  readonly particleColors = [
    '#60a5fa',
    '#38bdf8',
    '#bae6fd',
    '#93c5fd',
    '#e0f2fe',
  ];

  private fish(
    name: string,
    src: string,
    level: number,
    xp: number,
    duration: number,
    catchChance: number,
  ): FishEntry {
    const id = name.toLowerCase().replace(/\s+/g, '-');
    const item: GameItem = {
      id,
      name,
      description: '',
      icon: src,
      type: 'resource',
      subType: 'fish',
    };
    return {
      name,
      src,
      level,
      xp,
      duration,
      catchChance,
      dropTable: { id, name, drops: [{ item, chance: 1 }] },
    };
  }

  private readonly allSpots: FishingSpot[] = [
    {
      name: 'Tutorial Pond',
      background: 'assets/backgrounds/fishing_spot_1.png',
      levelReq: 1,
      fish: [
        this.fish('Raw Shrimp', 'assets/objects/shrimp.png', 1, 10, 5, 0.1),
        this.fish('Raw Sardine', 'assets/objects/sardine.png', 1, 20, 10, 0.85),
      ],
    },
    {
      name: 'Mainland Shores',
      background: 'assets/backgrounds/fishing_spot_1.png',
      levelReq: 1,
      fish: [
        this.fish('Raw Shrimp', 'assets/objects/shrimp.png', 1, 10, 5, 0.85),
        this.fish('Raw Sardine', 'assets/objects/sardine.png', 1, 20, 10, 0.85),
        this.fish(
          'Raw Herring',
          'assets/objects/herring.png',
          10,
          30,
          10,
          0.65,
        ),
      ],
    },
    {
      name: 'Muddy Lake',
      background: 'assets/backgrounds/fishing_slot_2.png',
      levelReq: 20,
      fish: [
        this.fish('Raw Trout', 'assets/objects/trout.png', 20, 50, 12, 0.7),
        this.fish('Raw Pike', 'assets/objects/pike.png', 25, 60, 15, 0.6),
        this.fish('Raw Salmon', 'assets/objects/salmon.png', 30, 70, 20, 0.55),
      ],
    },
    {
      name: 'Salty Cove',
      background: 'assets/backgrounds/fishing.png',
      levelReq: 35,
      fish: [
        this.fish('Raw Tuna', 'assets/objects/tuna.png', 35, 80, 25, 0.6),
        this.fish('Raw Lobster', 'assets/objects/lobster.png', 40, 90, 30, 0.5),
        this.fish(
          'Raw Swordfish',
          'assets/objects/swordfish.png',
          50,
          100,
          45,
          0.4,
        ),
      ],
    },
    {
      name: 'Deep Sea Dock',
      background: 'assets/backgrounds/fishing.png',
      levelReq: 62,
      fish: [
        this.fish(
          'Raw Monkfish',
          'assets/objects/monkfish.png',
          62,
          120,
          55,
          0.45,
        ),
        this.fish('Raw Shark', 'assets/objects/shark.png', 76, 110, 50, 0.35),
        this.fish(
          'Raw Anglerfish',
          'assets/objects/anglerfish.png',
          82,
          150,
          90,
          0.3,
        ),
      ],
    },
  ];

  readonly spots = computed(() => {
    const spotNames =
      this.locationService.current().activities.fishingSpot ?? [];
    return this.allSpots.filter((spot) => spotNames.includes(spot.name));
  });

  readonly selectedSpot = signal<FishingSpot | null>(null);
  readonly selectedFish = signal<FishEntry | null>(null);

  ngOnInit(): void {
    const current = this.activityService.current();
    if (current?.skillPanel !== 'fishing') return;
    for (const spot of this.allSpots) {
      const match = spot.fish.find((f) => f.name === current.name);
      if (match) {
        this.selectedSpot.set(spot);
        this.selectedFish.set(match);
        break;
      }
    }
  }

  selectSpot(spot: FishingSpot): void {
    this.selectedSpot.set(spot);
    const current = this.activityService.current();
    const activeFish =
      current?.skillPanel === 'fishing'
        ? (spot.fish.find((f) => f.name === current.name) ?? null)
        : null;
    this.selectedFish.set(activeFish);
  }

  backToSpots(): void {
    this.selectedSpot.set(null);
  }

  selectFish(fish: FishEntry): void {
    if (this.activityService.current()?.name === fish.name) {
      this.activityService.stop();
    } else {
      this.activityService.start({
        name: fish.name,
        xp: fish.xp,
        duration: fish.duration,
        skillId: 'fishing',
        skillPanel: 'fishing',
        catchChance: fish.catchChance,
        dropTable: fish.dropTable,
      });
    }
  }
}
