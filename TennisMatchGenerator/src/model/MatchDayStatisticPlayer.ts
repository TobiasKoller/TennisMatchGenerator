import { MatchDayStatisticRoundResult } from "./MatchDayStatisticRoundResult";
import { Player } from "./Player";


export class MatchDayStatisticPlayer {
    player: Player | null = null;
    totalPoints: number = 0;
    totalMatchesPlayed: number = 0;
    roundResults: MatchDayStatisticRoundResult[] = [];
}
