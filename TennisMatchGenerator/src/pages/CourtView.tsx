import { Box, IconButton, MenuItem, Select, SelectChangeEvent, TextField } from "@mui/material";
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
import { CourtSide } from "../model/Enums";
import { DragDropService } from "../handler/DragDropHandler";
import { DragPlayerContext } from "../model/DragPlayerContext";
import { CourtPlayer } from "../components/CourtPlayer";
import { PlayerCourtPosition } from "../model/PlayerCourtPosition";

interface CourtViewProps {
    roundId: string;
    court: number;
    match: Match | null;
    availableCourts: number[];

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
    const [isEditingCourtNumber, setIsEditingCourtNumber] = useState(false);

    const [isDraggingLeft, setIsDraggingLeft] = useState(false);
    const [isDraggingRight, setIsDraggingRight] = useState(false);
    const [isDraggingPlayerId, setIsDraggingPlayerId] = useState<string | null>(null);


    const playerStyle = (position: { top: string; left?: string; right?: string, isMarked: boolean, }): {} => ({
        position: "absolute",
        ...position,
        cursor: "pointer",
        backgroundColor: position.isMarked ? "rgba(0, 146, 19, 0.8)" : "rgba(255, 255, 255, 0.8)",
        color: "black",
        padding: "6px 6px 2px 6px",

        borderRadius: "2px",
        fontSize: "12px",
        fontWeight: 500,
        display: "flex",
        alignItems: "center",      // vertikal zentrieren
        justifyContent: "flex-start", // linksbündig
        textAlign: "left"
    });

    const playerService = new PlayerService(season.id, notification);
    const matchDayService = new MatchDayService(season.id, notification);
    const dragDropService = new DragDropService(season.id, notification, props.roundId, matchDayService, matchDayRoundContext.reloadMatches);

    const init = async () => {
        // Hier können Sie die Spieler laden und den Zustand aktualisieren
        const allPlayers = await playerService.getAllPlayers();
        setPlayers(allPlayers);
    }

    useEffect(() => {
        var currentMatch = props.match;
        console.log("Match changed", JSON.stringify(props.match));
        if (currentMatch?.set1) {
            setScoreHome(currentMatch.set1?.homeGames ?? 0);
            setScoreGuest(currentMatch.set1?.guestGames ?? 0);
        }
        else {
            setScoreHome(0);
            setScoreGuest(0);
        }

        setMatch(currentMatch);
    }, [props.match]);

    useEffect(() => {
        init();
    }, []);


    const handleInput = (value: string, setter: (v: number) => void) => {
        if (/^\d{0,2}$/.test(value)) {
            const parsed = parseInt(value ?? 0, 10);
            setter(isNaN(parsed) ? 0 : parsed);
        }
    };

    const saveResult = async () => {
        match!.set1.homeGames = scoreHome;
        match!.set1.guestGames = scoreGuest;
        await matchDayService.updateMatch(match!);

        setEditResult(false);
    };

