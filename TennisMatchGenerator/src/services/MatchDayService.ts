import { db } from "../db/Db";
import { DbColumnDefinition, safeSelect } from "../db/DbHelper";
import { Match } from "../model/Match";
import { MatchDay } from "../model/Matchday";
import { MatchDayRound } from "../model/MatchDayRound";
import { MatchDayRoundPlayer } from "../model/MatchDayRoundPlayer";
import { INotificationService } from "../provider/NotificationProvider";
import { PlayerService } from "./PlayerService";
import { ServiceBase } from "./ServiceBase";
import { v4 as uuidv4, validate, NIL as emptyGuid } from "uuid";
import { Set } from "../model/Set";

const tableNameMatchDay = "matchday" as const;
const tableNameRound = "round" as const;

const MatchDayColumns: DbColumnDefinition[] = [
    { column: "id", type: "string" },
    { column: "date", type: "date" },
    { column: "is_active", alias: "isActive", type: "boolean" }
];

const MatchColumns: DbColumnDefinition[] = [
    { column: "id", type: "string" },
    { column: "round_id", alias: "roundId", type: "string" },
    { column: "type", type: "string" },
    { column: "number", type: "number" },
    { column: "court", type: "number" },
    { column: "set1", alias: "set1Str", type: "string" },
    { column: "set2", alias: "set2Str", type: "string" },
    { column: "player1_home_id", alias: "player1HomeId", type: "string" },
    { column: "player2_home_id", alias: "player2HomeId", type: "string" },
    { column: "player1_guest_id", alias: "player1GuestId", type: "string" },
    { column: "player2_guest_id", alias: "player2GuestId", type: "string" }
]

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

            const lastRoundPlayers = lastRound ? await playerService.getPlayersByRoundId(lastRound.id, false) : [];

            try {
                await database.execute(`INSERT INTO ${tableNameRound} (id, matchday_id,number,start_date,end_date,courts,is_active) VALUES (?,?,?,?,?,?,?)`,
                    [newRound.id, newRound.matchDayId, newRound.number, newRound.StartDate, newRound.EndDate, JSON.stringify(newRound.courts), newRound.isActive]);

                for (var lastPlayer of lastRoundPlayers) {
                    var newPlayer: MatchDayRoundPlayer = {
                        id: uuidv4(),
                        playerId: lastPlayer.playerId,
                        roundId: newRound.id,
                        status: lastPlayer.status,
                    };
                    await playerService.createRoundPlayer(newRound.id, newPlayer);
                };
            }
            catch (error: any) {
                throw this.notifyError("Fehler beim Erstellen der neuen Runde: " + error?.message);
            };

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

    async getActiveMatchDay(): Promise<MatchDay | null> {
        const database = await db;
        const records = await safeSelect<MatchDay>(database, MatchDayColumns, tableNameMatchDay, `where season_id=? and is_active=1 LIMIT 1`, [this.seasonId]) //database.select<MatchDay>(`SELECT id,date,is_active as isActive FROM matchday where season_id=? and is_active=1 LIMIT 1`, [this.seasonId]);
        if (records.length === 0) return null;
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

    async updateMatch(match: Match) {
        this.updateMatches([match]);
    }

    async updateMatches(matches: Match[]) {
        try {
            const database = await db;
            const formatSet = (set: Set) => { return `${set.homeGames ?? 0}:${set.guestGames ?? 0}` }; // Formatierung der Sets für die Datenbank
            const nullIfEmpty = (value: string) => { return value === "" ? null : value }; // Null-Werte für leere Strings

            for (const match of matches) {
                await database.execute(`UPDATE match SET type=?,number=?,court=?,set1=?,set2=?,player1_home_id=?,player2_home_id=?,player1_guest_id=?,player2_guest_id=? WHERE id=?`,
                    [match.type, match.number, match.court, formatSet(match.set1), formatSet(match.set2), nullIfEmpty(match.player1HomeId), nullIfEmpty(match.player2HomeId), nullIfEmpty(match.player1GuestId), nullIfEmpty(match.player2GuestId), match.id]);
            }
            this.noticiationService.notifySuccess("Matches erfolgreich aktualisiert");
        }
        catch (error: any) {
            throw this.notifyError("Fehler beim Aktualisieren der Matches: " + error?.message);
        }
    }

    async saveMatches(roundId: string, matches: Match[]) {
        try {
            const database = await db;

            await database.execute(`DELETE FROM match WHERE round_id=?`, [roundId]); // Löschen der alten Matches für die Runde

            const formatSet = (set: Set) => { return `${set.homeGames ?? 0}:${set.guestGames ?? 0}` }; // Formatierung der Sets für die Datenbank
            const nullIfEmpty = (value: string) => { return value === "" ? null : value }; // Null-Werte für leere Strings

            for (const match of matches) {
                await database.execute(`INSERT INTO match (id, round_id,type,number,court,set1,set2,player1_home_id,player2_home_id,player1_guest_id,player2_guest_id) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
                    [match.id, match.roundId, match.type, match.number, match.court, formatSet(match.set1), formatSet(match.set2), nullIfEmpty(match.player1HomeId), nullIfEmpty(match.player2HomeId), nullIfEmpty(match.player1GuestId), nullIfEmpty(match.player2GuestId)]);
            }
            this.noticiationService.notifySuccess("Matches erfolgreich gespeichert");
        }
        catch (error: any) {
            throw this.notifyError("Fehler beim Speichern der Matches: " + error?.message);
        }
    }

    async deleteMatch(matchId: string) {
        const database = await db;
        await database.execute(`DELETE FROM match WHERE id=?`, [matchId]);
    }

    async getMatchesByRoundId(roundId: string): Promise<Match[]> {

        const formatSet = (setStr: string) => {
            const set = setStr.split(":");
            return {
                homeGames: Number(set[0]),
                guestGames: Number(set[1])
            } as Set;
        }

        const database = await db;
        const matches = await safeSelect<Match>(database, MatchColumns, "match", `where round_id=?`, [roundId]); //database.safeSelect<Match>(`SELECT id,round_id as roundId,type,number,court,set1,set2,player1_home_id as player1HomeId,player2_home_id as player2HomeId,player1_guest_id as player1GuestId,player2_guest_id as player2GuestId FROM match where round_id=?`, [roundId]);
        for (let match of matches) {
            match.set1 = formatSet((<any>match).set1Str);
            match.set2 = formatSet((<any>match).set2Str);
            delete (<any>match).set1Str;
            delete (<any>match).set2Str;
        }

        return matches;
    }

    async getLastMatchDayRound(matchdayId: string): Promise<MatchDayRound | null> {
        const database = await db;
        const rounds = await safeSelect<MatchDayRound>(database, RoundColumns, tableNameRound, `where matchday_id=? order by number desc limit 1`, [matchdayId]);
        if (rounds.length === 0) return null;
        return rounds[0];
    }

    async updateUsedCourts(roundId: string, courts: number[]) {
        const database = await db;
        await database.execute(`UPDATE ${tableNameRound} SET courts=? WHERE id=?`, [JSON.stringify(courts), roundId]);
    }

    async addMatch(match: Match, roundId: string, court: number) {
        const database = await db;
        await database.execute(`INSERT INTO match (id, round_id,type,number,court,set1,set2,player1_home_id,player2_home_id,player1_guest_id,player2_guest_id) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
            [match.id, roundId, match.type, match.number, court, "", "", this.validateGuid(match.player1HomeId), this.validateGuid(match.player2HomeId), this.validateGuid(match.player1GuestId), this.validateGuid(match.player2GuestId)]);
    }

    validateGuid(id: string): string | null {
        if (id === emptyGuid) return null;
        if (id === "") return null;
        if (!validate(id)) return null;
        return id;

    }
}
