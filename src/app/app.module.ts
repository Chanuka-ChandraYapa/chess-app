import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { ChessboardComponent } from './components/chessboard/chessboard.component';
import { GameControlsComponent } from './components/game-controls/game-controls.component';
import { PromotionDialogComponent } from './components/promotion-dialog/promotion-dialog.component';
import { TimerComponent } from './components/timer/timer.component';
import { MultiplayerComponent } from './components/multiplayer/multiplayer.component';

@NgModule({
  declarations: [
    AppComponent,
    ChessboardComponent,
    GameControlsComponent,
    PromotionDialogComponent,
    TimerComponent,
    MultiplayerComponent
  ],
  imports: [
    BrowserModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }