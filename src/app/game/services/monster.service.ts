import { Injectable } from '@angular/core';
import { MONSTERS } from '../data/monster.data';

export interface Monster {
  id: string;
  name: string;
  description: string;
  icon: string;
  level: number;
  stats: Stats;
  drops: { itemId: string; chance: number; qty?: number }[];
}

export interface Stats {
  health: number;
  attack: number;
  strength: number;
  defense: number;
  ranged: number;
  magic: number;
}

@Injectable({ providedIn: 'root' })
export class MonsterService {
  searchItemById(monsterId: Monster['id']): Monster | undefined {
    return MONSTERS.find((monster) => monster.id === monsterId);
  }
}
