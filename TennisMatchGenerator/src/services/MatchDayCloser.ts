import { Match } from "../model/Match";
import { StatisticData } from "../model/StatisticData";
import { MatchDayService } from "./MatchDayService";
import { v4 as uuidv4 } from 'uuid';
import { SeasonService } from "./SeasonService";

export class MatchDayCloser {

    constructor(private seasonService: SeasonService, private matchDayService: MatchDayService) {
    }

    public async CalculateMatchDayPoints(seasonId: string, matchDayId: string) {
        //dictionary playerId -> points
        var records: Record<string, StatisticData> = {};

        var rounds = await this.matchDayService.getAllMatchDayRounds(matchDayId);

        var settings = await this.seasonService.getSettings();

        for (var round of rounds) {
            var matches = await this.matchDayService.getMatches(round.id);
            for (var match of matches) {

                this.initPlayerRecords(seasonId, match, settings.pointsForParticipation, records);
                let set = this.getSet(match);

                if (set) {
                    if (match.player1HomeId) records[match.player1HomeId].pointsForWonGames += set.homeGames ?? 0;
                    if (match.player2HomeId) records[match.player2HomeId].pointsForWonGames += set.homeGames ?? 0;
                    if (match.player1GuestId) records[match.player1GuestId].pointsForWonGames += set.guestGames ?? 0;
                    if (match.player2GuestId) records[match.player2GuestId].pointsForWonGames += set.guestGames ?? 0;
                }

            }
        }

        //return StatisticData from records


        return Object.values(records);
    }

    private getSet(match: Match) {
        var games = (<any>match).set1Str.split(":");
        return {
            homeGames: parseInt(games[0]) || 0,
            guestGames: parseInt(games[1]) || 0
        };
    }

    private initPlayerRecords(seasonId: string, match: Match, pointsForParticipation: number, records: Record<string, StatisticData>) {
        var statisticData: StatisticData = {
            id: uuidv4(),
            playerId: "",
            seasonId: seasonId,
            pointsForParticipation: pointsForParticipation,
            pointsForWonGames: 0

        }
        if (match.player1HomeId && !records[match.player1HomeId]) records[match.player1HomeId] = { ...statisticData, playerId: match.player1HomeId };
        if (match.player2HomeId && !records[match.player2HomeId]) records[match.player2HomeId] = { ...statisticData, playerId: match.player2HomeId };
        if (match.player1GuestId && !records[match.player1GuestId]) records[match.player1GuestId] = { ...statisticData, playerId: match.player1GuestId };
        if (match.player2GuestId && !records[match.player2GuestId]) records[match.player2GuestId] = { ...statisticData, playerId: match.player2GuestId };
    }

}