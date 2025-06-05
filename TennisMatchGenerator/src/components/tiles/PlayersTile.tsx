import { Card, CardContent, Typography } from "@mui/material";
import { useSeason } from "../../context/SeasonContext";
import { useNotification } from "../../provider/NotificationProvider";
import { StatisticService } from "../../services/StatisticService";
import { useEffect, useState } from "react";

export interface PlayersTileProps {
}

export const PlayersTile: React.FC<PlayersTileProps> = (props) => {

    const { season } = useSeason();
    const notification = useNotification();
    if (!season) return null; // Sicherstellen, dass die Saison vorhanden ist


    const statisticService = new StatisticService(season.id, notification);

    const [count, setCount] = useState<number>();

    const init = async () => {
        var count = await statisticService.getNumberOfPlayers();
        setCount(count);
    }

    useEffect(() => {
        init();
    }, [])

    return (
        <Card>
            <CardContent>
                <Typography variant="h6">Anzahl Spieler</Typography>
                <Typography variant="h2">{count}</Typography>

            </CardContent>
        </Card>

    );
}