import Database from "@tauri-apps/plugin-sql";
import { DbColumnDefinition } from "./DbColumnDefinition";
import { Transaction } from "./Transaction";

export class DatabaseExt extends Database {

    constructor(path: string) {
        super(path);
    }

    static override async load(path: string): Promise<DatabaseExt> {
        // Ruft zuerst Verbindung auf
        await super.load(path);
        // Erzeugt DICH (nicht nur Database)
        return new DatabaseExt(path);
    }


    public buildSelect(columns: DbColumnDefinition[]): string {
        return columns
            .map(col => col.alias
                ? `${col.table ? `${col.table}.${col.column}` : col.column} as ${col.alias}`
                : col.column
            )
            .join(", ");
    }

    parseRow<T>(row: any, columns: DbColumnDefinition[]): T {
        const parsed: any = {};

        for (const col of columns) {
            const key = col.alias || col.column;
            const rawValue = row[key];

            switch (col.type) {
                case "number":
                    parsed[key] = Number(rawValue);
                    break;
                case "boolean":
                    parsed[key] = Boolean(rawValue);
                    break;
                case "date":
                    parsed[key] = rawValue ? new Date(rawValue) : null;
                    break;
                case "json":
                    parsed[key] = rawValue ? JSON.parse(rawValue) : null;
                    break;
                default:
                    parsed[key] = rawValue;
            }
        }

        return parsed as T;
    }

    async safeSelect<T>(
        columns: DbColumnDefinition[],
        table: string,
        whereClause: string = "",
        bindValues: any[] = []
    ): Promise<T[]> {
        const sql = `SELECT ${this.buildSelect(columns)} FROM ${table} ${whereClause}`;
        const rawRows = await this.select<any[]>(sql, bindValues);
        return rawRows.map(row => this.parseRow<T>(row, columns));
    }

    async beginTransaction(): Promise<Transaction> {

        return new Transaction(this);

    }
}
