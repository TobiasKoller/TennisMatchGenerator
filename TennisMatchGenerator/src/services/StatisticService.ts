import { db } from "../db/Db";
import { DbColumnDefinition } from "../db/DbColumnDefinition";
import { StatisticData } from "../model/StatisticData";
import { INotificationService } from "../provider/NotificationProvider";
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
}
