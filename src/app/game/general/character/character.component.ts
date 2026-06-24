import { Component, computed, inject, input, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { PlayerCharacterComponent } from '../../shared/components/player-character/player-character.component';
import { PlayerService } from '../../services/player.service';
import { GameItem, ItemService } from '../../services/item.service';

interface BankTab {
  id: string;
  label: string;
  deletable: boolean;
}

//TODO: This will become the existing player-character comp without PixiJS, and the existing player-character comp will become a new one that uses PixiJS for smooth animations. This is because this only needs an Idle animation, and wont follow the animations of the new integration.

@Component({
  selector: 'app-character',
  imports: [ModalComponent, FormsModule, DecimalPipe, PlayerCharacterComponent],
  templateUrl: './character.component.html',
  styleUrl: './character.component.scss',
})
export class CharacterComponent {
  pixelIcon = input<string>('');
  helpOpen = signal(false);
  search = signal('');

  selectedEntry = signal<{ item: GameItem; qty: number } | null>(null);
  activeTab = signal<string>('all');
  editingTabId = signal<string | null>(null);
  editingLabel = signal('');

  private readonly playerService = inject(PlayerService);
  readonly itemService = inject(ItemService);
  private nextTabId = 1;

  get bankSpace() {
    return this.playerService.bankSpace();
  }

  readonly filteredItems = computed(() => {
    const inv = this.itemService.inventory();
    const query = this.search().toLowerCase().trim();
    return Object.values(inv).filter(
      ({ item }) => !query || item.name.toLowerCase().includes(query),
    );
  });

  readonly tabs = signal<BankTab[]>([
    { id: 'all', label: 'All', deletable: false },
  ]);

  addTab(): void {
    const id = `tab-${this.nextTabId++}`;
    this.tabs.update((t) => [...t, { id, label: 'New Tab', deletable: true }]);
    this.activeTab.set(id);
    this.editingTabId.set(id);
    this.editingLabel.set('New Tab');
  }

  deleteTab(id: string, event: MouseEvent): void {
    event.stopPropagation();
    this.tabs.update((t) => t.filter((x) => x.id !== id));
    if (this.activeTab() === id) this.activeTab.set('all');
  }

  startRename(tab: BankTab, event: MouseEvent): void {
    if (!tab.deletable) return;
    event.stopPropagation();
    this.editingTabId.set(tab.id);
    this.editingLabel.set(tab.label);
  }

  commitRename(): void {
    const id = this.editingTabId();
    const label = this.editingLabel().trim();
    if (id && label) {
      this.tabs.update((t) =>
        t.map((x) => (x.id === id ? { ...x, label } : x)),
      );
    }
    this.editingTabId.set(null);
  }

  cancelRename(): void {
    this.editingTabId.set(null);
  }

  dropPct(qty: number): string {
    if (qty >= 1_000_000) return (qty / 1_000_000).toFixed(1) + 'm';
    if (qty >= 1_000) return (qty / 1_000).toFixed(1) + 'k';
    return qty.toString();
  }
}
