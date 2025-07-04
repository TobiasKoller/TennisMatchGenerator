import { useEffect, useState } from "react";
import { useSeason } from "../context/SeasonContext";
import { useNotification } from "../provider/NotificationProvider";
import { StatisticService } from "../services/StatisticService";
import { MatchDayStatisticData } from "../model/MatchDayStatisticData";
import { Box, Typography } from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams, GridRowsProp } from "@mui/x-data-grid";
import { MatchDayStatisticRoundResult } from "../model/MatchDayStatisticRoundResult";

interface MatchDayStatisticProps {
    matchDayId: string;
}

export const MatchDayStatistic: React.FC<MatchDayStatisticProps> = (props) => {

    const { matchDayId } = props;
    const { season } = useSeason();
    const notification = useNotification();

    const [statisticData, setStatisticData] = useState<MatchDayStatisticData | null>(null);


    var statService = new StatisticService(season!.id, notification);

    const init = async () => {
        var data = await statService.getMatchDayStatistics(matchDayId);
        setStatisticData(data);
    }

    useEffect(() => {
        init();
    }, []);


    if (!statisticData) return <Box>Loading...</Box>;

    const maxRounds = Math.max(...statisticData.playerResults.map(p => p.roundResults.length));

    // Basisspalten
    const baseColumns: GridColDef[] = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'playerId', headerName: 'Spieler', flex: 1 },
        { field: 'totalPoints', headerName: 'Punkte', width: 100 },
        { field: 'totalParticipations', headerName: 'Teilnahmen', width: 130 },
    ];

    // Runden-Spalten hinzufügen
    const roundColumns: GridColDef[] = Array.from({ length: maxRounds }, (_, i) => ({
        field: `round${i + 1}`,
        headerName: `Runde ${i + 1}`,
        flex: 1,
    }));

    const columns: GridColDef[] = [...baseColumns, ...roundColumns];

    // Zeilen konstruieren
    const rows: GridRowsProp = statisticData.playerResults.map((player, index) => {
        const roundData: Record<string, string> = {};

        player.roundResults.forEach((r, i) => {
            roundData[`round${i + 1}`] = `${r.games} – ${r.result}`;
        });

        return {
            id: index + 1,
            playerId: player.playerId,
            totalPoints: player.totalPoints,
            totalParticipations: player.totalParticipations,
            ...roundData,
        };
    });

    return (
        <Box sx={{ width: '100%' }}>
            <Typography variant="h6" gutterBottom>
                Spieltag: {statisticData.matchDayId} – {statisticData.totalPlayerCount} Spieler
            </Typography>

            <DataGrid
                rows={rows}
                columns={columns}
                // pageSize={5}
                autoHeight
                disableRowSelectionOnClick
            />
        </Box>
    );

}