import { Player } from "../model/Player";
import { v4 as uuidv4 } from "uuid";
import { ServiceBase } from "./ServiceBase";
import { db } from "../db/Db";
import { INotificationService } from "../provider/NotificationProvider";
import { MatchDayRoundPlayer } from "../model/MatchDayRoundPlayer";
import { DbColumnDefinition } from "../db/DbColumnDefinition";

const tableNamePlayer = "player" as const;
const tableNameRoundPlayer = "round_player" as const;
const PlayerColumns: DbColumnDefinition[] = [
    { column: "id", type: "string" },
    { column: "firstname", type: "string" },
    { column: "lastname", type: "string" },
    { column: "skill_rating", alias: "skillRating", type: "number" },
    { column: "birthdate", alias: "birthDate", type: "date" },
    { column: "gender", type: "string" },
    { column: "is_active", alias: "isActive", type: "boolean" }
];

const RoundPlayerColumns: DbColumnDefinition[] = [
    { column: "id", type: "string" },
    { column: "player_id", alias: "playerId", type: "string" },
    { column: "round_id", alias: "roundId", type: "string" }
]


export class PlayerService extends ServiceBase {

    constructor(seasonId: string, notificationService: INotificationService) {
        super(seasonId, notificationService);
    }

    async getAllPlayers(): Promise<Player[]> {
        const database = await db;
        const players = await database.safeSelect<Player>(PlayerColumns, tableNamePlayer); //await database.select<any[]>(`SELECT ${this.selectColumns} FROM player where season_id=?`, [this.seasonId]);
        return players;
    }

    async getPlayerById(id: string): Promise<Player | null> {

        const database = await db;
        const players = await database.safeSelect<Player>(PlayerColumns, tableNamePlayer, "where id=?", [id]) //database.select<any[]>(`SELECT ${this.selectColumns} FROM player where id=?`, [id]);

        if (players.length === 0)
            return null;

        return players[0];
    }

    async getPlayersByRoundId(roundId: string, includePlayerData: boolean): Promise<MatchDayRoundPlayer[]> {
        const database = await db;
        const players = await database.safeSelect<MatchDayRoundPlayer>(RoundPlayerColumns, tableNameRoundPlayer, "where round_id=?", [roundId]) //database.select<any[]>(`SELECT ${this.selectColumns} FROM player where round_id=?`, [roundId]);

        if (includePlayerData) {
            for (const player of players) {
                const playerData = await this.getPlayerById(player.playerId);
                if (playerData) player.player = playerData;
            }
        }
        return players;
    }

    async getPlayersByMatchDayId(matchDayId: string): Promise<Player[]> {
        const database = await db;

        var players: Player[] = [];
        const dbPlayers = await database.safeSelect<MatchDayRoundPlayer>(RoundPlayerColumns, tableNameRoundPlayer, "where round_id in (select id from round where matchday_id=?)", [matchDayId]);
        var allPlayers = await this.getAllPlayers();

        for (const player of dbPlayers) {
            if (!player.playerId) continue; // Skip if playerId is not set

            const playerData = allPlayers.find(p => p.id === player.playerId);
            if (playerData) players.push(playerData);
        }

        return players;
    }

    async createRoundPlayer(roundId: string, roundPlayer: MatchDayRoundPlayer): Promise<string> {
        roundPlayer.id = uuidv4();
        const database = await db;
        await database.execute(`INSERT INTO ${tableNameRoundPlayer} (id,player_id,round_id) VALUES (?,?,?)`, [roundPlayer.id, roundPlayer.playerId, roundId]);

        return roundPlayer.id;
    }

    async getSelectedRoundPlayers(roundId: string): Promise<MatchDayRoundPlayer[]> {
        const database = await db;
        const players = await database.safeSelect<MatchDayRoundPlayer>(RoundPlayerColumns, tableNameRoundPlayer, "where round_id=?", [roundId]) //database.select<any[]>(`SELECT ${this.selectColumns} FROM player where round_id=?`, [roundId]);

        return players;
    }


    async updateSelectedRoundPlayers(roundId: string, playerIds: string[]) {
        const database = await db;

        await database.execute(`DELETE FROM ${tableNameRoundPlayer} WHERE round_id=?`, [roundId]);
        for (const playerId of playerIds) {
            const roundPlayer: MatchDayRoundPlayer = {
                id: uuidv4(),
                playerId: playerId,
                roundId: roundId
            };
            await this.createRoundPlayer(roundId, roundPlayer);
        }
    }

    async addPlayer(player: Player): Promise<string> {

        player.id = uuidv4();
        const database = await db;
        await database.execute(`INSERT INTO ${tableNamePlayer} (id,firstname,lastname,birthdate,skill_rating, gender,is_active,season_id) VALUES (?,?,?,?,?,?,?,?)`, [player.id, player.firstname, player.lastname, player.birthDate, player.skillRating, player.gender, player.isActive, this.seasonId]);

        return player.id;
    }

    async updatePlayer(player: Player) {
        const database = await db;
        await database.execute(`UPDATE ${tableNamePlayer} SET firstname=?,lastname=?,birthdate=?,skill_rating=?,gender=?, is_active=?  WHERE id=?`, [player.firstname, player.lastname, player.birthDate, player.skillRating, player.gender, player.isActive, player.id]);
    }

    async deletePlayer(playerId: string) {
        const database = await db;
        await database.execute(`DELETE FROM ${tableNamePlayer} WHERE id=?`, [playerId]);
    }
}
