import { DbRecord } from "./DbRecord";

// import { Player } from "./Player";
export class MatchDay extends DbRecord {
    date: Date = new Date();
    isActive: boolean = false;
    scoringDone: boolean = false;
}

