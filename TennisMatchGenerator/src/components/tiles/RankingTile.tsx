import { Card, CardContent, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { RankingRecord } from "../../services/RankingRecord";
import { useSeason } from "../../context/SeasonContext";
import { useNotification } from "../../provider/NotificationProvider";
import { StatisticService } from "../../services/StatisticService";
import { useEffect, useState } from "react";

export interface RankingTileProps {
}

export const RankingTile: React.FC<RankingTileProps> = (_props) => {

    const { season } = useSeason();
    const notification = useNotification();
    if (!season) return null; // Sicherstellen, dass die Saison vorhanden ist


    const statisticService = new StatisticService(season.id, notification);

    const [rankingRecords, setRankingRecords] = useState<RankingRecord[]>([]);

    const init = async () => {
        var records = await statisticService.getRanking();
        setRankingRecords(records);
    }

    useEffect(() => {
        init();
    }, [])

    return (
        <Card>
            <CardContent>
                <Typography variant="h6">Rangliste</Typography>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Platz</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Anzahl Teilnahmen</TableCell>
                            <TableCell>Punkte</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rankingRecords.map((row) => (
                            <TableRow key={row.playerId}>
                                <TableCell>{row.position}</TableCell>
                                <TableCell>{row.name}</TableCell>
                                <TableCell>{row.participations}</TableCell>
                                <TableCell>{row.totalPoints}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>

    );
}