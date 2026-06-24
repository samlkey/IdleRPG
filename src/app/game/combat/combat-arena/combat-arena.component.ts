import {
  AfterViewInit,
  Component,
  effect,
  ElementRef,
  inject,
  input,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import {
  Application,
  Assets,
  ColorMatrixFilter,
  Graphics,
  Sprite,
  Text,
  TextStyle,
  Texture,
} from 'pixi.js';
import { Monster } from '../../services/monster.service';
import { CharacterAnimationService } from '../../services/character-animation.service';
import { GameLocation } from '../../services/location.service';

const IDLE_FRAMES = Array.from(
  { length: 7 },
  (_, i) => `assets/character/idle/Idle0${i + 1}.png`,
);

const H      = 320;
const INFO_H = 40;           // just enough for the name row
const STAGE_Y = H - INFO_H; // y-anchor for sprite bottoms (280)
const INFO_Y  = STAGE_Y + 8;
const PAD     = 14;

@Component({
  selector: 'app-combat-arena',
  standalone: true,
  templateUrl: './combat-arena.component.html',
  styleUrl: './combat-arena.component.scss',
})
export class CombatArenaComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  readonly anim = inject(CharacterAnimationService);

  readonly background  = input<string>('');
  readonly playerName  = input<string>('Adventurer');
  readonly monster     = input<Monster | null>(null);
  readonly killReqLocs = input<GameLocation[]>([]);

  private app!: Application;
  private ready   = false;
  private W       = 800;
  private get MID() { return this.W / 2; }

  // ── PixiJS display objects ────────────────────────────────────────────────
  private bgPlayer!: Sprite;
  private bgEnemy!: Sprite;
  private playerSprite!: Sprite;
  private playerNameText!: Text;
  private enemySprite!: Sprite;
  private enemyEmptyText!: Text;
  private enemyNameText!: Text;
  private enemyLevelText!: Text;

  private floatTime = 0;

  constructor() {
    effect(() => {
      if (!this.ready) return;
      void this.applyBackground(this.background());
    });

    effect(() => {
      const frame = this.anim.idleFrame();
      if (!this.ready) return;
      const tex = Assets.get<Texture>(frame);
      if (tex) this.playerSprite.texture = tex;
    });

    effect(() => {
      const name = this.playerName();
      if (!this.ready) return;
      this.playerNameText.text = name;
    });

    effect(() => {
      const m = this.monster();
      if (!this.ready) return;
      void this.applyEnemy(m);
    });
  }

  async ngAfterViewInit() {
    this.W = this.canvasRef.nativeElement.parentElement?.offsetWidth ?? 800;

    this.app = new Application();
    await this.app.init({
      canvas: this.canvasRef.nativeElement,
      width:  this.W,
      height: H,
      background: 0x07090f,
    });

    await Assets.load(IDLE_FRAMES);

    this.buildScene();
    this.ready = true;

    // Sync current input values
    void this.applyBackground(this.background());
    const tex = Assets.get<Texture>(this.anim.idleFrame());
    if (tex) this.playerSprite.texture = tex;
    this.playerNameText.text = this.playerName();
    void this.applyEnemy(this.monster());

    // Float animation — player and enemy bob out of phase
    this.app.ticker.add((ticker) => {
      this.floatTime += ticker.deltaMS / 1000;
      this.playerSprite.y = STAGE_Y - Math.sin(this.floatTime * Math.PI / 2) * 6;
      if (this.enemySprite.visible) {
        this.enemySprite.y = STAGE_Y - Math.sin((this.floatTime + 0.5) * Math.PI / 2) * 6;
      }
    });
  }

  private buildScene() {
    const s   = this.app.stage;
    const W   = this.W;
    const MID = this.MID;

    // ── Split backgrounds ───────────────────────────────────────────────────

    const playerMask = new Graphics();
    playerMask.rect(0, 0, MID, H);
    playerMask.fill(0xffffff);

    this.bgPlayer = new Sprite();
    this.bgPlayer.mask = playerMask;
    s.addChild(playerMask);
    s.addChild(this.bgPlayer);

    const darken = new ColorMatrixFilter();
    darken.brightness(0.55, false);
    darken.saturate(-0.25, false);

    const enemyMask = new Graphics();
    enemyMask.rect(MID, 0, MID, H);
    enemyMask.fill(0xffffff);

    this.bgEnemy = new Sprite();
    this.bgEnemy.filters = [darken];
    this.bgEnemy.mask = enemyMask;
    s.addChild(enemyMask);
    s.addChild(this.bgEnemy);

    // ── Gradient overlays ───────────────────────────────────────────────────

    const playerOverlay = new Graphics();
    this.gradientStrips(playerOverlay, 0,   H * 0.55, MID, H * 0.45, 0x09090f, 0, 0.7);
    s.addChild(playerOverlay);

    const enemyOverlay = new Graphics();
    this.gradientStrips(enemyOverlay,  MID, H * 0.45, MID, H * 0.55, 0x09090f, 0, 0.75);
    s.addChild(enemyOverlay);

    // ── Centre divider ──────────────────────────────────────────────────────

    const divider = new Graphics();
    divider.rect(MID - 0.5, 0, 1, H);
    divider.fill({ color: 0xffffff, alpha: 0.06 });
    s.addChild(divider);

    // ── Player sprite ───────────────────────────────────────────────────────

    this.playerSprite = new Sprite();
    this.playerSprite.anchor.set(0.5, 1);
    this.playerSprite.x = MID / 2;
    this.playerSprite.y = STAGE_Y;
    const firstFrame = Assets.get<Texture>(IDLE_FRAMES[0]);
    if (firstFrame) {
      const spriteH = STAGE_Y * 0.7;
      this.playerSprite.height = spriteH;
      this.playerSprite.width  = spriteH * (firstFrame.width / firstFrame.height);
    }
    s.addChild(this.playerSprite);

    // ── Player name ─────────────────────────────────────────────────────────

    this.playerNameText = this.makeText('', 15, 0xffffff, true);
    this.playerNameText.x = PAD;
    this.playerNameText.y = INFO_Y;
    s.addChild(this.playerNameText);

    const youTag = this.makeText('You', 9, 0xa78bfa);
    youTag.y = INFO_Y + 2;
    youTag.x = MID - PAD - youTag.width;
    s.addChild(youTag);

    // ── Enemy sprite ────────────────────────────────────────────────────────

    this.enemySprite = new Sprite();
    this.enemySprite.anchor.set(0.5, 1);
    this.enemySprite.x = MID + MID / 2;
    this.enemySprite.y = STAGE_Y;
    this.enemySprite.visible = false;
    s.addChild(this.enemySprite);

    this.enemyEmptyText = this.makeText('No enemies here', 12, 0x444455);
    this.enemyEmptyText.anchor.set(0.5);
    this.enemyEmptyText.x = MID + MID / 2;
    this.enemyEmptyText.y = H / 2;
    s.addChild(this.enemyEmptyText);

    // ── Enemy name / level ──────────────────────────────────────────────────

    const EPAD = MID + PAD;

    this.enemyNameText = this.makeText('', 15, 0xffffff, true);
    this.enemyNameText.x = EPAD;
    this.enemyNameText.y = INFO_Y;
    s.addChild(this.enemyNameText);

    this.enemyLevelText = this.makeText('', 10, 0x666677);
    this.enemyLevelText.y = INFO_Y + 2;
    s.addChild(this.enemyLevelText);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private makeText(text: string, size: number, color: number, serif = false): Text {
    return new Text({
      text,
      style: new TextStyle({
        fontFamily: serif ? 'Georgia, serif' : 'system-ui, sans-serif',
        fontSize:   size,
        fontWeight: serif ? 'bold' : 'normal',
        fill:       color,
      }),
    });
  }

  private gradientStrips(
    g: Graphics,
    x: number, y: number, w: number, h: number,
    color: number, fromAlpha: number, toAlpha: number,
    strips = 20,
  ) {
    const sh = h / strips;
    for (let i = 0; i < strips; i++) {
      const alpha = fromAlpha + (toAlpha - fromAlpha) * (i / (strips - 1));
      g.rect(x, y + sh * i, w, sh);
      g.fill({ color, alpha });
    }
  }

  private async applyBackground(src: string) {
    if (!src) return;
    const tex = await Assets.load<Texture>(src);
    for (const sprite of [this.bgPlayer, this.bgEnemy]) {
      sprite.texture = tex;
      sprite.width   = this.W;
      sprite.height  = H;
    }
  }

  private async applyEnemy(m: Monster | null) {
    if (!m) {
      this.enemySprite.visible    = false;
      this.enemyEmptyText.visible = true;
      this.enemyNameText.text     = '';
      this.enemyLevelText.text    = '';
      return;
    }

    this.enemyEmptyText.visible = false;
    this.enemySprite.visible    = true;

    const tex = await Assets.load<Texture>(m.icon);
    this.enemySprite.texture = tex;
    this.enemySprite.height  = 80;
    this.enemySprite.width   = 80 * (tex.width / tex.height);

    this.enemyNameText.text  = m.name;
    this.enemyLevelText.text = `Lv. ${m.level}`;
    this.enemyLevelText.x    = this.W - PAD - this.enemyLevelText.width;
  }

  ngOnDestroy() {
    this.app?.destroy(false);
  }
}
