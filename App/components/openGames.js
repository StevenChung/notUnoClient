import React, {Component} from 'react';

import {
  Text,
  View,
  TextInput,
  StyleSheet,
} from 'react-native';

const GameListItem = require('./gameListItem');
const Game = require('./game');

// get style sheet from external
const styles = require('./styles/styles').openGames;

class openGames extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: ''
    }
  }

  chooseGame(gameId) {
    fetch('https://notuno.herokuapp.com/api/game/getgame', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        gameId: gameId
      })
    })
    .then((response) => response.json())
    .then((parsedResponse) => {
      if (parsedResponse.gameComplete === 0) {
        this.setState({error: 'This game hasn\'t started yet.'});
        setTimeout(() => this.setState({error: ''}), 5000);
        return;
      } else if (parsedResponse.gameComplete === 2) {
        this.setState({error: 'This game is over. Didn\'t anyone tell you?'});
        setTimeout(() => this.setState({error: ''}), 5000);
        return;
      }
      const userId = this.props.parentState.appUserId;
      const players = parsedResponse.players;

      let assignedPlayers = {
        currentPlayer: null,
        topPlayer: null,
        rightPlayer: null,
        leftPlayer: null,
      };

      var myPosition;

      for (let i=0; i < players.length; i++) {
        let player = players[i];
        if (player.userId === userId) {
          assignedPlayers.currentPlayer = player;
          myPosition = player.position;
        } else if (assignedPlayers.topPlayer === null) {
          assignedPlayers.topPlayer = player;
        } else if (assignedPlayers.leftPlayer === null) {
          assignedPlayers.leftPlayer = player;
        } else if (assignedPlayers.rightPlayer == null) {
          assignedPlayers.rightPlayer = player;
        }
      }


      let cards = JSON.parse(assignedPlayers.currentPlayer.hand);
      let playedCards = JSON.parse(parsedResponse.playedCards);
      this.props.navigator.push({
        title: 'game',
        component: Game,
        passProps: {
          game: parsedResponse,
          players: assignedPlayers,
          hand: cards,
          gameId: gameId,
          userId: this.props.parentState.appUserId,
          currentCard: playedCards[playedCards.length-1],
          myPosition: myPosition
        }
      });
    })
    .catch((err) => {
      console.log(err);
    });
  }

  render() {
    const openGames = this.props.parentState.appUserGames;
    let games;
    if (openGames.length === 0) {
      console.log('empty set of games');
    } else {
      games = openGames.map((game, index) => {
        return <GameListItem
          key={index}
          index={index}
          game={game}
          chooseGame={this.chooseGame.bind(this)}/>
      });
    }
    return (
      <View style={styles.container}>
        <View style={{flex:0.25}} />
        <Text style={styles.title}> Your Open Games </Text>
        <View style={styles.gameList}>
          {games}
        </View>
        <Text> {this.state.error} </Text>
        <View style={{flex: 0.5}}></View>
      </View>
    )
  }
};

module.exports = openGames;
