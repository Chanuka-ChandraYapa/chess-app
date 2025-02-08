import { Component } from '@angular/core';
import { ChessGameService } from '../../services/chess-game.service';

@Component({
  selector: 'app-game-controls',
  standalone: false,
  template: `
    <div class="game-controls">
      <button (click)="startNewGame()">New Game</button>
      <button (click)="flipBoard()">Flip Board</button>
      <div class="game-info">
        <p>Current Turn: {{getCurrentTurn()}}</p>
        <p>Game Status: {{getGameStatus()}}</p>
      </div>
      <div class="button-group">
        <button [disabled]="!(canUndo$ | async)" (click)="undo()">Undo</button>
        <button [disabled]="!(canRedo$ | async)" (click)="redo()">Redo</button>
      </div>
    </div>
  `,
  styles: [`
    .game-controls {
      padding: 20px;
      background: #f5f5f5;
      border-radius: 8px;
    }
    button {
      margin: 5px;
      padding: 10px 20px;
      background: #2196f3;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    button:disabled {
      background: #cccccc;
      cursor: not-allowed;
    }

    button:not(:disabled):hover {
      background: #1976d2;
    }
    button:hover {
      background: #1976d2;
    }
    .game-info {
      margin-top: 20px;
    }
  `]
})
export class GameControlsComponent {
  canUndo$;
  canRedo$;
  constructor(private chessGameService: ChessGameService) {
    this.canUndo$ = this.chessGameService.getCanUndo();
    this.canRedo$ = this.chessGameService.getCanRedo();
  }
  
  startNewGame() {
    this.chessGameService.startNewGame();
  }

  flipBoard() {
    this.chessGameService.flipBoard();
  }

  getCurrentTurn() {
    return this.chessGameService.getCurrentTurn();
  }

  getGameStatus() {
    return this.chessGameService.getGameStatus();
  }

  undo() {
    return this.chessGameService.undo();
  }

  redo() {
    return this.chessGameService.redo();
  }
}