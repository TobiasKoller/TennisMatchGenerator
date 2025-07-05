import { db } from "../db/Db";
import { DbColumnDefinition } from "../db/DbColumnDefinition";
import { MatchDayRound } from "../model/MatchDayRound";
import { MatchDayStatisticRoundResult } from "../model/MatchDayStatisticRoundResult";
import { MatchDayStatisticPlayer } from "../model/MatchDayStatisticPlayer";
import { INotificationService } from "../provider/NotificationProvider";
import { PlayerService } from "./PlayerService";
import { RankingRecord } from "../model/RankingRecord";
import { SeasonService } from "./SeasonService";
import { ServiceBase } from "./ServiceBase";
import { StatisticData } from "../model/StatisticData";
import { MatchDayStatisticData } from "../model/MatchDayStatisticData";
import { StatisticSourceRecord } from "../model/StatisticSourceRecord";
import { RankingRecordDetails } from "../model/RankingRecordDetails";
import { RankingRecordDetailMatch } from "../model/RankingRecordDetailMatch";
import { RankingRecordMatchDay } from "../model/RankingRecordMatchDay";

export const StatisticColumns: DbColumnDefinition[] = [
    { column: "id", type: "string" },
    { column: "player_id", alias: "playerId", type: "string" },
    { column: "season_id", alias: "seasonId", type: "string" },
    { column: "points_for_participation", alias: "pointsForParticipation", type: "number" },
    { column: "points_for_won_games", alias: "pointsForWonGames", type: "number" }
]

export const StatistikSourceRecord: DbColumnDefinition[] = [

    { column: "r.number", alias: "number", type: "number" },
    { column: "m.court", alias: "court", type: "number" },
    { column: "m.set1", alias: "set1", type: "string" },
    { column: "m.player1_home_id", alias: "player1HomeId", type: "string" },
    { column: "m.player2_home_id", alias: "player2HomeId", type: "string" },
    { column: "m.player1_guest_id", alias: "player1GuestId", type: "string" },
    { column: "m.player2_guest_id", alias: "player2GuestId", type: "string" },
    { column: "md.date", alias: "matchDayDate", type: "date" },
    { column: "md.id", alias: "matchDayId", type: "string" }

];


const MatchColumns: DbColumnDefinition[] = [
    { column: "id", type: "string" },
    { column: "round_id", alias: "roundId", type: "string" },
    { column: "type", type: "string" },
    { column: "number", type: "number" },
    { column: "court", type: "number" },
    { column: "set1", alias: "set1Str", type: "string" },
    { column: "set2", alias: "set2Str", type: "string" },
    { column: "player1_home_id", alias: "player1HomeId", type: "string" },
    { column: "player2_home_id", alias: "player2HomeId", type: "string" },
    { column: "player1_guest_id", alias: "player1GuestId", type: "string" },
    { column: "player2_guest_id", alias: "player2GuestId", type: "string" }
];

const RoundColumns: DbColumnDefinition[] = [
    { column: "id", type: "string" },
    { column: "matchday_id", alias: "matchDayId", type: "string" },
    { column: "number", type: "number" },
    { column: "start_date", alias: "startDate", type: "date" },
    { column: "end_date", alias: "endDate", type: "date" },
    { column: "courts", type: "json" },
    { column: "is_active", alias: "isActive", type: "boolean" }
];


export class StatisticService extends ServiceBase {
    private _playerService: PlayerService;
    private _seasonService: SeasonService;

    constructor(seasonId: string, notificationService: INotificationService) {
        super(seasonId, notificationService);

        this._seasonService = new SeasonService();
        this._playerService = new PlayerService(seasonId, notificationService);
    }

    async getStatistics(): Promise<StatisticData[]> {
        const database = await db;
        const statistics = await database.safeSelect<StatisticData>(StatisticColumns, "statistic", `where season_id=?`, [this.seasonId]);
        return statistics;
    }

