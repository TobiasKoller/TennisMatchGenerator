
import { Box, Button, Stack, Typography } from '@mui/material';
import { CustomPaper } from '../components/CustomPaper';
import AddIcon from '@mui/icons-material/Add';
import { MatchDayService } from '../services/MatchDayService';
import { useNotification } from '../provider/NotificationProvider';
import { useSeason } from '../context/SeasonContext';
import { useEffect, useState } from 'react';
import { MatchDay } from '../model/Matchday';
import { useNavigate } from 'react-router-dom';
import { RoutePath } from '../model/RoutePath';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

interface MatchDaysProps {
}


export const MatchDays: React.FC<MatchDaysProps> = ({ }) => {

    const { season } = useSeason();
    const notification = useNotification();
    const [matchDays, setMatchDays] = useState<MatchDay[]>([]); // Zustand für die Spieltage
    const navigateHook = useNavigate();
    if (!season) return null; // Sicherstellen, dass die Saison vorhanden ist

    const matchDayService = new MatchDayService(season.id, notification);

    const fetchMatchDays = async () => {
        const dbMatchDays = await matchDayService.getAllMatchDays();
        setMatchDays(dbMatchDays.sort((a, b) => b.date.getTime() - a.date.getTime())); // Spieltage im Zustand speichern
    };

    const init = async () => {
        await fetchMatchDays();
    }


    useEffect(() => {
        init();

    }, []);


    const addMatchDay = async () => {
        const id = await matchDayService.createMatchDay();
        navigateHook(`/${RoutePath.MATCHDAYS.path}/${id}`);
    };
    const openMatchDay = (matchDay: MatchDay) => {
        navigateHook(`/${RoutePath.MATCHDAYS.path}/${matchDay.id}`);
    };

    const onRowUpdated = async (newRow: MatchDay) => {
        try {
            await matchDayService.updateMatchDayDate(newRow.id, newRow.date);
            notification.notifySuccess('Datum wurde aktualisiert');

            init();

            return newRow;
        } catch (error) {
            notification.notifyError('Fehler beim Aktualisieren des Datums');
            return newRow; // Rückgabe des unveränderten Rows, um den Zustand nicht zu verlieren
        }
    };
    // const getMatchDayTitle = (matchDay: MatchDay) => {
    //     //inkl. Wochentag
    //     const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: '2-digit', day: '2-digit' };
    //     const date = matchDay.date.toLocaleDateString('de-DE', options);
    //     return `Spieltag vom ${date}`;
    // }

    if (!matchDays) {
        return (
            <CustomPaper>
                <Typography variant="h6">Keine Spieltage gefunden</Typography>
            </CustomPaper>
        );
    }

    const columns: GridColDef[] = [
        {
            field: 'date',
            headerName: 'Datum',
            type: 'date',
            editable: true,
            width: 200,
            headerClassName: 'super-app-theme--header',
            valueFormatter: (value: Date) => {
                return value?.toLocaleDateString('de-DE', { year: 'numeric', month: '2-digit', day: '2-digit' });
            },
        },
        {
            field: 'isClosed',
            headerName: 'Status',
            flex: 200,
            headerClassName: 'super-app-theme--header',
            type: 'string',
            valueFormatter: (value: boolean) => value ? 'Abgeschlossen' : 'Offen',
        },
        {
            field: 'actions',
            headerName: 'Aktion',
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            headerClassName: 'super-app-theme--header',
            align: 'right',
            renderCell: (params) => (
                <Box
                    sx={{
                        opacity: 0,
                        transition: 'opacity 0.3s',
                        '.MuiDataGrid-row:hover &': {
                            opacity: 1,
                        },
                    }}
                >
                    <Button
                        variant="outlined"
                        size="small"
                        onClick={() => openMatchDay(params.row)}
                    >
                        Öffnen
                    </Button>
                </Box>
            ),
        },
    ];

    return (
        <CustomPaper>
            <Typography variant="h5" gutterBottom>
                Spieltage
            </Typography>
            <Stack direction="row" justifyContent="flex-end" mb={2}>
                <Button color='primary' variant="contained" startIcon={<AddIcon />} onClick={addMatchDay}>Neuer Spieltag</Button>
            </Stack>

            <Box sx={{ height: 400, width: '100%' }}>
                <DataGrid
                    processRowUpdate={onRowUpdated}
                    rows={matchDays}
                    columns={columns}
                    pageSizeOptions={[5]}
                    // checkboxSelection

                    disableRowSelectionOnClick
                    sx={{
                        '& .MuiDataGrid-cell:hover': {
                            color: 'primary.main',
                        },
                        '& .super-app-theme--header': {
                            backgroundColor: 'primary.main', // z. B. Lila
                            color: '#fff',
                            fontWeight: 'bold',
                        },
                        '& .MuiDataGrid-cell:focus': {
                            outline: 'none',
                        },
                        '& .MuiDataGrid-cell:focus-within': {
                            outline: 'none',
                        },
                    }}
                />
            </Box>
        </CustomPaper>
    );

}
