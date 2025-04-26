import { db } from "../db/Db";
import { DbColumnDefinition, safeSelect } from "../db/DbHelper";
import { MatchDay } from "../model/Matchday";
import { MatchDayRound } from "../model/MatchDayRound";
import { MatchDayRoundPlayer } from "../model/MatchDayRoundPlayer";
import { INotificationService } from "../provider/NotificationProvider";
import { PlayerService } from "./PlayerService";
import { ServiceBase } from "./ServiceBase";
import { v4 as uuidv4 } from "uuid";

const tableNameMatchDay = "matchday" as const;
const tableNameRound = "round" as const;

const MatchDayColumns: DbColumnDefinition[] = [
    { column: "id", type: "string" },
    { column: "date", type: "date" },
    { column: "is_active", alias: "isActive", type: "boolean" }
];

const RoundColumns: DbColumnDefinition[] = [
    { column: "id", type: "string" },
    { column: "matchday_id", alias: "matchDayId", type: "string" },
    { column: "number", type: "number" },
    { column: "start_date", alias: "startDate", type: "date" },
    { column: "end_date", alias: "endDate", type: "date" },
    { column: "courts", type: "json" },
    { column: "is_active", alias: "isActive", type: "boolean" }
];

export class MatchDayService extends ServiceBase {

    constructor(seasonId: string, notificationService: INotificationService) {
        super(seasonId, notificationService);
    }

    async createMatchDay(): Promise<string> {
        const matchday: MatchDay = {
            date: new Date(),
            isActive: true,
            id: uuidv4()
        }

        const database = await db;
        await database.execute(`INSERT INTO matchday (id,season_id,date, is_active) VALUES (?,?,?,?)`, [matchday.id, this.seasonId, matchday.date.toISOString(), true]);

        await this.setActiveMatchDay(matchday.id); // Set the new matchday as active
        return matchday.id;
    }

    async createMatchDayRound(matchdayId: string): Promise<string> {
        const database = await db;
        const playerService = new PlayerService(this.seasonId, this.noticiationService);
        var lastRound = await this.getLastMatchDayRound(matchdayId);

        await database.execute('BEGIN TRANSACTION');

        try {

            const newRound: MatchDayRound = {
                id: uuidv4(),
                matchDayId: matchdayId,
                number: (lastRound ? lastRound.number + 1 : 1),
                StartDate: new Date(),
                EndDate: null,
                courts: (lastRound ? lastRound.courts : []),
                isActive: true
            };

            await database.execute(`INSERT INTO ${tableNameRound} (id, matchday_id,number,start_date,end_date,courts,is_active) VALUES (?,?,?,?,?,?,?)`,
                [newRound.id, newRound.matchDayId, newRound.number, newRound.StartDate, newRound.EndDate, JSON.stringify(newRound.courts), newRound.isActive]);

            const lastRoundPlayers = lastRound ? await playerService.getPlayersByRoundId(lastRound.id, false) : [];
            for (var lastPlayer of lastRoundPlayers) {
                var newPlayer: MatchDayRoundPlayer = {
                    id: uuidv4(),
                    playerId: lastPlayer.playerId,
                    roundId: newRound.id,
                    status: lastPlayer.status,
                };
                await playerService.createRoundPlayer(newRound.id, newPlayer);
            };

            // Wenn alles erfolgreich war, bestätige die Transaktion
            await database.execute('COMMIT');
            return newRound.id;
        } catch (error: any) {
            // Falls ein Fehler auftritt, mache die Änderungen rückgängig
            await database.execute('ROLLBACK');
            throw this.notifyError('Fehler beim Anlegen der neuen Runde:' + error?.message);
        }
    }

    async setActiveMatchDay(matchdayId: string) {
        const database = await db;
        await database.execute(`UPDATE matchday SET is_active=0 WHERE season_id=?`, [this.seasonId]);
        await database.execute(`UPDATE matchday SET is_active=1 WHERE id=?`, [matchdayId]);
    }

    async getActiveMatchDay(): Promise<MatchDay> {
        const database = await db;
        const records = await safeSelect<MatchDay>(database, MatchDayColumns, tableNameMatchDay, `where season_id=? and is_active=1 LIMIT 1`, [this.seasonId]) //database.select<MatchDay>(`SELECT id,date,is_active as isActive FROM matchday where season_id=? and is_active=1 LIMIT 1`, [this.seasonId]);
        if (records.length === 0) throw this.notifyError("Konnte keinen aktiven Spieltag finden.");
        return this.getMatchDayById(records[0].id);
    }

    async getMatchDayById(id: string): Promise<MatchDay> {
        const database = await db;
        const matchDays = await safeSelect<MatchDay>(database, MatchDayColumns, tableNameMatchDay, `where id=?`, [id]) //database.safeSelect<MatchDay>(`SELECT id,date,is_active as isActive FROM matchday where id=?`, [id]);
        if (matchDays.length === 0) throw this.notifyError(`Spieltag ${id} nicht gefunden`);
        return matchDays[0];
    }

    async getAllMatchDays(): Promise<MatchDay[]> {
        const database = await db;
        const matchdays = await safeSelect<MatchDay>(database, MatchDayColumns, tableNameMatchDay, `where season_id=?`, [this.seasonId]) //db.safeSelect<MatchDay>(`SELECT id, date, is_active as isActive FROM matchday where season_id=?`, [this.seasonId]);

        return matchdays;
    }

    async getAllMatchDayRounds(matchdayId: string): Promise<MatchDayRound[]> {
        const database = await db;
        const rounds = await safeSelect<MatchDayRound>(database, RoundColumns, tableNameRound, `where matchday_id=? order by number asc`, [matchdayId]) //database.safeSelect<MatchDayRound>(`SELECT id,matchday_id as matchDayId,round,start_date as startDate,end_date as endDate,courts,is_active as isActive FROM matchday_round where matchday_id=?`, [matchdayId]);
        if (rounds.length === 0) return [];

        var playerService = new PlayerService(this.seasonId, this.noticiationService);

        for (let round of rounds) {
            round.players = await playerService.getPlayersByRoundId(round.id, true); // Hier wird die Spieler-Liste für den jeweiligen Spieltag geladen
        };

        return rounds;
    }

    async getLastMatchDayRound(matchdayId: string): Promise<MatchDayRound | null> {
        const database = await db;
        const rounds = await safeSelect<MatchDayRound>(database, RoundColumns, tableNameRound, `where matchday_id=? order by number desc limit 1`, [matchdayId]);
        if (rounds.length === 0) return null;
        return rounds[0];
    }
}
