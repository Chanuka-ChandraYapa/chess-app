import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
// import { environment } from '../../environments/environment';

export interface GameState {
  status: 'waiting_for_opponent' | 'playing' | 'opponent_disconnected' | 'disconnected';
  gameId?: string;
  playerColor?: 'white' | 'black';
}

@Injectable({
  providedIn: 'root'
})
export class MultiplayerService {
  private socket: WebSocket | null = null;
  private gameId: string | null = null;
  private playerColor: 'white' | 'black' | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  private gameStateSubject = new BehaviorSubject<GameState>({ status: 'disconnected' });
  private connectionStatusSubject = new BehaviorSubject<boolean>(false);
  private opponentMoveSubject = new Subject<any>();

  constructor() {
    // Initialize the WebSocket connection when the service is created
    this.connect();
  }

  private connect() {
    try {
      // Make sure we're not already connected
      if (this.socket?.readyState === WebSocket.OPEN) {
        return;
      }

      // Create new WebSocket connection
      this.socket = new WebSocket('ws://localhost:3000');

      this.socket.onopen = () => {
        console.log('WebSocket connection established');
        this.connectionStatusSubject.next(true);
        this.reconnectAttempts = 0;
      };

      this.socket.onclose = () => {
        console.log('WebSocket connection closed');
        this.connectionStatusSubject.next(false);
        this.handleDisconnection();
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.handleDisconnection();
      };

      this.socket.onmessage = (event) => {
        this.handleMessage(event);
      };

    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      this.handleDisconnection();
    }
  }

  private handleDisconnection() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      setTimeout(() => this.connect(), 5000);
    } else {
      this.gameStateSubject.next({ status: 'disconnected' });
    }
  }

  private handleMessage(event: MessageEvent) {
    try {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'game_created':
          this.gameId = data.gameId;
          this.playerColor = data.color;
          this.gameStateSubject.next({ 
            status: 'waiting_for_opponent',
            gameId: data.gameId,
            playerColor: data.color
          });
          break;

        case 'game_started':
          this.gameId = data.gameId;
          this.playerColor = data.color;
          this.gameStateSubject.next({ 
            status: 'playing',
            gameId: data.gameId,
            playerColor: data.color
          });
          console.log('Game started:', data);
          break;

        case 'move_made':
          if (data.move) {
            this.opponentMoveSubject.next(data);
          }
          break;

        case 'opponent_disconnected':
          this.gameStateSubject.next({ 
            status: 'opponent_disconnected',
            gameId: data.gameId,
            playerColor: data.playerColor
          });
          break;
      }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  }

  private sendMessage(message: any) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected');
    }
  }

  createGame() {
    this.sendMessage({ type: 'create_game' });
  }

  joinGame(gameId: string) {
    this.sendMessage({
      type: 'join_game',
      gameId
    });
  }

  makeMove(move: any, position: string) {
    if (this.gameId) {
      this.sendMessage({
        type: 'move',
        gameId: this.gameId,
        move,
        position
      });
    }
  }

  getGameState() {
    return this.gameStateSubject.asObservable();
  }

  getConnectionStatus() {
    return this.connectionStatusSubject.asObservable();
  }

  getOpponentMoves() {
    return this.opponentMoveSubject.asObservable();
  }

  getPlayerColor() {
    return this.playerColor;
  }

  getCurrentGameId() {
    return this.gameId;
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}