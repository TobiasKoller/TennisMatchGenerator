import { Box } from "@mui/material";
import { MatchDayRound } from "../model/MatchDayRound";
import { useState } from "react";
import tennisCourtUrl from "../assets/tennis_court.svg";
// import InputMask from "react-input-mask";

interface CourtsProps {
    round: MatchDayRound;
}

export const Courts: React.FC<CourtsProps> = (props) => {

    const [courts, setCourts] = useState<string[]>(["1", "2", "3", "4", "5", "6"]);

    return (
        <Box sx={{ height: "100%", width: "100%", display: "flex", flexDirection: "column", justifyContent: "top", alignItems: "left", padding: 2 }}>

            <Box style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '16px', // Abstand zwischen den SVGs (optional)
            }}>
                {courts.map((court, index) => (
                    // <Box key={index} sx={{ padding: 1, border: "1px solid #ccc", borderRadius: 1 }}>
                    //     {court}
                    //     <img src={tennisCourtUrl} alt="Tennisplatz" style={{ width: '300px' }} />
                    // </Box>
                    <Box
                        key={index}
                        sx={{
                            width: 300,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            border: "1px solid lightgray",
                            borderRadius: 2,
                            padding: 2,
                        }}
                    >
                        {/* Kopfzeile: Spieler - Ergebnis - Spieler */}
                        <Box
                            sx={{
                                width: "100%",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: 1,
                            }}
                        >
                            <Box>Spieler A</Box>
                            <Box
                                component="input"
                                type="text"
                                placeholder="0:0"
                                sx={{
                                    width: 60,
                                    textAlign: "center",
                                }}
                            />
                            <Box>Spieler B</Box>
                        </Box>

                        {/* Tennisplatz SVG */}
                        <img src={tennisCourtUrl} alt="Tennisplatz" style={{ width: '300px' }} />
                    </Box>
                ))}
            </Box>
        </Box>
    );
}