    async createStatistic(statistic: StatisticData): Promise<void> {
        const database = await db;
        await database.execute(`INSERT INTO statistic (id, player_id, season_id, points_for_participation, points_for_won_games) VALUES (?,?,?,?,?)`,
            [statistic.id, statistic.playerId, statistic.seasonId, statistic.pointsForParticipation, statistic.pointsForWonGames]);
    }



    // async getRankingOld(): Promise<RankingRecord[]> {
    //     const database = await db;
    //     //punkte und Spielteilnahmen addieren zu gesamtpunkten
    //     const statistics = await database.safeSelect<StatisticData>(StatisticColumns, "statistic", `where season_id=? order by points_for_participation + points_for_won_games desc`, [this.seasonId]);

    //     const playerService = new PlayerService(this.seasonId, this.noticiationService);
    //     const players = await playerService.getAllPlayers();

    //     var userPoints: Record<string, RankingRecord> = {};

    //     for (const stat of statistics) {
    //         const player = players.find(p => p.id === stat.playerId);
    //         if (!player) continue;

    //         if (!userPoints[stat.playerId])
    //             userPoints[stat.playerId] = new RankingRecord(stat.playerId, `${player.firstname} ${player.lastname}`, 0, 0);

    //         const totalPoints = stat.pointsForParticipation + stat.pointsForWonGames;

    //         userPoints[stat.playerId].totalPoints += totalPoints; // Addiere die Punkte
    //         userPoints[stat.playerId].participations += 1; // Erhöhe die Anzahl der Teilnahmen
    //     };


    //     // Sortiere die Spieler nach den Gesamtpunkten
    //     const ranking = Object.values(userPoints).sort((a, b) => b.totalPoints - a.totalPoints);

    //     //platzierung
    //     ranking.forEach((record, index) => {
    //         record.position = index + 1; // Platzierung beginnt bei 1

    //     });
    //     return ranking;
    // }

    async getRanking(): Promise<RankingRecord[]> {
        const database = await db;
        const players = await this._playerService.getAllPlayers();
        var settings = await this._seasonService.getSettings();

        var records = await database.safeSelect<StatisticSourceRecord>(StatistikSourceRecord, "match", ` m
                    inner join round r on m.round_id = r.id
                    inner join matchday md on r.matchday_id = md.id where md.season_id=?`, [this.seasonId]);

        var playerMap: Record<string, RankingRecord> = {};

        const mapPlayer = (matchdayId: string, id: string) => {
            if (!id) return;

            if (!playerMap[id]) {
                const player = players.find(p => p.id === id);
                if (player) playerMap[id] = new RankingRecord(id, `${player.firstname} ${player.lastname}`, 0, []);
                else playerMap[id] = new RankingRecord(id, `Unbekannt (${id})`, 0, []);
            }

            if (!playerMap[id].participationDays.includes(matchdayId)) {
                playerMap[id].participationDays.push(matchdayId);
            }
        }

        for (var record of records) {
            mapPlayer(record.matchDayId, record.player1HomeId);
            mapPlayer(record.matchDayId, record.player2HomeId);
            mapPlayer(record.matchDayId, record.player1GuestId);
            mapPlayer(record.matchDayId, record.player2GuestId);

            const set1 = record.set1.split(':').map(Number);

            if (record.player1HomeId) playerMap[record.player1HomeId].totalPoints += set1[0];
            if (record.player2HomeId) playerMap[record.player2HomeId].totalPoints += set1[0];
            if (record.player1GuestId) playerMap[record.player1GuestId].totalPoints += set1[1];
            if (record.player2GuestId) playerMap[record.player2GuestId].totalPoints += set1[1];
        }

        var participationPoints = settings.pointsForParticipation || 0;
        var sortedList = Object.values(playerMap).map(record => {
            record.totalPoints += record.participationDays.length * participationPoints; // Add participation points

            return record;
        }).sort((a, b) => b.totalPoints - a.totalPoints);

        return sortedList.map((record, index) => {
            record.position = index + 1; // Set position based on sorted order
            return record;
        });
    }

