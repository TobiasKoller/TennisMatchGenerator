import { MatchDayStatisticRoundResult } from "./MatchDayStatisticRoundResult";


export class MatchDayStatisticPlayer {
    playerId: string = "";
    totalPoints: number = 0;
    totalParticipations: number = 0;
    roundResults: MatchDayStatisticRoundResult[] = [];
}
