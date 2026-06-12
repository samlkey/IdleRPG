import { Component, inject, input, signal } from '@angular/core';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { LocationService, GameLocation, LOCATIONS } from '../../services/location.service';
import { PlayerService } from '../../services/player.service';

@Component({
  selector: 'app-map',
  imports: [ModalComponent],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss'
})
export class MapComponent {
  pixelIcon = input<string>('');
  helpOpen  = signal(false);

  readonly locationService = inject(LocationService);
  readonly playerService   = inject(PlayerService);

  readonly locations = LOCATIONS;

  canTravel(location: GameLocation): boolean {
    if (location.travelReq <= 1) return true;
    const skills = this.playerService.player().skills;
    return Object.values(skills).some(s => s.level >= location.travelReq);
  }

  isCurrent(location: GameLocation): boolean {
    return this.locationService.current().id === location.id;
  }

  travel(location: GameLocation): void {
    if (this.canTravel(location)) {
      this.locationService.travelTo(location);
    }
  }

  activitySummary(location: GameLocation): string[] {
    const acts = location.activities;
    const lines: string[] = [];
    if (acts.woodcutting?.length) lines.push(`Woodcutting: ${acts.woodcutting.join(', ')}`);
    if (acts.mining?.length)      lines.push(`Mining: ${acts.mining.join(', ')}`);
    if (acts.fishingSpot)         lines.push(`Fishing: ${acts.fishingSpot}`);
    if (acts.thievingArea)        lines.push(`Thieving: ${acts.thievingArea}`);
    return lines;
  }
}
