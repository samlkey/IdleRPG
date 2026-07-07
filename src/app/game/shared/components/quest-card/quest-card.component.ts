import {
  Component,
  effect,
  inject,
  input,
  output,
  signal,
  OnDestroy,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { PlayerService, SkillId } from '../../../services/player.service';
import { QuestService } from '../../../services/quest.service';

// ── Step condition ────────────────────────────────────────────────────────────

export type StepCondition =
  | { type: 'gather'; skillId: SkillId; itemId: string; qty: number }
  | { type: 'navigation'; tab: string }
  | { type: 'skill-action'; skillId: SkillId; qty: number }
  | { type: 'location'; locationId: string }
  | { type: 'have'; itemId: string; qty: number }
  | { type: 'manual' };

// ── Requirement types ─────────────────────────────────────────────────────────

export interface SkillRequirement {
  type: 'skill';
  skill: SkillId;
  level: number;
  icon: string;
}

export interface QuestRequirement {
  type: 'quest';
  questId: string;
  questName: string;
}

export type QuestReq = SkillRequirement | QuestRequirement;

// ── Dialog ────────────────────────────────────────────────────────────────────

export interface DialogLine {
  speaker: string;
  /** Optional portrait shown next to the speaker name */
  speakerIcon?: string;
  text: string;
}

// ── Step ──────────────────────────────────────────────────────────────────────

export interface QuestStep {
  stepIndex: number;
  completed: boolean;
  readyToAdvance?: boolean;
  /** Optional dialog sequence shown when the step becomes active */
  dialog?: DialogLine[];
  tasks: QuestTask[];
}

export interface QuestTask {
  /** Verb + qty prefix, e.g. "Cut 5" or "Navigate to" */
  action: string;
  /** Item / target name shown after the icon, e.g. "Normal Logs" or "Bank" */
  description: string;
  /** Icon representing the target item or skill */
  icon?: string;
  /** Condition that marks this task complete */
  condition?: StepCondition;
  /** Current progress toward a qty-based condition */
  progress?: number;
  completed: boolean;
}

// ── Quest status ──────────────────────────────────────────────────────────────

export type QuestStatus = 'not-started' | 'in-progress' | 'completed';

// ── Reward types ──────────────────────────────────────────────────────────────

export interface SkillXpReward {
  type: 'skill';
  skill: SkillId;
  icon: string;
  xp: number;
}

export interface CoinReward {
  type: 'coins';
  amount: number;
}

export interface UnlockReward {
  type: 'unlock';
  /** The nav panel id that gets unlocked */
  tab: string;
  /** Human-readable label e.g. "House" */
  label: string;
  /** Optional icon path */
  icon?: string;
}

export interface LocationReward {
  type: 'location';
  locationId: string;
  label: string;
  icon?: string;
}

export type QuestReward =
  | SkillXpReward
  | CoinReward
  | UnlockReward
  | LocationReward;

// ── Quest data ────────────────────────────────────────────────────────────────

export interface Quest {
  id: string;
  name: string;
  description: string;
  /** Flavour text shown in the completion modal */
  completionText?: string;
  icon?: string;
  questPoints: number;
  status: QuestStatus;
  requirements: QuestReq[];
  rewards?: QuestReward[];
  steps?: QuestStep[];
}

const TYPING_SPEED_MS = 22;

@Component({
  selector: 'app-quest-card',
  imports: [DecimalPipe],
  templateUrl: './quest-card.component.html',
  styleUrl: './quest-card.component.scss',
})
export class QuestCardComponent implements OnDestroy {
  quest = input.required<Quest>();
  selected = output<Quest>();

  readonly playerService = inject(PlayerService);
  readonly questService = inject(QuestService);

  get isTracked(): boolean {
    return this.playerService.trackedQuest()?.questId === this.quest().id;
  }

  toggleTrack(event: MouseEvent): void {
    event.stopPropagation();
    if (this.isTracked) {
      this.playerService.trackQuest(null);
    } else {
      const firstTask = this.currentStep?.tasks?.[0];
      this.playerService.trackQuest({
        questId: this.quest().id,
        questName: this.quest().name,
        stepAction: firstTask ? `${firstTask.action} ${firstTask.description}`.trim() : '',
        stepIcon: firstTask?.icon,
      });
    }
  }

  // ── Expand state ──────────────────────────────────────────────────────────
  expanded = signal(false);
  showPreviousSteps = signal(false);

  constructor() {
    // Auto-expand this card when navigated to via the tracked quest strip
    effect(() => {
      const targetId = this.playerService.expandQuestId();
      if (targetId && targetId === this.quest().id && !this.expanded()) {
        this.playerService.clearExpandQuest();
        this.expanded.set(true);
        this.openSteps();
        // Scroll the card into view
        setTimeout(() => {
          document
            .querySelector(`[data-quest-id="${this.quest().id}"]`)
            ?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 50);
      }
    });
  }

  // ── Dialog state ──────────────────────────────────────────────────────────
  dialogLineIndex = signal(0);
  displayedText = signal('');
  isTyping = signal(false);
  dialogComplete = signal(false);

  private typingTimer: ReturnType<typeof setInterval> | null = null;
  private activeTypingLine: DialogLine | null = null;

  // ── Derived helpers ───────────────────────────────────────────────────────

  get skillReqs(): SkillRequirement[] {
    return this.quest().requirements.filter(
      (r): r is SkillRequirement => r.type === 'skill',
    );
  }

  get questReqs(): QuestRequirement[] {
    return this.quest().requirements.filter(
      (r): r is QuestRequirement => r.type === 'quest',
    );
  }

  get statusLabel(): string {
    switch (this.quest().status) {
      case 'completed':
        return 'Completed';
      case 'in-progress':
        return 'In Progress';
      default:
        return 'Not Started';
    }
  }

  get currentStepIndex(): number {
    return this.quest().steps?.findIndex((s) => !s.completed) ?? -1;
  }

  get currentStep(): QuestStep | undefined {
    const i = this.currentStepIndex;
    return i >= 0 ? this.quest().steps?.[i] : undefined;
  }

  get currentDialogLine(): DialogLine | undefined {
    return this.currentStep?.dialog?.[this.dialogLineIndex()];
  }

  get hasMoreDialogLines(): boolean {
    return this.dialogLineIndex() < (this.currentStep?.dialog?.length ?? 0) - 1;
  }

  /** Returns the target qty for a qty-based task condition, or null. */
  taskQty(task: QuestTask): number | null {
    const c = task.condition;
    if (c?.type === 'gather' || c?.type === 'skill-action' || c?.type === 'have') return c.qty;
    return null;
  }

  stepState(i: number): 'completed' | 'current' | 'upcoming' {
    const cur = this.currentStepIndex;
    if (this.quest().steps![i].completed) return 'completed';
    if (i === cur) return 'current';
    return 'upcoming';
  }

  // ── Toggle ────────────────────────────────────────────────────────────────

  get canStart(): boolean {
    const p = this.playerService.player();
    return this.quest().requirements.every((r) => {
      if (r.type === 'skill') return p.skills[r.skill].level >= r.level;
      if (r.type === 'quest')
        return (
          this.questService.quests().find((q) => q.id === r.questId)?.status ===
          'completed'
        );
      return true;
    });
  }

  onStart(event: MouseEvent): void {
    event.stopPropagation();
    this.selected.emit(this.quest());
  }

  onAdvanceStep(event: MouseEvent, stepIndex: number): void {
    event.stopPropagation();
    const questId = this.quest().id;
    this.questService.advanceStep(questId, stepIndex);
    // questService.quests() is updated synchronously — use it to bypass stale quest() input
    const freshQuest = this.questService.quests().find((q) => q.id === questId);
    const nextIdx = freshQuest?.steps?.findIndex((s) => !s.completed) ?? -1;
    setTimeout(() => this.openSteps(nextIdx >= 0 ? nextIdx : undefined));
  }

  toggle(): void {
    if (this.quest().status !== 'in-progress' || !this.quest().steps?.length)
      return;
    const opening = !this.expanded();
    this.expanded.set(opening);
    if (opening) {
      this.openSteps();
    } else {
      this.stopTyping();
      this.displayedText.set('');
      this.dialogLineIndex.set(0);
      this.dialogComplete.set(false);
    }
  }

  /** Shared open logic used by toggle() and the auto-expand effect.
   *  Pass `overrideIdx` when quest() input may still be stale (e.g. after advancing a step). */
  private openSteps(overrideIdx?: number): void {
    this.resetDialog();
    this.showPreviousSteps.set(false);
    const questId = this.quest().id;
    // When overrideIdx is provided we trust it; otherwise derive from quest() input as normal
    const si = overrideIdx ?? this.currentStepIndex;
    // Step content is stable across updates — safe to read from quest() even if stale
    const step = this.quest().steps?.[si];
    const alreadySeen = this.playerService.isDialogSeen(questId, si);
    if (step?.dialog?.length && !alreadySeen) {
      this.startTyping(step.dialog[0]);
    } else if (step?.dialog?.length && alreadySeen) {
      const lastIndex = step.dialog.length - 1;
      this.dialogLineIndex.set(lastIndex);
      this.displayedText.set(step.dialog[lastIndex].text);
      this.isTyping.set(false);
      this.dialogComplete.set(true);
    } else {
      this.dialogComplete.set(true);
    }
  }

  // ── Dialog controls ───────────────────────────────────────────────────────

  /** Replay button — rewind to first line and start typewriter again. */
  replayDialog(event: MouseEvent): void {
    event.stopPropagation();
    this.playerService.clearDialogSeen(this.quest().id, this.currentStepIndex);
    this.dialogComplete.set(false);
    this.dialogLineIndex.set(0);
    this.displayedText.set('');
    this.startTyping();
  }

  /** Click on the dialog box — skip typing if in progress, otherwise no-op. */
  onDialogClick(): void {
    if (this.isTyping()) this.finishTypingInstantly();
  }

  /** Continue / Understood button — advance line or dismiss when done. */
  onContinue(event: MouseEvent): void {
    event.stopPropagation();
    if (this.isTyping()) {
      this.finishTypingInstantly();
      return;
    }
    if (this.hasMoreDialogLines) {
      this.dialogLineIndex.update((i) => i + 1);
      this.startTyping();
    } else {
      // All lines read — mark seen and reveal the action
      this.playerService.markDialogSeen(this.quest().id, this.currentStepIndex);
      this.dialogComplete.set(true);
    }
  }

  // ── Typing engine ─────────────────────────────────────────────────────────

  resetDialog(): void {
    this.dialogLineIndex.set(0);
    this.displayedText.set('');
    this.dialogComplete.set(false);
    this.activeTypingLine = null;
  }

  startTyping(explicitLine?: DialogLine): void {
    const line = explicitLine ?? this.currentDialogLine;
    if (!line) return;
    this.activeTypingLine = line;
    this.stopTyping();
    this.displayedText.set('');
    this.isTyping.set(true);
    let charIndex = 0;
    this.typingTimer = setInterval(() => {
      charIndex++;
      this.displayedText.set(line.text.slice(0, charIndex));
      if (charIndex >= line.text.length) {
        this.isTyping.set(false);
        this.stopTyping();
      }
    }, TYPING_SPEED_MS);
  }

  private finishTypingInstantly(): void {
    const line = this.activeTypingLine ?? this.currentDialogLine;
    if (!line) return;
    this.stopTyping();
    this.displayedText.set(line.text);
    this.isTyping.set(false);
  }

  private stopTyping(): void {
    if (this.typingTimer !== null) {
      clearInterval(this.typingTimer);
      this.typingTimer = null;
    }
  }

  ngOnDestroy(): void {
    this.stopTyping();
  }
}
