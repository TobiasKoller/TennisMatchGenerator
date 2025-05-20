import { DatabaseExt } from "./DatabaseExt";
import { buildSqlWithBindings } from "./SqlBuilder";


export class Transaction {
    private _db: DatabaseExt;
    private _statements: string[] = [];

    constructor(db: DatabaseExt) {
        this._db = db;
    }

    public addStatement(sql: string, bindValues: any[] = []): void {
        this._statements.push(buildSqlWithBindings(sql, bindValues));
    }



    public async commit() {

        console.log(this._statements.join("\r\n"));
        // for (const statement of this._statements) {
        //     await this._db.execute(statement);
        // }
        await this._db.execute("BEGIN TRANSACTION;");
        await this._db.execute(this._statements.join("\r\n"));
        await this._db.execute("COMMIT;");
    }

    public async rollback() {
        await this._db.execute("ROLLBACK;");
    }

}
