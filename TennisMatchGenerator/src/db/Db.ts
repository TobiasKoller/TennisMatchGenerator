import { DatabaseExt } from "./DatabaseExt";

const DB_PATH = "sqlite:tennismatchgenerator.sqlite";

// ✅ Singleton-Klasse
class DB {
    private static instance: Promise<DatabaseExt>;

    private constructor() { }

    static getInstance(): Promise<DatabaseExt> {
        if (!DB.instance) {
            DB.instance = DatabaseExt.load(DB_PATH);
        }
        return DB.instance;
    }
}

export const db = DB.getInstance();
