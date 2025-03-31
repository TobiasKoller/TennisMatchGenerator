import { db } from "../db/Db";
import { Setting as Settings } from "../model/Setting";

const columns = ["numberOfCourts", "pointsForWin", "pointsForParticipation"] as const;
const tableName = "setting" as const;

export class SettingService {

    async getSettings(): Promise<Settings> {
        const database = await db; // Warte auf die Singleton-Datenbank
        var records = await database.select<Settings[]>(`SELECT ${columns.join(",")} FROM ${tableName}`);
        if (records.length === 0) {
            return { numberOfCourts: 1, pointsForWin: 1, pointsForParticipation: 1 };
        }
        
        return records[0];
    }

    
    async saveSettings(settings: Settings) {
        const database = await db;
        await database.execute(`UPDATE ${tableName} SET ${columns.join("=?,")}=?`, [
            settings.numberOfCourts,
            settings.pointsForWin,
            settings.pointsForParticipation,
        ]);
    }
}
