import { Injectable, signal } from '@angular/core';

export type NotificationType = 'xp' | 'info' | 'success' | 'warning' | 'levelup' | 'gold';

export interface Notification {
  id: number;
  type: NotificationType;
  message: string;
  /** Optional sub-label shown smaller below message */
  detail?: string;
  /** Icon URL or emoji */
  icon?: string;
}

let nextId = 0;
const DEFAULT_DURATION_MS = 3000;

@Injectable({ providedIn: 'root' })
export class NotificationService {
  readonly notifications  = signal<Notification[]>([]);
  /** Fires on every level-up — { skill, level }. Components react to trigger animations. */
  readonly levelUpEvent   = signal<{ skill: string; level: number } | null>(null);

  show(options: Omit<Notification, 'id'>, durationMs = DEFAULT_DURATION_MS): void {
    console.log(`Showing notification: ${options.type} - ${options.message}`);
    const notif: Notification = { id: nextId++, ...options };
    this.notifications.update(n => [...n, notif]);
    setTimeout(() => this.dismiss(notif.id), durationMs);
  }

  xp(amount: number, skillName: string, iconUrl?: string): void {
    this.show({ type: 'xp', message: `+${amount} XP`, detail: skillName, icon: iconUrl });
  }

  gold(amount: number): void {
    this.show({ type: 'gold', message: `+${amount} GP`, detail: 'Gold', icon: '🪙' });
  }

  item(itemName: string, icon?: string, qty = 1): void {
    this.show({ type: 'success', message: `${qty}x ${itemName}`, detail: 'Item obtained', icon });
  }

  dismiss(id: number): void {
    this.notifications.update(n => n.filter(x => x.id !== id));
  }
}
