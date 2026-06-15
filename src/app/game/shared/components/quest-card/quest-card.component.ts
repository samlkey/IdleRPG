import { Component, effect, inject, input, output, signal, OnDestroy } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { PlayerService, SkillId } from '../../../services/player.service';
import { QuestService } from '../../../services/quest.service';

// ── Step condition ────────────────────────────────────────────────────────────

export type StepCondition =
  | { type: 'gather';       skillId: SkillId; itemId: string; qty: number }
  | { type: 'skill-action'; skillId: SkillId; qty: number }
  | { type: 'location';     locationId: string }
  | { type: 'have';         itemId: string;   qty: number }
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
  /** Short imperative task — e.g. "Cut 3 Logs" */
  action: string;
  /** Flavour/context text explaining why or what it involves */
  description: string;
  /** Optional pixel icon path for the step — e.g. a skill icon */
  icon?: string;
  /** Machine-readable condition that auto-completes this step */
  condition?: StepCondition;
  /** Current count toward a qty-based condition */
  progress?: number;
  completed: boolean;
  /** Optional dialog sequence shown when the step becomes active */
  dialog?: DialogLine[];
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

export type QuestReward = SkillXpReward | CoinReward | UnlockReward | LocationReward;

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
  quest    = input.required<Quest>();
  selected = output<Quest>();

  readonly playerService = inject(PlayerService);
  readonly questService  = inject(QuestService);

  get isTracked(): boolean {
    return this.playerService.trackedQuest()?.questId === this.quest().id;
  }

  toggleTrack(event: MouseEvent): void {
    event.stopPropagation();
    if (this.isTracked) {
      this.playerService.trackQuest(null);
    } else {
      const step = this.currentStep;
      this.playerService.trackQuest({
        questId:    this.quest().id,
        questName:  this.quest().name,
        stepAction: step?.action ?? '',
        stepIcon:   step?.icon,
      });
    }
  }

  // ── Expand state ──────────────────────────────────────────────────────────
  expanded = signal(false);

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
          document.querySelector(`[data-quest-id="${this.quest().id}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 50);
      }
    });
  }

  // ── Dialog state ──────────────────────────────────────────────────────────
  dialogLineIndex  = signal(0);
  displayedText    = signal('');
  isTyping         = signal(false);
  dialogComplete   = signal(false);

  private typingTimer: ReturnType<typeof setInterval> | null = null;

  // ── Derived helpers ───────────────────────────────────────────────────────

  get skillReqs(): SkillRequirement[] {
    return this.quest().requirements.filter((r): r is SkillRequirement => r.type === 'skill');
  }

  get questReqs(): QuestRequirement[] {
    return this.quest().requirements.filter((r): r is QuestRequirement => r.type === 'quest');
  }

  get statusLabel(): string {
    switch (this.quest().status) {
      case 'completed':   return 'Completed';
      case 'in-progress': return 'In Progress';
      default:            return 'Not Started';
    }
  }

  get currentStepIndex(): number {
    return this.quest().steps?.findIndex(s => !s.completed) ?? -1;
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

  /** Returns the target qty for progress-tracked steps, null otherwise. */
  stepQty(step: QuestStep): number | null {
    const c = step.condition;
    if (c?.type === 'gather' || c?.type === 'skill-action') return c.qty;
    if (c?.type === 'have') return c.qty;
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
    return this.quest().requirements.every(r => {
      if (r.type === 'skill') return p.skills[r.skill].level >= r.level;
      if (r.type === 'quest') return this.questService.quests().find(q => q.id === r.questId)?.status === 'completed';
      return true;
    });
  }

  onStart(event: MouseEvent): void {
    event.stopPropagation();
    this.selected.emit(this.quest());
  }

  toggle(): void {
    if (this.quest().status !== 'in-progress' || !this.quest().steps?.length) return;
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

  /** Shared open logic used by toggle() and the auto-expand effect. */
  private openSteps(): void {
    this.resetDialog();
    const step = this.currentStep;
    const alreadySeen = this.playerService.isDialogSeen(this.quest().id, this.currentStepIndex);
    if (step?.dialog?.length && !alreadySeen) {
      this.startTyping();
    } else if (step?.dialog?.length && alreadySeen) {
      // Show the last dialog line fully — no typewriter, no footer controls
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
      this.dialogLineIndex.update(i => i + 1);
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
  }

  startTyping(): void {
    const line = this.currentDialogLine;
    if (!line) return;
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
    const line = this.currentDialogLine;
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