    async getRankingForPlayer(playerId: string): Promise<RankingRecordDetails> {
        const database = await db;
        var records = await database.safeSelect<StatisticSourceRecord>(StatistikSourceRecord, "match", ` m
                        inner join round r on m.round_id = r.id
                        inner join matchday md on r.matchday_id = md.id
                        where season_id=? and (
                            m.player1_guest_id=? or 
                            m.player2_guest_id=? or 
                            m.player1_home_id=? or 
                            m.player2_home_id=?
                        )`, [this.seasonId, playerId, playerId, playerId, playerId]);

        var result = new RankingRecordDetails();
        for (var record of records) {

            let matchDay = result.MatchDays.find(md => md.matchDayId === record.matchDayId);
            if (!matchDay) {
                matchDay = new RankingRecordMatchDay(record.matchDayId, record.matchDayDate, []);
                result.MatchDays.push(matchDay);
            }

            let isHomePlayer = record.player1HomeId === playerId || record.player2HomeId === playerId;
            if (record.set1) {
                const setParts = record.set1.split(':').map(Number);
                matchDay.totalGames += isHomePlayer ? setParts[0] : setParts[1];
                matchDay.matches.push(new RankingRecordDetailMatch(isHomePlayer, setParts[0], setParts[1]));
            }
        }


        return result;
    }

    async getNumberOfMatchDays(): Promise<number> {
        const database = await db;
        const result: any = await database.select(`SELECT COUNT(*) as count FROM matchday WHERE season_id=?`, [this.seasonId]);
        return result[0].count;
    }

    async getNumberOfPlayers(): Promise<number> {
        const database = await db;
        const result: any[] = await database.select(`select count(distinct player_id) as count from statistic
                                    where season_id=?`, [this.seasonId]);

        return result[0].count;
    }

    async getMatchDayStatistics(matchDayId: string): Promise<MatchDayStatisticData> {
        let stat = new MatchDayStatisticData();
        const database = await db;
        const rounds = await database.safeSelect<MatchDayRound>(RoundColumns, "round", `where matchday_id=?`, [matchDayId]);
        if (rounds.length === 0) return stat;

        const players = await this._playerService.getPlayersByMatchDayId(matchDayId);
        const matches = await database.safeSelect<any>(MatchColumns, "match", `where round_id in (select id from round where matchday_id=?)`, [matchDayId]);

        var settings = await this._seasonService.getSettings();

        stat.matchDayId = matchDayId;
        stat.totalPlayerCount = 0;
        stat.pointsForParticipation = settings.pointsForParticipation || 0; // Default to 0 if not set

        let playerList: string[] = [];
        for (const player of players) {
            let playerStat: MatchDayStatisticPlayer = {
                player: player,
                totalPoints: 0,
                totalMatchesPlayed: 0,
                roundResults: []
            };

            // Filter matches for the current player
            const playerMatches = matches.filter(m => m.player1HomeId === player.id || m.player2HomeId === player.id || m.player1GuestId === player.id || m.player2GuestId === player.id);
            if (playerMatches.length === 0 || playerList.includes(player.id)) continue; // Skip if no matches found for the player

            playerList.push(player.id);
            for (const match of playerMatches) {
                let result = "";
                let points = 0;
                let games = match.set1Str || "";

                const isHomePlayer = match.player1HomeId === player.id || match.player2HomeId === player.id;

                // Determine the result and points based on the match data
                if (match.set1Str) {
                    const set1 = match.set1Str.split(':').map(Number);

                    if (isHomePlayer) {
                        points += set1[0];
                        result = set1[0] > set1[1] ? "Won" : (set1[0] < set1[1] ? "Lost" : "Draw");
                    }
                    else {
                        points += set1[1];
                        result = set1[1] > set1[0] ? "Won" : (set1[1] < set1[0] ? "Lost" : "Draw");
                    }
                }

                // Add points for participation
                // points += 1; // Assuming 1 point for participation

                playerStat.totalMatchesPlayed += 1;
                playerStat.totalPoints += points;
                playerStat.roundResults.push({ games, result, points } as MatchDayStatisticRoundResult);
            }

            stat.playerResults.push(playerStat);
            stat.totalPlayerCount = stat.playerResults.length;
        }

        return stat;
    }
}
