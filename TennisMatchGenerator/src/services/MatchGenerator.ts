import { Match } from "../model/Match";
import { MatchDayRoundPlayer } from "../model/MatchDayRoundPlayer";
import { v4 as uuidv4 } from "uuid";
import { MatchResult } from "../model/MatchResult";
import { Player } from "../model/Player";

interface PlayerPair {
  id: number;
  player1: Player;
  player2: Player;
  totalSkill: number;
}




export class MatchGenerator {
  private players: MatchDayRoundPlayer[] = [];
  constructor(players: MatchDayRoundPlayer[], countPlayersInMatch: Record<string, number>) {

    for (var player of players) {
      player.numberOfRoundsPlayed = countPlayersInMatch[player.playerId] || 0;
    }

    this.players = players;
  }


  public generate(roundId: string, courtNumbers: number[]): MatchResult {
    const maxPlayerCount = courtNumbers.length * 4; // Assuming each court can have 2 players in doubles
    const simplePairs = this.generatePairsSimple(maxPlayerCount);
    var allPairs = this.orderTeams(simplePairs, true);

    const usedPlayerIds: string[] = [];
    let singlePair: PlayerPair | null = null;

    const doubleMatches: Match[] = [];
    const singleMatches: Match[] = [];

    let courtIndex = 0;
    let matchNumber = 1;

    if (allPairs.length % 2 != 0) {
      //es wird ein Einzel geben.
      singlePair = this.getClosestPair(allPairs);
      allPairs.splice(allPairs.findIndex(p => p.id == singlePair!.id), 1);

    }

    // Doppel-Matches
    for (let i = 0; i < allPairs.length - 1 && courtIndex < courtNumbers.length; i += 2) {
      const team1 = allPairs[i];
      const team2 = allPairs[i + 1];

      usedPlayerIds.push(team1.player1.id, team1.player2.id, team2.player1.id, team2.player2.id);
      const match = new Match();
      match.id = uuidv4(); // Assuming you have a function to generate unique IDs
      match.roundId = roundId;
      match.type = "double";
      match.number = matchNumber++;
      match.court = courtNumbers[courtIndex++];

      match.player1HomeId = team1.player1.id;
      match.player2HomeId = team1.player2.id;
      match.player1GuestId = team2.player1.id;
      match.player2GuestId = team2.player2.id;

      doubleMatches.push(match);
    }



    if (courtIndex < courtNumbers.length && singlePair) {

      usedPlayerIds.push(singlePair.player1.id, singlePair.player2.id);
      const match = new Match();
      match.id = uuidv4(); // Assuming you have a function to generate unique IDs
      match.roundId = roundId;
      match.type = "single";
      match.number = matchNumber++;
      match.court = courtNumbers[courtIndex++];

      match.player1HomeId = singlePair.player1.id;
      match.player1GuestId = singlePair.player2.id;

      singleMatches.push(match);
    }

    const unusedPlayers = this.players.filter(p => !usedPlayerIds.includes(p.player!.id));

    return {
      doubles: doubleMatches,
      singles: singleMatches,
      unusedPlayers
    };
  }

  private getClosestPair(pairs: PlayerPair[]): PlayerPair {

    var closestPair: PlayerPair = pairs[0];
    for (var i = 1; i < pairs.length; i++) {
      var skillDiff = Math.abs(pairs[i].player1.skillRating - pairs[i].player2.skillRating);
      if (skillDiff < Math.abs(closestPair.player1.skillRating - closestPair.player2.skillRating)) {
        closestPair = pairs[i];
      }
    }
    return closestPair;
  }


  private generatePairsSimple(maxPlayerCount: number): PlayerPair[] {
    const pairs: PlayerPair[] = [];
    if (!this.players || this.players.length < 2) return pairs;

    var playersCopy = [...this.players];
    if (playersCopy.length > maxPlayerCount) { //wenn mehr Spieler als maxPlayerCount vorhanden sind, dann werden die Spieler mit den meisten Runden entfernt
      var playersCopy = playersCopy.sort((a, b) => a.numberOfRoundsPlayed! - b.numberOfRoundsPlayed!);
      playersCopy = playersCopy.slice(0, maxPlayerCount);
    }

    const shuffledPlayers = this.shuffleArray(playersCopy);
    let counter = 0;
    while (shuffledPlayers.length > 1) {
      if (shuffledPlayers.length < 2) break; // Ensure we have at least two players to form a pair
      const player1 = shuffledPlayers.pop()!;
      const player2 = shuffledPlayers.pop()!;

      pairs.push({
        id: counter++,
        player1: player1.player!,
        player2: player2.player!,
        totalSkill: player1.player!.skillRating + player2.player!.skillRating
      });
    }

    return pairs;
  }


  private shuffleArray<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  private orderTeams(teams: PlayerPair[], asc: boolean): PlayerPair[] {
    return teams.sort((a, b) => {
      const skillDiff = a.totalSkill - b.totalSkill;
      return asc ? skillDiff : -skillDiff;
    });
  }

}

