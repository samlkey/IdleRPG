import { computed, effect, Injectable, inject, signal } from '@angular/core';
import { Quest, QuestStep, StepCondition } from '../shared/components/quest-card/quest-card.component';
import { SkillId, PlayerService } from './player.service';
import { NotificationService } from './notification.service';
import { ItemService } from './item.service';
import { QUESTS } from '../general/quests/quests.data';

function initQuests(): Quest[] {
  return QUESTS.map(q => ({
    ...q,
    steps: q.steps?.map(s => ({
      ...s,
      progress: hasQty(s.condition) ? (s.progress ?? 0) : undefined,
    })),
  }));
}

function hasQty(c: StepCondition | undefined): c is { type: 'gather' | 'skill-action'; qty: number } & StepCondition {
  return c?.type === 'gather' || c?.type === 'skill-action';
}

@Injectable({ providedIn: 'root' })
export class QuestService {
  private readonly playerService       = inject(PlayerService);
  private readonly notificationService = inject(NotificationService);
  private readonly itemService         = inject(ItemService);

  private readonly _quests = signal<Quest[]>(initQuests());
  readonly quests = this._quests.asReadonly();

  /** Set when a quest completes — consumed by the completion modal in GameComponent. */
  readonly completionModalQuest = signal<Quest | null>(null);

  dismissCompletionModal(): void {
    this.completionModalQuest.set(null);
  }

  readonly questPoints = computed(() =>
    this._quests().filter(q => q.status === 'completed').reduce((sum, q) => sum + q.questPoints, 0)
  );

  constructor() {
    // Watch inventory for 'have' conditions on the current active step only
    effect(() => {
      const inv = this.itemService.inventory();
      this._quests().forEach((quest, qi) => {
        if (quest.status !== 'in-progress') return;
        const si = quest.steps?.findIndex(s => !s.completed) ?? -1;
        if (si < 0) return;
        const step = quest.steps![si];
        if (step.condition?.type !== 'have') return;
        const c = step.condition;
        if (this.itemService.count(c.itemId) >= c.qty) {
          this.completeStep(qi, si);
        }
      });
    });
  }

  // ── Public event hooks (called by ActivityService / LocationService) ─────────

  /** Call after each item is added to inventory. Advances 'gather' steps. */
  onItemGained(itemId: string, qty: number): void {
    this.advanceQtyCondition('gather', q => q.itemId === itemId, qty);
  }

  /** Call after each successful activity cycle. Advances 'skill-action' steps. */
  onSkillAction(skillId: SkillId): void {
    this.advanceQtyCondition('skill-action', q => q.skillId === skillId, 1);
  }

  /** Call when the player travels to a new location. Advances 'location' steps. */
  onLocationChanged(locationId: string): void {
    this._quests().forEach((quest, qi) => {
      if (quest.status !== 'in-progress') return;
      const si = quest.steps?.findIndex(s => !s.completed) ?? -1;
      if (si < 0) return;
      const step = quest.steps![si];
      if (step.condition?.type === 'location' && (step.condition as any).locationId === locationId) {
        this.completeStep(qi, si);
      }
    });
  }

  /** Call when the player navigates to a tab. Advances 'navigation' steps */
  onNavigation(tabId: string): void {
    console.log('onNavigation', tabId);
    this._quests().forEach((quest, qi) => {
      if (quest.status !== 'in-progress') return;
      const si = quest.steps?.findIndex(s => !s.completed) ?? -1;
      if (si < 0) return;
      const step = quest.steps![si];
      if (step.condition?.type === 'navigation' && (step.condition as any).tab === tabId) {
        this.completeStep(qi, si);
      }
    });
  }

  /** Start a not-started quest. */
  startQuest(questId: string): void {
    const qi = this._quests().findIndex(q => q.id === questId);
    if (qi < 0 || this._quests()[qi].status !== 'not-started') return;
    this.updateQuest(qi, q => ({ ...q, status: 'in-progress' }));
  }

  // ── Internal ─────────────────────────────────────────────────────────────────

  private advanceQtyCondition(
    type: 'gather' | 'skill-action',
    matches: (c: any) => boolean,
    amount: number,
  ): void {
    this._quests().forEach((quest, qi) => {
      if (quest.status !== 'in-progress') return;
      const si = quest.steps?.findIndex(s => !s.completed) ?? -1;
      if (si < 0) return;

      const step = quest.steps![si];
      if (step.condition?.type !== type || !matches(step.condition)) return;

      const c    = step.condition as { qty: number };
      const next = Math.min((step.progress ?? 0) + amount, c.qty);

      this.updateStep(qi, si, s => ({ ...s, progress: next }));

      if (next >= c.qty) this.completeStep(qi, si);
    });
  }

  private completeStep(questIndex: number, stepIndex: number): void {
    this.updateStep(questIndex, stepIndex, s => ({ ...s, completed: true }));

    const quest = this._quests()[questIndex];
    const allDone = quest.steps?.every(s => s.completed) ?? true;
    if (allDone) this.completeQuest(questIndex);
  }

  private completeQuest(questIndex: number): void {
    const quest = this._quests()[questIndex];
    this.updateQuest(questIndex, q => ({ ...q, status: 'completed' }));

    if (this.playerService.trackedQuest()?.questId === quest.id) {
      this.playerService.trackedQuest.set(null);
    }

    // Apply rewards
    quest.rewards?.forEach(r => {
      if (r.type === 'skill') {
        this.playerService.addXp(r.skill, r.xp);
        this.notificationService.xp(r.xp, r.skill, r.icon);
      } else if (r.type === 'coins') {
        this.playerService.addGold(r.amount);
        this.notificationService.gold(r.amount);
      }
    });

    this.completionModalQuest.set(quest);
  }

  // ── Immutable update helpers ──────────────────────────────────────────────────

  private updateQuest(qi: number, fn: (q: Quest) => Quest): void {
    this._quests.update(qs => qs.map((q, i) => i === qi ? fn(q) : q));
  }

  private updateStep(qi: number, si: number, fn: (s: QuestStep) => QuestStep): void {
    this.updateQuest(qi, q => ({
      ...q,
      steps: q.steps!.map((s, i) => i === si ? fn(s) : s),
    }));
  }
}
