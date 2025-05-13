import { Box, IconButton, TextField } from "@mui/material";
import { Match } from "../model/Match";
import { useContext, useEffect, useState } from "react";
import tennisCourtUrl from "../assets/tennis_court.svg";
import { PlayerService } from "../services/PlayerService";
import { useSeason } from "../context/SeasonContext";
import { useNotification } from "../provider/NotificationProvider";
import { Player } from "../model/Player";
import CheckIcon from "@mui/icons-material/Check";
import { MatchDayRoundContext } from "../context/MatchDayRoundContext";
import { MatchDayService } from "../services/MatchDayService";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { v4 as uuidv4, validate, NIL as emptyGuid } from "uuid";


interface CourtViewProps {
    roundId: string;
    court: number;
    match: Match | null;

}

enum CourtSide {
    LEFT = 0,
    RIGHT = 1,
}

export const CourtView: React.FC<CourtViewProps> = (props) => {

    const { court } = props;

    const notification = useNotification();
    const { season } = useSeason();
    const matchDayRoundContext = useContext(MatchDayRoundContext);

    if (!season || !matchDayRoundContext) return <></>;
    // const { togglePlayerSelection, isSelectedPlayer } = matchDayRoundContext!;

    // const [result, setResult] = useState<string>("");
    const [players, setPlayers] = useState<Player[]>([]);
    const [editResult, setEditResult] = useState(false);
    const [scoreHome, setScoreHome] = useState(0);
    const [scoreGuest, setScoreGuest] = useState(0);
    const [match, setMatch] = useState<Match | null>(props.match);

    const [isDraggingLeft, setIsDraggingLeft] = useState(false);
    const [isDraggingRight, setIsDraggingRight] = useState(false);

    const playerStyle = (position: { top: string; left?: string; right?: string, isMarked: boolean }): {} => ({
        position: "absolute",
        ...position,
        cursor: "pointer",
        backgroundColor: position.isMarked ? "rgba(0, 146, 19, 0.8)" : "rgba(255, 255, 255, 0.8)",
        color: "black",
        padding: "2px 6px",
        borderRadius: "2px",
        fontSize: "12px",
        fontWeight: 500,
    });

    const playerService = new PlayerService(season.id, notification);
    const matchDayService = new MatchDayService(season.id, notification);

    const init = async () => {
        // Hier können Sie die Spieler laden und den Zustand aktualisieren
        const players = await playerService.getAllPlayers();
        setPlayers(players);
    }

    useEffect(() => {
        if (match?.set1) {
            setScoreHome(match.set1.homeGames ?? 0);
            setScoreGuest(match.set1.guestGames ?? 0);
        }
    }, [match]);

    useEffect(() => {
        init();
    }, []);


    const handleInput = (value: string, setter: (v: number) => void) => {
        if (/^\d{0,2}$/.test(value)) {
            const parsed = parseInt(value, 10);
            setter(isNaN(parsed) ? 0 : parsed);
        }
    };

    const saveResult = async () => {
        match!.set1.homeGames = scoreHome;
        match!.set1.guestGames = scoreGuest;
        await matchDayService.updateMatch(match!);

        setEditResult(false);
    };

    const getPlayerName = (playerId: string): string => {
        const player = players.find(p => p.id === playerId);
        return player ? `${player.firstname} ${player.lastname} (${player.skillRating})` : "Unbekannt";
    }


    const getMatchSkill = (match: Match | undefined): string => {
        if (!match) return "";

        if (match.type === "double") {

            const homePlayer1 = players.find(p => p.id === match.player1HomeId);
            const homePlayer2 = players.find(p => p.id === match.player2HomeId);
            const guestPlayer1 = players.find(p => p.id === match.player1GuestId);
            const guestPlayer2 = players.find(p => p.id === match.player2GuestId);

            var skill1 = (homePlayer1?.skillRating ?? 0) + (homePlayer2?.skillRating ?? 0);
            var skill2 = (guestPlayer1?.skillRating ?? 0) + (guestPlayer2?.skillRating ?? 0);

            return `Leistung ${skill1} vs ${skill2}`;
        }
        else {
            const homePlayer = players.find(p => p.id === match.player1HomeId);
            const guestPlayer = players.find(p => p.id === match.player1GuestId);
            var skill1 = (homePlayer?.skillRating) ?? 0;
            var skill2 = (guestPlayer?.skillRating) ?? 0;

            return `Leistung ${skill1} vs ${skill2}`;
        }
    }

    const isValidId = (id: string) => {
        if (id === emptyGuid) return false;
        if (id === "") return false;
        if (!validate(id)) return false;
        return true;
    }

    const addPlayerToMatch = async (playerId: string, side: CourtSide) => {
        if (!match) {
            var newMatch = new Match();
            if (side == CourtSide.LEFT) newMatch.player1HomeId = playerId;
            else newMatch.player1GuestId = playerId;
            await matchDayService.addMatch(newMatch, props.roundId, court);
            setMatch(newMatch);
        }
        else {
            if (side == CourtSide.LEFT) {
                if (!isValidId(match.player1HomeId)) match.player1HomeId = playerId;
                else if (!isValidId(match.player2HomeId)) match.player2HomeId = playerId;
            }
            else {
                if (!isValidId(match.player1GuestId)) match.player1GuestId = playerId;
                else if (!isValidId(match.player2GuestId)) match.player2GuestId = playerId;
            }

            await matchDayService.updateMatch(match);
        }
    }

    const deleteMatch = async () => {
        if (match) {
            await matchDayService.deleteMatch(match.id);
            notification.notifySuccess("Begegnung gelöscht");
        }
    }


    // const [isHovered, setIsHovered] = useState(false);

    const handleDragOver = (event: React.DragEvent, side: CourtSide) => {


        side == CourtSide.LEFT ? setIsDraggingLeft(true) : setIsDraggingRight(true);
        event.preventDefault();

    };

    const handleDragLeave = (side: CourtSide) => {
        side == CourtSide.LEFT ? setIsDraggingLeft(false) : setIsDraggingRight(false);
    };

    const handleDrop = (event: React.DragEvent, side: CourtSide) => {
        event.preventDefault();
        side == CourtSide.LEFT ? setIsDraggingLeft(false) : setIsDraggingRight(false);

        addPlayerToMatch(event.dataTransfer.getData("playerId"), side);

    };

    return (
        <Box
            sx={{
                position: "relative",
                width: 300,
                height: 200,
                ...(match && {
                    '&:hover .action-icon': {
                        opacity: 1,
                    }
                })
            }}>
            {/* Court-Bild */}
            <img draggable={false}
                src={tennisCourtUrl}
                style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover", borderRadius: 8 }}
            />

            {/*Home-side linke hälfte */}
            <Box
                onDragOver={(event => handleDragOver(event, CourtSide.LEFT))}
                onDragLeave={() => handleDragLeave(CourtSide.LEFT)}
                onDrop={(event => handleDrop(event, CourtSide.LEFT))}
                sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "50%",
                    height: "100%",
                    backgroundColor: isDraggingLeft ? "rgba(0, 0, 0, 0.5)" : null,
                }}
            />
            {/*away-side */}
            <Box
                onDragOver={(event => handleDragOver(event, CourtSide.RIGHT))}
                onDragLeave={() => handleDragLeave(CourtSide.RIGHT)}
                onDrop={(event => handleDrop(event, CourtSide.RIGHT))}
                sx={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    width: "50%",
                    height: "100%",
                    backgroundColor: isDraggingRight ? "rgba(0, 0, 0, 0.5)" : null,
                }} />
            {match && match.type === "double" && (<>
                {/* Team A (links) */}
                <Box sx={playerStyle({ top: "28%", left: "5%", isMarked: false })} >{getPlayerName(match.player1HomeId)}</Box>
                <Box sx={playerStyle({ top: "60%", left: "5%", isMarked: false })} >{getPlayerName(match.player2HomeId)}</Box>

                {/* Team B (rechts) */}
                <Box sx={playerStyle({ top: "28%", right: "5%", isMarked: false })} >{getPlayerName(match.player1GuestId)}</Box>
                <Box sx={playerStyle({ top: "60%", right: "5%", isMarked: false })} >{getPlayerName(match.player2GuestId)}</Box>
            </>
            )}
            {match && match.type === "single" && (<>
                {/* Einzelspieler */}
                <Box sx={playerStyle({ top: "28%", left: "10%", isMarked: false })} >{getPlayerName(match.player1HomeId)}</Box>
                <Box sx={playerStyle({ top: "60%", right: "10%", isMarked: false })}>{getPlayerName(match.player1GuestId)}</Box>
            </>
            )}
            {match && !editResult && (
                <Box onClick={() => { setEditResult(true) }}
                    sx={{
                        cursor: "pointer",
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        backgroundColor: "rgba(255, 255, 255, 0.8)",
                        padding: "4px 12px",
                        borderRadius: 2,
                        border: "2px solid rgba(0, 0, 0, 0.6)",
                        fontWeight: "bold",
                    }}
                >
                    {scoreHome}:{scoreGuest}  </Box>

            )}
            {match && editResult && (
                <Box
                    sx={{
                        position: "absolute",
                        backgroundColor: "rgba(0,0,0,0.7)",
                        width: "100%",
                        height: "100%",
                        borderRadius: 2,
                        display: "flex", // Zentrierung aktivieren
                        alignItems: "center", // vertikal zentrieren
                        justifyContent: "center", // horizontal zentrieren
                    }}
                >
                    <Box display="flex" alignItems="center" gap={1} sx={{ backgroundColor: "white", padding: 1, borderRadius: 1 }}>
                        <TextField
                            variant="outlined"
                            size="small"
                            value={scoreHome}
                            onChange={(e) => handleInput(e.target.value, setScoreHome)}
                            inputProps={{
                                inputMode: "numeric",
                                pattern: "[0-9]*",
                                maxLength: 2,
                                style: { textAlign: "center", width: "2ch" },
                            }}
                        />
                        <Box>:</Box>
                        <TextField
                            variant="outlined"
                            size="small"
                            value={scoreGuest}
                            onChange={(e) => handleInput(e.target.value, setScoreGuest)}
                            inputProps={{
                                inputMode: "numeric",
                                pattern: "[0-9]*",
                                maxLength: 2,
                                style: { textAlign: "center", width: "2ch" },
                            }}
                        />
                        <IconButton onClick={saveResult} size="small" color="primary">
                            <CheckIcon fontSize="small" />
                        </IconButton>
                    </Box>
                </Box>
            )}

            {match && (
                <>
                    <Box
                        sx={{
                            cursor: "pointer",
                            position: "absolute",
                            top: -2,
                            left: 10,
                            color: "white",
                            borderRadius: "50%",
                            width: "atuo",
                            height: 28,
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            fontSize: "14px"
                        }}
                    >{getMatchSkill(match!)}</Box>

                </>
            )}
            {!match && (
                <Box sx={playerStyle({ top: "45%", left: "30%", isMarked: false })}>Keine Begegnung</Box>
            )}

            <Box
                sx={{
                    position: "absolute",
                    bottom: 8,
                    right: 8,
                    backgroundColor: "rgba(0,0,0,0.7)",
                    color: "white",
                    borderRadius: "50%",
                    width: 28,
                    height: 28,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontSize: "14px",
                    fontWeight: "bold",
                }}
            >
                {court}
            </Box>
            <Box
                className="action-icon"

                sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    backgroundColor: "rgba(219, 0, 0, 0.8)",
                    color: "white",
                    borderRadius: "50%",
                    width: 28,
                    height: 28,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontSize: "14px",
                    fontWeight: "bold",
                    cursor: "pointer",
                    opacity: 0,
                    transition: "opacity 0.2s",
                }}
            >
                <DeleteForeverIcon fontSize="small" onClick={() => deleteMatch} />
            </Box>
        </Box >
    )
}