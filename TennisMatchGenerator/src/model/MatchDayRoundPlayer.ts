import { Player } from "./Player";


export class MatchDayRoundPlayer {
    id: string = "";
    roundId: string = "";
    playerId: string = "";
    player?: Player = new Player();
    status?: "active" | "inactive" = "active";

}
