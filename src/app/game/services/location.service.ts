import { inject, Injectable, signal } from '@angular/core';
import { ActivityService } from './activity.service';
import { QuestService } from './quest.service';
import { WORLDS } from '../data/world.data';
import { Monster } from './monster.service';

export interface LocationActivities {
  woodcutting?: string[];
  mining?: string[];
  fishingSpot?: string[];
  thievingArea?: string[];
  agilityCourse?: string[];
  farming?: Record<string, number>;
  quests?: string[];
}

export interface GameLocation {
  id: string;
  name: string;
  description: string;
  background: string;
  travelReq: number;
  activities: LocationActivities;
  monsters?: string[];
  killReq?: number;
  x: number;
  y: number;
  connections: string[];
}

export interface World {
  id: string;
  locations: GameLocation[];
}

@Injectable({ providedIn: 'root' })
export class LocationService {
  private readonly _current = signal<GameLocation>(WORLDS[0].locations[0]);
  private readonly activityService = inject(ActivityService);
  private readonly questService = inject(QuestService);

  readonly current = this._current.asReadonly();

  travelTo(location: GameLocation): void {
    this.activityService.stop();
    this._current.set(location);
    this.questService.onLocationChanged(location.id);
  }

  hasActivity(skill: keyof LocationActivities): boolean {
    const acts = this._current().activities;
    if (skill === 'fishingSpot') return !!acts.fishingSpot;
    if (skill === 'thievingArea') return !!acts.thievingArea;
    return (acts[skill]?.length ?? 0) > 0;
  }
}
