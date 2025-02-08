import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: false,
  template: `
    <div class="chess-app">
      <header class="header" [class.compact]="modeSelected">
        <h1 class="title">Chess Game</h1>
        <div class="tab-container">
          <button 
            class="tab-button" 
            [class.active]="mode === 'explore'" 
            (click)="setMode('explore')">
            <span class="icon">♟️</span> Explore
          </button>
          <button 
            class="tab-button" 
            [class.active]="mode === 'online'" 
            (click)="setMode('online')">
            <span class="icon">🌍</span> Play Online
          </button>
        </div>
      </header>

      <main class="main-content">
        <div *ngIf="mode === 'explore'" class="explore-layout">
          <app-chessboard class="chessboard"></app-chessboard>
          <div class="side-panel">
            <app-timer class="timer"></app-timer>
            <app-game-controls class="controls"></app-game-controls>
          </div>
        </div>

        <app-chess-game *ngIf="mode === 'online'"></app-chess-game>
      </main>
    </div>
  `,
  styles: [
    `
      .chess-app {
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
        text-align: center;
      }
      .header {
        display: flex;
        flex-direction: column;
        align-items: center;
        transition: 0.3s;
        margin-bottom: 20px;
      }
      .header.compact {
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
      }
      .title {
        font-size: 24px;
        font-weight: bold;
        margin-bottom: 10px;
        transition: 0.3s;
      }
      .header.compact .title {
        margin-bottom: 0;
      }
      .tab-container {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
        justify-content: center;
      }
      .tab-button {
        padding: 10px 20px;
        font-size: 18px;
        font-weight: bold;
        border: none;
        cursor: pointer;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 10px;
        background: #f0f0f0;
        color: #333;
        transition: 0.3s;
      }
      .tab-button.active {
        background: #007bff;
        color: white;
      }
      .tab-button:hover {
        background: #0056b3;
        color: white;
      }
      .icon {
        font-size: 20px;
      }

      /* Explore mode layout */
      .explore-layout {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 20px;
        width: 100%;
        max-width: 1000px;
        margin: auto;
      }
      .side-panel {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }
      .chessboard {
        width: 100%;
      }
      .timer, .controls {
        width: 100%;
      }

      /* Mobile Responsiveness */
      @media (max-width: 768px) {
        .header {
          flex-direction: column;
          align-items: center;
        }
        .header.compact {
          flex-direction: column;
          align-items: center;
        }
        .title {
          font-size: 20px;
        }
        .tab-button {
          font-size: 16px;
          padding: 8px 15px;
        }
        .explore-layout {
          grid-template-columns: 1fr;
          gap: 10px;
        }
        .side-panel {
          flex-direction: column;
        }
      }
    `,
  ],
})
export class AppComponent {
  mode: 'explore' | 'online' | null = null;
  modeSelected = false;

  setMode(selectedMode: 'explore' | 'online') {
    this.mode = selectedMode;
    this.modeSelected = true;
  }
}
