import { Box, Button, Chip, Stack, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { MatchDayRound } from "../model/MatchDayRound";
import { PlayerService } from "../services/PlayerService";
import { useNotification } from "../provider/NotificationProvider";
import { useSeason } from "../context/SeasonContext";
import { useEffect, useState } from "react";
import { MatchDayRoundPlayer } from "../model/MatchDayRoundPlayer";
import { Player } from "../model/Player";
import { CourtsView } from "./CourtsView";
import { SeasonService } from "../services/SeasonService";
import { Setting } from "../model/Setting";
import LockOutlineIcon from '@mui/icons-material/LockOutline';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import { MatchGenerator } from "../services/MatchGenerator.ts";
import { MatchDayService } from "../services/MatchDayService.ts";
import PlayCircleFilledWhiteIcon from '@mui/icons-material/PlayCircleFilledWhite';
import { MatchDayRoundContext } from "../context/MatchDayRoundContext.tsx";
import { Match } from "../model/Match.ts";
import { PlayerListView } from "./PlayerListView.tsx";
import { OptionType } from "../model/OptionType.ts";



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
    // const [markedPlayers, setMarkedPlayers] = useState<string[]>([]);
    // const [allPlayers, setAllPlayers] = useState<Player[]>([]);

    const playerService = new PlayerService(season.id, notification);
    const matchDayService = new MatchDayService(season.id, notification);


    // const fetchAllPlayers = async () => {
    //     try {
    //         const players = await playerService.getAllPlayers();

    //         var allPlayers: OptionType[] = players.map((player: Player) => ({ //Modell für Select-Optionen
    //             value: player.id,
    //             label: `${player.firstname} ${player.lastname} (${player.skillRating})`,
    //         }));
    //         setAllPlayers(players); // Speichern der Spieler für die Hintergrundfarbe
    //         // setAllPlayerOptions(allPlayers);
    //     } catch (error) {
    //         console.error("Fehler beim Abrufen der Spieler:", error);
    //     }
    // };

    // const fetchSelectedPlayers = async () => {
    //     try {
    //         const players = await playerService.getPlayersByRoundId(round.id, true);

    //         var selectedPlayers: OptionType[] = players.map((player: MatchDayRoundPlayer) => ({
    //             value: player.playerId,
    //             label: `${player.player?.firstname} ${player.player?.lastname} (${player.player?.skillRating})`,
    //         }));


    //         setSelectedPlayers(selectedPlayers);
    //     } catch (error) {
    //         console.error("Fehler beim Abrufen der selektierten Spieler:", error);
    //     }
    // };

    const fetchSettings = async () => {
        const seasonService = new SeasonService();
        const settings = await seasonService.getSettings();
        setSettings(settings);
    }

    const fetchMatches = async () => {
        const currentMatches = await matchDayService.getMatchesByRoundId(round.id);
        setMatches(currentMatches);
    }

    const init = async () => {
        // await fetchAllPlayers();
        // await fetchSelectedPlayers();
        await fetchSettings();
        await fetchMatches();
    }


    const registerDraggablePlayer = (control: HTMLDivElement) => {
        control.addEventListener("dragstart", (e: any) => {
            const playerId = e.currentTarget.getAttribute("data-player-id");
            if (playerId) {
                handleOnDrag(e, playerId);
            }
        });
    }



    useEffect(() => {
        init();
    }, []);



    useEffect(() => {
        matchDayService.updateUsedCourts(round.id, selectedCourts);
    }, [selectedCourts])

    // useEffect(() => {
    //     if (markedPlayers.length === 2) {
    //         switchPlayers();
    //     }
    // }, [markedPlayers]);



    const courtSelectionChanged = (_event: React.MouseEvent<HTMLElement>, newCourts: number[]) => {
        var sorted = newCourts.sort((a, b) => a - b);
        setSelectedCourts(sorted);
    };

    // const createMatches = async () => {
    //     if (selectedPlayers.length < 2) {
    //         notification.notifyError("Bitte mindestens 2 Spieler auswählen.");
    //         return;
    //     }
    //     const players = await playerService.getPlayersByRoundId(round.id, true);
    //     var generator = new MatchGenerator(players!);
    //     var result = generator.generate(round.id, selectedCourts) ?? [];

    //     var matches = result.doubles.concat(result.singles);
    //     if (matches.length === 0) {
    //         notification.notifyError("Es konnten keine Paarungen erstellt werden. Bitte überprüfen Sie die Anzahl der Spieler und Plätze.");
    //         return;
    //     }

    //     if (result.unusedPlayers.length > 0) {
    //         if (result.unusedPlayers.length === 1) {
    //             notification.notifyWarning(`[${result.unusedPlayers[0].player?.firstname} ${result.unusedPlayers[0].player?.lastname}] pausiert in dieser Runde.`);
    //         }
    //         else {
    //             notification.notifyWarning(`Die Spieler [${result.unusedPlayers.map((p) => p.player?.firstname + " " + p.player?.lastname).join(", ")}] pausieren in dieser Runde.`);
    //         }
    //     }
    //     if (matches.length > 0) {
    //         notification.notifySuccess("Paarungen erfolgreich erstellt.");
    //     }

    //     await matchDayService.saveMatches(round.id, matches);
    //     await fetchMatches();
    // };

    const toggleRoundState = async () => {

        setRoundStarted(!roundStarted);
    }

    // const isSelectedPlayer = (playerId: string) => {
    //     return markedPlayers.includes(playerId);
    // }

    // const togglePlayerSelection = (playerId: string) => {
    //     if (markedPlayers.length >= 2 && !isSelectedPlayer(playerId)) return;

    //     if (isSelectedPlayer(playerId)) {
    //         setMarkedPlayers(markedPlayers.filter(id => id !== playerId));
    //     } else {
    //         setMarkedPlayers([...markedPlayers, playerId]);
    //     }
    // }

    // const switchPlayers = () => {
    //     if (markedPlayers.length !== 2) return;
    //     const [player1Id, player2Id] = markedPlayers;


    //     var updatedMatches: Match[] = [];
    //     var currentMatches = matches.map((match) => {
    //         const newMatch = { ...match };

    //         // Für alle 4 Spieler-Positionen prüfen und ggf. tauschen
    //         for (const key of ['player1HomeId', 'player2HomeId', 'player1GuestId', 'player2GuestId'] as const) {
    //             let updated = false;
    //             if (newMatch[key] === player1Id) {
    //                 newMatch[key] = player2Id;
    //                 updated = true;
    //             }
    //             else if (newMatch[key] === player2Id) {
    //                 newMatch[key] = player1Id;
    //                 updated = true;
    //             }

    //             if (updated && updatedMatches.find((m) => m.id === newMatch.id) === undefined) {
    //                 updatedMatches.push(newMatch);
    //             }
    //         }
    //         return newMatch;
    //     });

    //     setMatches(currentMatches);
    //     updateMatches(updatedMatches);
    //     setMarkedPlayers([]);
    // };

    const isPlayerUsedInMatch = (playerId: string) => {
        return matches.some((match) => {
            return match.player1HomeId === playerId || match.player2HomeId === playerId || match.player1GuestId === playerId || match.player2GuestId === playerId;
        });
    }



    // const updateMatches = async (matches: Match[]) => {
    //     const matchDayService = new MatchDayService(season.id, notification);
    //     await matchDayService.updateMatches(matches);
    //     fetchMatches(); // Aktualisiere die Matches nach dem Update
    // }

    const handleOnDrag = (e: React.DragEvent<HTMLDivElement>, playerId: string) => {
        console.log("Drag started for player ID:", playerId);
        e.dataTransfer.setData("playerId", playerId);
    }

    return (
        <MatchDayRoundContext.Provider value={{ isPlayerUsedInMatch, registerDraggablePlayer, reloadMatches: fetchMatches }}>
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
