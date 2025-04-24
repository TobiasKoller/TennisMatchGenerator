import { DbRecord } from "./DbRecord";

export class Player extends DbRecord {
    id: string = "";
    firstname: string = "";
    lastname: string = "";
    skillRating: number = 0;
    age: number = 0;
    isActive: boolean = true;

    constructor(init?: Partial<Player>) {
        super();
        Object.assign(this, init);
    }

    static fromJSON(data: any): Player {
        return new Player(data);
    }
}


