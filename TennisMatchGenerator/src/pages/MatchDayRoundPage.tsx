import { Box, Button, Stack, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { MatchDayRound } from "../model/MatchDayRound";
import { useNotification } from "../provider/NotificationProvider";
import { useSeason } from "../context/SeasonContext";
import { useEffect, useRef, useState } from "react";
import { CourtsView } from "./CourtsView";
import { SeasonService } from "../services/SeasonService";
import { Setting } from "../model/Setting";
import LockOutlineIcon from '@mui/icons-material/LockOutline';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import { MatchDayService } from "../services/MatchDayService.ts";
import PlayCircleFilledWhiteIcon from '@mui/icons-material/PlayCircleFilledWhite';
import { MatchDayRoundContext } from "../context/MatchDayRoundContext.tsx";
import { PlayerListView } from "./PlayerListView.tsx";
import { PlayerService } from "../services/PlayerService.ts";
import { Match } from "../model/Match.ts";
import CasinoOutlinedIcon from '@mui/icons-material/CasinoOutlined';
import { ConfirmDialog, ConfirmDialogHandle } from "../components/ConfirmDialog.tsx";
import { isNullOrEmpty } from "../common/Common.ts";


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

    const dialogRef = useRef<ConfirmDialogHandle>(null);

    const [matches, setMatches] = useState(round.matches ?? []); // Matches aus der Runde extrahieren
    const [settings, setSettings] = useState<Setting>(new Setting());
    const [selectedCourts, setSelectedCourts] = useState<number[]>(round.courts ?? []); // Zustand für die ausgewählten Plätze
    const isEnabled = props.isEnabled;
    const isActive = props.isActive; // Zustand für die aktiven Runden
    const [roundStarted, setRoundStarted] = useState(false); // Zustand für die aktive Runde


    const matchDayService = new MatchDayService(season.id, notification);
    const playerService = new PlayerService(season.id, notification);

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

        //gibt es ein match wozu es aber keinen court gibt?

        matchDayService.updateUsedCourts(round.id, selectedCourts);
    }, [selectedCourts])


    const courtSelectionChanged = (_event: React.MouseEvent<HTMLElement>, newCourts: number[]) => {

        //removed court
        if (newCourts.length < selectedCourts.length) {
            const removedCourt = selectedCourts.filter(court => !newCourts.includes(court));
            if (removedCourt.length > 0) {
                var usedCourts = matches.filter(match => match.court === removedCourt[0]);
                if (usedCourts.length > 0) {
                    notification.notifyError(`Platz ${removedCourt[0]} kann nicht entfernt werden, da er bereits in einem Match verwendet wird.`);

                    return;
                }
                notification.notifySuccess(`Platz ${removedCourt[0]} entfernt`);
            }
        }

        var sorted = newCourts.sort((a, b) => a - b);
        setSelectedCourts(sorted);
    };

    const toggleRoundState = async () => {

        if (!roundStarted) {
            for (const match of matches) {
                if (match.type === "single") {
                    if (isNullOrEmpty(match.player1HomeId) || isNullOrEmpty(match.player1GuestId)) {
                        notification.notifyError(`Court ${match.court} ist nicht vollständig besetzt!`);
                        return;
                    }
                }
                if (match.type === "double") {
                    //2 gegen 1 erlaubt
                    if ((isNullOrEmpty(match.player1HomeId) && isNullOrEmpty(match.player2HomeId)) || (isNullOrEmpty(match.player1GuestId) && isNullOrEmpty(match.player2GuestId))) {
                        notification.notifyError(`Court ${match.court} ist nicht vollständig besetzt!`);
                        return;
                    }
                }
            }

            dialogRef.current?.open({
                question: "Möchten Sie die Runde wirklich starten?",
                onConfirm: async () => {
                    notification.notifyWarning("TODO: Runde starten");
                    setRoundStarted(true);
                },
                onClose: () => {
                },
            });
        }
        else {
            notification.notifyWarning("TODO: Runde beenden");
            setRoundStarted(false);
        }
    }

    const generateMatches = async () => {
        if (selectedCourts.length === 0) {
            notification.notifyWarning("Bitte mindestens einen Platz auswählen");
            return;
        }

        dialogRef.current?.open({
            question: "Es werden alle bisherigen Matches gelöscht! Fortfahren?",
            onConfirm: async () => {
                const players = await playerService.getPlayersByRoundId(round.id, true);
                const generatedMatches = await matchDayService.generateMatches(players, round.id, selectedCourts);
                var newMatches: Match[] = [generatedMatches.doubles, generatedMatches.singles].flat();
                await matchDayService.createMatches(round.id, newMatches);
                fetchMatches();
            },
            onClose: () => {
            },
        });
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
                    <PlayerListView round={round} isActive={isActive} isEnabled={isEnabled} matches={matches} />
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
                        <Box>
                            <Button onClick={generateMatches}
                                variant="outlined" color="primary"
                                startIcon={<CasinoOutlinedIcon />}>
                                Partien auslosen
                            </Button>
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
            <ConfirmDialog ref={dialogRef} />
        </MatchDayRoundContext.Provider>
    );
}
