
interface ModelBase{
    id:string
}

interface Player extends ModelBase{

    firstName: string,
    lastName: string,
    birthDate: Date,
    lk: number,
    achievements: Achievement[]
}

interface MatchDay{
    availablePlayers: Player[];
    matches: Match[]
}

enum AchievementType{
    Participate = 0,
    WonGames = 1
}

enum GameType
{
    Single = 1,
    Double = 2
}

interface Achievement extends ModelBase{
    type:AchievementType,
    date: Date,
    points: number
}

interface RankedPlayer extends ModelBase{
    position:number,
    player:Player
}

interface Setting extends ModelBase{
    numberOfCourts: number
}

interface Match {
    courtNo: number,
    gameType: GameType
}

export type SingleMatch = Match & {
    
        gameType: GameType.Single;
        player1: Player;
        player2: Player;
}

export type DoubleMatch = Match & {
    gameType: GameType.Double;
    players1: Player[];
    players2: Player[];

}