import { db } from "../db/Db";
import { DbColumnDefinition } from "../db/DbColumnDefinition";
import { MatchDayRound } from "../model/MatchDayRound";
import { MatchDayStatisticRoundResult } from "../model/MatchDayStatisticRoundResult";
import { MatchDayStatisticPlayer } from "../model/MatchDayStatisticPlayer";
import { INotificationService } from "../provider/NotificationProvider";
import { PlayerService } from "./PlayerService";
import { RankingRecord } from "./RankingRecord";
import { SeasonService } from "./SeasonService";
import { ServiceBase } from "./ServiceBase";
import { StatisticData } from "../model/StatisticData";
import { MatchDayStatisticData } from "../model/MatchDayStatisticData";

export const StatisticColumns: DbColumnDefinition[] = [
    { column: "id", type: "string" },
    { column: "player_id", alias: "playerId", type: "string" },
    { column: "season_id", alias: "seasonId", type: "string" },
    { column: "points_for_participation", alias: "pointsForParticipation", type: "number" },
    { column: "points_for_won_games", alias: "pointsForWonGames", type: "number" }
]

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

    async getRanking(): Promise<RankingRecord[]> {
        const database = await db;
        //punkte und Spielteilnahmen addieren zu gesamtpunkten
        const statistics = await database.safeSelect<StatisticData>(StatisticColumns, "statistic", `where season_id=? order by points_for_participation + points_for_won_games desc`, [this.seasonId]);

        const playerService = new PlayerService(this.seasonId, this.noticiationService);
        const players = await playerService.getAllPlayers();

        var userPoints: Record<string, RankingRecord> = {};

        for (const stat of statistics) {
            const player = players.find(p => p.id === stat.playerId);
            if (!player) continue;

            if (!userPoints[stat.playerId])
                userPoints[stat.playerId] = new RankingRecord(stat.playerId, `${player.firstname} ${player.lastname}`, 0, 0);

            const totalPoints = stat.pointsForParticipation + stat.pointsForWonGames;

            userPoints[stat.playerId].totalPoints += totalPoints; // Addiere die Punkte
            userPoints[stat.playerId].participations += 1; // Erhöhe die Anzahl der Teilnahmen
        };


        // Sortiere die Spieler nach den Gesamtpunkten
        const ranking = Object.values(userPoints).sort((a, b) => b.totalPoints - a.totalPoints);

        //platzierung
        ranking.forEach((record, index) => {
            record.position = index + 1; // Platzierung beginnt bei 1

        });
        return ranking;
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
        stat.totalPlayerCount = players.length;

        for (const player of players) {
            let playerStat: MatchDayStatisticPlayer = {
                playerId: player.id,
                totalPoints: 0,
                totalParticipations: settings.pointsForParticipation,
                roundResults: []
            };

            // Filter matches for the current player
            const playerMatches = matches.filter(m => m.player1HomeId === player.id || m.player2HomeId === player.id || m.player1GuestId === player.id || m.player2GuestId === player.id);

            for (const match of playerMatches) {
                let result = "";
                let points = 0;
                let games = match.set1Str || "";

                const isHomePlayer = match.player1HomeId === player.id || match.player2HomeId === player.id;
                const isGuestPlayer = match.player1GuestId === player.id || match.player2GuestId === player.id;

                // Determine the result and points based on the match data
                if (match.set1Str) {
                    const set1 = match.set1Str.split(':').map(Number);

                    if (isHomePlayer) points += set1[0];
                    else points += set1[1];

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
                points += 1; // Assuming 1 point for participation

                playerStat.totalPoints += points;
                playerStat.roundResults.push({ games, result, points } as MatchDayStatisticRoundResult);
            }

            stat.playerResults.push(playerStat);
        }

        return stat;
    }
}
