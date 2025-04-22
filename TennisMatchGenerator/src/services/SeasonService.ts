import { db } from "../db/Db";
import { Season } from "../model/Season";
import { v4 as uuidv4 } from "uuid";

const tableName = "season" as const;

export class SeasonService {

    public async getCurrentSeason(): Promise<Season | null> {
        var currentYear = new Date().getFullYear();
        var season = await this.getSeasonByYear(currentYear);

        return season ?? this.createSeason();
    }

    private async getSeasonByYear(year: number): Promise<Season | null> {

        // Hier wird eine Saison anhand des Jahres abgerufen
        const database = await db;
        var records = await database.select<any[]>(`SELECT * FROM ${tableName} where year=? LIMIT 1`, [year]);
        if (records.length === 0) {
            return null;
        };
        var season = JSON.parse(records[0].jsondata as string) as Season;
        return season;
    }

    private async createSeason(): Promise<Season | null> {
        // Hier wird eine neue Saison erstellt und in die Datenbank eingefügt
        const database = await db;
        var year = new Date().getFullYear();

        var prevSeason = await this.getPreviousSeason(year);

        const newSeason: Season = {
            id: uuidv4(),
            name: "Saison " + new Date().getFullYear(),
            year: year,
            description: "Saison " + year,
            settings: prevSeason === null ? {
                numberOfCourts: 1,
                pointsForParticipation: 1,
                pointsForWin: 1,
            } : prevSeason.settings, //Einstellungen aus der Vorjahressaison übernehmen
            players: prevSeason === null ? [] : prevSeason.players, //Player aus der Vorjahressaison übernehmen
            matchDays: [],
        };

        await database.execute(`INSERT INTO ${tableName} (id,year,jsondata) VALUES (?,?,?)`, [newSeason.id, newSeason.year, JSON.stringify(newSeason)]);
        return await this.getCurrentSeason();

    }

    private async getPreviousSeason(year: number): Promise<Season | null> {
        const database = await db;
        var prevSeason = await database.select<any[]>(`SELECT * FROM ${tableName} where year!=? order by year desc LIMIT 1`, [year]);
        if (prevSeason.length === 0) return null;

        var season = JSON.parse(prevSeason[0].jsondata as string) as Season;
        return season;
    }

    public async saveCurrentSeason(season: Season) {
        const database = await db;
        await database.execute(`UPDATE ${tableName} SET season=?`, [season]);
    }
}
