import { Component, ElementRef, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-promotion-dialog',
  standalone: false,
  template: `
    <div *ngIf="isVisible" class="promotion-modal">
      <div class="promotion-dialog">
        <h3>Choose Promotion Piece</h3>
        <div class="piece-options">
          <button (click)="selectPiece('q')" class="piece-button">
            <img [src]="getImagePath('q')" alt="Queen">
          </button>
          <button (click)="selectPiece('r')" class="piece-button">
            <img [src]="getImagePath('r')" alt="Rook">
          </button>
          <button (click)="selectPiece('b')" class="piece-button">
            <img [src]="getImagePath('b')" alt="Bishop">
          </button>
          <button (click)="selectPiece('n')" class="piece-button">
            <img [src]="getImagePath('n')" alt="Knight">
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .promotion-modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }
    .promotion-dialog {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    .piece-options {
      display: flex;
      gap: 10px;
      margin-top: 15px;
    }
    .piece-button {
      width: 60px;
      height: 60px;
      padding: 5px;
      border: 1px solid #ddd;
      border-radius: 4px;
      cursor: pointer;
      background: white;
    }
    .piece-button:hover {
      background: #f0f0f0;
    }
    .piece-button img {
      width: 100%;
      height: 100%;
    }
    h3 {
      margin: 0 0 15px 0;
      text-align: center;
    }
  `]
})
export class PromotionDialogComponent {
  @Input() isVisible: boolean = false;
  @Input() color: 'w' | 'b' = 'w';
  @Output() pieceSelected = new EventEmitter<string>();

  getImagePath(piece: string): string {
    return `https://chessboardjs.com/img/chesspieces/wikipedia/${this.color}${piece.toUpperCase()}.png`;
  }

  selectPiece(piece: string) {
    this.pieceSelected.emit(piece);
  }
}