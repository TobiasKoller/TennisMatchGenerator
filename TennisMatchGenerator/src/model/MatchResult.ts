import { Match } from "./Match";
import { MatchDayRoundPlayer } from "./MatchDayRoundPlayer";


export class MatchResult {
    doubles: Match[] = [];
    singles: Match[] = [];
    unusedPlayers: MatchDayRoundPlayer[] = [];
}
