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
  constructor(private players: MatchDayRoundPlayer[]) { }

  // private getUsedPlayerIds(pairs: PlayerPair[]): string[] {
  //   const usedPlayerIds: string[] = [];
  //   pairs.forEach(pair => {
  //     usedPlayerIds.push(pair.player1id);
  //     usedPlayerIds.push(pair.player2id);
  //   });
  //   return usedPlayerIds;
  // }

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

  public generate(roundId: string, courtNumbers: number[]): MatchResult {
    const allPairs = this.generatePairsSimple();
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

      usedPlayerIds.push(singlePair.player1.id, singlePair.player2.id);
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

    if (singlePair) {
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
    // Einzel-Matches
    // while (courtIndex < courtNumbers.length && allPairs.length > 0) {
    //   const player1 = allPairs.pop()!;
    //   usedPlayerIds.push(player1.player1.id, player1.player2.id);
    //   const match = new Match();
    //   match.id = uuidv4(); // Assuming you have a function to generate unique IDs
    //   match.roundId = roundId;
    //   match.type = "single";
    //   match.number = matchNumber++;
    //   match.court = courtNumbers[courtIndex++];

    //   match.player1HomeId = player1.player1.id;
    //   match.player1GuestId = player1.player2.id;

    //   singleMatches.push(match);
    // }

    const unusedPlayers = this.players.filter(p => !usedPlayerIds.includes(p.player!.id));

    return {
      doubles: doubleMatches,
      singles: singleMatches,
      unusedPlayers
    };
  }

  private generatePairsSimple(): PlayerPair[] {
    const pairs: PlayerPair[] = [];

    const shuffledPlayers = this.shuffleArray(this.players);
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

  // public generate(roundId: string, courtNumbers: number[]): MatchResult {
  //   const { groupA, groupB, groupC } = this.groupPlayers();


  //   const allPairs = this.generatePairs(groupA, groupB, groupC);

  //   const usedPlayerIds: string[] = [];
  //   const doubleMatches: Match[] = [];
  //   const singleMatches: Match[] = [];

  //   let courtIndex = 0;
  //   let matchNumber = 1;

  //   // Doppel-Matches
  //   //for (let i = 0; i < allPairs.length - 1 && courtIndex < courtNumbers.length; i += 2) {
  //   while (allPairs.length > 0 && courtIndex < courtNumbers.length) {

  //     if (allPairs.length >= 2) {
  //       const team1 = allPairs.pop()!;//allPairs[i];
  //       const team2 = allPairs.pop()!;//allPairs[i + 1];

  //       usedPlayerIds.push(team1.player1id, team1.player2id, team2.player1id, team2.player2id);
  //       const match = new Match();
  //       match.id = uuidv4(); // Assuming you have a function to generate unique IDs
  //       match.roundId = roundId;
  //       match.type = "double";
  //       match.number = matchNumber++;
  //       match.court = courtNumbers[courtIndex++];

  //       match.player1HomeId = team1.player1id;
  //       match.player2HomeId = team1.player2id;
  //       match.player1GuestId = team2.player1id;
  //       match.player2GuestId = team2.player2id;

  //       doubleMatches.push(match);
  //     }
  //     else if (allPairs.length == 1) {
  //       const team1 = allPairs.pop()!;//allPairs[i];
  //       usedPlayerIds.push(team1.player1id, team1.player2id);
  //       const match = new Match();
  //       match.id = uuidv4(); // Assuming you have a function to generate unique IDs
  //       match.roundId = roundId;
  //       match.type = "single";
  //       match.number = matchNumber++;
  //       match.court = courtNumbers[courtIndex++];

  //       match.player1HomeId = team1.player1id;
  //       match.player1GuestId = team1.player2id;

  //       singleMatches.push(match);
  //     }

  //   }

  //   const unusedPlayers = this.players.filter(p => !usedPlayerIds.includes(p.player!.id));

  //   return {
  //     doubles: doubleMatches,
  //     singles: singleMatches,
  //     unusedPlayers
  //   };
  // }

  // private groupPlayers(): { groupA: MatchDayRoundPlayer[]; groupB: MatchDayRoundPlayer[]; groupC: MatchDayRoundPlayer[] } {
  //   const sorted = [...this.players].sort((a, b) => b.player!.skillRating - a.player!.skillRating);
  //   const groupSize = Math.ceil(sorted.length / 3);

  //   return {
  //     groupA: sorted.slice(0, groupSize),
  //     groupB: sorted.slice(groupSize, groupSize * 2),
  //     groupC: sorted.slice(groupSize * 2)
  //   };
  // }



  // private generatePairs(
  //   groupA: MatchDayRoundPlayer[],
  //   groupB: MatchDayRoundPlayer[],
  //   groupC: MatchDayRoundPlayer[]
  // ): PlayerPair[] {
  //   const pairs: PlayerPair[] = [];
  //   const usedA = new Set<string>();
  //   const usedB = new Set<string>();
  //   const usedC = new Set<string>();

  //   let toggle = true; // true = A, false = C

  //   for (const playerB of this.shuffleArray(groupB)) {
  //     if (usedB.has(playerB.player!.id)) continue;

  //     let partner: MatchDayRoundPlayer | undefined;

  //     if (toggle) {
  //       partner = this.shuffleArray(groupA).find(p => !usedA.has(p.player!.id));
  //       if (partner) usedA.add(partner.player!.id);
  //     } else {
  //       partner = this.shuffleArray(groupC).find(p => !usedC.has(p.player!.id));
  //       if (partner) usedC.add(partner.player!.id);
  //     }

  //     if (partner) {
  //       pairs.push({
  //         player1id: playerB.player!.id,
  //         player2id: partner.player!.id,
  //         totalSkill: playerB.player!.skillRating + partner.player!.skillRating
  //       });
  //       usedB.add(playerB.player!.id);
  //     }

  //     toggle = !toggle;
  //   }

  //   const remaining = this.players.filter(p => !usedA.has(p.player!.id) && !usedB.has(p.player!.id) && !usedC.has(p.player!.id));
  //   const remainingCopy = [...this.shuffleArray(remaining)];
  //   for (const player of remainingCopy) {
  //     if (remainingCopy.length < 2) break; // Ensure we have at least two players to form a pair
  //     const partner = remainingCopy.pop(); // Get the last player from the array
  //     const partner2 = remainingCopy.pop(); // Get the last player from the array

  //     pairs.push({
  //       player1id: partner!.player!.id,
  //       player2id: partner2!.player!.id,
  //       totalSkill: player.player!.skillRating + partner!.player!.skillRating
  //     });
  //   }

  //   return pairs;
  // }


  private shuffleArray<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

}

