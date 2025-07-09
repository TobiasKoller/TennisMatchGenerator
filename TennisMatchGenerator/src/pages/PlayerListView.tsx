import { Badge, Box, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import Select, { MultiValue } from 'react-select';
import { useNotification } from "../provider/NotificationProvider";
import { useSeason } from "../context/SeasonContext";
import { PlayerService } from "../services/PlayerService";
import { Player } from "../model/Player";
import { PlayerOptionType } from "../model/PlayerOptionType";
import { MatchDayRoundContext } from "../context/MatchDayRoundContext";

import { MatchDayRound } from "../model/MatchDayRound";
import { MatchDayRoundPlayer } from "../model/MatchDayRoundPlayer";
import { DragDropService } from "../handler/DragDropHandler";
import { MatchDayService } from "../services/MatchDayService";
import { Match } from "../model/Match";
import CloseIcon from '@mui/icons-material/Close';
import RefreshIcon from '@mui/icons-material/Refresh';

import StarIcon from '@mui/icons-material/Star';

interface PlayerListProps {
    // Define any props you need here
    isActive?: boolean;
    isEnabled?: boolean;
    matchDayId: string;
    round: MatchDayRound;
    matches: Match[];
}



export const PlayerListView: React.FC<PlayerListProps> = (props) => {

    const notification = useNotification();
    const { season } = useSeason();
    const matchDayRoundContext = useContext(MatchDayRoundContext);
    if (!season || !matchDayRoundContext) return <></>;

    const [allPlayerOptions, setAllPlayerOptions] = useState<PlayerOptionType[]>([]);
    const [allPlayers, setAllPlayers] = useState<Player[]>([]);
    const [selectionChanged, setSelectionChanged] = useState(false);
    const [selectedPlayers, setSelectedPlayers] = useState<MultiValue<PlayerOptionType>>([]);
    const [isEnabled, setIsEnabled] = useState(props.isEnabled ?? true);
    const round = props.round;


    const { isPlayerUsedInMatch } = matchDayRoundContext!;
    const playerService = new PlayerService(season.id, notification);
    const matchDayService = new MatchDayService(season.id, notification);
    const dragDropService = new DragDropService(season.id, notification, round.id, matchDayService, matchDayRoundContext.reloadMatches);

    const NoMultiValue = () => null;

    const matchesChanged = async () => {
        await fetchSelectedPlayers();
    }

    useEffect(() => {
        setIsEnabled(props.isEnabled ?? true);
    }, [props.isEnabled]);



    useEffect(() => {
        matchesChanged();
    }, [props.matches]);

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

            var playerOptions: PlayerOptionType[] = players.map((player: Player) => ({ //Modell für Select-Optionen
                value: player.id,
                player: player, // Hier wird der Player direkt verwendet
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
            var playerCount = await matchDayService.countPlayersInMatches(props.matchDayId);

            var selectedPlayers: PlayerOptionType[] = players.map((player: MatchDayRoundPlayer) => ({
                value: player.playerId,
                NumberOfRoundsPlayed: playerCount[player.playerId] ?? 0, // Anzahl der Teilnahmen
                player: player.player!, // Hier wird der Player aus MatchDayRoundPlayer verwendet
                label: `${player.player?.firstname} ${player.player?.lastname}`,
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

    const handleSelectChange = (selectedOptions: MultiValue<PlayerOptionType>) => {
        const sortedPlayers = [...selectedOptions].sort((a, b) => {
            // Vergleiche die Namen lexikografisch
            return a.label.localeCompare(b.label);
        });


        setSelectedPlayers(sortedPlayers);
    };

    // const getGenderIcon = (playerId: string) => {
    //     var player = allPlayers.find((p) => p.id === playerId);

    //     switch (player?.gender) {
    //         case "male": return <ManIcon sx={{ color: "darkblue" }} />;
    //         case "female": return <WomanIcon sx={{ color: "hotpink" }} />;
    //         case "diverse": return <Man4Icon sx={{ color: "purple" }} />;
    //         default: return null; // Fallback, falls kein Geschlecht gefunden wird
    //     }
    // }

    const getGenderColor = (playerId: string) => {
        var player = allPlayers.find((p) => p.id === playerId);
        switch (player?.gender) {
            case "male": return "darkblue";
            case "female": return "hotpink";
            case "diverse": return "purple";
            default: return null; // Fallback, falls kein Geschlecht gefunden wird
        }
    }

    return (

        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ marginBottom: 2 }}>
                <Typography variant="h6">Spieler der Runde</Typography>
                <Typography variant="subtitle2" color="text.secondary">
                    Insgesamt: {selectedPlayers.length}
                </Typography>
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
                    flex: 1,
                    overflowY: 'auto',
                    minHeight: 0, // <<< sehr wichtig!
                    paddingRight: 1, // optional für Scrollbar-Abstand
                }}
            >

                {
                    selectedPlayers.map((player, index) => {
                        const isDisabled = !isEnabled || isPlayerUsedInMatch(player.value);
                        return <Box

                            key={index} sx={{
                                pointerEvents: isDisabled ? 'none' : 'auto',
                                opacity: isDisabled ? 0.5 : 1,
                                marginBottom: 1,
                            }}
                            draggable={!isPlayerUsedInMatch(player.value)}
                            onDragStart={(ev) => dragDropService.handleDragPlayerStart(ev, player.value, null, null, null)}
                        >
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    p: 1,
                                    border: "2px solid " + getGenderColor(player.value),
                                    borderRadius: 1,
                                    maxWidth: 300,
                                    backgroundColor: "#fafafa",
                                }}
                            >
                                {/* Name + Gender + Badges */}
                                <Stack direction="row" alignItems="center" spacing={1} sx={{ flexGrow: 1, minWidth: 0 }}>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            overflow: "hidden",
                                            whiteSpace: "nowrap",
                                            textOverflow: "ellipsis",
                                            gap: 0.5,
                                            flexShrink: 1,
                                        }}
                                    >
                                        {/* {getGenderIcon(player.value)} */}
                                        <span title={player.label}>{player.label}</span>
                                    </Box>
                                    <Box sx={{ flexGrow: 1, minWidth: 0 }} /> {/* Spacer für Flexbox */}
                                    <Tooltip title="Teilnahmen">
                                        <Badge
                                            badgeContent={player.NumberOfRoundsPlayed ?? 0}
                                            showZero
                                            color="primary"
                                            sx={{
                                                "& .MuiBadge-badge": {
                                                    fontSize: "0.7rem", height: 18, minWidth: 18,
                                                    top: -3, // Standard ist ca. 10, kleiner Wert = höher
                                                    right: 0,
                                                }
                                            }}
                                        >
                                            <RefreshIcon fontSize="small" />
                                        </Badge>
                                    </Tooltip>

                                    <Tooltip title="Spielstärke">
                                        <Badge
                                            badgeContent={player.player?.skillRating ?? 0}
                                            showZero
                                            color="secondary"
                                            sx={{
                                                "& .MuiBadge-badge": {
                                                    fontSize: "0.7rem", height: 18, minWidth: 18,
                                                    top: -3, // Standard ist ca. 10, kleiner Wert = höher
                                                    right: 0,
                                                }
                                            }}
                                        >
                                            <StarIcon fontSize="small" sx={{ color: "gold" }} />
                                        </Badge>
                                    </Tooltip>
                                </Stack>

                                {/* Delete Icon */}
                                <IconButton
                                    size="small"
                                    onClick={() => {
                                        deletePlayer(player.value);
                                    }}
                                    aria-label={`Lösche ${player.label}`}
                                    sx={{ ml: 1, pointerEvents: 'all' }}
                                >
                                    <CloseIcon fontSize="small" />
                                </IconButton>
                            </Box>
                            {/* <Chip disabled={isPlayerUsedInMatch(player.value)}
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
                            /> */}
                        </Box>
                    })
                }
            </Box >
        </Box >)

}