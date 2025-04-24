import { db } from "../db/Db";
import { Season } from "../model/Season";
import { v4 as uuidv4 } from "uuid";
import { Setting } from "../model/Setting";

const tableName = "season" as const;

export class SeasonService {

    public async getCurrentSeason(createIfNotFound = true): Promise<Season | null> {
        const database = await db;
        var records = await database.select<any[]>(`SELECT * FROM ${tableName} where is_active=1 LIMIT 1`, []);
        if (records.length === 0) {
            if (createIfNotFound) return await this.createSeason();
            else throw new Error("Keine aktive Saison gefunden.");
        };

        return {
            id: records[0].id,
            name: records[0].name,
            year: records[0].year,
            description: records[0].description,
            settings: JSON.parse(records[0].settings),
            isActive: records[0].is_active == "true",
            number: records[0].number
        }
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
        var prevSeason = await database.select<any[]>(`SELECT * FROM ${tableName} order by number desc LIMIT 1`, []);
        if (prevSeason.length === 0) return null;

        return {
            id: prevSeason[0].id,
            name: prevSeason[0].name,
            year: prevSeason[0].year,
            description: prevSeason[0].description,
            settings: JSON.parse(prevSeason[0].settings),
            isActive: prevSeason[0].is_active == "true",
            number: prevSeason[0].number
        }
    }

    public async saveSettings(settings: Setting): Promise<void> {
        const database = await db;
        var season = await this.getCurrentSeason(false);
        if (!season) throw new Error("Keine aktive Saison gefunden.");

        await database.execute(`UPDATE ${tableName} SET settings=? WHERE id=?`, [JSON.stringify(settings), season.id]);
    }

}
