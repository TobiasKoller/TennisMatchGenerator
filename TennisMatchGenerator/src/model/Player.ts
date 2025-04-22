import { DbRecord } from "./DbRecord";

export interface Player extends DbRecord {
    id: string;
    firstname: string;
    lastname: string;
    skillRating: number;
    age: number;
    isActive: boolean;
}
