import React, { use, useEffect } from "react";
import {
    Grid,
    Card,
    CardContent,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
} from "@mui/material";
import { useSeason } from "../context/SeasonContext";
import { useNotification } from "../provider/NotificationProvider";
import { StatisticService } from "../services/StatisticService";
import { RankingRecord } from "../services/RankingRecord";



export const Home: React.FC = () => {

    const { season } = useSeason();
    const notification = useNotification();
    if (!season) return null; // Sicherstellen, dass die Saison vorhanden ist


    const statisticService = new StatisticService(season.id, notification);

    const [rankingRecords, setRankingRecords] = React.useState<RankingRecord[]>([]);

    const init = async () => {
        var records = await statisticService.getRanking();
        setRankingRecords(records);
    }

    useEffect(() => {
        init();


    }, [])

    return (
        <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>

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
                                        <TableCell>pos..todo</TableCell>
                                        <TableCell>{row.name}</TableCell>
                                        <TableCell>{row.participations}</TableCell>
                                        <TableCell>{row.totalPoints}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </Grid>
            {/* Kachel 1: Spieltage */}
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Card>
                    <CardContent>
                        <Typography variant="h6">Spieltage</Typography>
                        <Typography variant="h3">18</Typography>
                    </CardContent>
                </Card>
            </Grid>

            {/* Kachel 2: Anzahl Spieler */}
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Card>
                    <CardContent>
                        <Typography variant="h6">Spieler</Typography>
                        <Typography variant="h3">24</Typography>
                    </CardContent>
                </Card>
            </Grid>


        </Grid>
    );
}
