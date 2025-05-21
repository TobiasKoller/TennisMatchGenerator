import { CourtSide } from "./Enums";

export class DragPlayerContext {
    fromMatchId: string | null = null;
    fromPlayerId: string | null = null;
    fromCourtNumber: number | null = null;
    toMatchId: string | null = null;
    toPlayerId: string | null = null;
    fromSide: CourtSide | null = null;
    toSide: CourtSide | null = null;
    toCourtNumber: number | null = null;
}


