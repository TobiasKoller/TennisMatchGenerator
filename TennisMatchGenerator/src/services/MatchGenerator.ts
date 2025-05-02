import { Match } from "../model/Match";
import { MatchDay } from "../model/Matchday";
import { MatchDayRoundPlayer } from "../model/MatchDayRoundPlayer";
import { v4 as uuidv4 } from "uuid";
import { MatchResult } from "../model/MatchResult";

interface PlayerPair {
  player1id: string;
  player2id: string;
  totalSkill: number;
}




export class MatchGenerator {
  constructor(private players: MatchDayRoundPlayer[]) { }

  public generate(roundId: string, courtNumbers: number[]): MatchResult {
    const { groupA, groupB, groupC } = this.groupPlayers();
    const pairsAB = this.generatePairsWithoutRepetition(groupA, groupB);
    const pairsBC = this.generatePairsWithoutRepetition(groupB, groupC);

    const allPairs = this.shuffleArray([...pairsAB, ...pairsBC]);

    const usedPlayerIds = new Set<string>();
    const doubleMatches: Match[] = [];
    const singleMatches: Match[] = [];

    let courtIndex = 0;
    let matchNumber = 1;

    // Doppel-Matches
    for (let i = 0; i < allPairs.length - 1 && courtIndex < courtNumbers.length; i += 2) {
      const team1 = allPairs[i];
      const team2 = allPairs[i + 1];

      if (
        usedPlayerIds.has(team1.player1id) || usedPlayerIds.has(team1.player2id) ||
        usedPlayerIds.has(team2.player1id) || usedPlayerIds.has(team2.player2id)
      ) {
        continue;
      }

      const match = new Match();
      match.id = uuidv4(); // Assuming you have a function to generate unique IDs
      match.roundId = roundId;
      match.type = "double";
      match.number = matchNumber++;
      match.court = courtNumbers[courtIndex++];

      match.player1HomeId = team1.player1id;
      match.player2HomeId = team1.player2id;
      match.player1GuestId = team2.player1id;
      match.player2GuestId = team2.player2id;

      doubleMatches.push(match);

      [team1.player1id, team1.player2id, team2.player1id, team2.player2id].forEach(id => usedPlayerIds.add(id));
    }

    const remainingPlayers = this.players.filter(p => !usedPlayerIds.has(p.player!.id));

    // Einzel-Matches
    for (let i = 0; i < remainingPlayers.length - 1 && courtIndex < courtNumbers.length; i += 2) {
      const p1 = remainingPlayers[i];
      const p2 = remainingPlayers[i + 1];

      const match = new Match();
      match.id = uuidv4(); // Assuming you have a function to generate unique IDs
      match.roundId = roundId
      match.type = "single";
      match.number = matchNumber++;
      match.court = courtNumbers[courtIndex++];

      match.player1HomeId = p1.player!.id;
      match.player2HomeId = "";
      match.player1GuestId = p2.player!.id;
      match.player2GuestId = "";

      singleMatches.push(match);

      usedPlayerIds.add(p1.player!.id);
      usedPlayerIds.add(p2.player!.id);
    }

    const unusedPlayers = this.players.filter(p => !usedPlayerIds.has(p.player!.id));

    return {
      doubles: doubleMatches,
      singles: singleMatches,
      unusedPlayers
    };
  }

  private groupPlayers(): { groupA: MatchDayRoundPlayer[]; groupB: MatchDayRoundPlayer[]; groupC: MatchDayRoundPlayer[] } {
    const sorted = [...this.players].sort((a, b) => b.player!.skillRating - a.player!.skillRating);
    const groupSize = Math.ceil(sorted.length / 3);

    return {
      groupA: sorted.slice(0, groupSize),
      groupB: sorted.slice(groupSize, groupSize * 2),
      groupC: sorted.slice(groupSize * 2)
    };
  }

  private generatePairsWithoutRepetition(group1: MatchDayRoundPlayer[], group2: MatchDayRoundPlayer[]): PlayerPair[] {
    const shuffled1 = this.shuffleArray(group1);
    const shuffled2 = this.shuffleArray(group2);
    const minLength = Math.min(shuffled1.length, shuffled2.length);

    const pairs: PlayerPair[] = [];

    for (let i = 0; i < minLength; i++) {
      pairs.push({
        player1id: shuffled1[i].player!.id,
        player2id: shuffled2[i].player!.id,
        totalSkill: shuffled1[i].player!.skillRating + shuffled2[i].player!.skillRating
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

}

