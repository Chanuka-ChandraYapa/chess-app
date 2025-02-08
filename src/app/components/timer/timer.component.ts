import { Component, OnInit, OnDestroy } from '@angular/core';
import { TimerService } from '../../services/timer.service';
import { ChessGameService } from '../../services/chess-game.service';
import { MultiplayerService } from '../../services/multiplayer.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-timer',
  standalone: false,
  template: `
    <div class="timer-container">
      <div class="time-controls" *ngIf="!timerState.isRunning">
        <select [(ngModel)]="selectedTime" (change)="onTimeChange()">
          <option [value]="1">1 minute</option>
          <option [value]="3">3 minutes</option>
          <option [value]="5">5 minutes</option>
          <option [value]="10">10 minutes</option>
          <option [value]="15">15 minutes</option>
          <option [value]="30">30 minutes</option>
        </select>
      </div>

      <div class="player-timers">
        <div class="player-timer" [class.active]="timerState.activePlayer === 'black'">
          <span class="player-label">Black</span>
          <span class="time">{{formatTime(timerState.black)}}</span>
        </div>

        <div class="timer-controls">
          <button *ngIf="!timerState.isRunning" (click)="startGame()" >
            Start Game
          </button>
          <button *ngIf="timerState.isRunning" (click)="pauseGame()">
            Pause
          </button>
          <button (click)="resetGame()">Reset</button>
        </div>

        <div class="player-timer" [class.active]="timerState.activePlayer === 'white'">
          <span class="player-label">White</span>
          <span class="time">{{formatTime(timerState.white)}}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .timer-container {
      padding: 15px;
      background: #f5f5f5;
      border-radius: 8px;
      margin: 10px 0;
    }

    .time-controls {
      margin-bottom: 15px;
      text-align: center;
    }

    .time-controls select {
      padding: 5px 10px;
      border-radius: 4px;
      border: 1px solid #ddd;
    }

    .player-timers {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .player-timer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 15px;
      background: white;
      border-radius: 4px;
      border: 2px solid transparent;
    }

    .player-timer.active {
      border-color: #2196f3;
      background: #e3f2fd;
    }

    .player-label {
      font-weight: bold;
    }

    .time {
      font-family: monospace;
      font-size: 1.2em;
    }

    .timer-controls {
      display: flex;
      justify-content: center;
      gap: 10px;
      margin: 10px 0;
    }

    button {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      background: #2196f3;
      color: white;
      cursor: pointer;
    }

    button:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    button:not(:disabled):hover {
      background: #1976d2;
    }
  `]
})
export class TimerComponent implements OnInit, OnDestroy {
  timerState = {
    white: 600,
    black: 600,
    isRunning: false,
    activePlayer: 'white'
  };
  selectedTime = 10;
  gameInProgress = false;
  isGameCreator = false;
  isFirstMove = true;
  private stateSubscription!: Subscription;
  private moveSubscription!: Subscription;
  private gameStateSubscription!: Subscription;

  constructor(
    private timerService: TimerService,
    private chessGameService: ChessGameService,
    private multiplayerService: MultiplayerService
  ) {}

  ngOnInit() {
    this.stateSubscription = this.timerService.getTimerState()
      .subscribe(state => {
        this.timerState = state;
      });

    // Subscribe to moves to switch timer
    this.moveSubscription = this.chessGameService.getBoardPosition()
      .subscribe(() => {
        if (this.isFirstMove) {
          this.handleFirstMove();
        } else if (this.timerState.isRunning) {
          this.timerService.switchPlayer();
        }
      });

      this.gameStateSubscription = this.multiplayerService.getGameState()
      .subscribe(state => {
        // Player who creates game (white) can control timer settings
        this.isGameCreator = state.playerColor === 'white';
        
        // Reset first move flag when new game starts
        if (state.status === 'playing') {
          this.isFirstMove = true;
        }
      });
  }

  ngOnDestroy() {
    this.stateSubscription?.unsubscribe();
    this.moveSubscription?.unsubscribe();
    this.timerService.stopTimer();
    this.gameStateSubscription?.unsubscribe();
  }

  private handleFirstMove() {
    if (this.multiplayerService.getPlayerColor() === 'white') {
      this.isFirstMove = false;
      this.gameInProgress = true;
      this.timerService.resumeTimer();
      this.timerService.startTimer();
    }
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  onTimeChange() {
    this.timerService.setTime(this.selectedTime);
  }

  startGame() {
    this.gameInProgress = true;
    this.timerService.resumeTimer();
    this.timerService.startTimer();
  }

  pauseGame() {
    this.timerService.pauseTimer();
  }

  resetGame() {
    this.gameInProgress = false;
    this.timerService.resetTimer(this.selectedTime);
  }
}
