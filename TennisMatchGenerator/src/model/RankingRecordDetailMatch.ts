
export class RankingRecordDetailMatch {
    homeGames: number = 0;
    guestGames: number = 0;
    isPlayerHome: boolean = false;

    constructor(isPlayerHome: boolean, homeGames: number, guestGames: number) {
        this.isPlayerHome = isPlayerHome;
        this.homeGames = homeGames;
        this.guestGames = guestGames;
    }
}
