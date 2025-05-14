import { CourtSide } from "../model/Enums";
import { Match } from "../model/Match";
import { INotificationService } from "../provider/NotificationProvider";
import { MatchDayService } from "./MatchDayService";
import { ServiceBase } from "./ServiceBase";
import { v4 as uuidv4, NIL as EMPTY_GUID, validate as validateGuid } from 'uuid';



export class DragDropService extends ServiceBase {
    constructor(seasonId: string, private notificationService: INotificationService, private roundId: string, private matchDayService: MatchDayService, private reloadMatches: () => void) {
        super(seasonId, notificationService);
    }

    public handleDragPlayerStart(e: React.DragEvent, playerId: string) {
        e.dataTransfer?.setData('playerid', playerId);
    }

    public handleDragOver(e: React.DragEvent) {
        e.preventDefault();
    }

    public handleDropOnPlayer(e: React.DragEvent, onPlayerId: string, onDrop?: (playerId: string) => void) {
        e.preventDefault();
        const playerId = e.dataTransfer?.getData('playerid');
        if (playerId) {
            onDrop && onDrop(playerId);
        }
    }



    public async handleOnDropOnCourt(e: React.DragEvent, side: CourtSide, courtNumber: number, match?: Match | null, onDrop?: (playerId: string) => void) {
        e.preventDefault();
        const playerId = e.dataTransfer?.getData('playerid');
        if (!playerId) return;

        if (!match) {
            match = await this.createMatch(courtNumber);
        }

        this.addPlayerToMatch(playerId, side, match);

        onDrop && onDrop(playerId);
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


        this.reloadMatches();
    }
}
