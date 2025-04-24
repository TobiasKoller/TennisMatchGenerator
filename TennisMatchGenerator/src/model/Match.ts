import { DbRecord } from "./DbRecord";
import { Set } from "./Set";




export class Match extends DbRecord {
    type: "single" | "double" = "single";
    number: number = 0;
    court: number = 0;
    set1: Set = new Set();
    set2: Set = new Set();

}
