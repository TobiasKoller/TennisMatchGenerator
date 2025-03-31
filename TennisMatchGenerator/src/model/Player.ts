import { DbRecord } from "./DbRecord";

export interface Player extends DbRecord {
    firstname: string;
    lastname: string;
    skillRating: number;
    age: number;
    isActive: boolean;
}
