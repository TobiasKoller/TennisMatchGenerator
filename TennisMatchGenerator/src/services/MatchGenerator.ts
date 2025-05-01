// MatchGenerator.ts

import { Match } from "../model/Match";
import { MatchDayRoundPlayer } from "../model/MatchDayRoundPlayer";


export class MatchGenerator {
    private playerHistory = new Map<string, Set<string>>();
    private roundCounter = 0;

    constructor() { }

    generateNextRound(roundId: string, players: MatchDayRoundPlayer[], courtCount: number): Match[] {
        // Init History falls neue Spieler dabei sind
        for (const p of players) {
            if (!this.playerHistory.has(p.playerId)) {
                this.playerHistory.set(p.playerId, new Set());
            }
        }

        const availablePlayers = [...players].sort((a, b) => a.player!.skillRating - b.player!.skillRating);
        const roundMatches: Match[] = [];
        let matchNumber = 1;

        while (availablePlayers.length >= 2 && roundMatches.length < courtCount) {
            const group =
                this.selectBestGroup(availablePlayers, 4) ||
                this.selectBestGroup(availablePlayers, 2);

            if (!group) break;

            // History aktualisieren
            for (let i = 0; i < group.length; i++) {
                for (let j = i + 1; j < group.length; j++) {
                    this.playerHistory.get(group[i].playerId)?.add(group[j].playerId);
                    this.playerHistory.get(group[j].playerId)?.add(group[i].playerId);
                }
            }

            const match = new Match();
            match.id = `${roundId}-${matchNumber}`;
            match.roundId = roundId;
            match.type = group.length === 4 ? "double" : "single";
            match.number = matchNumber;
            match.court = matchNumber;

            if (group.length === 2) {
                match.player1HomeId = group[0].playerId;
                match.player1GuestId = group[1].playerId;
            } else {
                match.player1HomeId = group[0].playerId;
                match.player2HomeId = group[1].playerId;
                match.player1GuestId = group[2].playerId;
                match.player2GuestId = group[3].playerId;
            }

            roundMatches.push(match);
            matchNumber++;

            // Spieler entfernen
            for (const p of group) {
                const idx = availablePlayers.findIndex(ap => ap.playerId === p.playerId);
                if (idx !== -1) availablePlayers.splice(idx, 1);
            }
        }

        return roundMatches;
    }

    private selectBestGroup(players: MatchDayRoundPlayer[], groupSize: 2 | 4): MatchDayRoundPlayer[] | null {
        if (players.length < groupSize) return null;

        let bestGroup: MatchDayRoundPlayer[] | null = null;
        let bestScore = Infinity;
        const combinations = this.getCombinations(players, groupSize);

        for (const group of combinations) {
            const lkSpread = Math.max(...group.map(p => p.player!.skillRating)) - Math.min(...group.map(p => p.player!.skillRating));
            const repeatCount = this.countPreviousMatches(group);
            const score = lkSpread * 2 + repeatCount * 5; // Gewichtung anpassbar

            if (score < bestScore) {
                bestScore = score;
                bestGroup = group;
            }
        }

        return bestGroup;
    }

    private countPreviousMatches(group: MatchDayRoundPlayer[]): number {
        let repeats = 0;
        for (let i = 0; i < group.length; i++) {
            for (let j = i + 1; j < group.length; j++) {
                if (this.playerHistory.get(group[i].playerId)?.has(group[j].playerId)) repeats++;
            }
        }
        return repeats;
    }

    private getCombinations<T>(arr: T[], size: number): T[][] {
        const results: T[][] = [];
        const combine = (start: number, path: T[]) => {
            if (path.length === size) {
                results.push([...path]);
                return;
            }
            for (let i = start; i < arr.length; i++) {
                path.push(arr[i]);
                combine(i + 1, path);
                path.pop();
            }
        };
        combine(0, []);
        return results;
    }
}
