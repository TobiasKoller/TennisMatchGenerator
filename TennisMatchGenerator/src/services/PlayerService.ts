import { db } from "../db/Db";
import { Player } from "../model/Player";
import { v4 as uuidv4, NIL as EMPTY_UUID } from "uuid";
import { Season } from "../model/Season";
import { SeasonService } from "./SeasonService";

export class PlayerService {

    season: Season;
    seasonService: SeasonService;

    constructor(seasonService: SeasonService, season: Season) {
        this.season = season;
        this.seasonService = seasonService;
    }

    async getAllPlayers(): Promise<Player[]> {
        return this.season.players;
        // const database = await db; // Warte auf die Singleton-Datenbank
        // var records = await database.select<Player[]>(`SELECT id,firstname,lastname,skillRating,age FROM ${tableName}`);
        // if (records.length === 0) {
        //     return [];
        // }

        // return records;
    }

    async addPlayer(player: Player): Promise<string> {

        player.id = uuidv4();
        this.season.players.push(player);

        // await database.execute(`INSERT INTO ${tableName} (id,firstname,lastname,skillRating,age,isActive) VALUES (?,?,?,?,?,?)`, [
        //     player.id,
        //     player.firstname,
        //     player.lastname,
        //     player.skillRating,
        //     player.age
        // ]);

        return player.id;
    }

    async updatePlayer(player: Player) {
        // const database = await db;

        // await database.execute(`UPDATE ${tableName} SET firstname=?,lastname=?,skillRating=?,age=?,isActive=? where id=?`, [
        //     player.firstname,
        //     player.lastname,
        //     player.skillRating,
        //     player.age,
        //     player.isActive,
        //     player.id
        // ]);

        const index = this.season.players.findIndex(p => p.id === player.id);
        if (index !== -1) this.season.players[index] = player;
        else throw new Error(`Spieler ${player.id} nicht gefunden`);
    }

    async deletePlayer(player: Player) {
        // const database = await db;
        // await database.execute(`DELETE FROM ${tableName} WHERE id=?`, [player.id]);
        this.season.players = this.season.players.filter(p => p.id !== player.id);
    }
}
