import { useEffect, useState } from "react";
import { SeasonService } from "../services/SeasonService";
import { Season } from "../model/Season";
import Alert from "@mui/material/Alert";
import CheckIcon from '@mui/icons-material/Check';

export const CurrentSeason: React.FC = () => {

    const seasonService = new SeasonService();
    const [season, setSeason] = useState<Season | null>(null);

    useEffect(() => {
        // const fetchSeason = async () => {
        //     const currentSeason = await seasonService.getCurrentSeason();
        //     if (currentSeason === null) {
        //         if (season === null) {
        //             if (confirm("Es gibt noch keine Saison. Möchten Sie eine neue Saison erstellen?")) {
        //                 const newSeason: Season = {
        //                     year: new Date().getFullYear(),
        //                     players: [],
        //                     matches: [],
        //                     pointsTable: [],
        //                     courts: [],
        //                     currentMatchday: 0,
        //                 };
        //                 await seasonService.saveCurrentSeason(newSeason);
        //                 setSeason(newSeason);
        //             }
        //         }
        //         return;
        //     }
        //     setSeason(currentSeason);
        // };

        // fetchSeason();
    }
        , []);

    return (
        <>

            Current Season
        </>
    );
}