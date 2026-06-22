import {
  Component,
  OnDestroy,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ItemService } from '../../../services/item.service';
import { PassiveService, SlotMap } from '../../../services/passive.service';
import { ModalComponent } from '../modal/modal.component';

@Component({
  selector: 'app-passive-activity',
  imports: [DecimalPipe, ModalComponent],
  templateUrl: './passive-activity.component.html',
  styleUrl: './passive-activity.component.scss',
})
export class PassiveActivityComponent implements OnDestroy {
  slotId = input.required<string>();
  name = input<string>('');
  slotMap = input.required<SlotMap[]>();
  disabled = input<boolean>(false);

  readonly passiveService = inject(PassiveService);
  readonly itemService = inject(ItemService);

  readonly modalOpen = signal(false);
  readonly progressPct = signal(0);
  readonly timeRemaining = signal('');

  readonly slot = computed(() => this.passiveService.slots()[this.slotId()]);
  readonly state = computed(() => this.slot()?.state ?? 'empty');
  readonly isProcessing = computed(() => this.state() === 'processing');
  readonly isReady = computed(() => this.state() === 'ready');

  readonly validRecipes = computed(() =>
    this.slotMap().filter(
      (
        r,
      ): r is SlotMap & {
        input: NonNullable<SlotMap['input']>;
        output: NonNullable<SlotMap['output']>;
      } => r.input !== undefined && r.output !== undefined,
    ),
  );

  readonly availableRecipes = computed(() =>
    this.validRecipes().filter((r) => this.itemService.count(r.input.id) > 0),
  );

  private displayTimer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    effect(() => {
      if (this.isProcessing()) {
        this.startDisplayTimer();
      } else {
        this.stopDisplayTimer();
        this.progressPct.set(this.isReady() ? 100 : 0);
        this.timeRemaining.set('');
      }
    });
  }

  onClick(): void {
    if (this.disabled() || this.isProcessing()) return;
    if (this.state() === 'empty') {
      this.modalOpen.set(true);
    } else if (this.state() === 'ready') {
      this.passiveService.collect(this.slotId());
    }
  }

  selectRecipe(recipe: SlotMap): void {
    if (!recipe.input || !recipe.output) return;
    this.passiveService.start(
      this.slotId(),
      recipe.input,
      recipe.output,
      recipe.duration,
      recipe.quantity,
    );
    this.modalOpen.set(false);
  }

  inputCount(recipe: SlotMap): number {
    return recipe.input ? this.itemService.count(recipe.input.id) : 0;
  }

  formatDuration(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}m${s > 0 ? ` ${s}s` : ''}` : `${s}s`;
  }

  private startDisplayTimer(): void {
    this.stopDisplayTimer();
    this.displayTimer = setInterval(() => {
      this.progressPct.set(this.passiveService.progressOf(this.slotId()));
      const slot = this.slot();
      if (slot?.startedAt != null) {
        const remainingS = Math.max(
          0,
          slot.duration - (Date.now() - slot.startedAt) / 1000,
        );
        this.timeRemaining.set(this.formatTime(remainingS));
      }
    }, 50);
  }

  private stopDisplayTimer(): void {
    if (this.displayTimer) {
      clearInterval(this.displayTimer);
      this.displayTimer = null;
    }
  }

  private formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  }

  ngOnDestroy(): void {
    this.stopDisplayTimer();
  }
}
