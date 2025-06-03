import { DbRecord } from "./DbRecord";

export class Player extends DbRecord {
    id: string = "";
    firstname: string = "";
    lastname: string = "";
    skillRating: number = 0;
    birthDate: Date | null = null;
    gender: "male" | "female" | "diverse" = "male";
    isActive: boolean = true;
}


