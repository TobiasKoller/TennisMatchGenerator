import { db } from "../db/Db";
import { Player } from "../model/Player";
import { v4 as uuidv4, NIL as EMPTY_UUID } from "uuid";

const tableName = "player" as const;

export class PlayerService {

    async getAllPlayers(): Promise<Player[]> {
        const database = await db; // Warte auf die Singleton-Datenbank
        var records = await database.select<Player[]>(`SELECT id,firstname,lastname,skillRating,age FROM ${tableName}`);
        if (records.length === 0) {
            return [];
        }

        return records;
    }

    async addPlayer(player: Player): Promise<string> {
        const database = await db;
        player.id = uuidv4();
        await database.execute(`INSERT INTO ${tableName} (id,firstname,lastname,skillRating,age,isActive) VALUES (?,?,?,?,?,?)`, [
            player.id,
            player.firstname,
            player.lastname,
            player.skillRating,
            player.age
        ]);

        return player.id;
    }

    async updatePlayer(player: Player) {
        const database = await db;

        await database.execute(`UPDATE ${tableName} SET firstname=?,lastname=?,skillRating=?,age=?,isActive=? where id=?`, [
            player.firstname,
            player.lastname,
            player.skillRating,
            player.age,
            player.isActive,
            player.id
        ]);
    }

    async deletePlayer(player: Player) {
        const database = await db;
        await database.execute(`DELETE FROM ${tableName} WHERE id=?`, [player.id]);
    }
}
