import { RankingRecordDetailMatch } from "./RankingRecordDetailMatch";


export class RankingRecordMatchDay {
    matchDayId: string = "";
    matchDayDate: Date | null = null;
    totalGames: number = 0;
    matches: RankingRecordDetailMatch[] = [];

    constructor(matchDayId: string, matchDayDate: Date | null, matches: RankingRecordDetailMatch[], totalGames: number = 0) {
        this.matchDayId = matchDayId;
        this.matches = matches;
        this.matchDayDate = matchDayDate;
        this.totalGames = totalGames;
    }
}
