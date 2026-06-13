import { Component, ElementRef, input, OnDestroy, OnInit, output, viewChild } from '@angular/core';
import { DecimalPipe, TitleCasePipe } from '@angular/common';
import { Quest } from '../quest-card/quest-card.component';

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

@Component({
  selector: 'app-quest-complete-modal',
  imports: [DecimalPipe, TitleCasePipe],
  templateUrl: './quest-complete-modal.component.html',
  styleUrl: './quest-complete-modal.component.scss',
})
export class QuestCompleteModalComponent implements OnInit, OnDestroy {
  quest = input.required<Quest>();
  close = output<void>();

  private readonly canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('confetti');
  private particles: Particle[] = [];
  private rafId: number | null = null;

  ngOnInit(): void {
    // Defer so the canvas is in the DOM
    requestAnimationFrame(() => this.burst());
  }

  ngOnDestroy(): void {
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.close.emit();
  }

  private burst(): void {
    const canvas = this.canvasRef().nativeElement;
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    this.particles = Array.from({ length: 120 }, () => ({
      x:             Math.random() * canvas.width,
      y:             canvas.height * 0.55 + Math.random() * canvas.height * 0.1,
      vx:            (Math.random() - 0.5) * 10,
      vy:            Math.random() * -14 - 4,
      alpha:         1,
      size:          Math.random() * 9 + 4,
      color:         COLORS[Math.floor(Math.random() * COLORS.length)],
      rotation:      Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.25,
      shape:         Math.random() > 0.4 ? 'rect' : 'circle',
    }));

    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    this.animate(canvas);
  }

  private animate(canvas: HTMLCanvasElement): void {
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let alive = false;
    for (const p of this.particles) {
      p.vy    += 0.22;
      p.x     += p.vx;
      p.y     += p.vy;
      p.alpha  = Math.max(0, p.alpha - 0.010);
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
}
