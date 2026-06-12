import { Injectable, signal, computed, inject } from '@angular/core';
import { NotificationService } from './notification.service';
import { ItemService } from './item.service';

// ── Skill IDs ────────────────────────────────────────────────────────────────

export type SkillId =
  | 'attack' | 'strength' | 'defence' | 'ranged' | 'magic'
  | 'prayer' | 'hitpoints' | 'slayer'
  | 'mining' | 'woodcutting' | 'fishing' | 'firemaking' | 'farming'
  | 'cooking' | 'smithing' | 'agility' | 'herblore' | 'thieving'
  | 'crafting' | 'fletching' | 'hunter' | 'construction';

// ── XP table (OSRS — total XP required to reach each level) ─────────────────

export const XP_TABLE: readonly number[] = [
  0, 83, 174, 276, 388, 512, 650, 801, 969, 1154,
  1358, 1584, 1833, 2107, 2411, 2746, 3115, 3523, 3973, 4470,
  5018, 5624, 6291, 7028, 7842, 8740, 9730, 10824, 12031, 13363,
  14833, 16456, 18247, 20224, 22406, 24815, 27473, 30408, 33648, 37224,
  41171, 45529, 50339, 55649, 61512, 67983, 75127, 83014, 91721, 101333,
  111945, 123660, 136594, 150872, 166636, 184040, 203254, 224466, 247886, 273742,
  302288, 333804, 368599, 407015, 449428, 496254, 547953, 605032, 668051, 737627,
  814445, 899257, 992895, 1096278, 1210421, 1336443, 1475581, 1629200, 1798808, 1986068,
  2192818, 2421087, 2673114, 2951373, 3258594, 3597792, 3972294, 4385776, 4842295, 5346332,
  5902831, 6517253, 7195629, 7944614, 8771558, 9684577, 10692629, 11805606, 13034431,
];

/** XP needed to go from `level` to `level + 1` (1-indexed, max 98). */
export function xpToNextLevel(level: number): number {
  if (level >= 99) return 0;
  return XP_TABLE[level] - XP_TABLE[level - 1];
}

/** Derive level from total accumulated XP. */
export function levelFromXp(xp: number): number {
  let level = 1;
  for (let i = 1; i < XP_TABLE.length; i++) {
    if (xp >= XP_TABLE[i]) level = i + 1;
    else break;
  }
  return Math.min(level, 99);
}

// ── Data interfaces ──────────────────────────────────────────────────────────

export interface SkillData {
  /** Current level (1–99). */
  level: number;
  /** Total accumulated XP. */
  xp: number;
  /** XP remaining to reach the next level (0 at level 99). */
  xpToNext: number;
  /** XP earned within the current level. */
  xpIntoLevel: number;
  /** Total XP span of the current level (xpIntoLevel + xpToNext). */
  xpForLevel: number;
}

export interface TrackedQuest {
  questId: string;
  questName: string;
  stepAction: string;
  stepIcon?: string;
}

export interface Equipment {
  axe: string;
  pickaxe: string;
  rod: string;
}

export interface PlayerData {
  name: string;
  combatLevel: number;
  hp: number;
  maxHp: number;
  questPoints: number;
  houseLevel: number;
  /** Maximum number of distinct item stacks the bank can hold. */
  bankCapacity: number;
  gold: number;
  /** 0–1 probability of a crit window opening per activity cycle */
  critChance: number;
  equipment: Equipment;
  skills: Record<SkillId, SkillData>;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeSkill(xp = 0): SkillData {
  const level       = levelFromXp(xp);
  const xpAtLevel   = XP_TABLE[level - 1];
  const xpForLevel  = level < 99 ? XP_TABLE[level] - xpAtLevel : 1;
  const xpIntoLevel = xp - xpAtLevel;
  return { level, xp, xpToNext: xpToNextLevel(level), xpIntoLevel, xpForLevel };
}

const INITIAL_PLAYER: PlayerData = {
  name: 'Aldric',
  combatLevel: 32,
  hp: 100,
  maxHp: 100,
  questPoints: 0,
  houseLevel: 1,
  bankCapacity: 500,
  gold: 100,
  critChance: 0.1,
  equipment: {
    axe: 'Iron',
    pickaxe: 'Iron',
    rod: 'Fly Fishing Rod',
  },
  skills: {
    attack:       makeSkill(),
    strength:     makeSkill(),
    defence:      makeSkill(),
    ranged:       makeSkill(),
    magic:        makeSkill(),
    prayer:       makeSkill(),
    hitpoints:    makeSkill(1154), // starts at level 10
    slayer:       makeSkill(),
    mining:       makeSkill(),
    woodcutting:  makeSkill(),
    fishing:      makeSkill(),
    firemaking:   makeSkill(),
    farming:      makeSkill(),
    cooking:      makeSkill(),
    smithing:     makeSkill(),
    agility:      makeSkill(),
    herblore:     makeSkill(),
    thieving:     makeSkill(),
    crafting:     makeSkill(),
    fletching:    makeSkill(),
    hunter:       makeSkill(),
    construction: makeSkill(),
  },
};

// ── Service ──────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class PlayerService {

  private readonly notificationService = inject(NotificationService);
  readonly itemService = inject(ItemService);
  private readonly _player = signal<PlayerData>(INITIAL_PLAYER);

