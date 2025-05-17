import { CourtSide } from "../model/Enums";
import { Match } from "../model/Match";
import { DragPlayerContext } from "../model/DragPlayerContext";
import { INotificationService } from "../provider/NotificationProvider";
import { MatchDayService } from "../services/MatchDayService";
import { ServiceBase } from "../services/ServiceBase";
import { v4 as uuidv4, NIL as EMPTY_GUID, validate as validateGuid } from 'uuid';



export class DragDropService extends ServiceBase {
    constructor(seasonId: string, private notificationService: INotificationService, private roundId: string, private matchDayService: MatchDayService, private reloadMatches: () => void) {
        super(seasonId, notificationService);
    }

    public handleDragPlayerStart(e: React.DragEvent, playerId: string, fromMatchId: string | null, fromCourtNumber: number | null) {
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

        this.reloadMatches();
    }



    public async handleOnDropOnCourt(e: React.DragEvent, context: DragPlayerContext) {
        e.preventDefault();

        let matchId = context.toMatchId;
        const side = context.toSide;
        const playerId = context.fromPlayerId;

        if (side === null || playerId === null) return;

        if (!matchId) {
            if (!context.toCourtNumber) return;
            let match = await this.createMatch(context.toCourtNumber);
            matchId = match.id;
        }

        await this.addPlayerToMatch(playerId, side, matchId!);

        this.reloadMatches();
    };

    private async createMatch(courtNumber: number) {
        const match = new Match();
        match.id = uuidv4();
        match.roundId = this.roundId;
        match.court = courtNumber;
        match.type = "single";

        await this.matchDayService.addMatch(match);
        return match;
    }

    isvalidId(id: string) {
        if (id == EMPTY_GUID) return false;
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
