import { CourtSide } from "../model/Enums";
import { Match } from "../model/Match";
import { DragPlayerContext } from "../model/DragPlayerContext";
import { INotificationService } from "../provider/NotificationProvider";
import { MatchDayService } from "../services/MatchDayService";
import { ServiceBase } from "../services/ServiceBase";
import { v4 as uuidv4, NIL as EMPTY_GUID, validate as validateGuid } from 'uuid';



export class DragDropService extends ServiceBase {
    constructor(seasonId: string, private notificationService: INotificationService, private roundId: string, private matchDayService: MatchDayService, private reloadMatches: () => Promise<void>) {
        super(seasonId, notificationService);
    }

    public handleDragPlayerStart(e: React.DragEvent, playerId: string | null, fromMatchId: string | null, fromCourtNumber: number | null) {
        const context: DragPlayerContext = {
            fromMatchId: fromMatchId,
            fromPlayerId: playerId,
            fromCourtNumber: fromCourtNumber,
            toMatchId: null,
            toPlayerId: null,
            toSide: null,
            toCourtNumber: null
        };
        e.dataTransfer?.setData('dragcontext', JSON.stringify(context));
    }

    public handleDragOver(e: React.DragEvent) {
        e.preventDefault();
    }

    public async handleDropOnPlayer(e: React.DragEvent, context: DragPlayerContext) {
        e.preventDefault();

        var fromPlayer = context.fromPlayerId;
        var toPlayer = context.toPlayerId;
        var fromMatchId = context.fromMatchId;
        var toMatchId = context.toMatchId;

        if (!fromPlayer || !toPlayer || !toMatchId) return;

        await this.switchPlayers(fromPlayer, toPlayer, fromMatchId, toMatchId);

        await this.reloadMatches();
    }



    public async handleOnDropOnCourt(e: React.DragEvent, context: DragPlayerContext) {
        e.preventDefault();

        let matchId = context.toMatchId;
        const side = context.toSide;
        const playerId = context.fromPlayerId;

        if (side === null || playerId === null) return;
        if (await this.isPlayerInMatch(playerId, matchId!)) {
            this.notificationService.notifyWarning("Spieler ist bereits im Match");
            return;
        }

        if (!matchId) {
            if (!context.toCourtNumber) return;
            let match = await this.createMatch(context.toCourtNumber);
            matchId = match.id;
        }

        if (context.fromMatchId) { // Spieler wird von einem anderen Match verschoben
            await this.addPlayerToMatch(playerId, side, matchId!);
            await this.removePlayerFromMatch(playerId, context.fromMatchId);
        }
        else { // Spieler wird von der Spielerliste verschoben
            if (await this.isPlayerInAnyMatch(playerId)) {
                this.notificationService.notifyWarning("Spieler ist bereits in einem anderen Match");
                return;
            }
            await this.addPlayerToMatch(playerId, side, matchId!);
        }

        await this.reloadMatches();
    };

    async isPlayerInAnyMatch(playerId: string) {
        if (!playerId) return false;

        const matches = await this.matchDayService.getMatches(this.roundId);

        for (const match of matches) {
            if (await this.isPlayerInMatch(playerId, match)) return true;
        }
        return false;
    }

    async isPlayerInMatch(playerId: string, match: Match | string) {
        if (!playerId || !match) return false;

        const currentMatch = typeof match === "string" ? await this.matchDayService.getMatch(match) : match;

        if (currentMatch.player1HomeId == playerId || currentMatch.player2HomeId == playerId || currentMatch.player1GuestId == playerId || currentMatch.player2GuestId == playerId) {
            return true;
        }
        return false;
    }


    private async createMatch(courtNumber: number) {
        const match = new Match();
        match.id = uuidv4();
        match.roundId = this.roundId;
        match.court = courtNumber;
        match.type = "single";

        await this.matchDayService.addMatch(match);
        return match;
    }

    isvalidId(id: string | null) {
        if (id == EMPTY_GUID || id === null) return false;
        return validateGuid(id);
    }

    async switchPlayers(fromPlayerId: string, toPlayerId: string, fromMatchId: string | null, toMatchId: string) {
        if (!fromPlayerId || !toPlayerId) return;

        if (fromMatchId == toMatchId) {
            this.notificationService.notifyError("Beide Spieler sind bereits im selben Match");
            return;
        }

        await this.switchPlayers(fromPlayerId, toPlayerId, fromMatchId, toMatchId);

    }

    async removePlayerFromMatch(playerId: string, matchId: string) {
        var match = await this.matchDayService.getMatch(matchId);

        if (match.player1HomeId == playerId) match.player1HomeId = null;
        else if (match.player2HomeId == playerId) match.player2HomeId = null;
        else if (match.player1GuestId == playerId) match.player1GuestId = null;
        else if (match.player2GuestId == playerId) match.player2GuestId = null;

        if (this.isEmptyMatch(match)) await this.matchDayService.deleteMatch(matchId);
        else await this.matchDayService.updateMatch(match);
    }

    isEmptyMatch(match: Match) {
        if (match.player1HomeId == null && match.player2HomeId == null && match.player1GuestId == null && match.player2GuestId == null) {
            return true;
        }
        return false;
    }


    async addPlayerToMatch(playerId: string, side: CourtSide, matchId: string) {

        var match = await this.matchDayService.getMatch(matchId);

        if (side == CourtSide.LEFT) {
            if (this.isvalidId(match.player1HomeId) && this.isvalidId(match.player2HomeId)) {
                this.notificationService.notifyError("Beide Spieler sind bereits gesetzt");
                return;
            }

            if (!match.player1HomeId) match.player1HomeId = playerId;
            else if (!match.player2HomeId) match.player2HomeId = playerId;

            if (this.isvalidId(match.player1HomeId) && this.isvalidId(match.player2HomeId)) {
                match.type = "double";
            }
        }
        else {
            if (this.isvalidId(match.player1GuestId) && this.isvalidId(match.player2GuestId)) {
                this.notificationService.notifyError("Beide Spieler sind bereits gesetzt");
                return;

            }
            if (!match.player1GuestId) match.player1GuestId = playerId;
            else if (!match.player2GuestId) match.player2GuestId = playerId;

            if (this.isvalidId(match.player1GuestId) && this.isvalidId(match.player2GuestId)) {
                match.type = "double";
            }
        }

        await this.matchDayService.updateMatch(match);
    }
}
