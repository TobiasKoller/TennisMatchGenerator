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

    public handleDragPlayerStart(e: React.DragEvent, playerId: string | null, fromMatchId: string | null, fromCourtNumber: number | null, fromSide: CourtSide | null) {
        const context: DragPlayerContext = {
            fromMatchId: fromMatchId,
            fromPlayerId: playerId,
            fromCourtNumber: fromCourtNumber,
            toMatchId: null,
            toPlayerId: null,
            fromSide: fromSide,
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

        const fromMatchId = context.fromMatchId;
        const toMatchId = context.toMatchId;
        const fromPlayerId = context.fromPlayerId;
        const toPlayerId = context.toPlayerId;
        const fromCourtNumber = context.fromCourtNumber;
        const toCourtNumber = context.toCourtNumber;
        const fromSide = context.fromSide;
        const toSide = context.toSide;
        const fromMatch = context.fromMatchId ? await this.matchDayService.getMatch(context.fromMatchId) : null;
        let toMatch = context.toMatchId ? await this.matchDayService.getMatch(context.toMatchId) : null;

        if (toSide === null || fromPlayerId === null) return;

        try {
            if (this.playerMovedFromOtherCourt(fromCourtNumber, toCourtNumber)) {
                if (!toMatchId && toCourtNumber)
                    toMatch = await this.createMatch(toCourtNumber);

                await this.addPlayerToMatch(fromPlayerId, toSide, toMatch!);
                await this.removePlayerFromMatch(fromPlayerId, fromMatch!);
                return;
            }
            if (this.playerMovedSideOnSameCourt(fromMatchId, toMatchId)) {
                await this.movePlayerToOtherSide(fromPlayerId, toMatch!, fromSide, toSide);
                return;
            }


            if (this.playerMovedFromPlayerList(fromMatchId)) {
                if (await this.isPlayerInAnyMatch(fromPlayerId)) {
                    this.notificationService.notifyWarning("Spieler ist bereits in einem anderen Match");
                    return;
                }

                if (!toMatchId && toCourtNumber)
                    toMatch = await this.createMatch(toCourtNumber);

                await this.addPlayerToMatch(fromPlayerId, toSide, toMatch!);
            }
        }
        finally {
            await this.reloadMatches();
        }
    };



    async movePlayerToOtherSide(fromPlayerId: string, match: Match, fromSide: CourtSide | null, toSide: CourtSide | null) {
        if (!match) return;

        if (fromSide == CourtSide.LEFT) {
            if (toSide == CourtSide.LEFT) {
                this.notificationService.notifyWarning("Der Spieler ist bereits auf der Seite.");
                return;
            }

            if (!this.isNullOrEmpty(match.player1GuestId) && !this.isNullOrEmpty(match.player2GuestId)) {
                this.notificationService.notifyError("Beide Spieler sind bereits gesetzt");
                return;
            }

            if (this.isNullOrEmpty(match.player1GuestId)) match.player1GuestId = fromPlayerId;
            else match.player2GuestId = fromPlayerId;

            this.removePlayerFromCourt(fromPlayerId, match, CourtSide.LEFT);

        }
        else {
            if (toSide == CourtSide.RIGHT) {
                this.notificationService.notifyWarning("Der Spieler ist bereits auf der Seite.");
                return;
            }
            if (!this.isNullOrEmpty(match.player1HomeId) && !this.isNullOrEmpty(match.player2HomeId)) {
                this.notificationService.notifyWarning("Beide Spieler sind bereits gesetzt");
                return;
            }
            if (this.isNullOrEmpty(match.player1HomeId)) match.player1HomeId = fromPlayerId;
            else match.player2HomeId = fromPlayerId;

            this.removePlayerFromCourt(fromPlayerId, match, CourtSide.RIGHT);
        }

        await this.matchDayService.updateMatch(match);
    }

    removePlayerFromCourt(playerId: string, match: Match, side: CourtSide) {
        if (!match) return;

        if (side == CourtSide.LEFT) {
            if (match.player1HomeId == playerId) match.player1HomeId = null;
            else if (match.player2HomeId == playerId) match.player2HomeId = null;
        }
        else {
            if (match.player1GuestId == playerId) match.player1GuestId = null;
            else if (match.player2GuestId == playerId) match.player2GuestId = null;
        }

        this.matchDayService.updateMatch(match);
    }

    playerMovedFromOtherCourt(fromCourtNumber: number | null, toCourtNumber: number | null) {
        return fromCourtNumber !== null && fromCourtNumber != toCourtNumber;
    }

    playerMovedFromPlayerList(fromMatchId: string | null) {
        return fromMatchId === null;
    }

    playerMovedSideOnSameCourt(fromMatchId: string | null, toMatchId: string | null) {
        return !this.isNullOrEmpty(fromMatchId) && !this.isNullOrEmpty(toMatchId) && fromMatchId === toMatchId;
    }

    async isPlayerInAnyMatch(fromPlayerId: string) {
        if (!fromPlayerId) return false;

        const matches = await this.matchDayService.getMatches(this.roundId);

        for (const match of matches) {
            if (await this.isPlayerInMatch(fromPlayerId, match)) return true;
        }
        return false;
    }

    async isPlayerInMatch(fromPlayerId: string, match: Match | string) {
        if (!fromPlayerId || !match) return false;

        const currentMatch = typeof match === "string" ? await this.matchDayService.getMatch(match) : match;

        if (currentMatch.player1HomeId == fromPlayerId || currentMatch.player2HomeId == fromPlayerId || currentMatch.player1GuestId == fromPlayerId || currentMatch.player2GuestId == fromPlayerId) {
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

    async switchPlayers(fromPlayerId: string, toPlayerId: string, fromMatchId: string | null, toMatchId: string, fromSide: CourtSide | null = null, toSide: CourtSide | null = null) {
        if (!fromPlayerId || !toPlayerId) return;

        if (fromMatchId == toMatchId) {
            // if(fromSide != toSide) {
            // }
            // else{

            // }
            this.notificationService.notifyError("Beide Spieler sind bereits im selben Match");
            return;
        }

        await this.switchPlayers(fromPlayerId, toPlayerId, fromMatchId, toMatchId);

    }

    async removePlayerFromMatch(playerId: string, match: Match) {
        //var match = await this.matchDayService.getMatch(matchId);

        if (match.player1HomeId == playerId) match.player1HomeId = null;
        else if (match.player2HomeId == playerId) match.player2HomeId = null;
        else if (match.player1GuestId == playerId) match.player1GuestId = null;
        else if (match.player2GuestId == playerId) match.player2GuestId = null;

        if (this.isEmptyMatch(match)) await this.matchDayService.deleteMatch(match.id);
        else {
            if (this.countHomePlayers(match) < 2 && this.countGuestPlayers(match) < 2) {
                match.type = "single";
                if (!this.isNullOrEmpty(match.player2HomeId)) {
                    match.player1HomeId = match.player2HomeId;
                    match.player2HomeId = null;
                }
                if (!this.isNullOrEmpty(match.player2GuestId)) {
                    match.player1GuestId = match.player2GuestId;
                    match.player2GuestId = null;
                }
            }
            else {
                match.type = "double";
            }

            await this.matchDayService.updateMatch(match);
        }
    }

    isNullOrEmpty(value: string | null) {
        return value === null || value === "" || value == EMPTY_GUID || value == undefined;
    }

    countHomePlayers(match: Match) {

        let count = 0;
        if (match.player1HomeId) count++;
        if (match.player2HomeId) count++;
        return count;
    }
    countGuestPlayers(match: Match) {
        let count = 0;
        if (match.player1GuestId) count++;
        if (match.player2GuestId) count++;
        return count;
    }

    isEmptyMatch(match: Match) {
        if (match.player1HomeId == null && match.player2HomeId == null && match.player1GuestId == null && match.player2GuestId == null) {
            return true;
        }
        return false;
    }


    async addPlayerToMatch(playerId: string, side: CourtSide, match: Match) {

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
