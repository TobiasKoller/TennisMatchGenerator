// import { Season } from "../model/Season";
// import { Setting as Settings } from "../model/Setting";
// import { SeasonService } from "./SeasonService";
// import { ServiceBase } from "./ServiceBase";

// const columns = ["numberOfCourts", "pointsForWin", "pointsForParticipation"] as const;
// export const tableName = "setting" as const;

// export class SettingService extends ServiceBase {


//     constructor(seasonService: SeasonService, season: Season) {
//         super(seasonService, season);
//     }

//     async getSettings(): Promise<Settings> {
//         return this.season.settings;
//     }


//     async saveSettings(settings: Settings) {
//         // const database = await db;
//         // await database.execute(`UPDATE ${tableName} SET ${columns.join("=?,")}=?`, [
//         //     settings.numberOfCourts,
//         //     settings.pointsForWin,
//         //     settings.pointsForParticipation,
//         // ]);

//         this.season.settings = settings;
//         this.save();
//     }
// }
