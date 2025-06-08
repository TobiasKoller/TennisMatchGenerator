import { Player } from "./Player";


export class MatchDayRoundPlayer {
    id: string = "";
    roundId: string = "";
    playerId: string = "";
    player?: Player = new Player();
    numberOfRoundsPlayed?: number = 0;
    status?: "active" | "inactive" = "active";

}
