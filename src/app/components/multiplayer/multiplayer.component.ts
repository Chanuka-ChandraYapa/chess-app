import { Component, OnInit } from '@angular/core';
import { MultiplayerService } from '../../services/multiplayer.service';

@Component({
  selector: 'app-chess-game',
  standalone: false,
  template: `
    <div class="chess-game">
      <div *ngIf="!isInGame" class="game-setup">
        <button class="game-button create-button" (click)="createNewGame()">Create New Game</button>

        <!-- Show Game ID and Waiting Message after clicking "Create New Game" -->
        <div *ngIf="currentGameId && !isInGame" class="game-waiting">
          <p>Game ID: <strong>{{ currentGameId }}</strong></p>
          <p class="waiting-message">Waiting for opponent...</p>
        </div>

        <button class="game-button join-button" (click)="toggleJoinGame()">Join Game</button>

        <div *ngIf="showJoinGameInput" class="join-game">
          <input
            class="game-input"
            [(ngModel)]="gameIdToJoin"
            placeholder="Enter Game ID"
          />
          <button class="game-button confirm-join" (click)="joinGame()">Confirm</button>
        </div>
      </div>

      <div *ngIf="isInGame" class="game-info">
        <p>Game ID: <strong>{{ currentGameId }}</strong></p>
        <p>Playing as: <strong>{{ playerColor }}</strong></p>
        <p>Status: <strong>{{ gameStatus }}</strong></p>
      </div>

      <div *ngIf="isInGame" class="game-layout">
        <app-chessboard class="chessboard"></app-chessboard>
        <div class="side-panel">
          <app-timer class="timer"></app-timer>
          <app-game-controls class="controls"></app-game-controls>
          <!-- <div class="to-be">To be implemented</div> -->
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .chess-game {
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.game-setup {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 10px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  text-align: center;
}

.game-input {
  padding: 12px;
  font-size: 16px;
  border: 2px solid #ccc;
  border-radius: 5px;
  width: 100%;
  text-align: center;
  transition: all 0.3s ease-in-out;
}

.game-input:focus {
  border-color: #007bff;
  outline: none;
}

.game-button {
  padding: 12px 20px;
  font-size: 16px;
  font-weight: bold;
  border: none;
  cursor: pointer;
  border-radius: 8px;
  transition: 0.3s;
  width: 100%;
}

.create-button {
  background: #007bff;
  color: white;
}
.create-button:hover {
  background: #0056b3;
}

.join-button {
  background: #28a745;
  color: white;
}
.join-button:hover {
  background: #218838;
}

.confirm-join {
  background: #ffc107;
  color: black;
}
.confirm-join:hover {
  background: #e0a800;
}

.join-game {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  width: 100%;
  margin-top: 10px;
}

.game-waiting {
  margin-top: 10px;
  padding: 10px;
  background: #fef3c7;
  border-radius: 5px;
  border: 1px solid #f59e0b;
  width: 100%;
}

.waiting-message {
  font-size: 16px;
  font-weight: bold;
  color: #d97706;
  margin-top: 5px;
}

.game-info {
  text-align: center;
  margin-bottom: 20px;
  padding: 15px;
  background: #f5f5f5;
  border-radius: 8px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
}

.game-layout {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  width: 100%;
  max-width: 1000px;
}

.side-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.chessboard,
.timer,
.controls {
  width: 100%;
}

/* Mobile Responsive Styles */
@media (max-width: 768px) {
  .game-setup {
    width: 90%;
    max-width: 350px; /* Slightly smaller width for mobile */
  }

  .game-layout {
    grid-template-columns: 1fr; /* Stack the chessboard and side panel */
  }

  .side-panel {
    width: 100%;
  }

  .chessboard,
  .timer,
  .controls {
    max-width: 100%;
  }

  .game-info {
    width: 90%;
    max-width: 100%; /* Ensure the game info section fits on smaller screens */
  }
}

@media (max-width: 480px) {
  .game-button {
    font-size: 14px;
    padding: 10px;
  }

  .game-input {
    font-size: 14px;
    padding: 10px;
  }

  .waiting-message {
    font-size: 14px;
  }
}
    `,
  ],
})
export class MultiplayerComponent implements OnInit {
  isInGame = false;
  gameIdToJoin = '';
  currentGameId: string | null = null;
  playerColor: string | null = null;
  gameStatus = 'Not connected';
  showJoinGameInput = false; // Hide join input initially

  constructor(private gameService: MultiplayerService) {}

  ngOnInit() {
    this.gameService.getGameState().subscribe((state) => {
      if (state) {
        this.currentGameId = state.gameId ?? null;
        this.playerColor = state.playerColor ?? null;
        this.gameStatus = state.status;
        if (state.status === 'playing') {
          this.isInGame = true;
        }
      }
    });

    this.gameService.getConnectionStatus().subscribe((connected) => {
      this.gameStatus = connected ? 'Connected' : 'Disconnected';
    });
  }

  createNewGame() {
    this.gameService.createGame();
    this.currentGameId = this.gameService.getCurrentGameId();
    this.playerColor = this.gameService.getPlayerColor();
  }

  toggleJoinGame() {
    this.showJoinGameInput = !this.showJoinGameInput;
  }

  joinGame() {
    if (this.gameIdToJoin) {
      this.gameService.joinGame(this.gameIdToJoin);
      this.currentGameId = this.gameService.getCurrentGameId();
      this.playerColor = this.gameService.getPlayerColor();
    }
  }
}
