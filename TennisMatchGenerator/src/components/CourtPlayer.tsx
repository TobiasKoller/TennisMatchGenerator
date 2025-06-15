import { Box } from "@mui/material";
import { CourtSide } from "../model/Enums";
import CloseIcon from '@mui/icons-material/Close';
import { DragDropService } from "../handler/DragDropHandler";
import { useNotification } from "../provider/NotificationProvider";
import { MatchDayService } from "../services/MatchDayService";
import { MatchDayRoundContext } from "../context/MatchDayRoundContext";
import { useContext } from "react";
import { Player } from "../model/Player";
import { PlayerCourtPosition } from "../model/PlayerCourtPosition";

interface CourtPlayerProps {
    playerId: string;
    courtSide: CourtSide;
    matchId: string;
    seasonId: string;
    roundId: string;
    court: number;
    playerPosition: PlayerCourtPosition;
    players: Player[];
    draggingPlayerId?: string | null;

    createPlayerDragContext: (event: React.DragEvent<HTMLDivElement>, playerId: string | null, courtSide: CourtSide) => any;
    handleDragOverPlayer: (event: React.DragEvent<HTMLDivElement>, playerId: string | null) => void;
    handleDragLeavePlayer: (event: React.DragEvent<HTMLDivElement>) => void;
    handleRemovePlayer: (playerId: string | null) => void;
    resetDragging: () => void;
}

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

export const CourtPlayer: React.FC<CourtPlayerProps> = (props) => {

    const playerId = props.playerId;
    const matchId = props.matchId;
    const court = props.court;
    const seasonId = props.seasonId;
    const roundId = props.roundId;
    const players = props.players || [];
    const draggingPlayerId = props.draggingPlayerId;
    const courtSide = props.courtSide;


    const createPlayerDragContext = props.createPlayerDragContext;
    const handleDragOverPlayer = props.handleDragOverPlayer;
    const handleDragLeavePlayer = props.handleDragLeavePlayer;
    const resetDragging = props.resetDragging;
    const handleRemovePlayer = props.handleRemovePlayer;


    var left: string | null = null;
    var right: string | null = null;
    var top = "";



    switch (props.playerPosition) {

        case PlayerCourtPosition.LeftPlayer1:
            left = "5%";
            top = "28%"
            break;
        case PlayerCourtPosition.LeftPlayer2:
            left = "5%";
            top = "60%"
            break;
        case PlayerCourtPosition.RightPlayer1:
            right = "5%";
            top = "28%"
            break;
        case PlayerCourtPosition.RightPlayer2:
            right = "5%";
            top = "60%"
            break;
        default:
            console.error("Unbekannte Spielerposition:", props.playerPosition);
            return null; // oder eine andere Fehlerbehandlung

    }

    const notification = useNotification();
    const matchDayRoundContext = useContext(MatchDayRoundContext);
    const matchDayService = new MatchDayService(seasonId, notification);
    const dragDropService = new DragDropService(seasonId, notification, roundId, matchDayService, matchDayRoundContext!.reloadMatches);


    const isDraggingOverPlayer = (playerId: string | undefined | null): boolean => {
        return !!playerId && draggingPlayerId === playerId;
    }

    const getPlayerName = (playerId: string | null): string => {
        if (playerId === null) return "";
        const player = players.find(p => p.id === playerId);
        return player ? `${player.firstname} ${player.lastname} (${player.skillRating})` : "";
    }


    return (
        <Box
            draggable
            onDragStart={(e) => dragDropService.handleDragPlayerStart(e, playerId, matchId, court, courtSide)}
            onDragOver={(e) => handleDragOverPlayer(e, playerId)}
            onDragLeave={handleDragLeavePlayer}
            onDrop={(event) => {
                resetDragging();
                dragDropService.handleDropOnPlayer(event, createPlayerDragContext(event, playerId, courtSide));
            }}
            sx={{
                ...playerStyle({ top, left: left ?? undefined, right: right ?? undefined, isMarked: isDraggingOverPlayer(playerId) }),
                '&:hover .delete-icon': {
                    opacity: 1,
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                }
            }}
        >
            <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
                <span style={{ flexGrow: 1 }}>{getPlayerName(playerId)}</span>
            </Box>

            <Box
                className="delete-icon"
                sx={{
                    position: "absolute",
                    top: "2px",
                    right: "2px",
                    height: "24px",
                    marginTop: "-1px",
                    marginRight: "-1px",
                    paddingTop: "2px",
                    opacity: 0,
                    // transition: "opacity 0.2s ease-in-out",
                    cursor: "pointer",
                    color: "rgba(0,0,0,0.4)",
                    '&:hover': {
                        color: 'red',
                    }
                }}
                onClick={(e) => {
                    e.stopPropagation(); // verhindert Drag-Start oder Auswahl beim Klicken
                    handleRemovePlayer(playerId); // ← deine Löschfunktion
                }}
            >
                <CloseIcon fontSize="small" />
            </Box>
        </Box>
    );
};