  /** Full reactive player snapshot (read-only). */
  readonly player = this._player.asReadonly();

  /** HP as a 0–100 percentage. */
  readonly hpPercent = computed(() =>
    Math.round((this._player().hp / this._player().maxHp) * 100)
  );

  /** Total level (sum of all skill levels). */
  readonly totalLevel = computed(() =>
    Object.values(this._player().skills).reduce((sum, s) => sum + s.level, 0)
  );

  /** Bank usage as "used/capacity" — consumed by the sidebar badge. */
  readonly bankSpace = computed(() =>
    `${this.itemService.bankCount()}/${this._player().bankCapacity}`
  );

  // ── Skill accessors ────────────────────────────────────────────────────────

  /** Reactive snapshot of a single skill. */
  skill(id: SkillId): SkillData {
    return this._player().skills[id];
  }

  /** Sidebar badge string for a skill — e.g. "43/99". */
  skillBadge(id: SkillId): string {
    return `${this._player().skills[id].level}/99`;
  }

  // ── Mutators ───────────────────────────────────────────────────────────────

  /** Add XP to a skill and recalculate level + xpToNext. */
  addXp(id: SkillId, amount: number): void {
    this._player.update(p => {
      const current  = p.skills[id];
      const newXp    = current.xp + amount;
      const newLevel = Math.min(levelFromXp(newXp), 99);
      if (newLevel > current.level) {
        const skillName = id.charAt(0).toUpperCase() + id.slice(1);
        this.notificationService.show({
          type: 'levelup',
          message: `Level ${newLevel}!`,
          detail: skillName,
          icon: `assets/icons/${id}.png`,
        }, 5000);
        this.notificationService.levelUpEvent.set({ skill: skillName, level: newLevel });
      }
      return {
        ...p,
        skills: {
          ...p.skills,
          [id]: (() => {
            const xpAtLevel  = XP_TABLE[newLevel - 1];
            const xpForLevel = newLevel < 99 ? XP_TABLE[newLevel] - xpAtLevel : 1;
            return { level: newLevel, xp: newXp, xpToNext: xpToNextLevel(newLevel), xpIntoLevel: newXp - xpAtLevel, xpForLevel };
          })(),
        },
      };
    });
  }

  /** Directly set a skill's level (sets XP to the minimum for that level). */
  setLevel(id: SkillId, level: number): void {
    const clampedLevel = Math.max(1, Math.min(99, level));
    const xp = XP_TABLE[clampedLevel - 1];
    this._player.update(p => ({
      ...p,
      skills: {
        ...p.skills,
        [id]: { level: clampedLevel, xp, xpToNext: xpToNextLevel(clampedLevel) },
      },
    }));
  }

  /** Update player character info (name, hp, combatLevel, etc.). */
  updateCharacter(patch: Partial<Omit<PlayerData, 'skills' | 'equipment'>>): void {
    this._player.update(p => ({ ...p, ...patch }));
  }

  /** Reduce HP by amount, clamped to 0. */
  takeDamage(amount: number): void {
    this._player.update(p => ({ ...p, hp: Math.max(0, p.hp - amount) }));
  }

  addGold(amount: number): void {
    this._player.update(p => ({ ...p, gold: p.gold + amount }));
  }

  /** Update a single equipment slot. */
  updateEquipment(patch: Partial<Equipment>): void {
    this._player.update(p => ({ ...p, equipment: { ...p.equipment, ...patch } }));
  }

  // ── Active activity ────────────────────────────────────────────────────────

  /** Name of the currently running activity, or null if idle. */
  readonly mainActivity = signal<string | null>(null);
  /** Skill panel that owns the current activity, or null if idle. */
  readonly mainActivitySkill = signal<SkillId | null>(null);

  setMainActivity(name: string | null, skillId?: SkillId | null): void {
    this.mainActivity.set(name);
    this.mainActivitySkill.set(name ? (skillId ?? null) : null);
  }

  // ── Quest tracking ─────────────────────────────────────────────────────────

  readonly trackedQuest = signal<TrackedQuest | null>(null);

  trackQuest(info: TrackedQuest | null): void {
    this.trackedQuest.set(info);
  }

  // ── Dialog seen state ──────────────────────────────────────────────────────

  /** Keys are `questId:stepIndex`. Persisted for the session so dialogs don't replay. */

  /** TODO: Might be best to refactor into a dialog service */
  private readonly _seenDialogs = signal<Set<string>>(new Set());

  isDialogSeen(questId: string, stepIndex: number): boolean {
    return this._seenDialogs().has(`${questId}:${stepIndex}`);
  }

  markDialogSeen(questId: string, stepIndex: number): void {
    this._seenDialogs.update(s => new Set(s).add(`${questId}:${stepIndex}`));
  }

  clearDialogSeen(questId: string, stepIndex: number): void {
    this._seenDialogs.update(s => { const n = new Set(s); n.delete(`${questId}:${stepIndex}`); return n; });
  }

  /** Set to a quest ID to request that quest be expanded in the UI. Consumers should clear it after acting. */
  readonly expandQuestId = signal<string | null>(null);

  requestExpandQuest(id: string): void {
    this.expandQuestId.set(id);
  }

  clearExpandQuest(): void {
    this.expandQuestId.set(null);
  }
}
