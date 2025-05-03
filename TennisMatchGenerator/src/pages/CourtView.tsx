import { Box } from "@mui/material";
import { Match } from "../model/Match";
import { useEffect, useState } from "react";
import tennisCourtUrl from "../assets/tennis_court.svg";
import { Set } from "../model/Set";
import { PlayerService } from "../services/PlayerService";
import { useSeason } from "../context/SeasonContext";
import { useNotification } from "../provider/NotificationProvider";
import { Player } from "../model/Player";

interface CourtViewProps {
    roundId: string;
    court: number;
    match: Match | null;

}
const playerStyle = (position: { top: string; left?: string; right?: string }) => ({
    position: "absolute",
    ...position,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    color: "black",
    padding: "2px 6px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: 500,
});

// const playerStyle = (position: { top: string; left?: string; right?: string }) => ({
//     position: "absolute",
//     ...position,
//     backgroundColor: "rgba(0,0,0,0.6)",
//     color: "white",
//     padding: "2px 6px",
//     borderRadius: "6px",
//     fontSize: "12px",
//     whiteSpace: "nowrap",
//     textAlign: "center",
// });


// const fadeRight = {
//     position: "relative",
//     overflow: "hidden",
//     whiteSpace: "nowrap",
//     textOverflow: "ellipsis",
//     '&::after': {
//         content: '""',
//         position: "absolute",
//         top: 0,
//         right: 0,
//         bottom: 0,
//         width: "30px",
//         background: "linear-gradient(to right, transparent, white)",
//         pointerEvents: "none",
//     },
// };

export const CourtView: React.FC<CourtViewProps> = (props) => {

    const { court, match } = props;

    const notification = useNotification();
    const { season } = useSeason();

    if (!season) return <></>;

    // const [result, setResult] = useState<string>("");
    const [players, setPlayers] = useState<Player[]>([]);

    const playerService = new PlayerService(season.id, notification);

    const init = async () => {
        // Hier können Sie die Spieler laden und den Zustand aktualisieren
        const players = await playerService.getAllPlayers();
        setPlayers(players);
    }

    useEffect(() => {
        init();
    }
        , []);

    // const resultChanged = (e: React.ChangeEvent<HTMLInputElement>) => {

    //     const val = e.target.value;
    //     // if (/^(\d{1,2}:\d{1,2})?$/.test(val)) {
    //     //     setResult(val);
    //     // }
    //     setResult(val);
    // };

    const getPlayerName = (playerId: string): string => {
        const player = players.find(p => p.id === playerId);
        return player ? `${player.firstname} ${player.lastname}` : "Unbekannt";
    }

    const isSetFinished = (set: Set): boolean => {
        return set.homeGames === 6 && set.awayGames < 5 ||
            set.awayGames === 6 && set.homeGames < 5 ||
            set.homeGames >= 7 && set.awayGames < 6 ||
            set.awayGames >= 7 && set.homeGames < 6;
    }

    const formatResult = (match: Match): string => {
        var sets = [`${match.set1.homeGames}:${match.set1.awayGames}`];
        if (isSetFinished(match.set1)) { sets.push(`${match.set2.homeGames}:${match.set2.awayGames}`); }
        return sets.join(" ");
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


    return (
        <Box sx={{ position: "relative", width: 300, height: 200 }}>
            {/* Court-Bild */}
            <img
                src={tennisCourtUrl}
                style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover", borderRadius: 8 }}
            />

            {match && match.type === "double" && (<>
                {/* Team A (links) */}
                <Box sx={playerStyle({ top: "28%", left: "5%" })}>{getPlayerName(match.player1HomeId)}</Box> {/* vorne */}
                <Box sx={playerStyle({ top: "60%", left: "5%" })}>{getPlayerName(match.player2HomeId)}</Box> {/* hinten */}

                {/* Team B (rechts) */}
                <Box sx={playerStyle({ top: "28%", right: "5%" })}>{getPlayerName(match.player1GuestId)}</Box> {/* vorne */}
                <Box sx={playerStyle({ top: "60%", right: "5%" })}>{getPlayerName(match.player2GuestId)}</Box> {/* hinten */}
            </>
            )}
            {match && match.type === "single" && (<>
                {/* Einzelspieler */}
                <Box sx={playerStyle({ top: "28%", left: "10%" })}>{getPlayerName(match.player1HomeId)}</Box>
                <Box sx={playerStyle({ top: "60%", right: "10%" })}>{getPlayerName(match.player1GuestId)}</Box>
            </>
            )}
            {match && (
                <Box
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        backgroundColor: "rgba(255, 255, 255, 0.8)",
                        padding: "4px 12px",
                        borderRadius: 4,
                        fontWeight: "bold",
                    }}
                >
                    {formatResult(match)}  </Box>

            )}
            {match && (
                <>
                    <Box
                        sx={{
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
                <Box sx={playerStyle({ top: "50%", left: "30%" })}>Keine Begegnung</Box>
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
        </Box >
    )
}