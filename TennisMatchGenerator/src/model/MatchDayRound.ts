import { Match } from "./Match";
import { MatchDayRoundPlayer } from "./MatchDayRoundPlayer";


export class MatchDayRound {
    id: string = "";
    matchDayId: string = "";
    number: number = 0;
    StartDate: Date = new Date();
    EndDate: Date | null = null;
    matches?: Match[] = [];
    players?: MatchDayRoundPlayer[] = [];
    courts: string[] = [];
    isActive: boolean = false;
}
