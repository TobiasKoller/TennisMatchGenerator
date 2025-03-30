import Database from "@tauri-apps/plugin-sql";
import { DbRepository } from "./dbRepository";

export class SettingsRepository extends DbRepository {
    constructor(db: Database) {
        super(db);
    }    

    async GetSettings(): Promise<any> {
        if (!this.db) {
            throw new Error("Datenbank nicht initialisiert.");
        }

        const result = await this.db.execute("SELECT * FROM settings");
        return result;
    }
}