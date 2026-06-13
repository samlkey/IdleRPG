import { Component, computed, inject, input, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { PlayerService } from '../../services/player.service';
import { LocationService } from '../../services/location.service';
import { FishingLocationComponent, FishingLocation } from './fishing-location/fishing-location.component';

@Component({
  selector: 'app-fishing',
  imports: [DecimalPipe, ModalComponent, FishingLocationComponent],
  templateUrl: './fishing.component.html',
  styleUrl: './fishing.component.scss',
})
export class FishingComponent {
  pixelIcon = input<string>('');
  helpOpen  = signal(false);

  readonly playerService   = inject(PlayerService);
  readonly locationService = inject(LocationService);

  get skillData() { return this.playerService.skill('fishing'); }

  private readonly allLocations: FishingLocation[] = [
    {
      name: 'Tutorial Pond',
      background: 'assets/backgrounds/fishing_spot_1.png',
      levelReq: 1,
      fish: [
        { name: 'Raw Shrimp',   src: 'assets/objects/shrimp.png',   level: 1,  xp: 10,  duration: 5,  catchChance: 0.85 },
        { name: 'Raw Sardine',  src: 'assets/objects/sardine.png',  level: 1,  xp: 20,  duration: 10,  catchChance: 0.85 }
      ],
    },
    {
      name: 'Mainland Shores',
      background: 'assets/backgrounds/fishing_spot_1.png',
      levelReq: 1,
      fish: [
        { name: 'Raw Shrimp',   src: 'assets/objects/shrimp.png',   level: 1,  xp: 10,  duration: 5,  catchChance: 0.85 },
        { name: 'Raw Sardine',  src: 'assets/objects/sardine.png',  level: 1,  xp: 20,  duration: 10,  catchChance: 0.85 },
        { name: 'Raw Herring',  src: 'assets/objects/herring.png',  level: 10, xp: 30,  duration: 10, catchChance: 0.65 },
      ],
    },
    {
      name: 'Muddy Lake',
      background: 'assets/backgrounds/fishing_slot_2.png',
      levelReq: 20,
      fish: [
        { name: 'Raw Trout',  src: 'assets/objects/trout.png',  level: 20, xp: 50,  duration: 12, catchChance: 0.70 },
        { name: 'Raw Pike',   src: 'assets/objects/pike.png',   level: 25, xp: 60,  duration: 15, catchChance: 0.60 },
        { name: 'Raw Salmon', src: 'assets/objects/salmon.png', level: 30, xp: 70,  duration: 20, catchChance: 0.55 },
      ],
    },
    {
      name: 'Salty Cove',
      background: 'assets/backgrounds/fishing.png',
      levelReq: 35,
      fish: [
        { name: 'Raw Tuna',      src: 'assets/objects/tuna.png',      level: 35, xp: 80,  duration: 25, catchChance: 0.60,},
        { name: 'Raw Lobster',   src: 'assets/objects/lobster.png',   level: 40, xp: 90,  duration: 30, catchChance: 0.50 },
        { name: 'Raw Swordfish', src: 'assets/objects/swordfish.png', level: 50, xp: 100, duration: 45, catchChance: 0.40 },
      ],
    },
    {
      name: 'Deep Sea Dock',
      background: 'assets/backgrounds/fishing.png',
      levelReq: 62,
      fish: [
        { name: 'Raw Monkfish',   src: 'assets/objects/monkfish.png',   level: 62, xp: 120, duration: 55, catchChance: 0.45 },
        { name: 'Raw Shark',      src: 'assets/objects/shark.png',      level: 76, xp: 110, duration: 50, catchChance: 0.35 },
        { name: 'Raw Anglerfish', src: 'assets/objects/anglerfish.png', level: 82, xp: 150, duration: 90, catchChance: 0.30 },
      ],
    },
  ];

  readonly activeLocations = computed(() => {
    const spotName = this.locationService.current().activities.fishingSpot;
    return this.allLocations.filter(loc => spotName?.includes(loc.name));
  });
}
