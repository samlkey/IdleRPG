import { Component, effect, ElementRef, inject, OnDestroy, viewChild } from '@angular/core';
import { NotificationService } from '../../../services/notification.service';

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  alpha: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  shape: 'rect' | 'circle';
}

const COLORS = ['#fbbf24', '#fcd34d', '#f59e0b', '#fff7ed', '#a78bfa', '#c4b5fd', '#86efac'];
const PARTICLE_COUNT = 60;
// Matches the notification stack position in notifications.component.scss
const NOTIF_RIGHT  = 24;
const NOTIF_BOTTOM = 24;
const CANVAS_W = 320;
const CANVAS_H = 260;

@Component({
  selector: 'app-level-up',
  template: `<canvas #canvas class="level-up-canvas"></canvas>`,
  styles: [`
    .level-up-canvas {
      position: fixed;
      bottom: ${NOTIF_BOTTOM}px;
      right: ${NOTIF_RIGHT}px;
      width: ${CANVAS_W}px;
      height: ${CANVAS_H}px;
      pointer-events: none;
      z-index: 999;
    }
  `],
})
export class LevelUpComponent implements OnDestroy {
  private readonly notifService = inject(NotificationService);
  private readonly canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');

  private particles: Particle[] = [];
  private rafId: number | null = null;

  constructor() {
    effect(() => {
      const event = this.notifService.levelUpEvent();
      if (event) this.burst();
    });
  }

  private burst(): void {
    const canvas = this.canvasRef().nativeElement;
    canvas.width  = CANVAS_W;
    canvas.height = CANVAS_H;

    this.particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * CANVAS_W,
      y: CANVAS_H,
      vx: (Math.random() - 0.5) * 5,
      vy: Math.random() * -7 - 3,
      alpha: 1,
      size: Math.random() * 8 + 4,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.2,
      shape: Math.random() > 0.4 ? 'rect' : 'circle',
    }));

    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    this.animate(canvas);
  }

  private animate(canvas: HTMLCanvasElement): void {
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let alive = false;
    for (const p of this.particles) {
      p.vy  += 0.18; // gravity
      p.x   += p.vx;
      p.y   += p.vy;
      p.alpha = Math.max(0, p.alpha - 0.012);
      p.rotation += p.rotationSpeed;

      if (p.alpha <= 0) continue;
      alive = true;

      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle   = p.color;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);

      if (p.shape === 'rect') {
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    if (alive) {
      this.rafId = requestAnimationFrame(() => this.animate(canvas));
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      this.rafId = null;
    }
  }

  ngOnDestroy(): void {
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
  }
}
