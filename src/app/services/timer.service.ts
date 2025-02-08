import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
// import { TimerState } from '../models/timer.model';

interface TimerState {
  white: number;
  black: number;
  isRunning: boolean;
  activePlayer: 'white' | 'black';
}

@Injectable({
  providedIn: 'root'
})
export class TimerService {
  private intervalId: any;
  private timerState = new BehaviorSubject<TimerState>({
    white: 600, // 10 minutes in seconds
    black: 600,
    isRunning: false,
    activePlayer: 'white'
  });

  constructor() {}

  getTimerState() {
    return this.timerState.asObservable();
  }

  startTimer() {
    if (!this.intervalId) {
      this.intervalId = setInterval(() => {
        const currentState = this.timerState.value;
        if (currentState.isRunning) {
          const newState = { ...currentState };
          if (newState[newState.activePlayer] > 0) {
            newState[newState.activePlayer] -= 1;
          }
          this.timerState.next(newState);
        }
      }, 1000);
    }
  }

  stopTimer() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  switchPlayer() {
    const currentState = this.timerState.value;
    this.timerState.next({
      ...currentState,
      activePlayer: currentState.activePlayer === 'white' ? 'black' : 'white'
    });
  }

  setTime(minutes: number) {
    const seconds = minutes * 60;
    this.timerState.next({
      white: seconds,
      black: seconds,
      isRunning: false,
      activePlayer: 'white'
    });
  }

  pauseTimer() {
    const currentState = this.timerState.value;
    this.timerState.next({
      ...currentState,
      isRunning: false
    });
  }

  resumeTimer() {
    const currentState = this.timerState.value;
    this.timerState.next({
      ...currentState,
      isRunning: true
    });
  }

  resetTimer(selectedTime: number) {
    this.stopTimer();
    const currentTime = selectedTime*60; // Use current time setting
    this.timerState.next({
      white: currentTime,
      black: currentTime,
      isRunning: false,
      activePlayer: 'white'
    });
  }
}
