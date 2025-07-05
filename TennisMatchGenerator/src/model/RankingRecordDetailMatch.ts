
export class RankingRecordDetailMatch {
    HomeGames: number = 0;
    GuestGames: number = 0;
    IsPlayerHome: boolean = false;

    constructor(isPlayerHome: boolean, homeGames: number, guestGames: number) {
        this.IsPlayerHome = isPlayerHome;
        this.HomeGames = homeGames;
        this.GuestGames = guestGames;
    }
}
