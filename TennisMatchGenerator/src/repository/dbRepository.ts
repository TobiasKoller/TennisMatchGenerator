import Database from "@tauri-apps/plugin-sql";


export abstract class DbRepository {

    protected db: Database | null = null;

    constructor(db: Database) {
        this.db = db;
    }

    abstract GetSettings(): Promise<any>;
}
