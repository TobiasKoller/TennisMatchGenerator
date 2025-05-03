import { Match } from "../model/Match";
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

  private getUsedPlayerIds(pairs: PlayerPair[]): string[] {
    const usedPlayerIds: string[] = [];
    pairs.forEach(pair => {
      usedPlayerIds.push(pair.player1id);
      usedPlayerIds.push(pair.player2id);
    });
    return usedPlayerIds;
  }


  public generate(roundId: string, courtNumbers: number[]): MatchResult {
    const { groupA, groupB, groupC } = this.groupPlayers();


    // const pairsAB = this.generatePairs(groupA, groupB,[]);
    // var usedPlayerIds = this.getUsedPlayerIds(pairsAB);
    // const pairsBC = this.generatePairs(groupB, groupC,usedPlayerIds);
    // usedPlayerIds = [...usedPlayerIds, ...this.getUsedPlayerIds(pairsBC)];
    // const allPairs = this.shuffleArray([...pairsAB, ...pairsBC]);
    const allPairs = this.generatePairs(groupA, groupB, groupC);
    const usedPlayerIds: string[] = [];
    const doubleMatches: Match[] = [];
    const singleMatches: Match[] = [];

    let courtIndex = 0;
    let matchNumber = 1;

    // Doppel-Matches
    //for (let i = 0; i < allPairs.length - 1 && courtIndex < courtNumbers.length; i += 2) {
    while (allPairs.length > 0 && courtIndex < courtNumbers.length) {

      if (allPairs.length >= 2) {
        const team1 = allPairs.pop()!;//allPairs[i];
        const team2 = allPairs.pop()!;//allPairs[i + 1];

        usedPlayerIds.push(team1.player1id, team1.player2id, team2.player1id, team2.player2id);
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
      }
      else if (allPairs.length == 1) {
        const team1 = allPairs.pop()!;//allPairs[i];
        usedPlayerIds.push(team1.player1id, team1.player2id);
        const match = new Match();
        match.id = uuidv4(); // Assuming you have a function to generate unique IDs
        match.roundId = roundId;
        match.type = "single";
        match.number = matchNumber++;
        match.court = courtNumbers[courtIndex++];

        match.player1HomeId = team1.player1id;
        match.player1GuestId = team1.player2id;

        singleMatches.push(match);
      }

    }

    const unusedPlayers = this.players.filter(p => !usedPlayerIds.includes(p.player!.id));

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

  private generatePairs(
    groupA: MatchDayRoundPlayer[],
    groupB: MatchDayRoundPlayer[],
    groupC: MatchDayRoundPlayer[]
  ): PlayerPair[] {
    const pairs: PlayerPair[] = [];
    const usedA = new Set<string>();
    const usedB = new Set<string>();
    const usedC = new Set<string>();

    let toggle = true; // true = A, false = C

    for (const playerB of this.shuffleArray(groupB)) {
      if (usedB.has(playerB.player!.id)) continue;

      let partner: MatchDayRoundPlayer | undefined;

      if (toggle) {
        partner = this.shuffleArray(groupA).find(p => !usedA.has(p.player!.id));
        if (partner) usedA.add(partner.player!.id);
      } else {
        partner = this.shuffleArray(groupC).find(p => !usedC.has(p.player!.id));
        if (partner) usedC.add(partner.player!.id);
      }

      if (partner) {
        pairs.push({
          player1id: playerB.player!.id,
          player2id: partner.player!.id,
          totalSkill: playerB.player!.skillRating + partner.player!.skillRating
        });
        usedB.add(playerB.player!.id);
      }

      toggle = !toggle;
    }

    const remaining = this.players.filter(p => !usedA.has(p.player!.id) && !usedB.has(p.player!.id) && !usedC.has(p.player!.id));
    const remainingCopy = [...this.shuffleArray(remaining)];
    for (const player of remainingCopy) {
      if (remainingCopy.length < 2) break; // Ensure we have at least two players to form a pair
      const partner = remainingCopy.pop(); // Get the last player from the array
      const partner2 = remainingCopy.pop(); // Get the last player from the array

      pairs.push({
        player1id: partner!.player!.id,
        player2id: partner2!.player!.id,
        totalSkill: player.player!.skillRating + partner!.player!.skillRating
      });
    }

    return pairs;
  }


  // private generatePairs(group1: MatchDayRoundPlayer[], group2: MatchDayRoundPlayer[], usedPlayerIds: string[]): PlayerPair[] {
  //   const shuffled1 = this.shuffleArray(group1.filter(player => !usedPlayerIds.includes(player.player!.id)));
  //   const shuffled2 = this.shuffleArray(group2.filter(player => !usedPlayerIds.includes(player.player!.id)));
  //   const minLength = Math.min(shuffled1.length, shuffled2.length);

  //   const pairs: PlayerPair[] = [];

  //   for (let i = 0; i < minLength; i++) {
  //     pairs.push({
  //       player1id: shuffled1[i].player!.id,
  //       player2id: shuffled2[i].player!.id,
  //       totalSkill: shuffled1[i].player!.skillRating + shuffled2[i].player!.skillRating
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

