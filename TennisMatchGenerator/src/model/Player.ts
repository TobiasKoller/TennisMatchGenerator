import { DbRecord } from "./DbRecord";

export interface Player extends DbRecord {
    id: number;
    firstname: string;
    lastname: string;
    skillRating: number;
    age: number;
    isActive: boolean;
}
