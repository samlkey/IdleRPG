import { Component, computed, inject, input, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { PlayerService } from '../../services/player.service';
import { ItemService } from '../../services/item.service';

export interface BankTab {
  id: string;
  label: string;
  deletable: boolean;
}

@Component({
  selector: 'app-bank',
  imports: [ModalComponent, FormsModule, DecimalPipe],
  templateUrl: './bank.component.html',
  styleUrl: './bank.component.scss',
})
export class BankComponent {
  pixelIcon = input<string>('');
  helpOpen  = signal(false);
  search    = signal('');
  activeTab = signal<string>('all');

  /** null = not editing; string = id of tab being renamed */
  editingTabId = signal<string | null>(null);
  editingLabel = signal('');

  private readonly playerService = inject(PlayerService);
  readonly itemService           = inject(ItemService);
  private nextTabId = 1;

  get bankSpace() { return this.playerService.bankSpace(); }

  readonly filteredItems = computed(() => {
    const inv    = this.itemService.inventory();
    const query  = this.search().toLowerCase().trim();
    return Object.values(inv).filter(({ item }) =>
      !query || item.name.toLowerCase().includes(query)
    );
  });
  readonly MAX_BANK_SLOTS = 800;

  readonly tabs = signal<BankTab[]>([
    { id: 'all', label: 'All', deletable: false },
  ]);

  addTab(): void {
    const id = `tab-${this.nextTabId++}`;
    this.tabs.update(t => [...t, { id, label: 'New Tab', deletable: true }]);
    this.activeTab.set(id);
    // Enter rename immediately
    this.editingTabId.set(id);
    this.editingLabel.set('New Tab');
  }

  deleteTab(id: string, event: MouseEvent): void {
    event.stopPropagation();
    this.tabs.update(t => t.filter(x => x.id !== id));
    if (this.activeTab() === id) this.activeTab.set('all');
  }

  startRename(tab: BankTab, event: MouseEvent): void {
    if (!tab.deletable) return;
    event.stopPropagation();
    this.editingTabId.set(tab.id);
    this.editingLabel.set(tab.label);
  }

  commitRename(): void {
    const id    = this.editingTabId();
    const label = this.editingLabel().trim();
    if (id && label) {
      this.tabs.update(t => t.map(x => x.id === id ? { ...x, label } : x));
    }
    this.editingTabId.set(null);
  }

  cancelRename(): void {
    this.editingTabId.set(null);
  }
}
