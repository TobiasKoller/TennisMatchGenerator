import { Player } from "./Player";


export class MatchDayRoundPlayer {
    id: string = "";
    roundId: string = "";
    status: "active" | "paused" | "finished" = "active";
    playerId: string = "";
    player?: Player = new Player();

}
