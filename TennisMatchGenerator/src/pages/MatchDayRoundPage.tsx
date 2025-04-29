import { Box, Chip, Stack, Typography } from "@mui/material";
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
import { Courts } from "./Courts";

interface MatchDayRoundPageProps {
    matchDayId: string;
    round: MatchDayRound;
    isActive: boolean;
}
type OptionType = {
    value: string;
    label: string;
};

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
    const playerService = new PlayerService(season.id, notification);

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

    const initPlayers = async () => {
        await fetchAllPlayers();
        await fetchSelectedPlayers();
    }


    useEffect(() => {
        initPlayers();
    }, []);

    useEffect(() => {
        if (selectionChanged) {
            onSelectionClosed(); // Jetzt ist selectedPlayers sicher aktuell
            setSelectionChanged(false); // Reset
        }
    }, [selectedPlayers, selectionChanged]);





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
                                label={
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        {getGenderIcon(player.value)}
                                        <span>{player.label}</span>
                                    </Stack>
                                }
                                onDelete={() => {
                                    const newSelectedPlayers = selectedPlayers.filter((p) => p.value !== player.value);
                                    setSelectedPlayers(newSelectedPlayers);
                                    setSelectionChanged(true);
                                }
                                }
                                sx={{
                                    width: '100%',
                                    justifyContent: 'space-between', // <<< Abstand zwischen Text und "X"
                                    borderRadius: 0, // Kantig
                                    paddingLeft: 1, // Etwas Abstand nach links
                                    paddingRight: 0, // Minimiert Abstand rechts für "X"
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
                <Courts round={round} />
            </Box>
        </Box>

    );
}
