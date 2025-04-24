import { Player } from "../model/Player";
import { v4 as uuidv4, NIL as EMPTY_UUID } from "uuid";
import { Season } from "../model/Season";
import { SeasonService } from "./SeasonService";
import { ServiceBase } from "./ServiceBase";
import { db } from "../db/Db";

export class PlayerService extends ServiceBase {


    constructor(seasonId: string) {
        super(seasonId);
    }

    async getAllPlayers(): Promise<Player[]> {
        const database = await db;
        const records = await database.select<any[]>(`SELECT * FROM player where season_id=?`, [this.seasonId]);
        var players: Player[] = [];
        for (const record of records) {
            players.push({
                id: record.id,
                firstname: record.firstname,
                lastname: record.lastname,
                age: record.age,
                skillRating: record.skill_rating,
                isActive: record.is_active == "true",
            });
        }
        return players;
    }

    async getPlayerById(id: string): Promise<Player | null> {

        const database = await db;
        const records = await database.select<any[]>(`SELECT * FROM player where id=?`, [id]);
        if (records.length === 0) throw new Error(`Spieler ${id} nicht gefunden`);;
        return {
            id: records[0].id,
            firstname: records[0].firstname,
            lastname: records[0].lastname,
            age: records[0].age,
            skillRating: records[0].skill_rating,
            isActive: records[0].is_active == "true",
        };
    }

    async addPlayer(player: Player): Promise<string> {

        player.id = uuidv4();
        const database = await db;
        await database.execute(`INSERT INTO player (id,firstname,lastname,age,skill_rating,is_active,season_id) VALUES (?,?,?,?,?,?,?)`, [player.id, player.firstname, player.lastname, player.age, player.skillRating, player.isActive, this.seasonId]);

        return player.id;
    }

    async updatePlayer(player: Player) {
        const database = await db;
        await database.execute(`UPDATE player SET firstname=?,lastname=?,age=?,skill_rating=?,is_active=? WHERE id=?`, [player.firstname, player.lastname, player.age, player.skillRating, player.isActive, player.id]);
    }

    async deletePlayer(player: Player) {
        const database = await db;
        await database.execute(`DELETE FROM player WHERE id=?`, [player.id]);
    }
}
