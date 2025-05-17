import { Box, Button, Stack, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { MatchDayRound } from "../model/MatchDayRound";
import { useNotification } from "../provider/NotificationProvider";
import { useSeason } from "../context/SeasonContext";
import { useEffect, useState } from "react";
import { CourtsView } from "./CourtsView";
import { SeasonService } from "../services/SeasonService";
import { Setting } from "../model/Setting";
import LockOutlineIcon from '@mui/icons-material/LockOutline';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import { MatchDayService } from "../services/MatchDayService.ts";
import PlayCircleFilledWhiteIcon from '@mui/icons-material/PlayCircleFilledWhite';
import { MatchDayRoundContext } from "../context/MatchDayRoundContext.tsx";
import { PlayerListView } from "./PlayerListView.tsx";



interface MatchDayRoundPageProps {
    matchDayId: string;
    round: MatchDayRound;
    isEnabled: boolean;
    isActive: boolean;
    addNewRound: () => void;
    changeTabState: (enableTab: boolean) => void;
}
export const MatchDayRoundPage: React.FC<MatchDayRoundPageProps> = (props) => {

    const notification = useNotification();
    const { season } = useSeason();

    const round = props.round; // Runde aus den Props extrahieren


    if (!season) return null; // Sicherstellen, dass die Saison vorhanden ist


    const [matches, setMatches] = useState(round.matches ?? []); // Matches aus der Runde extrahieren
    const [settings, setSettings] = useState<Setting>(new Setting());
    const [selectedCourts, setSelectedCourts] = useState<number[]>(round.courts ?? []); // Zustand für die ausgewählten Plätze
    const isEnabled = props.isEnabled;
    const isActive = props.isActive; // Zustand für die aktiven Runden
    const [roundStarted, setRoundStarted] = useState(false); // Zustand für die aktive Runde


    const matchDayService = new MatchDayService(season.id, notification);

    const fetchSettings = async () => {
        const seasonService = new SeasonService();
        const settings = await seasonService.getSettings();
        setSettings(settings);
    }

    const fetchMatches = async () => {
        const currentMatches = await matchDayService.getMatchesByRoundId(round.id);
        console.log("Fetched matches:", currentMatches);
        setMatches(currentMatches);
    }

    useEffect(() => {
        console.log("Matches updated:", matches);
    }, [matches])

    const init = async () => {
        await fetchSettings();
        await fetchMatches();
    }


    useEffect(() => {
        init();
    }, []);


    useEffect(() => {
        matchDayService.updateUsedCourts(round.id, selectedCourts);
    }, [selectedCourts])


    const courtSelectionChanged = (_event: React.MouseEvent<HTMLElement>, newCourts: number[]) => {
        var sorted = newCourts.sort((a, b) => a - b);
        setSelectedCourts(sorted);
    };

    const toggleRoundState = async () => {
        setRoundStarted(!roundStarted);
    }

    const isPlayerUsedInMatch = (playerId: string) => {
        return matches.some((match) => {
            return match.player1HomeId === playerId || match.player2HomeId === playerId || match.player1GuestId === playerId || match.player2GuestId === playerId;
        });
    }

    return (
        <MatchDayRoundContext.Provider value={{ isPlayerUsedInMatch, reloadMatches: fetchMatches }}>
            <Box
                sx={{
                    display: "flex",
                    height: "100%",
                    overflow: "hidden", // wichtig damit links/rechts jeweils selbst scrollen
                }}
            >
                <Box
                    sx={{
                        width: '20%',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column', // <<< Spalten-Layout
                        borderRight: '1px solid #ccc',
                        height: '100%'
                    }}
                >
                    <PlayerListView round={round} isActive={isActive} isEnabled={isEnabled} />
                </Box>

                {/* Rechte Seite */}
                <Box
                    sx={{
                        flexGrow: 1,
                        padding: 2,
                        overflowY: "auto"
                    }}
                >
                    <Stack direction="row" spacing={2} justifyContent="flex-end">
                        <Box display="flex" alignItems="center">
                            <Typography variant="subtitle1" gutterBottom>
                                Verfügbare Plätze auswählen:
                            </Typography>
                            <ToggleButtonGroup
                                value={selectedCourts}
                                onChange={courtSelectionChanged}
                                sx={{ marginLeft: 2 }}
                            >
                                {settings?.availableCourts?.map((court) => (
                                    <ToggleButton key={court} value={court} sx={{
                                        py: 0.5, // weniger vertical padding
                                        px: 1.5, // horizontaler Abstand kann bleiben
                                        backgroundColor: "lightgray",
                                        '&.Mui-selected': {
                                            backgroundColor: 'green',
                                            color: 'white',
                                            '&:hover': {
                                                backgroundColor: 'darkgreen',
                                            },
                                        },
                                    }}>
                                        {court}
                                    </ToggleButton>
                                ))}
                            </ToggleButtonGroup>
                        </Box>
                        <Box flexGrow={1} />
                        {!isActive && (
                            <Button
                                color="error"
                                variant="outlined"
                                startIcon={isEnabled ? <LockOutlineIcon /> : <LockOpenIcon />}
                                onClick={() => props.changeTabState(!isEnabled)}
                            >
                                {isEnabled ? "Abschließen" : "Entsperren"}
                            </Button>

                        )}
                        {isActive && matches.length > 0 && (
                            <Button
                                color={roundStarted ? "error" : "success"}
                                variant="contained"
                                startIcon={<PlayCircleFilledWhiteIcon />}
                                onClick={() => toggleRoundState()}
                            >
                                {roundStarted ? "Runde beenden" : "Runde starten"}
                            </Button>
                        )}

                    </Stack>

                    <CourtsView round={round} courts={selectedCourts} matches={matches} />

                </Box>
            </Box >
        </MatchDayRoundContext.Provider>
    );
}
