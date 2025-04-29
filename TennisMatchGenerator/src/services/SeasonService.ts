import { db } from "../db/Db";
import { Season } from "../model/Season";
import { v4 as uuidv4 } from "uuid";
import { Setting } from "../model/Setting";
import { DbColumnDefinition, safeSelect } from "../db/DbHelper";

const tableName = "season" as const;

const SeasonColumns: DbColumnDefinition[] = [
    { column: "id", type: "string" },
    { column: "year", type: "string" },
    { column: "description", type: "string" },
    { column: "settings", type: "json" },
    { column: "is_active", alias: "isActive", type: "boolean" },
    { column: "number", type: "number" }
];

export class SeasonService {

    public async getCurrentSeason(createIfNotFound = true): Promise<Season | null> {
        const database = await db;
        var seasons = await safeSelect<Season>(database, SeasonColumns, tableName, "LIMIT 1");

        if (seasons.length === 0) {
            if (createIfNotFound) return await this.createSeason();
            else throw new Error("Keine aktive Saison gefunden.");
        };
        return seasons[0];
    }

    public async setActiveSeason(seasonId: string): Promise<void> {
        const database = await db;
        await database.execute(`UPDATE ${tableName} SET is_active=0`);
        await database.execute(`UPDATE ${tableName} SET is_active=1 WHERE id=?`, [seasonId]);
    }

    private async createSeason(): Promise<Season | null> {
        // Hier wird eine neue Saison erstellt und in die Datenbank eingefügt
        const database = await db;
        var year = new Date().getFullYear();

        var prevSeason = await this.getPreviousSeason();

        var description = `Saison ${year}`;
        var settings = prevSeason !== null ? prevSeason.settings : new Setting(); //Einstellungen aus der Vorjahressaison übernehmen
        var seasonId = uuidv4();

        await database.execute(`INSERT INTO ${tableName} (id,year,description,settings,is_active) VALUES (?,?,?,?,?)`, [seasonId, year, description, JSON.stringify(settings), 1]);
        this.setActiveSeason(seasonId);

        return this.getCurrentSeason(false);
    }

    private async getPreviousSeason(): Promise<Season | null> {
        const database = await db;
        var prevSeason = await safeSelect<Season>(database, SeasonColumns, tableName, "LIMIT 1");
        return (prevSeason.length === 0) ? null : prevSeason[0];
    }

    public async saveSettings(seasonId: string, settings: Setting): Promise<void> {
        const database = await db;

        await database.execute(`UPDATE ${tableName} SET settings=? WHERE id=?`, [JSON.stringify(settings), seasonId]);
    }

    public async getSettings(seasonId: string): Promise<Setting> {
        var season = await this.getCurrentSeason();
        return season?.settings ?? new Setting();
    }

}
