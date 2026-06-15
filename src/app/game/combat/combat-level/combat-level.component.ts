import { Component, inject, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { PlayerService, SkillId } from '../../services/player.service';

interface CombatStat { id: SkillId; label: string; icon: string; color: string; }

@Component({
  selector: 'app-combat-level',
  imports: [DecimalPipe],
  templateUrl: './combat-level.component.html',
  styleUrl: './combat-level.component.scss',
})
export class CombatLevelComponent {
  pixelIcon = input<string>('');
  readonly playerService = inject(PlayerService);

  readonly combatStats: CombatStat[] = [
    { id: 'attack',    label: 'Attack',    icon: 'assets/icons/attack.png',    color: '#f87171' },
    { id: 'strength',  label: 'Strength',  icon: 'assets/icons/strength.png',  color: '#fb923c' },
    { id: 'defence',   label: 'Defence',   icon: 'assets/icons/defence.png',   color: '#60a5fa' },
    { id: 'ranged',    label: 'Ranged',    icon: 'assets/icons/ranged.png',    color: '#4ade80' },
    { id: 'hitpoints', label: 'Hitpoints', icon: 'assets/icons/hitpoints.png', color: '#f43f5e' },
  ];

  skill(id: SkillId) { return this.playerService.skill(id); }

  xpPct(id: SkillId): number {
    const s = this.playerService.skill(id);
    return s.xpForLevel > 0 ? (s.xpIntoLevel / s.xpForLevel) * 100 : 100;
  }
}
