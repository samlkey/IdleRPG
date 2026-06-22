import { Injectable, inject, signal } from '@angular/core';
import { GameItem, ItemService } from './item.service';
import { NotificationService } from './notification.service';

export type PassiveSlotState = 'empty' | 'processing' | 'ready';

export interface PassiveSlot {
  id: string;
  state: PassiveSlotState;
  startedAt: number | null;
  inputItem: GameItem | null;
  outputItem: GameItem | null;
  duration: number;
  quantity: number;
}

export interface SlotMap {
  input: GameItem | undefined;
  output: GameItem | undefined;
  duration: number;
  quantity: number;
}

const TICK_MS = 1000;

@Injectable({ providedIn: 'root' })
export class PassiveService {
  private readonly itemService = inject(ItemService);
  private readonly notificationService = inject(NotificationService);

  private readonly _slots = signal<Record<string, PassiveSlot>>({});
  readonly slots = this._slots.asReadonly();

  private tickTimer: ReturnType<typeof setInterval> | null = null;

  slot(id: string): PassiveSlot {
    return (
      this._slots()[id] ?? {
        id,
        state: 'empty',
        startedAt: null,
        inputItem: null,
        outputItem: null,
        duration: 0,
        quantity: 0,
      }
    );
  }

  start(
    id: string,
    inputItem: GameItem,
    outputItem: GameItem,
    duration: number,
    quantity: number,
  ): void {
    if (!this.itemService.has(inputItem.id)) {
      this.notificationService.show({
        type: 'warning',
        message: `No ${inputItem.name}`,
        detail: 'Nothing to place',
      });
      return;
    }
    this.itemService.remove(inputItem.id, quantity);
    this._slots.update((slots) => ({
      ...slots,
      [id]: {
        id,
        state: 'processing',
        startedAt: Date.now(),
        inputItem,
        outputItem,
        duration,
        quantity,
      },
    }));
    this.ensureTimer();
  }

  collect(id: string): void {
    const slot = this._slots()[id];
    if (!slot || slot.state !== 'ready' || !slot.outputItem) return;
    this.itemService.add(slot.outputItem, slot.quantity);
    this.notificationService.item(
      slot.outputItem.name,
      slot.outputItem.icon,
      slot.quantity,
    );
    this._slots.update((slots) => ({
      ...slots,
      [id]: {
        ...slot,
        state: 'empty',
        startedAt: null,
        inputItem: null,
        outputItem: null,
      },
    }));
  }

  progressOf(id: string): number {
    const slot = this._slots()[id];
    if (!slot || slot.state !== 'processing' || slot.startedAt === null)
      return 0;
    return Math.min(
      ((Date.now() - slot.startedAt) / (slot.duration * 1000)) * 100,
      100,
    );
  }

  private ensureTimer(): void {
    if (this.tickTimer) return;
    this.tickTimer = setInterval(() => this.tick(), TICK_MS);
  }

  private tick(): void {
    const now = Date.now();
    const current = this._slots();
    const readyIds: string[] = [];
    let anyStillProcessing = false;

    for (const slot of Object.values(current)) {
      if (slot.state !== 'processing' || slot.startedAt === null) continue;
      if (now - slot.startedAt >= slot.duration * 1000) {
        readyIds.push(slot.id);
      } else {
        anyStillProcessing = true;
      }
    }

    if (readyIds.length) {
      this._slots.update((slots) => {
        const updated = { ...slots };
        for (const id of readyIds)
          updated[id] = { ...updated[id], state: 'ready' };
        return updated;
      });
      for (const id of readyIds) {
        const out = current[id]?.outputItem;
        if (out) {
          this.notificationService.show({
            type: 'success',
            message: `${out.name} ready!`,
            detail: 'Passive activity complete',
            icon: out.icon,
          });
        }
      }
    }

    if (!anyStillProcessing && !readyIds.length) {
      clearInterval(this.tickTimer!);
      this.tickTimer = null;
    }
  }
}
