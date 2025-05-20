import { DatabaseExt } from "./DatabaseExt";

// ✅ Singleton-Klasse
class DB {
    private static instance: Promise<DatabaseExt>;

    private constructor() { }

    static getInstance(): Promise<DatabaseExt> {
        if (!DB.instance) {
            DB.instance = DatabaseExt.load("sqlite:tennismatchgenerator.sqlite");
        }
        return DB.instance;
    }
}

export const db = DB.getInstance();
