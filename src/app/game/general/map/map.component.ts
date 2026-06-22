import { Component, inject, input, signal } from '@angular/core';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { LocationService, GameLocation } from '../../services/location.service';
import { WORLDS } from '../../data/world.data';
import { PlayerService } from '../../services/player.service';

interface MapEdge {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  fromId: string;
  toId: string;
}

@Component({
  selector: 'app-map',
  imports: [ModalComponent],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss',
})
export class MapComponent {
  pixelIcon = input<string>('');
  helpOpen = signal(false);
  readonly selected = signal<GameLocation | null>(null);

  readonly locationService = inject(LocationService);
  readonly playerService = inject(PlayerService);

  readonly locations = WORLDS[0].locations;

  readonly edges: MapEdge[] = (() => {
    const seen = new Set<string>();
    const result: MapEdge[] = [];
    for (const loc of WORLDS[0].locations) {
      for (const connId of loc.connections) {
        const key = [loc.id, connId].sort().join('|');
        if (!seen.has(key)) {
          seen.add(key);
          const other = WORLDS[0].locations.find((l) => l.id === connId);
          if (other) {
            result.push({
              x1: loc.x,
              y1: loc.y,
              x2: other.x,
              y2: other.y,
              fromId: loc.id,
              toId: connId,
            });
          }
        }
      }
    }
    return result;
  })();

  canTravel(location: GameLocation): boolean {
    if (location.travelReq <= 1) return true;
    const skills = this.playerService.player().skills;
    return Object.values(skills).some((s) => s.level >= location.travelReq);
  }

  isCurrent(location: GameLocation): boolean {
    return this.locationService.current().id === location.id;
  }

  isSelected(location: GameLocation): boolean {
    return this.selected()?.id === location.id;
  }

  selectNode(location: GameLocation): void {
    this.selected.set(location);
  }

  travel(location: GameLocation): void {
    if (this.canTravel(location)) {
      this.locationService.travelTo(location);
    }
  }

  activitySummary(location: GameLocation): string[] {
    const acts = location.activities;
    const lines: string[] = [];
    if (acts.woodcutting?.length)
      lines.push(`Woodcutting: ${acts.woodcutting.join(', ')}`);
    if (acts.mining?.length) lines.push(`Mining: ${acts.mining.join(', ')}`);
    if (acts.fishingSpot?.length)
      lines.push(`Fishing: ${acts.fishingSpot.join(', ')}`);
    if (acts.thievingArea?.length)
      lines.push(`Thieving: ${acts.thievingArea.join(', ')}`);
    return lines;
  }
}
