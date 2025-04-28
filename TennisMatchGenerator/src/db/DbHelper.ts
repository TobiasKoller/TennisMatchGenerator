import Database from "@tauri-apps/plugin-sql";

export type DbColumnDefinition = {
    column: string;
    alias?: string;
    type: "string" | "number" | "boolean" | "date" | "json";
    table?: string; // Optional table name for joins
};

export function buildSelect(columns: DbColumnDefinition[]): string {
    return columns.map(col => col.alias ? `${col.table ? `${col.table}.${col.column}` : col.column} as ${col.alias}` : col.column).join(", ");
}

export function parseRow<T>(row: any, columns: DbColumnDefinition[]): T {
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

export async function safeSelect<T>(
    db: Database,
    columns: DbColumnDefinition[],
    table: string,
    whereClause: string = "",
    bindValues: any[] = []
): Promise<T[]> {
    const sql = `SELECT ${buildSelect(columns)} FROM ${table} ${whereClause}`;
    const rawRows = await db.select<any[]>(sql, bindValues);
    return rawRows.map(row => parseRow<T>(row, columns));
}

// export async function runInTransaction<T>(database: Database, work: () => Promise<T>, onError: (error: any) => Error): Promise<T | null> {


//     await database.execute('BEGIN TRANSACTION');
//     try {
//         const result = await work();
//         await database.execute('COMMIT');
//         return result;
//     } catch (error) {
//         await database.execute('ROLLBACK');
//         onError(error);
//         return null;
//     }
// }