import { computed, effect, Injectable, inject, signal } from '@angular/core';
import {
  Quest,
  QuestStep,
  QuestTask,
  StepCondition,
} from '../shared/components/quest-card/quest-card.component';
import { SkillId, PlayerService } from './player.service';
import { NotificationService } from './notification.service';
import { ItemService } from './item.service';
import { QUESTS } from '../data/quests.data';

function initQuests(): Quest[] {
  return QUESTS.map((q) => ({
    ...q,
    steps: q.steps?.map((s) => ({
      ...s,
      completed: s.completed ?? false,
      tasks: s.tasks.map((t) => ({
        ...t,
        completed: t.completed ?? false,
        progress: hasQty(t.condition) ? (t.progress ?? 0) : undefined,
      })),
    })),
  }));
}

function hasQty(
  c: StepCondition | undefined,
): c is { type: 'gather' | 'skill-action'; qty: number } & StepCondition {
  return c?.type === 'gather' || c?.type === 'skill-action';
}

@Injectable({ providedIn: 'root' })
export class QuestService {
  private readonly playerService = inject(PlayerService);
  private readonly notificationService = inject(NotificationService);
  private readonly itemService = inject(ItemService);

  private readonly _quests = signal<Quest[]>(initQuests());
  readonly quests = this._quests.asReadonly();

  /** Set when a quest completes — consumed by the completion modal in GameComponent. */
  readonly completionModalQuest = signal<Quest | null>(null);

  dismissCompletionModal(): void {
    this.completionModalQuest.set(null);
  }

  readonly questPoints = computed(() =>
    this._quests()
      .filter((q) => q.status === 'completed')
      .reduce((sum, q) => sum + q.questPoints, 0),
  );

  constructor() {
    // Watch inventory for 'have' conditions on tasks in the current active step
    effect(() => {
      const inv = this.itemService.inventory();
      this._quests().forEach((quest, qi) => {
        if (quest.status !== 'in-progress') return;
        const si =
          quest.steps?.findIndex((s) => !s.completed && !s.readyToAdvance) ?? -1;
        if (si < 0) return;
        const step = quest.steps![si];

        let anyUpdated = false;
        const newTasks = step.tasks.map((task) => {
          if (task.completed) return task;
          const c = task.condition;
          if (c?.type !== 'have') return task;
          if (this.itemService.count(c.itemId) >= c.qty) {
            anyUpdated = true;
            return { ...task, completed: true };
          }
          return task;
        });

        if (!anyUpdated) return;
        this.updateStep(qi, si, (s) => ({ ...s, tasks: newTasks }));
        if (newTasks.every((t) => t.completed)) this.readyStep(qi, si);
      });
    });
  }

  // ── Public event hooks (called by ActivityService / LocationService) ─────────

  /** Call after each item is added to inventory. Advances 'gather' steps. */
  onItemGained(itemId: string, qty: number): void {
    this.advanceQtyCondition('gather', (q) => q.itemId === itemId, qty);
  }

  /** Call after each successful activity cycle. Advances 'skill-action' steps. */
  onSkillAction(skillId: SkillId): void {
    this.advanceQtyCondition('skill-action', (q) => q.skillId === skillId, 1);
  }

  /** Call when the player travels to a new location. Completes matching 'location' tasks. */
  onLocationChanged(locationId: string): void {
    this._quests().forEach((quest, qi) => {
      if (quest.status !== 'in-progress') return;
      const si =
        quest.steps?.findIndex((s) => !s.completed && !s.readyToAdvance) ?? -1;
      if (si < 0) return;
      const step = quest.steps![si];

      let anyUpdated = false;
      const newTasks = step.tasks.map((task) => {
        if (task.completed) return task;
        const c = task.condition;
        if (c?.type !== 'location' || c.locationId !== locationId) return task;
        anyUpdated = true;
        return { ...task, completed: true };
      });

      if (!anyUpdated) return;
      this.updateStep(qi, si, (s) => ({ ...s, tasks: newTasks }));
      if (newTasks.every((t) => t.completed)) this.readyStep(qi, si);
    });
  }

