import { useEffect, useState } from "react";
import { useSeason } from "../context/SeasonContext";
import { useNotification } from "../provider/NotificationProvider";
import { StatisticService } from "../services/StatisticService";
import { MatchDayStatisticData } from "../model/MatchDayStatisticData";
import { Badge, Box, Typography } from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams, GridRowsProp } from "@mui/x-data-grid";
import { MatchDayStatisticRoundResult } from "../model/MatchDayStatisticRoundResult";
import { Player } from "../model/Player";

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
        {
            field: 'player',
            headerName: 'Spieler',
            flex: 1,
            renderCell: (params: GridRenderCellParams<MatchDayStatisticData>) => {
                const player: Player = params.value.player;
                return (
                    <Typography variant="body2" color="textPrimary">
                        {player.firstname} {player.lastname}
                    </Typography>
                );
            },
        }
    ];

    // Runden-Spalten hinzufügen
    const roundColumns: GridColDef[] = Array.from({ length: maxRounds }, (_, i) => ({
        field: `round${i + 1}`,
        headerName: `Runde ${i + 1}`,
        flex: 1,
        renderCell: (params) => {
            const rowValue: MatchDayStatisticRoundResult = params.value;

            if (!rowValue) return <Box />; // Falls keine Daten vorhanden sind

            const badgeColor =
                rowValue.result === 'Won' ? 'success' :
                    rowValue.result === 'Lost' ? 'error' :
                        'default';

            const textColor =
                rowValue.result === 'Won' ? 'green' :
                    rowValue.result === 'Lost' ? 'red' :
                        'text.secondary';

            return (
                <Box
                    width="100%"
                    height="100%"
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                >
                    <Box position="relative" display="inline-flex">
                        <Typography sx={{ color: textColor }}>{rowValue.games}</Typography>
                        <Badge
                            badgeContent={rowValue.points}
                            color={badgeColor}
                            showZero
                            sx={{
                                position: 'absolute',
                                top: -2,
                                right: -12,
                                '& .MuiBadge-badge': {
                                    fontSize: '0.7rem',
                                    minWidth: 18,
                                    height: 18,
                                },
                            }}
                        />
                    </Box>
                </Box>
            );
        },
    }));

    const lastColumns: GridColDef[] = [
        {
            field: 'totalPoints',
            headerName: 'Gesamtpunkte',
            width: 150,
            renderCell: (params: GridRenderCellParams<MatchDayStatisticData>) => {
                const row = params.row as any
                return (
                    <Box
                        width="100%"
                        height="100%"
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                    >
                        <Box position="relative" display="inline-flex">
                            <Typography>{row.totalPoints}</Typography>
                            <Badge
                                badgeContent={row.totalMatchesPlayed > 0 ? row.pointsForParticipation : 0}
                                color={"primary"}
                                showZero
                                sx={{
                                    position: 'absolute',
                                    top: -2,
                                    right: -12,
                                    '& .MuiBadge-badge': {
                                        fontSize: '0.7rem',
                                        minWidth: 18,
                                        height: 18,
                                    },
                                }}
                            />
                        </Box>
                    </Box>
                );
            },
        }]

    const columns: GridColDef[] = [...baseColumns, ...roundColumns, ...lastColumns];

    // Zeilen konstruieren
    const rows: GridRowsProp = statisticData.playerResults.map((player, index) => {
        const roundData: Record<string, any> = {};

        player.roundResults.forEach((r, i) => {
            roundData[`round${i + 1}`] = r
        });
        return {
            id: index + 1,
            player: player,
            totalMatchesPlayed: player.totalMatchesPlayed,
            pointsForParticipation: statisticData.pointsForParticipation,
            totalPoints: player.totalPoints,
            ...roundData,
        };
    });

    return (
        <Box sx={{ height: '100%', overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
            {/* <Typography variant="h6" gutterBottom>
                Statistik für Spieltag {matchDayId}
            </Typography> */}

            <Box sx={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
                <DataGrid
                    rows={rows}
                    columns={columns}
                    disableRowSelectionOnClick
                    sx={{
                        '& .MuiDataGrid-cell': {
                            display: 'flex',
                            alignItems: 'center',
                        },
                        '& .MuiDataGrid-columnHeader': {
                            alignItems: 'center',
                        },
                    }}
                />
            </Box>
        </Box>
    );

}