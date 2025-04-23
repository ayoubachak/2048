import { Component, EventEmitter, Input, Output, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { AIPlayerService, AIStrategy } from '../../services/ai-player.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export interface AIControlsEvent {
  type: 'start' | 'stop' | 'step';
  speed?: number;
  strategy?: AIStrategy;
}

interface Strategy {
  id: string;
  name: string;
}

@Component({
  selector: 'app-ai-controls',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatSliderModule,
    MatSelectModule,
    MatFormFieldModule,
    FormsModule
  ],
  templateUrl: './ai-controls.component.html',
  styleUrls: ['./ai-controls.component.scss']
})
export class AiControlsComponent implements OnInit, OnDestroy {
  @Input() isPlaying = false;
  @Input() speed = 500; // milliseconds between moves (default: 500ms)
  @Input() strategy: AIStrategy = 'greedy';

  @Output() play = new EventEmitter<void>();
  @Output() stop = new EventEmitter<void>();
  @Output() step = new EventEmitter<void>();
  @Output() speedChange = new EventEmitter<number>();
  @Output() strategyChange = new EventEmitter<AIStrategy>();

  strategies: { value: AIStrategy, viewValue: string }[] = [
    { value: 'random', viewValue: 'Random' },
    { value: 'greedy', viewValue: 'Greedy' },
    { value: 'corner', viewValue: 'Corner' }
  ];

  private destroy$ = new Subject<void>();

  constructor(private aiPlayerService: AIPlayerService) {}

  ngOnInit(): void {
    this.aiPlayerService.isPlaying$.pipe(takeUntil(this.destroy$)).subscribe(isPlaying => {
      this.isPlaying = isPlaying;
    });
    
    this.aiPlayerService.speed$.pipe(takeUntil(this.destroy$)).subscribe(speed => {
      this.speed = speed;
    });
    
    this.aiPlayerService.strategy$.pipe(takeUntil(this.destroy$)).subscribe(strategy => {
      this.strategy = strategy;
    });
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  formatLabel(value: number): string {
    return `${value}ms`;
  }

  onPlay(): void {
    this.aiPlayerService.startPlaying(this.strategy, this.speed);
    this.play.emit();
  }

  onStop(): void {
    this.aiPlayerService.stopPlaying();
    this.stop.emit();
  }

  onStep(): void {
    this.aiPlayerService.makeNextMove();
    this.step.emit();
  }

  onSpeedChange(event: any): void {
    this.speed = event;
    this.speedChange.emit(this.speed);
    
    if (this.isPlaying) {
      // Update the running AI with new speed
      this.aiPlayerService.setSpeed(this.speed);
    }
  }

  onStrategyChange(): void {
    if (this.isPlaying) {
      // Update the running AI with new strategy
      this.aiPlayerService.setStrategy(this.strategy);
    }
    this.strategyChange.emit(this.strategy);
  }
} 