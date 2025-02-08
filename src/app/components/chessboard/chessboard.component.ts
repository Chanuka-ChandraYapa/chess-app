import { Component, OnInit, AfterViewInit, ElementRef, OnDestroy } from '@angular/core';
import { ChessGameService } from '../../services/chess-game.service';
import { MultiplayerService } from '../../services/multiplayer.service';
import * as jQuery from 'jquery';
import { Subscription } from 'rxjs';

declare var ChessBoard: any;
const $ = jQuery;

@Component({
  selector: 'app-chessboard',
  standalone: false,
  template: `
    <div class="chessboard-container">
      <div #chessboard id="board1" style="width: 600px"></div>
      <app-promotion-dialog
        [isVisible]="showPromotionDialog"
        [color]="promotionColor"
        (pieceSelected)="onPromotionPieceSelected($event)">
      </app-promotion-dialog>
    </div>
  `,
  styles: [`
    .chessboard-container {
      padding: 20px;
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
      border-radius: 8px;
    }
  `]
})
export class ChessboardComponent implements AfterViewInit, OnDestroy {
  private board: any;
  private boardSubscription!: Subscription;
  private orientationSubscription!: Subscription;
  showPromotionDialog = false;
  promotionColor: 'w' | 'b' = 'w';

  constructor(
    private elementRef: ElementRef,
    private chessGameService: ChessGameService,
    private gameService: MultiplayerService
  ) {}

  ngAfterViewInit() {
    this.initializeBoard();
    this.boardSubscription = this.chessGameService.getBoardPosition()
      .subscribe(position => {
        if (this.board) {
          this.board.position(position, false);
        }
      });

    this.orientationSubscription = this.chessGameService.getBoardOrientation().subscribe(
      (orientation) => {
        if (this.board) {
          this.board.orientation(orientation);
        }
      }
    );

    this.chessGameService.getShowPromotionDialog().subscribe(
      (show) => {
        this.showPromotionDialog = show;
        if (show) {
          this.promotionColor = this.chessGameService.getCurrentColor();
        }
      });

      this.gameService.getOpponentMoves().subscribe(moveData => {
        // this.board.position(moveData.position, false);
        // this.chessGameService.updatePosition(moveData.position);
        if (moveData.move) {
          this.chessGameService.updatePositionFromOpponent(moveData.move);
        }
      });

      this.gameService.getGameState().subscribe(state => {
        if (state.status === 'disconnected') {
          this.board.position('start', false);
        }
        if (state.playerColor === 'black') {
          this.board.orientation('black');
        }
      });
  }

  onPromotionPieceSelected(piece: string) {
    this.chessGameService.handlePromotion(piece);
  }
  ngOnDestroy() {
    if (this.boardSubscription) {
      this.boardSubscription.unsubscribe();
    }
    if (this.orientationSubscription) {
      this.orientationSubscription.unsubscribe();
    }
  }

  private initializeBoard() {
    const config = {
      position: 'start',
      draggable: true,
      pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png',
      onDragStart: (source: string, piece: string) => {
        const playerColor = this.gameService.getPlayerColor();
        
        if ((playerColor === 'white' && piece.charAt(0) === 'b') || 
            (playerColor === 'black' && piece.charAt(0) === 'w')) {
          return false; // Prevent piece from being dragged
        }
        return true; // Allow piece to be dragged
      },
      onDrop: (source: string, target: string, piece: string) => {
        const playerColor = this.gameService.getPlayerColor();

        if ((playerColor === 'white' && piece.charAt(0) === 'b') || 
            (playerColor === 'black' && piece.charAt(0) === 'w')) {
          return 'snapback';
        }
  
        const moveResult = this.chessGameService.onPieceDrop(source, target);
        if (!moveResult) {
          return 'snapback';
        }
        
        this.gameService.makeMove(
          { from: source, to: target },
          this.board.position()
        );
        return true;
      }
    };
      
    this.board = ChessBoard('board1', config);
  }
}
