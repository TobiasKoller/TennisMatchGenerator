import { Season } from "../model/Season";
import { Setting as Settings } from "../model/Setting";
import { SeasonService } from "./SeasonService";

const columns = ["numberOfCourts", "pointsForWin", "pointsForParticipation"] as const;
export const tableName = "setting" as const;

export class SettingService {
    season: Season;
    seasonService: SeasonService;

    constructor(seasonService: SeasonService, season: Season) {
        this.season = season;
        this.seasonService = seasonService;
    }

    async getSettings(): Promise<Settings> {
        // const database = await db; // Warte auf die Singleton-Datenbank
        // var records = await database.select<Settings[]>(`SELECT ${columns.join(",")} FROM ${tableName}`);
        // if (records.length === 0) {
        //     return { numberOfCourts: 1, pointsForWin: 1, pointsForParticipation: 1 };
        // }

        // return records[0];

        return this.season.settings;
    }


    async saveSettings(settings: Settings) {
        // const database = await db;
        // await database.execute(`UPDATE ${tableName} SET ${columns.join("=?,")}=?`, [
        //     settings.numberOfCourts,
        //     settings.pointsForWin,
        //     settings.pointsForParticipation,
        // ]);

        this.season.settings = settings;
    }
}
