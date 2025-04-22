import { DbRecord } from "./DbRecord";
import { Player } from "./Player";
import { Setting } from "./Setting";

export interface Season extends DbRecord {
    name: string;
    year: number;
    description: string;
    settings: Setting;
    players: Player[];
    matchDays: Matchday[];
}

export interface Matchday extends DbRecord {
    date: Date;
    players: Player[];
    matches: Match[];
}

export interface Match extends DbRecord {
    type: "single" | "double";
    number: number;
    court: number;
    sets: Set[];

}

export interface Set extends DbRecord {
    homeGames: number;
    awayGames: number;
}


export interface SingleMatch extends Match {
    type: "single";
    homePlayer: string;
    awayPlayer: string;
}

export interface DoubleMatch extends Match {
    type: "double";
    homePlayers: [string, string];
    awayPlayers: [string, string];
}