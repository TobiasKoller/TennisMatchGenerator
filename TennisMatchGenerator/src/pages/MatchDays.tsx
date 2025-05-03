
import { Button, List, ListItem, Paper, Stack, Typography } from '@mui/material';
import { CustomPaper } from '../components/CustomPaper';
import AddIcon from '@mui/icons-material/Add';
import { MatchDayService } from '../services/MatchDayService';
import { useNotification } from '../provider/NotificationProvider';
import { useSeason } from '../context/SeasonContext';
import { useEffect, useState } from 'react';
import { MatchDay } from '../model/Matchday';
import { useNavigate } from 'react-router-dom';
import { RoutePath } from '../model/RoutePath';

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

    useEffect(() => {
        fetchMatchDays();
    }, []);


    const addMatchDay = async () => {
        const id = await matchDayService.createMatchDay();
        navigateHook(`/${RoutePath.MATCHDAYS.path}/${id}`);
    };

    const getMatchDayTitle = (matchDay: MatchDay) => {
        //inkl. Wochentag
        const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: '2-digit', day: '2-digit' };
        const date = matchDay.date.toLocaleDateString('de-DE', options);
        return `Spieltag vom ${date}`;
    }

    return (
        <CustomPaper>
            <Stack direction="column" spacing={2} style={{ marginBottom: "16px" }}>
                <Stack direction="row" spacing={2} justifyContent={'flex-end'}>
                    <Button color='primary' variant="contained" startIcon={<AddIcon />} onClick={addMatchDay}>Neuer Spieltag</Button>
                </Stack >
                <List sx={{ width: '100%', maxWidth: 800, mx: 'auto' }}>
                    {matchDays.map((matchDay) => (
                        <ListItem key={matchDay.id} disablePadding sx={{ mb: 2 }}>
                            <Paper
                                elevation={3}
                                sx={{
                                    width: '100%',
                                    p: 2,
                                    display: 'flex',
                                    flexDirection: 'column',
                                }}
                            >
                                <Typography variant="h6">{getMatchDayTitle(matchDay)}</Typography>
                            </Paper>
                        </ListItem>
                    ))}
                    {matchDays.length === 0 && (
                        <Typography variant="h6">Keine Spieltage gefunden.</Typography>
                    )}
                </List>
            </Stack>
        </CustomPaper>
    );

}
