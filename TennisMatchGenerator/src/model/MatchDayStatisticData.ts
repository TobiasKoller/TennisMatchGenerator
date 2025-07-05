import { MatchDayStatisticPlayer } from "./MatchDayStatisticPlayer";


export class MatchDayStatisticData {
    matchDayId: string = "";
    totalPlayerCount: number = 0;
    pointsForParticipation: number = 0;
    playerResults: MatchDayStatisticPlayer[] = [];
}