    const getMatchSkill = (): string => {
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

    const handleCourtChange = async (oldCourtNo: number, event: SelectChangeEvent<number>) => {
        const newCourt = event.target.value as unknown as number;
        if (newCourt !== court) {
            await matchDayService.switchCourts(props.roundId, oldCourtNo, newCourt);
            setIsEditingCourtNumber(false);
            notification.notifySuccess(`Platznummer geändert von ${oldCourtNo} auf ${newCourt}`);
            matchDayRoundContext.reloadMatches();
        }
    };

    const deleteMatch = async () => {
        if (match) {
            await matchDayService.deleteMatch(match.id);
            notification.notifySuccess("Begegnung gelöscht");
            matchDayRoundContext.reloadMatches();
        }
    }

    const handleDragOver = (event: React.DragEvent, side: CourtSide) => {
        side == CourtSide.LEFT ? setIsDraggingLeft(true) : setIsDraggingRight(true);
        event.preventDefault();
    };

    const handleDragLeave = (side: CourtSide) => {
        side == CourtSide.LEFT ? setIsDraggingLeft(false) : setIsDraggingRight(false);
    };

    const resetDragging = () => {
        setIsDraggingLeft(false);
        setIsDraggingRight(false);
        setIsDraggingPlayerId(null);
    }

    const handleDragOverPlayer = (event: React.DragEvent, playerId: string | null) => {
        event.preventDefault();
        setIsDraggingPlayerId(playerId);
    }
    const handleDragLeavePlayer = (event: React.DragEvent) => {
        event.preventDefault();
        setIsDraggingPlayerId(null);
    }

    const handleRemovePlayer = async (playerId: string | null) => {
        if (!match) return;
        if (match.type === "double") {
            if (match.player1HomeId === playerId) match.player1HomeId = null;
            else if (match.player2HomeId === playerId) match.player2HomeId = null;
            else if (match.player1GuestId === playerId) match.player1GuestId = null;
            else if (match.player2GuestId === playerId) match.player2GuestId = null;
        }
        else {
            if (match.player1HomeId === playerId) match.player1HomeId = null;
            else if (match.player1GuestId === playerId) match.player1GuestId = null;

        }
        await matchDayService.updateMatch(match);
        matchDayRoundContext.reloadMatches();
    }

    const createCourtDragContext = (e: React.DragEvent<HTMLDivElement>, toSide: CourtSide) => {

        var dragContext: DragPlayerContext = JSON.parse(e.dataTransfer!.getData("dragContext"));
        dragContext.toMatchId = match?.id ?? null;
        dragContext.toCourtNumber = court;
        dragContext.toSide = toSide;
        return dragContext;
    }

    const createPlayerDragContext = (e: React.DragEvent<HTMLDivElement>, toPlayerId: string | null, toSide: CourtSide) => {

        var dragContext: DragPlayerContext = JSON.parse(e.dataTransfer!.getData("dragContext"));
        dragContext.toMatchId = match?.id ?? null;
        dragContext.toCourtNumber = court;
        dragContext.toPlayerId = toPlayerId;
        dragContext.toSide = toSide;
        return dragContext;
    }

    return (
        <Box
            sx={{
                position: "relative",
                width: 300,
                height: 200,
                // pointerEvents: isEditable ? 'auto' : 'none',
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
                onDrop={(event) => {
                    resetDragging();
                    dragDropService.handleOnDropOnCourt(event, createCourtDragContext(event, CourtSide.LEFT));
                }}
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
                onDrop={(event) => {
                    resetDragging();
                    dragDropService.handleOnDropOnCourt(event, createCourtDragContext(event, CourtSide.RIGHT));
                }}
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
                {match.player1HomeId &&
                    <CourtPlayer
                        playerId={match.player1HomeId}
                        matchId={match.id}
                        courtSide={CourtSide.LEFT}
                        court={court}
                        seasonId={season.id}
                        roundId={props.roundId}
                        players={players}
                        draggingPlayerId={isDraggingPlayerId}
                        playerPosition={PlayerCourtPosition.LeftPlayer1}
                        createPlayerDragContext={createPlayerDragContext}
                        handleDragOverPlayer={handleDragOverPlayer}
                        handleDragLeavePlayer={handleDragLeavePlayer}
                        resetDragging={resetDragging}
                        handleRemovePlayer={handleRemovePlayer}

                    />
                }
                {match.player2HomeId &&
                    <CourtPlayer
                        playerId={match.player2HomeId}
                        matchId={match.id}
                        courtSide={CourtSide.LEFT}
                        court={court}
                        seasonId={season.id}
                        roundId={props.roundId}
                        players={players}
                        draggingPlayerId={isDraggingPlayerId}
                        playerPosition={PlayerCourtPosition.LeftPlayer2}
                        createPlayerDragContext={createPlayerDragContext}
                        handleDragOverPlayer={handleDragOverPlayer}
                        handleDragLeavePlayer={handleDragLeavePlayer}
                        resetDragging={resetDragging}
                        handleRemovePlayer={handleRemovePlayer}

                    />
                }
                {/* Team B (rechts) */}
                {match.player1GuestId &&
                    <CourtPlayer
                        playerId={match.player1GuestId}
                        matchId={match.id}
                        courtSide={CourtSide.RIGHT}
                        court={court}
                        seasonId={season.id}
                        roundId={props.roundId}
                        players={players}
                        draggingPlayerId={isDraggingPlayerId}
                        playerPosition={PlayerCourtPosition.RightPlayer1}
                        createPlayerDragContext={createPlayerDragContext}
                        handleDragOverPlayer={handleDragOverPlayer}
                        handleDragLeavePlayer={handleDragLeavePlayer}
                        resetDragging={resetDragging}
                        handleRemovePlayer={handleRemovePlayer}

                    />
                }
                {match.player2GuestId &&
                    <CourtPlayer
                        playerId={match.player2GuestId}
                        matchId={match.id}
                        courtSide={CourtSide.RIGHT}
                        court={court}
                        seasonId={season.id}
                        roundId={props.roundId}
                        players={players}
                        draggingPlayerId={isDraggingPlayerId}
                        playerPosition={PlayerCourtPosition.RightPlayer2}
                        createPlayerDragContext={createPlayerDragContext}
                        handleDragOverPlayer={handleDragOverPlayer}
                        handleDragLeavePlayer={handleDragLeavePlayer}
                        resetDragging={resetDragging}
                        handleRemovePlayer={handleRemovePlayer}

                    />
                }</>
            )}
            {match && match.type === "single" && (<>
                {/* Einzelspieler */}
                {match.player1HomeId &&
                    <CourtPlayer
                        playerId={match.player1HomeId}
                        matchId={match.id}
                        courtSide={CourtSide.LEFT}
                        court={court}
                        seasonId={season.id}
                        roundId={props.roundId}
                        players={players}
                        draggingPlayerId={isDraggingPlayerId}
                        playerPosition={PlayerCourtPosition.LeftPlayer1}
                        createPlayerDragContext={createPlayerDragContext}
                        handleDragOverPlayer={handleDragOverPlayer}
                        handleDragLeavePlayer={handleDragLeavePlayer}
                        resetDragging={resetDragging}
                        handleRemovePlayer={handleRemovePlayer}
                    />
                }
                {match.player1GuestId &&
                    <CourtPlayer
                        playerId={match.player1GuestId}
                        matchId={match.id}
                        courtSide={CourtSide.RIGHT}
                        court={court}
                        seasonId={season.id}
                        roundId={props.roundId}
                        players={players}
                        draggingPlayerId={isDraggingPlayerId}
                        playerPosition={PlayerCourtPosition.RightPlayer2}
                        createPlayerDragContext={createPlayerDragContext}
                        handleDragOverPlayer={handleDragOverPlayer}
                        handleDragLeavePlayer={handleDragLeavePlayer}
                        resetDragging={resetDragging}
                        handleRemovePlayer={handleRemovePlayer}
                    />
                }</>
            )}
            {match && !editResult && (
                <Box onClick={() => { setEditResult(true) }}
                    sx={{
                        // pointerEvents: 'all',
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
                        // pointerEvents: 'all',
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
                    >{getMatchSkill()}</Box>

                </>
            )}
            {!match && (
                <Box sx={playerStyle({ top: "45%", left: "30%", isMarked: false })}>Keine Begegnung</Box>
            )}

            <Box
                onClick={() => setIsEditingCourtNumber(true)}
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
                {isEditingCourtNumber ? (
                    <Select
                        value={court}
                        onChange={(event) => handleCourtChange(court, event)}
                        autoFocus
                        size="small"
                        sx={{
                            backgroundColor: "white",
                            borderRadius: 1,
                            color: "black",
                            height: 28,
                            fontSize: "14px",
                            "& .MuiSelect-select": {
                                padding: "4px 8px",
                            },
                        }}
                        onBlur={() => setIsEditingCourtNumber(false)}
                    >
                        {[...props.availableCourts].map((num) => (
                            num != court && <MenuItem key={num} value={num}>
                                {num}
                            </MenuItem>
                        ))}
                    </Select>
                ) : (
                    court
                )}
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
                <DeleteForeverIcon fontSize="small" onClick={() => deleteMatch()} />
            </Box>
        </Box >
    )
}