import { computed, Injectable, signal } from '@angular/core';

export interface GameItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'resource' | 'consumable' | 'equipment' | 'pet' | 'misc';
  subType?: string;
  levelReq?: number | null;
  value?: number;
}

export interface DropTable {
  id: string;
  name: string;
  drops: { item: GameItem; chance: number; qty?: number }[];
}

export type Inventory = Record<GameItem['id'], { item: GameItem; qty: number }>;

@Injectable({ providedIn: 'root' })
export class ItemService {
  private readonly _inventory = signal<Inventory>({});

  readonly inventory = this._inventory.asReadonly();

  readonly bankCount = computed(() => Object.keys(this._inventory()).length);

  add(item: GameItem, qty = 1): void {
    this._inventory.update(inv => ({
      ...inv,
      [item.id]: { item, qty: (inv[item.id]?.qty ?? 0) + qty },
    }));
  }

  remove(itemId: GameItem['id'], qty = 1): void {
    this._inventory.update(inv => {
      const entry = inv[itemId];
      if (!entry) return inv;
      const next = entry.qty - qty;
      const updated = { ...inv };
      if (next <= 0) delete updated[itemId];
      else updated[itemId] = { ...entry, qty: next };
      return updated;
    });
  }

  count(itemId: GameItem['id']): number {
    return this._inventory()[itemId]?.qty ?? 0;
  }

  has(itemId: GameItem['id'], qty = 1): boolean {
    return this.count(itemId) >= qty;
  }
}
