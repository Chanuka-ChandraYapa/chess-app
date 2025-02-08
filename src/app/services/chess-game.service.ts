import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Chess, Square, Move } from 'chess.js';

interface PendingMove {
  from: string;
  to: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChessGameService {
  private chess: Chess;
  private gameStatus = new BehaviorSubject<string>('Active');
  private currentTurn = new BehaviorSubject<string>('White');
  private boardPosition = new BehaviorSubject<string>('start');
  private boardOrientation = new BehaviorSubject<string>('white');
  private isFlipped = false;
  private showPromotionDialog = new BehaviorSubject<boolean>(false);
  private pendingPromotion: PendingMove | null = null;
  private moveHistory: Move[] = [];
  private undoneMovesStack: Move[] = [];
  private canUndo = new BehaviorSubject<boolean>(false);
  private canRedo = new BehaviorSubject<boolean>(false);

  constructor() {
    this.chess = new Chess();
    this.updateUndoRedoState();
  }

  startNewGame() {
    this.chess = new Chess();
    this.moveHistory = [];
    this.undoneMovesStack = [];
    this.updateGameState();
    this.boardPosition.next('start');
    this.updateUndoRedoState();
  }

  getBoardPosition(): Observable<string> {
    return this.boardPosition.asObservable();
  }
  getBoardOrientation() {
    return this.boardOrientation.asObservable();
  }

  getShowPromotionDialog() {
    return this.showPromotionDialog.asObservable();
  }

  getCanUndo() {
    return this.canUndo.asObservable();
  }

  getCanRedo() {
    return this.canRedo.asObservable();
  }

  private updateUndoRedoState() {
    this.canUndo.next(this.moveHistory.length > 0);
    this.canRedo.next(this.undoneMovesStack.length > 0);
  }

  private addMoveToHistory(move: Move) {
    this.moveHistory.push(move);
    // Clear redo stack when new move is made
    this.undoneMovesStack = [];
    this.updateUndoRedoState();
  }

  getCurrentColor(): 'w' | 'b' {
    return this.chess.turn();
  }

  onPieceDrop(source: string, target: string): boolean {

    const moveObj = {
      from: source,
      to: target
    };

    // const move = this.chess.move({ ...moveObj, promotion: 'q' });
    // this.chess.undo(); // Undo the temporary move

    
    try {
      const move = this.chess.move({
        from: source,
        to: target,
        promotion: 'q'
      });

      // If it's a promotion move
      if (move && this.isPawnPromotion(source, target)) {
        console.log(source, target);
        this.chess.undo();
        this.pendingPromotion = moveObj;
        this.showPromotionDialog.next(true);
        return false; // Don't make the move yet
      }

      if (move === null) return false;
      this.addMoveToHistory(move);
      
      this.updateGameState();
      this.boardPosition.next(this.chess.fen());
      return true;
    } catch (e) {
      console.error('Invalid move:', e);
      return false;
    }
  }

  private isPawnPromotion(from: string, to: string): boolean {
    // get the block of square where the pawn is moving from
    if (!this.isValidSquare(from)) return false;
    const piece = this.chess.get(from);
    const destRank = to.charAt(1);
    console.log(piece?.type, destRank);
    return piece?.type === 'p' && (destRank === '8' || destRank === '1');
  }

  private isValidSquare(square: string): square is Square {
    return /^[a-h][1-8]$/.test(square);
  }

  updatePositionFromOpponent(move: any) {
    try {
      const result = this.chess.move({
        from: move.from,
        to: move.to,
        promotion: 'q' // Default to queen for now
      });

      if (result) {
        this.boardPosition.next(this.chess.fen());
        this.currentTurn.next(this.chess.turn());
      }
    } catch (e) {
      console.error('Error updating position from opponent:', e);
    }
  }

  handlePromotion(promotionPiece: string) {
    if (!this.pendingPromotion) return;

    try {
      const move = this.chess.move({
        from: this.pendingPromotion.from,
        to: this.pendingPromotion.to,
        promotion: promotionPiece
      });

      if (move) {
        this.addMoveToHistory(move);
        this.updateGameState();
        this.boardPosition.next(this.chess.fen());
      }
    } catch (e) {
      console.error('Invalid promotion:', e);
    }

    this.showPromotionDialog.next(false);
    this.pendingPromotion = null;
  }

  flipBoard() {
    // Implementation will depend on the board instance
    this.isFlipped = !this.isFlipped;
    this.boardOrientation.next(this.isFlipped ? 'black' : 'white');
  }

  private updateGameState() {
    this.currentTurn.next(this.chess.turn() === 'w' ? 'White' : 'Black');
    
    if (this.chess.isCheckmate()) {
      this.gameStatus.next('Checkmate');
    } else if (this.chess.isDraw()) {
      this.gameStatus.next('Draw');
    } else if (this.chess.isCheck()) {
      this.gameStatus.next('Check');
    } else {
      this.gameStatus.next('Active');
    }
  }

  getCurrentTurn() {
    return this.currentTurn.value;
  }

  getGameStatus() {
    return this.gameStatus.value;
  }

  undo(): boolean {
    if (this.moveHistory.length === 0) return false;
    
    const undoneMove = this.chess.undo();
    if (undoneMove) {
      // Remove the last move from history and add to undone stack
      const move = this.moveHistory.pop()!;
      this.undoneMovesStack.push(move);
      
      this.updateGameState();
      this.boardPosition.next(this.chess.fen());
      this.updateUndoRedoState();
      return true;
    }
    return false;
  }

  redo(): boolean {
    if (this.undoneMovesStack.length === 0) return false;

    const moveToRedo = this.undoneMovesStack[this.undoneMovesStack.length - 1];
    try {
      const move = this.chess.move({
        from: moveToRedo.from,
        to: moveToRedo.to,
        promotion: moveToRedo.promotion
      });

      if (move) {
        // Remove from undone stack and add back to history
        this.undoneMovesStack.pop();
        this.moveHistory.push(move);
        
        this.updateGameState();
        this.boardPosition.next(this.chess.fen());
        this.updateUndoRedoState();
        return true;
      }
    } catch (e) {
      console.error('Invalid redo move:', e);
    }
    return false;
  }
}
