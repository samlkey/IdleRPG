import { Component, computed, inject, input, signal } from '@angular/core';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { QuestCardComponent, Quest } from '../../shared/components/quest-card/quest-card.component';
import { LocationService } from '../../services/location.service';
import { QuestService } from '../../services/quest.service';

@Component({
  selector: 'app-quests',
  imports: [ModalComponent, QuestCardComponent],
  templateUrl: './quests.component.html',
  styleUrl: './quests.component.scss',
})
export class QuestsComponent {
  pixelIcon = input<string>('');
  helpOpen  = signal(false);

  readonly locationService = inject(LocationService);
  readonly questService    = inject(QuestService);

  readonly inProgressQuests = computed(() =>
    this.questService.quests().filter(q => q.status === 'in-progress')
  );

  readonly completedQuests = computed(() =>
    this.questService.quests().filter(q => q.status === 'completed')
  );

  readonly availableQuests = computed(() => {
    const locationQuestIds = this.locationService.current().activities.quests ?? [];
    return this.questService.quests().filter(q =>
      q.status === 'not-started' && locationQuestIds.includes(q.id)
    );
  });

  startQuest(quest: Quest): void {
    this.questService.startQuest(quest.id);
  }
}
