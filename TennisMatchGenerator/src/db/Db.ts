import Database from "@tauri-apps/plugin-sql";

class DB {
    private static instance: Promise<Database>;

    private constructor() { }

    static getInstance(): Promise<Database> {

        if (!DB.instance) {
            DB.instance = Database.load("sqlite:tennismatchgenerator.sqlite");
        }
        return DB.instance;
    }
}

export const db = DB.getInstance();
