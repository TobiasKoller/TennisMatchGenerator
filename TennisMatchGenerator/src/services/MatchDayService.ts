import { db } from "../db/Db";
import { Match } from "../model/Match";
import { MatchDay } from "../model/Matchday";
import { MatchDayRound } from "../model/MatchDayRound";
import { MatchDayRoundPlayer } from "../model/MatchDayRoundPlayer";
import { INotificationService } from "../provider/NotificationProvider";
import { PlayerService } from "./PlayerService";
import { ServiceBase } from "./ServiceBase";
import { v4 as uuidv4, validate, NIL as emptyGuid } from "uuid";
import { Set } from "../model/Set";
import { DbColumnDefinition } from "../db/DbColumnDefinition";
import { MatchGenerator } from "./MatchGenerator";
import { MatchResult } from "../model/MatchResult";
import { SeasonService } from "./SeasonService";
import { Setting } from "../model/Setting";

const tableNameMatchDay = "matchday" as const;
const tableNameRound = "round" as const;
const tableNameRoundPlayer = "round_player" as const;
const tableNameMatch = "match" as const;

const MatchDayColumns: DbColumnDefinition[] = [
    { column: "id", type: "string" },
    { column: "date", type: "date" },
    { column: "is_active", alias: "isActive", type: "boolean" },
    { column: "is_closed", alias: "isClosed", type: "boolean" },
    { column: "season_id", alias: "seasonId", type: "string" }
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

    // private statisticService: StatisticService;
    private seasonService: SeasonService;

    constructor(seasonId: string, notificationService: INotificationService) {
        super(seasonId, notificationService);

        // this.statisticService = new StatisticService(seasonId, notificationService);
        this.seasonService = new SeasonService();

    }

    async getSettings(): Promise<Setting> {
        const settings = await this.seasonService.getSettings();
        return settings;
    }

    async createMatchDay(): Promise<string> {
        const matchday: MatchDay = {
            date: new Date(),
            isActive: true,
            isClosed: false, // Standardmäßig auf false setzen
            id: uuidv4()
        }

        const database = await db;
        await database.execute(`INSERT INTO matchday (id,season_id,date, is_active, is_closed) VALUES (?,?,?,?,?)`, [matchday.id, this.seasonId, matchday.date.toISOString(), 0, 0]);
        await this.setActiveMatchDay(matchday.id); // Set the new matchday as active

        await this.createMatchDayRound(matchday.id); // Create the first round for the new matchday
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

            if (!lastRound) {
                //alle courts aktivieren
                var settings = await this.getSettings();
                newRound.courts = settings.availableCourts!;
            }

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

    async deleteMatchDayRound(roundId: string) {
        const database = await db;

        try {
            database.execute(`DELETE FROM ${tableNameRoundPlayer} WHERE round_id=?`, [roundId]); // Löschen der zugehörigen Spieler
            database.execute(`DELETE FROM ${tableNameMatch} WHERE round_id=?`, [roundId]); // Löschen der zugehörigen Matches
            database.execute(`DELETE FROM ${tableNameRound} WHERE id=?`, [roundId]);
        }
        catch (error: any) {
            throw this.notifyError("Fehler beim Löschen der Runde: " + error?.message);
        }
    }

    async setActiveMatchDay(matchdayId: string) {
        const database = await db;
        await database.execute(`UPDATE matchday SET is_active=0 WHERE season_id=?`, [this.seasonId]);
        await database.execute(`UPDATE matchday SET is_active=1 WHERE id=?`, [matchdayId]);
    }

    async getActiveMatchDay(): Promise<MatchDay | null> {
        const database = await db;
        const records = await database.safeSelect<MatchDay>(MatchDayColumns, tableNameMatchDay, `where season_id=? and is_active=1 LIMIT 1`, [this.seasonId]) //database.select<MatchDay>(`SELECT id,date,is_active as isActive FROM matchday where season_id=? and is_active=1 LIMIT 1`, [this.seasonId]);
        if (records.length === 0) return null;
        return this.getMatchDayById(records[0].id);
    }

    async getMatchDayById(id: string): Promise<MatchDay> {
        const database = await db;
        const matchDays = await database.safeSelect<MatchDay>(MatchDayColumns, tableNameMatchDay, `where id=?`, [id]) //database.safeSelect<MatchDay>(`SELECT id,date,is_active as isActive FROM matchday where id=?`, [id]);
        if (matchDays.length === 0) throw this.notifyError(`Spieltag ${id} nicht gefunden`);
        return matchDays[0];
    }

    async getAllMatchDays(): Promise<MatchDay[]> {
        const database = await db;
        const matchdays = await database.safeSelect<MatchDay>(MatchDayColumns, tableNameMatchDay, `where season_id=?`, [this.seasonId]) //db.safeSelect<MatchDay>(`SELECT id, date, is_active as isActive FROM matchday where season_id=?`, [this.seasonId]);

        return matchdays;
    }

    async getAllMatchDayRounds(matchdayId: string): Promise<MatchDayRound[]> {
        const database = await db;
        const rounds = await database.safeSelect<MatchDayRound>(RoundColumns, tableNameRound, `where matchday_id=? order by number asc`, [matchdayId]) //database.safeSelect<MatchDayRound>(`SELECT id,matchday_id as matchDayId,round,start_date as startDate,end_date as endDate,courts,is_active as isActive FROM matchday_round where matchday_id=?`, [matchdayId]);
        if (rounds.length === 0) return [];

        var playerService = new PlayerService(this.seasonId, this.noticiationService);

        for (let round of rounds) {
            round.players = await playerService.getPlayersByRoundId(round.id, true); // Hier wird die Spieler-Liste für den jeweiligen Spieltag geladen
        };

        return rounds;
    }

    async getMatch(matchId: string): Promise<Match> {
        const database = await db;
        const matches = await database.safeSelect<Match>(MatchColumns, "match", `where id=?`, [matchId]); //database.safeSelect<Match>(`SELECT id,round_id as roundId,type,number,court,set1,set2,player1_home_id as player1HomeId,player2_home_id as player2HomeId,player1_guest_id as player1GuestId,player2_guest_id as player2GuestId FROM match where id=?`, [matchId]);
        if (matches.length === 0) throw this.notifyError(`Spiel ${matchId} nicht gefunden`);
        return matches[0];
    }

    async getMatches(roundId: string): Promise<Match[]> {
        const database = await db;
        const matches = await database.safeSelect<Match>(MatchColumns, "match", `where round_id=?`, [roundId]); //database.safeSelect<Match>(`SELECT id,round_id as roundId,type,number,court,set1,set2,player1_home_id as player1HomeId,player2_home_id as player2HomeId,player1_guest_id as player1GuestId,player2_guest_id as player2GuestId FROM match where round_id=?`, [roundId]);
        return matches ?? [];
    }

    async updateMatch(match: Match) {
        if (!match.player1GuestId && !match.player2GuestId && !match.player1HomeId && !match.player2HomeId)
            return this.deleteMatch(match.id); // Wenn keine Spieler gesetzt sind, wird das Match gelöscht
        return this.updateMatches([match]);
    }

    async updateMatches(matches: Match[]) {
        const database = await db;
        //const transaction = await database.beginTransaction();
        try {

            const formatSet = (set: Set) => { return `${set?.homeGames ?? 0}:${set?.guestGames ?? 0}` }; // Formatierung der Sets für die Datenbank
            const nullIfEmpty = (value: string | null) => { return value === null || value === "" ? null : value }; // Null-Werte für leere Strings

            for (const match of matches) {
                await database.execute(`UPDATE match SET type=?,number=?,court=?,set1=?,set2=?,player1_home_id=?,player2_home_id=?,player1_guest_id=?,player2_guest_id=? WHERE id=?`,
                    [match.type, match.number, match.court, formatSet(match.set1), formatSet(match.set2), nullIfEmpty(match.player1HomeId), nullIfEmpty(match.player2HomeId), nullIfEmpty(match.player1GuestId), nullIfEmpty(match.player2GuestId), match.id]);
            }

            // await transaction.commit(); // Transaktion abschließen
            this.noticiationService.notifySuccess("Matches erfolgreich aktualisiert");
        }
        catch (error: any) {
            //await transaction.rollback(); // Transaktion zurücksetzen
            throw this.notifyError("Fehler beim Aktualisieren der Matches: " + error);
        }
    }

    async createMatches(roundId: string, matches: Match[]) {
        try {
            const database = await db;

            await database.execute(`DELETE FROM match WHERE round_id=?`, [roundId]); // Löschen der alten Matches für die Runde

            const formatSet = (set: Set) => { return `${set?.homeGames ?? 0}:${set?.guestGames ?? 0}` }; // Formatierung der Sets für die Datenbank
            const nullIfEmpty = (value: string | null) => { return value === "" ? null : value }; // Null-Werte für leere Strings

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

        const matches = await database.safeSelect<Match>(MatchColumns, "match", `where round_id=?`, [roundId]); //database.safeSelect<Match>(`SELECT id,round_id as roundId,type,number,court,set1,set2,player1_home_id as player1HomeId,player2_home_id as player2HomeId,player1_guest_id as player1GuestId,player2_guest_id as player2GuestId FROM match where round_id=?`, [roundId]);
        for (let match of matches) {
            match.set1 = formatSet((<any>match).set1Str);
            match.set2 = formatSet((<any>match).set2Str);
            delete (<any>match).set1Str;
            delete (<any>match).set2Str;
        }

        return matches;
    }

    async getMatchDayRoundById(roundId: string): Promise<MatchDayRound> {
        const database = await db;
        const rounds = await database.safeSelect<MatchDayRound>(RoundColumns, tableNameRound, `where id=?`, [roundId]); //database.safeSelect<MatchDayRound>(`SELECT id,matchday_id as matchDayId,number,start_date as startDate,end_date as endDate,courts,is_active as isActive FROM matchday_round where id=?`, [roundId]);
        if (rounds.length === 0) throw this.notifyError(`Runde ${roundId} nicht gefunden`);
        return rounds[0];
    }


    async getLastMatchDayRound(matchdayId: string): Promise<MatchDayRound | null> {
        const database = await db;
        const rounds = await database.safeSelect<MatchDayRound>(RoundColumns, tableNameRound, `where matchday_id=? order by number desc limit 1`, [matchdayId]);
        if (rounds.length === 0) return null;
        return rounds[0];
    }

    async updateUsedCourts(roundId: string, courts: number[]) {
        const database = await db;
        await database.execute(`UPDATE ${tableNameRound} SET courts=? WHERE id=?`, [JSON.stringify(courts), roundId]);
    }

    async addMatch(match: Match) {
        const database = await db;
        await database.execute(`INSERT INTO match (id, round_id,type,number,court,set1,set2,player1_home_id,player2_home_id,player1_guest_id,player2_guest_id) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
            [match.id, match.roundId, match.type, match.number, match.court, "", "", this.validateGuid(match.player1HomeId), this.validateGuid(match.player2HomeId), this.validateGuid(match.player1GuestId), this.validateGuid(match.player2GuestId)]);
    }

    async closeMatchDay(matchdayId: string) {
        const database = await db;

        try {
            await database.execute(`UPDATE matchday SET is_closed=1 WHERE id=?`, [matchdayId]);
        } catch (error: any) {
            throw new Error(`Fehler beim Schließen des Spieltags: ${error?.message}`);
        }

        // var closer = new MatchDayCloser(seasonService, this);
        // var records = await closer.CalculateMatchDayPoints(this.seasonId, matchdayId);
        // if (records.length === 0) throw new Error("Keine Spieler für den Spieltag gefunden. Bitte stellen Sie sicher, dass Spieler in der Runde vorhanden sind.");

        // const rollBackStatistics = async (database: any, records: any[]) => {
        //     for (var record of records) {
        //         await database.execute(`DELETE FROM statistic WHERE id=?`, [record.id]);
        //     }
        // }

        // try {
        //     for (var record of records) {
        //         await this.statisticService.createStatistic(record);
        //     }
        //     await database.execute(`UPDATE matchday SET is_closed=1 WHERE id=?`, [matchdayId]);
        // } catch (error: any) {
        //     rollBackStatistics(database, records);
        //     throw new Error(`Fehler beim Schließen des Spieltags: ${error?.message}`);
        // }
    }

    async reopenMatchDay(matchdayId: string) {
        const database = await db;

        try {
            await database.execute(`UPDATE matchday SET is_closed=0 WHERE id=?`, [matchdayId]);
        } catch (error: any) {
            throw new Error(`Fehler beim Öffnen des Spieltags: ${error?.message}`);
        }
    }

    async getPrevMatchDayId(matchDayId: string): Promise<string | null> {
        const database = await db;

        const matchDays = await database.safeSelect<MatchDay>(MatchDayColumns, tableNameMatchDay, `where season_id=? and date < (select date from matchday where id=?) order by date desc limit 1`, [this.seasonId, matchDayId]);
        if (matchDays.length === 0) return null;
        return matchDays[0].id;
    }

    async updateMatchDayDate(matchDayId: string, newDate: Date) {
        const database = await db;
        await database.execute(`UPDATE matchday SET date=? WHERE id=?`, [newDate.toISOString(), matchDayId]);
    }

    async getNextMatchDayId(matchDayId: string): Promise<string | null> {
        const database = await db;

        const matchDays = await database.safeSelect<MatchDay>(MatchDayColumns, tableNameMatchDay, `where season_id=? and date > (select date from matchday where id=?) order by date asc limit 1`, [this.seasonId, matchDayId]);
        if (matchDays.length === 0) return null;
        return matchDays[0].id;
    }

    async deleteAllMatchesByRoundId(roundId: string) {
        const database = await db;
        await database.execute(`DELETE FROM ${tableNameMatch} WHERE round_id=?`, [roundId]); // Löschen der Matches für die Runde
    }

    async getDistinctMatchDayPlayerCount(matchDayId: string): Promise<number> {
        const database = await db;

        const players = await database.select<any>(`select distinct p.player_id from round r
                                    inner join round_player p
                                    on r.id = p.round_id
                                    where r.matchday_id=?`, [matchDayId]);

        return players.length;
    }


    async countPlayersInMatches(matchDayId: string) {
        const database = await db;

        const columns: DbColumnDefinition[] = [
            { column: "player1_home_id", alias: "player1HomeId", type: "string" },
            { column: "player2_home_id", alias: "player2HomeId", type: "string" },
            { column: "player1_guest_id", alias: "player1GuestId", type: "string" },
            { column: "player2_guest_id", alias: "player2GuestId", type: "string" }
        ]
        const result = await database.safeSelect<Match>(columns, `${tableNameMatch} m`, `JOIN round r ON m.round_id = r.id WHERE r.matchday_id = ?`, [matchDayId]);

        const playerMatchCount: Record<string, number> = {};

        for (const match of result) {
            const players = [
                match.player1HomeId,
                match.player2HomeId,
                match.player1GuestId,
                match.player2GuestId
            ];

            for (const playerId of players) {
                if (!playerId || playerId === emptyGuid) continue; // Skip if playerId is null or empty

                if (!playerMatchCount[playerId]) {
                    playerMatchCount[playerId] = 0;
                }
                playerMatchCount[playerId]++;
            }
        }

        return playerMatchCount;
    }

    async generateMatches(players: MatchDayRoundPlayer[], matchDayId: string, roundId: string, courts: number[]): Promise<MatchResult> {
        var playerMatchCount = await this.countPlayersInMatches(matchDayId);
        var generator = new MatchGenerator(players, playerMatchCount);
        const matches = generator.generate(roundId, courts);

        return matches;
    }

    async switchCourts(roundId: string, oldCourt: number, newCourt: number) {
        if (!oldCourt || !newCourt || oldCourt === newCourt) return;
        const database = await db;

        const newCourtMatch = await database.safeSelect<Match>(MatchColumns, tableNameMatch, `where round_id=? and court=?`, [roundId, newCourt]);
        const oldCourtMatch = await database.safeSelect<Match>(MatchColumns, tableNameMatch, `where round_id=? and court=?`, [roundId, oldCourt]);


        if (newCourtMatch.length > 0)
            await database.execute(`UPDATE ${tableNameMatch} SET court=? WHERE id=?`, [oldCourt, newCourtMatch[0].id]);
        if (oldCourtMatch.length > 0)
            await database.execute(`UPDATE ${tableNameMatch} SET court=? WHERE id=?`, [newCourt, oldCourtMatch[0].id]);
    }

    validateGuid(id: string | null): string | null {
        if (id === emptyGuid || id === null) return null;
        if (id === "") return null;
        if (!validate(id)) return null;
        return id;

    }
}
