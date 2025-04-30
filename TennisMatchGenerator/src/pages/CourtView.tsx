import { Box, TextField } from "@mui/material";
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


const fadeRight = {
    position: "relative",
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    '&::after': {
        content: '""',
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        width: "30px",
        background: "linear-gradient(to right, transparent, white)",
        pointerEvents: "none",
    },
};

export const CourtView: React.FC<CourtViewProps> = (props) => {

    const { roundId, court } = props;

    const notification = useNotification();
    const { season } = useSeason();

    if (!season) return <></>;


    const match: Match = {
        id: "", // ID des Matches
        roundId: roundId, // ID der Runde
        type: "double",
        number: 0,
        court: court,
        set1: new Set(),
        set2: new Set(),
        player1HomeId: "5e67756f-c7fc-4773-b18e-c8c1a548958c", // Spieler 1 Heim  
        player2HomeId: "65fca80a-a055-47aa-83c8-9eab4f17ac82", // Spieler 2 Heim
        player1GuestId: "d3653350-30a3-40c6-8c1e-cb9486ce5083", // Spieler 1 Gast
        player2GuestId: "2b7106a0-764c-4af2-aa19-0ed21e8e8bb0", // Spieler 2 Gast 

    }
    const [result, setResult] = useState<string>("");
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

    const resultChanged = (e: React.ChangeEvent<HTMLInputElement>) => {

        const val = e.target.value;
        // if (/^(\d{1,2}:\d{1,2})?$/.test(val)) {
        //     setResult(val);
        // }
        setResult(val);
    };

    const getPlayerName = (playerId: string): string => {
        const player = players.find(p => p.id === playerId);
        return player ? `${player.firstname} ${player.lastname}` : "Unbekannt";
    }

    return (
        <Box sx={{ position: "relative", width: 300, height: 200 }}>
            {/* Court-Bild */}
            <img
                src={tennisCourtUrl}
                style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover", borderRadius: 8 }}
            />

            {/* Spielerplatzierungen */}
            {match?.type === "double" ? (
                <>
                    {/* Team A (links) */}
                    <Box sx={playerStyle({ top: "30%", left: "5%" })}>{getPlayerName(match.player1HomeId)}</Box> {/* vorne */}
                    <Box sx={playerStyle({ top: "60%", left: "5%" })}>{getPlayerName(match.player2HomeId)}</Box> {/* hinten */}

                    {/* Team B (rechts) */}
                    <Box sx={playerStyle({ top: "30%", right: "5%" })}>{getPlayerName(match.player1GuestId)}</Box> {/* vorne */}
                    <Box sx={playerStyle({ top: "60%", right: "5%" })}>{getPlayerName(match.player2GuestId)}</Box> {/* hinten */}
                </>
            ) : (
                <>
                    {/* Einzelspieler */}
                    <Box sx={playerStyle({ top: "30%", left: "10%" })}>{getPlayerName(match.player1HomeId)}</Box>
                    <Box sx={playerStyle({ top: "60%", right: "10%" })}>{getPlayerName(match.player1GuestId)}</Box>
                </>
            )}

            {/* Ergebnis mittig */}
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
                3:4  </Box>
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
                {match.court}
            </Box>
        </Box>



    )
    // return (
    //     <Box
    //         sx={{
    //             width: 500,
    //             display: "flex",
    //             flexDirection: "column",
    //             alignItems: "center",
    //             border: "1px solid lightgray",
    //             borderRadius: 2,
    //             padding: 2,
    //         }}
    //     >
    //         {match ? (
    //             <Box
    //                 sx={{
    //                     width: "100%",
    //                     display: "flex",
    //                     justifyContent: "space-between",
    //                     alignItems: "center",
    //                     marginBottom: 1,
    //                 }}
    //             >
    //                 <Box
    //                     sx={{
    //                         display: "flex",
    //                         flexDirection: "column", // sorgt für untereinander
    //                         gap: 0,                   // optional: Abstand zwischen den Spielern
    //                     }}
    //                 >
    //                     <Box sx={{ width: 100, ...fadeRight }}>{getPlayerName(match.player1HomeId)}</Box>
    //                     {match.type === "double" && <Box sx={{ width: 100, ...fadeRight }}>{getPlayerName(match.player2HomeId)}</Box>}
    //                 </Box>
    //                 {/* {match.type === "double" && <Box>Spieler AA</Box>} */}


    //                 <TextField
    //                     value={result}
    //                     onChange={resultChanged}
    //                     placeholder=":"
    //                     variant="outlined"
    //                     size="small"
    //                     sx={{
    //                         width: "80px",        // genau genug für 5 Zeichen + Puffer
    //                         input: {
    //                             padding: "6px 8px", // Höhe kompakt
    //                             textAlign: "center" // optional: zentrierter Text
    //                         }
    //                     }}
    //                     inputProps={{
    //                         maxLength: 5,
    //                     }}
    //                 />
    //                 <Box
    //                     sx={{
    //                         display: "flex",
    //                         flexDirection: "column", // sorgt für untereinander
    //                         gap: 0,                   // optional: Abstand zwischen den Spielern
    //                     }}
    //                 >
    //                     <Box sx={{ width: 100, ...fadeRight }}>{getPlayerName(match.player1GuestId)}</Box>
    //                     {match.type === "double" && <Box sx={{ width: 100, ...fadeRight }}>{getPlayerName(match.player2GuestId)}</Box>}
    //                 </Box>
    //                 {/* {match.type === "double" && <Box>Spieler BB</Box>} */}
    //             </Box>
    //         ) : (
    //             <Box sx={{
    //                 width: "100%",
    //                 display: "flex",
    //                 justifyContent: "center",   // horizontal zentriert
    //                 alignItems: "center",       // vertikal zentriert (wenn Höhe da ist)
    //                 marginBottom: 1,
    //             }}>
    //                 Keine Begegnung
    //             </Box>
    //         )
    //         }

    //         {/* Tennisplatz SVG */}
    //         <Box position="relative" width={"300px"} height={"auto"}>
    //             <img src={tennisCourtUrl} alt={`Tennisplatz ${court}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    //             <Box
    //                 position="absolute"
    //                 bottom={8}
    //                 right={8}
    //                 bgcolor="rgba(0, 0, 0, 0.6)"
    //                 color="white"
    //                 px={1}
    //                 py={0.5}
    //                 borderRadius={1}
    //                 fontSize="0.875rem"
    //             >
    //                 {court}
    //             </Box>
    //         </Box>

    //     </Box>
    // )
}