import { Box, Button, Chip, Stack, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { MatchDayRound } from "../model/MatchDayRound";
import { PlayerService } from "../services/PlayerService";
import { useNotification } from "../provider/NotificationProvider";
import { useSeason } from "../context/SeasonContext";
import { useEffect, useState } from "react";
import Select, { MultiValue } from 'react-select';
import { MatchDayRoundPlayer } from "../model/MatchDayRoundPlayer";
import { Player } from "../model/Player";
import WomanIcon from '@mui/icons-material/Woman';
import ManIcon from '@mui/icons-material/Man';
import Man4Icon from '@mui/icons-material/Man4';
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
import { ConfirmDialog } from "../components/ConfirmDialog.tsx";

type OptionType = {
    value: string;
    label: string;
};

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
    const NoMultiValue = () => null;

    if (!season) return null; // Sicherstellen, dass die Saison vorhanden ist

    const [allPlayerOptions, setAllPlayerOptions] = useState<OptionType[]>([]);
    const [allPlayers, setAllPlayers] = useState<Player[]>([]);
    const [selectedPlayers, setSelectedPlayers] = useState<MultiValue<OptionType>>([]);
    const [selectionChanged, setSelectionChanged] = useState(false);
    const [matches, setMatches] = useState(round.matches ?? []); // Matches aus der Runde extrahieren
    const [settings, setSettings] = useState<Setting>(new Setting());
    const [selectedCourts, setSelectedCourts] = useState<number[]>(round.courts ?? []); // Zustand für die ausgewählten Plätze
    const isEnabled = props.isEnabled;
    const isActive = props.isActive; // Zustand für die aktiven Runden
    const [roundStarted, setRoundStarted] = useState(false); // Zustand für die aktive Runde
    const [markedPlayers, setMarkedPlayers] = useState<string[]>([]);
    const [showSwitchPlayerDialog, setSwitchPlayerDialog] = useState(false);

    const playerService = new PlayerService(season.id, notification);
    const matchDayService = new MatchDayService(season.id, notification);

    const fetchAllPlayers = async () => {
        try {
            const players = await playerService.getAllPlayers();

            var allPlayers: OptionType[] = players.map((player: Player) => ({ //Modell für Select-Optionen
                value: player.id,
                label: `${player.firstname} ${player.lastname} (${player.skillRating})`,
            }));
            setAllPlayers(players); // Speichern der Spieler für die Hintergrundfarbe
            setAllPlayerOptions(allPlayers);
        } catch (error) {
            console.error("Fehler beim Abrufen der Spieler:", error);
        }
    };

    const fetchSelectedPlayers = async () => {
        try {
            const players = await playerService.getPlayersByRoundId(round.id, true);

            var selectedPlayers: OptionType[] = players.map((player: MatchDayRoundPlayer) => ({
                value: player.playerId,
                label: `${player.player?.firstname} ${player.player?.lastname} (${player.player?.skillRating})`,
            }));


            setSelectedPlayers(selectedPlayers);
        } catch (error) {
            console.error("Fehler beim Abrufen der selektierten Spieler:", error);
        }
    };

    const fetchSettings = async () => {
        const seasonService = new SeasonService();
        const settings = await seasonService.getSettings();
        setSettings(settings);
    }

    const init = async () => {
        await fetchAllPlayers();
        await fetchSelectedPlayers();
        await fetchSettings();

    }


    useEffect(() => {
        init();
    }, []);

    useEffect(() => {
        if (selectionChanged) {
            onSelectionClosed(); // Jetzt ist selectedPlayers sicher aktuell
            setSelectionChanged(false); // Reset
        }
    }, [selectedPlayers, selectionChanged]);

    useEffect(() => {
        matchDayService.updateUsedCourts(round.id, selectedCourts);
    }, [selectedCourts])

    useEffect(() => {
        if (markedPlayers.length === 2) {
            switchPlayers();
        }
    }, [markedPlayers]);

    const onSelectionClosed = async () => {
        const selectedPlayerIds = selectedPlayers.map((player) => player.value);
        await playerService.updateSelectedRoundPlayers(round.id, selectedPlayerIds)
    }

    const handleSelectChange = (selectedOptions: MultiValue<OptionType>) => {
        const sortedPlayers = [...selectedOptions].sort((a, b) => {
            // Vergleiche die Namen lexikografisch
            return a.label.localeCompare(b.label);
        });


        setSelectedPlayers(sortedPlayers);
    };

    const getGenderIcon = (playerId: string) => {
        var player = allPlayers.find((p) => p.id === playerId);

        switch (player?.gender) {
            case "male": return <ManIcon sx={{ color: "darkblue" }} />;
            case "female": return <WomanIcon sx={{ color: "hotpink" }} />;
            case "diverse": return <Man4Icon sx={{ color: "purple" }} />;
            default: return null; // Fallback, falls kein Geschlecht gefunden wird
        }
    }

    const courtSelectionChanged = (_event: React.MouseEvent<HTMLElement>, newCourts: number[]) => {
        var sorted = newCourts.sort((a, b) => a - b);
        setSelectedCourts(sorted);
    };

    const createMatches = async () => {
        if (selectedPlayers.length < 2) {
            notification.notifyError("Bitte mindestens 2 Spieler auswählen.");
            return;
        }
        const players = await playerService.getPlayersByRoundId(round.id, true);
        var generator = new MatchGenerator(players!);
        var result = generator.generate(round.id, selectedCourts) ?? [];

        var matches = result.doubles.concat(result.singles);
        if (matches.length === 0) {
            notification.notifyError("Es konnten keine Paarungen erstellt werden. Bitte überprüfen Sie die Anzahl der Spieler und Plätze.");
            return;
        }

        if (result.unusedPlayers.length > 0) {
            if (result.unusedPlayers.length === 1) {
                notification.notifyWarning(`[${result.unusedPlayers[0].player?.firstname} ${result.unusedPlayers[0].player?.lastname}] pausiert in dieser Runde.`);
            }
            else {
                notification.notifyWarning(`Die Spieler [${result.unusedPlayers.map((p) => p.player?.firstname + " " + p.player?.lastname).join(", ")}] pausieren in dieser Runde.`);
            }
        }
        if (matches.length > 0) {
            notification.notifySuccess("Paarungen erfolgreich erstellt.");
        }

        setMatches(matches);

    };

    const toggleRoundState = async () => {
        setRoundStarted(!roundStarted);
    }

    const isSelectedPlayer = (playerId: string) => {
        return markedPlayers.includes(playerId);
    }

    const togglePlayerSelection = (playerId: string) => {
        if (markedPlayers.length >= 2 && !isSelectedPlayer(playerId)) return;

        if (isSelectedPlayer(playerId)) {
            setMarkedPlayers(markedPlayers.filter(id => id !== playerId));
        } else {
            setMarkedPlayers([...markedPlayers, playerId]);
        }
    }

    const switchPlayers = () => {
        if (markedPlayers.length !== 2) return;
        const [player1Id, player2Id] = markedPlayers;



        var updatedMatches = matches.map((match) => {
            const newMatch = { ...match };

            // Für alle 4 Spieler-Positionen prüfen und ggf. tauschen
            for (const key of ['player1HomeId', 'player2HomeId', 'player1GuestId', 'player2GuestId'] as const) {
                if (newMatch[key] === player1Id) {
                    newMatch[key] = player2Id;
                } else if (newMatch[key] === player2Id) {
                    newMatch[key] = player1Id;
                }
            }
            return newMatch;
        });

        setMatches([...updatedMatches]);
        setMarkedPlayers([]);
        setSwitchPlayerDialog(false);
    };

    // const onSwitchPlayerDialogCanceled = () => {
    //     setMarkedPlayers([]);
    //     setSwitchPlayerDialog(false);
    // }




    return (
        <Box
            sx={{
                display: "flex",
                height: "100%",
                overflow: "hidden", // wichtig damit links/rechts jeweils selbst scrollen
            }}
        >
            {/* Linke Seite */}
            <Box
                sx={{
                    width: '20%',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column', // <<< Spalten-Layout
                    borderRight: '1px solid #ccc',
                    height: '100%',
                }}
            >
                {/* 1. Fester Bereich oben */}
                <Box sx={{ marginBottom: 2 }}>
                    <Typography variant="h6">Spieler der Runde</Typography>
                    <Select
                        isDisabled={!props.isActive}
                        options={allPlayerOptions}
                        value={selectedPlayers}
                        onChange={handleSelectChange}
                        placeholder="Spieler auswählen"
                        isMulti
                        closeMenuOnSelect={false}
                        onMenuClose={onSelectionClosed}
                        menuPortalTarget={document.body}
                        components={{
                            MultiValue: NoMultiValue,
                            ClearIndicator: () => null,
                        }}
                        styles={{
                            menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                        }}
                    />
                </Box>

                {/* 2. Scrollbarer Bereich */}
                <Box
                    sx={{
                        flexGrow: 1, // <<< nimmt den restlichen Platz ein
                        overflowY: 'auto',
                        paddingRight: 1, // optional Scrollbar Platz lassen
                    }}
                >
                    {selectedPlayers.map((player) => (
                        <Box key={player.value} sx={{ marginBottom: 1 }}>
                            <Chip
                                onClick={() => togglePlayerSelection(player.value)}
                                label={
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        {getGenderIcon(player.value)}
                                        <span>{player.label}</span>
                                    </Stack>
                                }
                                onDelete={!isEnabled ? undefined : () => {
                                    const newSelectedPlayers = selectedPlayers.filter((p) => p.value !== player.value);
                                    setSelectedPlayers(newSelectedPlayers);
                                    setSelectionChanged(true);
                                }}


                                sx={{
                                    width: '100%',
                                    cursor: 'pointer',
                                    justifyContent: 'space-between', // <<< Abstand zwischen Text und "X"
                                    borderRadius: 0, // Kantig
                                    paddingLeft: 1, // Etwas Abstand nach links
                                    paddingRight: 0, // Minimiert Abstand rechts für "X"
                                    backgroundColor: isSelectedPlayer(player.value) ? "rgba(0, 146, 19, 0.8)" : "rgba(255, 255, 255, 0.8)"
                                }}
                            />
                        </Box>
                    ))}
                </Box>
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
                    <Button
                        color="success"
                        variant="outlined"
                        startIcon={<ViewInArIcon />}
                        onClick={createMatches}
                    >
                        Paarungen ermitteln
                    </Button>
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
                <MatchDayRoundContext.Provider value={{ togglePlayerSelection, isSelectedPlayer }}>
                    <CourtsView round={round} courts={selectedCourts} matches={matches} />
                </MatchDayRoundContext.Provider>
            </Box>

            {/* <ConfirmDialog open={showSwitchPlayerDialog} onClose={onSwitchPlayerDialogCanceled} onConfirm={switchPlayers} question="Willst du die Spieler jetzt wechseln?" /> */}

        </Box >

    );
}
