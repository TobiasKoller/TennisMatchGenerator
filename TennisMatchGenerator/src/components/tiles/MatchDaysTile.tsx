import { Card, CardContent, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { RankingRecord } from "../../services/RankingRecord";
import { useSeason } from "../../context/SeasonContext";
import { useNotification } from "../../provider/NotificationProvider";
import { StatisticService } from "../../services/StatisticService";
import { useEffect, useState } from "react";

export interface MatchDaysTileProps {
}

export const MatchDaysTile: React.FC<MatchDaysTileProps> = (props) => {

    const { season } = useSeason();
    const notification = useNotification();
    if (!season) return null; // Sicherstellen, dass die Saison vorhanden ist


    const statisticService = new StatisticService(season.id, notification);

    const [matchDayCount, setMatchDayCount] = useState<number>();

    const init = async () => {
        var count = await statisticService.getNumberOfMatchDays();
        setMatchDayCount(count);
    }

    useEffect(() => {
        init();
    }, [])

    return (
        <Card>
            <CardContent>
                <Typography variant="h6">Spieltage</Typography>
                <Typography variant="h2">{matchDayCount}</Typography>

            </CardContent>
        </Card>

    );
}