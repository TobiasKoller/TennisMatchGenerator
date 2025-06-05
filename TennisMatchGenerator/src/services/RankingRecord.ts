
export class RankingRecord {
    position: number = -1; // Platzierung, falls benötigt
    playerId: string;
    name: string;
    totalPoints: number;
    participations: number; // Anzahl der Teilnahmen, falls benötigt

    constructor(playerId: string, name: string, totalPoints: number, participations: number) {
        this.playerId = playerId;
        this.name = name;
        this.participations = participations; // Anzahl der Teilnahmen, falls benötigt
        this.totalPoints = totalPoints;

    }
}