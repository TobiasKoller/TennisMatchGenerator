type SqlValue = string | number | boolean | null | Date;

function formatSqlValue(value: SqlValue): string {
    if (value === null) return "NULL";
    if (value === undefined) return "NULL";
    if (typeof value === "number") return value.toString();
    if (typeof value === "boolean") return value ? "1" : "0";
    if (value instanceof Date) return `'${value.toISOString()}'`;

    // String: einfache Hochkommas escapen
    return `'${value.replace(/'/g, "''")}'`;
}

export function buildSqlWithBindings(sql: string, bindings: SqlValue[]): string {
    let index = 0;

    return sql.replace(/\?/g, () => {
        if (index >= bindings.length) throw new Error("Zu wenig Bind-Werte für SQL.");
        return formatSqlValue(bindings[index++]);
    });
}