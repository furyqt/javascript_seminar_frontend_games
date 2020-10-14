import { Component, OnInit } from '@angular/core';
import { GamesApiService } from '@app/services/custom/games/games-api.service';
import { DrawIt } from '@app/models/game-models/drawIt';

@Component({
  selector: 'app-draw-it-game-config',
  templateUrl: './draw-it-game-config.component.html',
  styleUrls: ['./draw-it-game-config.component.less']
})
export class DrawItGameConfigComponent implements OnInit {

  games: DrawIt[];

  newGame: DrawIt = {
    _id: "-1",
    name: "",
    description: "",
    words: []
  };

  constructor(private api: GamesApiService) { }

  ngOnInit(): void {
    this.api.getDrawItGames().subscribe(data => {
      console.log("fetch draw it games", data)
      this.games = data;
    });
  }

  deleteGame(game: DrawIt) {
    this.api.deleteDrawItGame(game).subscribe(data => {
      if (data) {
        console.log("delete game", data)
        this.games = this.games.filter(elem => elem._id !== game._id)
      }
    });
  }

  onCreateGame(game: DrawIt) {
    this.api.createDrawItGame(game).subscribe(data => {
      console.log("create game", data)
      if (data) {
        this.games.push(data);
        this.resetNewGame();
      }
    });
  }

  onGameChange(game: DrawIt) {
    this.api.updateDrawItGame(game).subscribe(data => {
      if (data) {
        console.log("changed game", data)
        this.games[this.games.findIndex(g => {
          return g._id === data._id
        })] = data;
      }
    });
  }

  resetNewGame() {
    this.newGame = {
      _id: "-1",
      name: "",
      description: "",
      words: []
    }
  }
}
