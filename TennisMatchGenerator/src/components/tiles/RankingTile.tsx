import { Card, CardContent, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { RankingRecord } from "../../model/RankingRecord";
import { useSeason } from "../../context/SeasonContext";
import { useNotification } from "../../provider/NotificationProvider";
import { StatisticService } from "../../services/StatisticService";
import { useEffect, useState } from "react";
import { RankingTileDetails } from "./RankingTileDetails";

export interface RankingTileProps {
}

export const RankingTile: React.FC<RankingTileProps> = (_props) => {

    const { season } = useSeason();
    const notification = useNotification();
    if (!season) return null; // Sicherstellen, dass die Saison vorhanden ist


    const statisticService = new StatisticService(season.id, notification);

    const [rankingRecords, setRankingRecords] = useState<RankingRecord[]>([]);
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

    const init = async () => {
        var records = await statisticService.getRanking();
        setRankingRecords(records);
    }


    const toggleDetails = (playerId: string) => {
        setExpandedRows(prev => {
            const newSet = new Set(prev);
            newSet.has(playerId) ? newSet.delete(playerId) : newSet.add(playerId);
            return newSet;
        });
    };

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
                            <>
                                <TableRow
                                    key={row.playerId}
                                    onClick={() => toggleDetails(row.playerId)}
                                    className="cursor-pointer hover:bg-muted"
                                >
                                    <TableCell>{row.position}</TableCell>
                                    <TableCell>{row.name}</TableCell>
                                    <TableCell>{row.participationDays.length}</TableCell>
                                    <TableCell>{row.totalPoints}</TableCell>
                                </TableRow>

                                {expandedRows.has(row.playerId) && (
                                    <TableRow className="bg-muted/50">
                                        <TableCell colSpan={4}>
                                            {/* Hier kannst du beliebige Details anzeigen */}
                                            <div className="text-sm space-y-1">
                                                <RankingTileDetails playerId={row.playerId} />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </>

                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>

    );
}