import { useEffect, useState } from "react";
import { db } from "../db/Db";
import { Match } from "../model/Match";
import { useNotification } from "../provider/NotificationProvider";
import { useSeason } from "../context/SeasonContext";
import { MatchDayService } from "../services/MatchDayService";

export const Home: React.FC = () => {

    const [match, setMatch] = useState<any>(null);

    const notification = useNotification();
    const { season } = useSeason();
    if (!season) return <></>

    const matchDayService = new MatchDayService(season?.id, notification);
    // const init = async () => {
    //     let ignore = false;

    //     if (ignore == false) {
    //         const database = await db;
    //         //update match
    //         var currentMatches: Match[] = await database.select(`SELECT * FROM match where id = '58c24433-8f41-48a8-aab9-cc16538f9e0b'`);
    //         var currentMatch: Match = currentMatches[0];
    //         console.log("currentmatch", currentMatch);
    //         currentMatch.number = currentMatch.number + 1;
    //         await matchDayService.updateMatch(currentMatch);

    //         const updatedMatch: Match = await database.select(`SELECT * FROM match where id = '58c24433-8f41-48a8-aab9-cc16538f9e0b'`);
    //         console.log("updatedMatch", updatedMatch);

    //         // var testdummies: any[] = await database.select(`SELECT id,number FROM testdummy where id = '1'`);
    //         // var testdummy: any = testdummies[0];
    //         // console.log("currentTestdummy", JSON.stringify(testdummy));
    //         // testdummy.number = testdummy.number + 1;
    //         // await database.execute(`UPDATE testdummy SET number = ? WHERE id = ?`, [testdummy.number, testdummy.id]);

    //         // const updatedTestdummy: any[] = await database.select(`SELECT number FROM testdummy where id = '1'`);
    //         // console.log("updatedMatch", JSON.stringify(updatedTestdummy));
    //     }


    //     return () => {
    //         ignore = true;
    //     };
    // }

    const test = async () => {
        const database = await db;
        //update match
        var currentMatches: Match[] = await database.select(`SELECT * FROM match where id = '58c24433-8f41-48a8-aab9-cc16538f9e0b'`);
        var currentMatch: Match = currentMatches[0];
        console.log("currentmatch", currentMatch);
        currentMatch.number = currentMatch.number + 1;
        await matchDayService.updateMatch(currentMatch);

        const updatedMatch: Match = await database.select(`SELECT * FROM match where id = '58c24433-8f41-48a8-aab9-cc16538f9e0b'`);
        console.log("updatedMatch", updatedMatch);
    }

    useEffect(() => {

    }, []);

    return (
        <>
            <h1>Home</h1><button onClick={test}>Test</button>
            {JSON.stringify(match)}
        </>
    );
}
