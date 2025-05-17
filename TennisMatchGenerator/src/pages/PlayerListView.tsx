import { Box, Chip, Stack, Typography } from "@mui/material";
import { useContext, useEffect, useRef, useState } from "react";
import Select, { MultiValue } from 'react-select';
import { useNotification } from "../provider/NotificationProvider";
import { useSeason } from "../context/SeasonContext";
import { PlayerService } from "../services/PlayerService";
import { Player } from "../model/Player";
import { OptionType } from "../model/OptionType";
import { MatchDayRoundContext } from "../context/MatchDayRoundContext";

import WomanIcon from '@mui/icons-material/Woman';
import ManIcon from '@mui/icons-material/Man';
import Man4Icon from '@mui/icons-material/Man4';
import { MatchDayRound } from "../model/MatchDayRound";
import { MatchDayRoundPlayer } from "../model/MatchDayRoundPlayer";
import { DragDropService } from "../handler/DragDropHandler";
import { MatchDayService } from "../services/MatchDayService";

interface PlayerListProps {
    // Define any props you need here
    isActive?: boolean;
    isEnabled?: boolean;
    round: MatchDayRound;
}



export const PlayerListView: React.FC<PlayerListProps> = (props) => {

    const notification = useNotification();
    const { season } = useSeason();
    const matchDayRoundContext = useContext(MatchDayRoundContext);
    if (!season || !matchDayRoundContext) return <></>;

    const [allPlayerOptions, setAllPlayerOptions] = useState<OptionType[]>([]);
    const [allPlayers, setAllPlayers] = useState<Player[]>([]);
    const [selectionChanged, setSelectionChanged] = useState(false);
    const [selectedPlayers, setSelectedPlayers] = useState<MultiValue<OptionType>>([]);

    const round = props.round;
    const isEnabled = props.isEnabled;

    const { isPlayerUsedInMatch } = matchDayRoundContext!;
    const playerService = new PlayerService(season.id, notification);
    const matchDayService = new MatchDayService(season.id, notification);
    const dragDropService = new DragDropService(season.id, notification, round.id, matchDayService, matchDayRoundContext.reloadMatches);

    const NoMultiValue = () => null;

    const deletePlayer = async (playerId: string) => {
        if (isPlayerUsedInMatch(playerId)) {
            notification.notifyError("Spieler kann nicht entfernt werden, da er bereits in einem Match verwendet wird.");
            return;
        }
        const newSelectedPlayers = selectedPlayers.filter((p) => p.value !== playerId);
        setSelectedPlayers(newSelectedPlayers);
        setSelectionChanged(true);
    }

    const fetchAllPlayers = async () => {
        try {
            const players = await playerService.getAllPlayers();

            var playerOptions: OptionType[] = players.map((player: Player) => ({ //Modell für Select-Optionen
                value: player.id,
                label: `${player.firstname} ${player.lastname} (${player.skillRating})`,
            }));
            setAllPlayers(players); // Speichern der Spieler für die Hintergrundfarbe
            setAllPlayerOptions(playerOptions);
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



    const init = async () => {
        await fetchAllPlayers();
        await fetchSelectedPlayers();
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

        <>
            < Box sx={{ marginBottom: 2 }}>
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
            </Box >

            {/* 2. Scrollbarer Bereich */}
            < Box
                sx={{
                    flexGrow: 1, // <<< nimmt den restlichen Platz ein
                    overflowY: 'auto',
                    paddingRight: 1, // optional Scrollbar Platz lassen
                }}
            >

                {
                    selectedPlayers.map((player, index) => {
                        return <Box
                            key={index} sx={{ marginBottom: 1 }}
                            draggable
                            onDragStart={(ev) => dragDropService.handleDragPlayerStart(ev, player.value, null, null)}
                        >
                            <Chip
                                label={
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        {getGenderIcon(player.value)}
                                        <span>{player.label}</span>
                                    </Stack>
                                }
                                onDelete={!isEnabled ? undefined : () => {
                                    deletePlayer(player.value);
                                }}


                                sx={{
                                    width: '100%',
                                    cursor: 'pointer',
                                    justifyContent: 'space-between', // <<< Abstand zwischen Text und "X"
                                    borderRadius: 0, // Kantig
                                    paddingLeft: 1, // Etwas Abstand nach links
                                    paddingRight: 0, // Minimiert Abstand rechts für "X"
                                    backgroundColor: "rgba(255, 255, 255, 0.8)"
                                }}
                            />
                        </Box>
                    })
                }
            </Box >
        </ >)

}