import { db } from "../db/Db";
import { DbColumnDefinition } from "../db/DbColumnDefinition";
import { StatisticData } from "../model/StatisticData";
import { INotificationService } from "../provider/NotificationProvider";
import { PlayerService } from "./PlayerService";
import { RankingRecord } from "./RankingRecord";
import { ServiceBase } from "./ServiceBase";

export const StatisticColumns: DbColumnDefinition[] = [
    { column: "id", type: "string" },
    { column: "player_id", alias: "playerId", type: "string" },
    { column: "season_id", alias: "seasonId", type: "string" },
    { column: "points_for_participation", alias: "pointsForParticipation", type: "number" },
    { column: "points_for_won_games", alias: "pointsForWonGames", type: "number" }
]


export class StatisticService extends ServiceBase {
    constructor(seasonId: string, notificationService: INotificationService) {
        super(seasonId, notificationService);
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
        const result: any[] = await database.select(`SELECT  COUNT(DISTINCT round_player.player_id) as count  FROM round_player
                                    inner join round on round_player.round_id = round.id
                                    inner join matchday on matchday.id = round.matchday_id
                                    where season_id=?`, [this.seasonId]);

        return result[0].count;
    }
}
