
export type DbColumnDefinition = {
    column: string;
    alias?: string;
    type: "string" | "number" | "boolean" | "date" | "json";
    table?: string;
};