  /** Call when the player navigates to a tab. Completes matching 'navigation' tasks. */
  onNavigation(tabId: string): void {
    this._quests().forEach((quest, qi) => {
      if (quest.status !== 'in-progress') return;
      const si =
        quest.steps?.findIndex((s) => !s.completed && !s.readyToAdvance) ?? -1;
      if (si < 0) return;
      const step = quest.steps![si];

      let anyUpdated = false;
      const newTasks = step.tasks.map((task) => {
        if (task.completed) return task;
        const c = task.condition;
        if (c?.type !== 'navigation' || c.tab !== tabId) return task;
        anyUpdated = true;
        return { ...task, completed: true };
      });

      if (!anyUpdated) return;
      this.updateStep(qi, si, (s) => ({ ...s, tasks: newTasks }));
      if (newTasks.every((t) => t.completed)) this.readyStep(qi, si);
    });
  }

  /** Start a not-started quest. */
  startQuest(questId: string): void {
    const qi = this._quests().findIndex((q) => q.id === questId);
    if (qi < 0 || this._quests()[qi].status !== 'not-started') return;
    this.updateQuest(qi, (q) => ({ ...q, status: 'in-progress' }));
  }

  // ── Internal ─────────────────────────────────────────────────────────────────

  private advanceQtyCondition(
    type: 'gather' | 'skill-action',
    matches: (c: any) => boolean,
    amount: number,
  ): void {
    this._quests().forEach((quest, qi) => {
      if (quest.status !== 'in-progress') return;
      const si =
        quest.steps?.findIndex((s) => !s.completed && !s.readyToAdvance) ?? -1;
      if (si < 0) return;

      const step = quest.steps![si];
      let anyUpdated = false;

      const newTasks = step.tasks.map((task) => {
        if (task.completed) return task;
        const c = task.condition;
        if (c?.type !== type || !matches(c)) return task;
        if (c.type === 'gather' || c.type === 'skill-action') {
          const newProg = Math.min((task.progress ?? 0) + amount, c.qty);
          anyUpdated = true;
          return { ...task, progress: newProg, completed: newProg >= c.qty };
        }
        return task;
      });

      if (!anyUpdated) return;

      this.updateStep(qi, si, (s) => ({ ...s, tasks: newTasks }));
      if (newTasks.every((t) => t.completed)) this.readyStep(qi, si);
    });
  }

  /** Mark a step's condition as satisfied — player must click Continue to proceed. */
  private readyStep(questIndex: number, stepIndex: number): void {
    this.updateStep(questIndex, stepIndex, (s) => ({
      ...s,
      readyToAdvance: true,
    }));
  }

  /** Called by the Continue button in the quest card. */
  advanceStep(questId: string, stepIndex: number): void {
    const qi = this._quests().findIndex((q) => q.id === questId);
    if (qi < 0) return;
    this.completeStep(qi, stepIndex);
  }

  private completeStep(questIndex: number, stepIndex: number): void {
    this.updateStep(questIndex, stepIndex, (s) => ({
      ...s,
      completed: true,
      readyToAdvance: false,
      // Mark all tasks completed for visual consistency on the completed step row
      tasks: s.tasks.map((t) => ({ ...t, completed: true })),
    }));

    const quest = this._quests()[questIndex];
    const allDone = quest.steps?.every((s) => s.completed) ?? true;
    if (allDone) this.completeQuest(questIndex);
  }

  private completeQuest(questIndex: number): void {
    const quest = this._quests()[questIndex];
    this.updateQuest(questIndex, (q) => ({ ...q, status: 'completed' }));

    if (this.playerService.trackedQuest()?.questId === quest.id) {
      this.playerService.trackedQuest.set(null);
    }

    // Apply rewards
    quest.rewards?.forEach((r) => {
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
    this._quests.update((qs) => qs.map((q, i) => (i === qi ? fn(q) : q)));
  }

  private updateStep(
    qi: number,
    si: number,
    fn: (s: QuestStep) => QuestStep,
  ): void {
    this.updateQuest(qi, (q) => ({
      ...q,
      steps: q.steps!.map((s, i) => (i === si ? fn(s) : s)),
    }));
  }

  getQuestStatus(questId: string): Quest['status'] | undefined {
    return this._quests().find((q) => q.id === questId)?.status;
  }
}
