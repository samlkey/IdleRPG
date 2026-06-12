import { Component, computed, inject, input, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ActivityComponent } from '../../shared/components/activity/activity.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { PlayerService } from '../../services/player.service';
import { ActivityService } from '../../services/activity.service';
import { LocationService } from '../../services/location.service';
import { GameItem, DropTable } from '../../services/item.service';

@Component({
  selector: 'app-woodcutting',
  imports: [ActivityComponent, DecimalPipe, ModalComponent],
  templateUrl: './woodcutting.component.html',
  styleUrl: './woodcutting.component.scss',
})
export class WoodcuttingComponent {
  pixelIcon = input<string>('');
  helpOpen  = signal(false);

  readonly playerService   = inject(PlayerService);
  readonly activityService = inject(ActivityService);
  readonly locationService = inject(LocationService);

  get skillData()  { return this.playerService.skill('woodcutting'); }
  get currentAxe() { return this.playerService.player().equipment.axe; }

  private readonly allDropTables: DropTable[] = [
    {
      id: 'normal-tree', name: 'Normal Tree', drops: [
        { item: { 
          id: 'normal-log',  
          name: 'Normal Log',  
          description: 'A basic log.',          
          icon: 'assets/objects/normal_log.png',  
          type: 'resource' as const, 
          subType: 'wood' 
        }, chance: 1, qty: 1 },
        { item: { 
          id: 'normal-seed',  
          name: 'Normal Seed',  
          description: 'A seed from a normal tree.',  
          icon: 'assets/objects/normal_seed.png',  
          type: 'resource' as const, 
          subType: 'seed' 
        }, chance: 0.5, qty: 1 },
        { item: { 
          id: 'beaver',  
          name: 'Beaver',  
          description: 'He wants to be your friend.',  
          icon: 'assets/objects/normal_seed.png',  
          type: 'pet' as const, 
        }, chance: 0.05, qty: 1 },  
      ],
    },
    {
      id: 'oak-tree', name: 'Oak Tree', drops: [
        { item: { 
          id: 'oak-log',     
          name: 'Oak Log',     
          description: 'A sturdy oak log.',      
          icon: 'assets/objects/oak_log.png',     
          type: 'resource' as const, 
          subType: 'wood' 
        }, chance: 1, qty: 1 },
      ],
    },
    {
      id: 'willow-tree', name: 'Willow Tree', drops: [
        { item: { 
          id: 'willow-log',  
          name: 'Willow Log',  
          description: 'A flexible willow log.', 
          icon: 'assets/objects/willow_log.png',  
          type: 'resource' as const, 
          subType: 'wood' 
        }, chance: 1, qty: 1 },
      ],
    },
    {
      id: 'maple-tree', name: 'Maple Tree', drops: [
        { item: { 
          id: 'maple-log',   
          name: 'Maple Log',   
          description: 'A dense maple log.',     
          icon: 'assets/objects/maple_log.png',   
          type: 'resource' as const, 
          subType: 'wood' 
        }, chance: 1, qty: 1 },
      ],
    },
    {
      id: 'yew-tree', name: 'Yew Tree', drops: [
        { item: { 
          id: 'yew-log',     
          name: 'Yew Log',     
          description: 'A rare yew log.',        
          icon: 'assets/objects/yew_log.png',     
          type: 'resource' as const, 
          subType: 'wood' 
        }, chance: 1, qty: 1 },
      ],
    },
    {
      id: 'magic-tree', name: 'Magic Tree', drops: [
        { item: { 
          id: 'magic-log',   
          name: 'Magic Log',   
          description: 'A magical log.',         
          icon: 'assets/objects/magic_log.png',   
          type: 'resource' as const, 
          subType: 'wood' 
        }, chance: 1, qty: 1 },
      ],
    },
  ];

  private readonly allTrees = [
    { name: 'Normal Tree',  src: 'assets/objects/tree.png',            level: 1,  xp: 300,  time: 5,  critChance: 0.4, disabled: false, dropTable: this.allDropTables[0] },
    { name: 'Oak Tree',     src: 'assets/objects/oak_tree.png',        level: 15, xp: 37.5, time: 10, critChance: 0.4, disabled: true,  item: this.allDropTables[1] },
    { name: 'Willow Tree',  src: 'assets/objects/willow_tree.png',     level: 30, xp: 67.5, time: 15, critChance: 0.4, disabled: true,  item: this.allDropTables[2] },
    { name: 'Maple Tree',   src: 'assets/objects/maple_tree.png',      level: 45, xp: 100,  time: 20, critChance: 0.4, disabled: true,  item: this.allDropTables[3] },
    { name: 'Yew Tree',     src: 'assets/objects/yew_tree.png',        level: 60, xp: 175,  time: 30, critChance: 0.4, disabled: true,  item: this.allDropTables[4] },
    { name: 'Magic Tree',   src: 'assets/objects/magic_tree.png',      level: 75, xp: 250,  time: 60, critChance: 0.4, disabled: true,  item: this.allDropTables[5] },
  ];

  readonly trees = computed(() => {
    const available = this.locationService.current().activities.woodcutting ?? [];
    return this.allTrees.filter(t => available.includes(t.name));
  });

  selectTree(tree: typeof this.allTrees[0]): void {
    if (this.activityService.current()?.name === tree.name) {
      this.activityService.stop();
    } else {
      this.activityService.start({
        name: tree.name, xp: tree.xp, duration: tree.time,
        skillId: 'woodcutting', skillPanel: 'woodcutting', dropTable: tree.dropTable,
      });
    }
  }
}
