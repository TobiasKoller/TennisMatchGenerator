import { DbRecord } from "./DbRecord";
import { Set } from "./Set";




export class Match extends DbRecord {
    id: string = ""; // ID des Matches
    roundId: string = ""; // ID der Runde
    type: "single" | "double" = "single";
    number: number = 0;
    court: number = 0;
    set1: Set = new Set(0, 0);
    set2: Set = new Set(0, 0);
    player1HomeId: string = ""; // Spieler 1 Heim  
    player2HomeId: string = ""; // Spieler 2 Heim
    player1GuestId: string = ""; // Spieler 1 Gast
    player2GuestId: string = ""; // Spieler 2 Gast 

}
