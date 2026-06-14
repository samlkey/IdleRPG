import { Injectable, signal } from '@angular/core';

// Refactor this to read item.data.ts for all the assets instead of hardcoding them here. This will ensure that any new items added to item.data.ts will automatically be preloaded without needing to update this list manually.

const ASSETS: string[] = [
  // Backgrounds
  'assets/backgrounds/agility.png',
  'assets/backgrounds/construction.png',
  'assets/backgrounds/cooking.png',
  'assets/backgrounds/crafting.png',
  'assets/backgrounds/farming.png',
  'assets/backgrounds/firemaking.png',
  'assets/backgrounds/fishing.png',
  'assets/backgrounds/fishing_slot_2.png',
  'assets/backgrounds/fishing_spot_1.png',
  'assets/backgrounds/fletching.png',
  'assets/backgrounds/herblore.png',
  'assets/backgrounds/house.png',
  'assets/backgrounds/hunting.png',
  'assets/backgrounds/mining.png',
  'assets/backgrounds/shop.png',
  'assets/backgrounds/smithing.png',
  'assets/backgrounds/thieving.png',
  'assets/backgrounds/thieving_town_1.png',
  'assets/backgrounds/woodcutting.png',
  // Icons
  'assets/icons/agility.png',
  'assets/icons/attack.png',
  'assets/icons/bank.png',
  'assets/icons/construction.png',
  'assets/icons/cooking.png',
  'assets/icons/crafting.png',
  'assets/icons/defence.png',
  'assets/icons/farming.png',
  'assets/icons/firemaking.png',
  'assets/icons/fishing.png',
  'assets/icons/fletching.png',
  'assets/icons/herblore.png',
  'assets/icons/hitpoints.png',
  'assets/icons/house.png',
  'assets/icons/hunter.png',
  'assets/icons/magic.png',
  'assets/icons/mining.png',
  'assets/icons/prayer.png',
  'assets/icons/quests.png',
  'assets/icons/ranged.png',
  'assets/icons/settings.png',
  'assets/icons/shop.png',
  'assets/icons/slayer.png',
  'assets/icons/smithing.png',
  'assets/icons/strength.png',
  'assets/icons/thieving.png',
  'assets/icons/woodcutting.png',
  // Objects
  'assets/objects/adamant_ore.png',
  'assets/objects/anglerfish.png',
  'assets/objects/burnt_shrimp.png',
  'assets/objects/coal.png',
  'assets/objects/cooked_shrimp.png',
  'assets/objects/copper_ore.png',
  'assets/objects/farmer.png',
  'assets/objects/food_stall.png',
  'assets/objects/fur_stall.png',
  'assets/objects/gem_stall.png',
  'assets/objects/guard.png',
  'assets/objects/herring.png',
  'assets/objects/iron_ore.png',
  'assets/objects/lobster.png',
  'assets/objects/magic_tree.png',
  'assets/objects/man.png',
  'assets/objects/map.png',
  'assets/objects/maple_tree.png',
  'assets/objects/mithril_ore.png',
  'assets/objects/monkfish.png',
  'assets/objects/normal_log.png',
  'assets/objects/normal_seed.png',
  'assets/objects/oak_tree.png',
  'assets/objects/pike.png',
  'assets/objects/runite_ore.png',
  'assets/objects/salmon.png',
  'assets/objects/sardine.png',
  'assets/objects/shark.png',
  'assets/objects/shrimp.png',
  'assets/objects/silk_stall.png',
  'assets/objects/swordfish.png',
  'assets/objects/tin_ore.png',
  'assets/objects/tree.png',
  'assets/objects/trout.png',
  'assets/objects/tuna.png',
  'assets/objects/willow_tree.png',
  'assets/objects/woman.png',
  'assets/objects/yew_tree.png',
  'assets/objects/bronze_bar.png',
  'assets/objects/tomato.png',
  // Quests
  'assets/quests/dragon_slayer.png',
];

@Injectable({ providedIn: 'root' })
export class PreloadService {
  readonly progress = signal(0);
  readonly done     = signal(false);

  preload(): void {
    this.progress.set(0);
    this.done.set(false);

    const total = ASSETS.length;
    if (total === 0) { this.done.set(true); return; }

    let loaded = 0;
    const onSettle = () => {
      loaded++;
      this.progress.set(loaded / total);
      if (loaded >= total) this.done.set(true);
    };

    for (const src of ASSETS) {
      const img = new Image();
      img.onload  = onSettle;
      img.onerror = onSettle; // still advance on broken paths
      img.src     = src;
    }
  }
}
