import { DbRecord } from "./DbRecord";
import { Setting } from "./Setting";


export class Season extends DbRecord {
    name: string = "";
    number: number = 0;
    isActive: boolean = false;
    year: number = 0;
    description: string = "";
    settings: Setting = new Setting();
}
