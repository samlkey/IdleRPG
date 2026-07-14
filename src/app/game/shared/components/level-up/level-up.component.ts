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

interface Cannon {
  x: number;
  y: number;
  /** Fan angle range, in radians (0 = +x, -PI/2 = straight up). */
  minAngle: number;
  maxAngle: number;
  minSpeed: number;
  maxSpeed: number;
  share: number;
}

const COLORS = ['#fbbf24', '#fcd34d', '#f59e0b', '#fff7ed', '#a78bfa', '#c4b5fd', '#86efac', '#f472b6', '#60a5fa'];
const PARTICLE_COUNT = 260;
const GRAVITY = 0.25;
const FADE_RATE = 0.008;

const deg = (d: number) => (d * Math.PI) / 180;

@Component({
  selector: 'app-level-up',
  template: `<canvas #canvas class="level-up-canvas"></canvas>`,
  styles: [`
    .level-up-canvas {
      position: fixed;
      inset: 0;
      width: 100vw;
      height: 100vh;
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
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width  = w;
    canvas.height = h;

    // Three confetti cannons along the bottom edge, fanning up and across
    // the full width so the burst reads as screen-wide rather than a
    // single corner pop.
    const cannons: Cannon[] = [
      { x: w * 0.04, y: h, minAngle: deg(-80), maxAngle: deg(-15),  minSpeed: 9,  maxSpeed: 16, share: 0.34 },
      { x: w * 0.5,  y: h, minAngle: deg(-120), maxAngle: deg(-60), minSpeed: 7,  maxSpeed: 13, share: 0.32 },
      { x: w * 0.96, y: h, minAngle: deg(-165), maxAngle: deg(-100), minSpeed: 9, maxSpeed: 16, share: 0.34 },
    ];

    const spawned: Particle[] = [];
    for (const cannon of cannons) {
      const count = Math.round(PARTICLE_COUNT * cannon.share);
      for (let i = 0; i < count; i++) {
        const angle = cannon.minAngle + Math.random() * (cannon.maxAngle - cannon.minAngle);
        const speed = cannon.minSpeed + Math.random() * (cannon.maxSpeed - cannon.minSpeed);
        spawned.push({
          x: cannon.x,
          y: cannon.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 1,
          size: Math.random() * 9 + 5,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.25,
          shape: Math.random() > 0.4 ? 'rect' : 'circle',
        });
      }
    }

    this.particles = spawned;

    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    this.animate(canvas);
  }

  private animate(canvas: HTMLCanvasElement): void {
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let alive = false;
    for (const p of this.particles) {
      p.vy  += GRAVITY;
      p.x   += p.vx;
      p.y   += p.vy;
      p.alpha = Math.max(0, p.alpha - FADE_RATE);
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
