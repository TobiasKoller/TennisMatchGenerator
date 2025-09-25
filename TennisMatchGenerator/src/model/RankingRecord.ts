import { RankingRecordDetails } from "./RankingRecordDetails";

export class RankingRecord {
    position: number = -1; // Platzierung, falls benötigt
    playerId: string;
    name: string;
    totalPoints: number;
    participationDays: string[]; // Anzahl der Teilnahmen, falls benötigt
    details?: RankingRecordDetails;

    constructor(playerId: string, name: string, totalPoints: number, participations: string[]) {
        this.playerId = playerId;
        this.name = name;
        this.participationDays = participations; // Anzahl der Teilnahmen, falls benötigt
        this.totalPoints = totalPoints;

    }
}



