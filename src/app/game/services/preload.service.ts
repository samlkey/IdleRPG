import { Injectable, signal } from '@angular/core';
import { ITEMS } from '../data/item.data';
import { QUESTS } from '../data/quests.data';
import { LOCATIONS } from '../data/location.data';
import { SKILL_IDS } from './player.service';

// TODO: Refactor this to read item.data.ts for all the assets instead of hardcoding them here. This will ensure that any new items added to item.data.ts will automatically be preloaded without needing to update this list manually.

@Injectable({ providedIn: 'root' })
export class PreloadService {
  readonly progress = signal(0);
  readonly done = signal(false);

  preload(): void {
    this.progress.set(0);
    this.done.set(false);

    const ASSETS = this.constructAssets();

    console.log(`Preloading`, ASSETS);

    const total = ASSETS.length;
    if (total === 0) {
      this.done.set(true);
      return;
    }

    let loaded = 0;
    const onSettle = () => {
      loaded++;
      this.progress.set(loaded / total);
      if (loaded >= total) this.done.set(true);
    };

    for (const src of ASSETS) {
      const img = new Image();
      img.onload = onSettle;
      img.onerror = onSettle; // still advance on broken paths
      img.src = src;
    }
  }

  constructAssets(): string[] {
    const itemAssets = ITEMS.map((item) => item.icon);

    const questAssets = QUESTS.flatMap((quest) => {
      const icons: string[] = [];
      if (quest.icon) icons.push(quest.icon);
      for (const step of quest.steps ?? []) {
        for (const task of step.tasks ?? []) {
          if (task.icon) icons.push(task.icon);
        }
      }
      for (const reward of quest.rewards ?? []) {
        if ('icon' in reward && reward.icon) icons.push(reward.icon);
      }
      return icons;
    });

    const locationAssets = LOCATIONS.map((location) => location.background);

    const skillIconAssets = SKILL_IDS.map((id) => `assets/icons/${id}.png`);

    return Array.from(
      new Set([
        ...itemAssets,
        ...questAssets,
        ...locationAssets,
        ...skillIconAssets,
      ]),
    );
  }
}
