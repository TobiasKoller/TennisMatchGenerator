import { Box, TextField } from "@mui/material";
import { MatchDayRound } from "../model/MatchDayRound";
import { useState } from "react";
import tennisCourtUrl from "../assets/tennis_court.svg";
import InputMask from "react-input-mask";
import { Match } from "../model/Match";

interface CourtsViewProps {
    round: MatchDayRound;
    matches: Match[];

}

export const CourtsView: React.FC<CourtsViewProps> = (props) => {

    // const [match, setCourts] = useState<string[]>(["1", "2", "3", "4", "5", "6"]);
    const [matches, setMatches] = useState<Match[]>(props.matches);

    const resultChanged = (court: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value;
        console.log(`Ergebnis für Platz ${court} geändert: ${newValue}`);
        // Hier können Sie den neuen Wert speichern oder weiterverarbeiten
        // Zum Beispiel: setMatches((prev) => ({ ...prev, [court]: newValue }));
    }

    return (
        <Box sx={{ height: "100%", width: "100%", display: "flex", flexDirection: "column", justifyContent: "top", alignItems: "left", padding: 2 }}>

            <Box style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '16px', // Abstand zwischen den SVGs (optional)
            }}>
                {matches.map((match, index) => (

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
                            {/* <Box
                                component="input"
                                type="text"
                                placeholder="0:0"
                                sx={{
                                    width: 60,
                                    textAlign: "center",
                                }}
                            /> */}
                            <InputMask mask="9:9" value={`${match.set1.homeGames ?? 0}:${match.set1.awayGames}`} maskChar={null} onChange={resultChanged(match.court)}>
                                {(inputProps) => (
                                    <TextField
                                        {...inputProps}
                                        variant="outlined"
                                        sx={{
                                            width: '40px',
                                            '& input': {
                                                padding: 0,
                                                width: '40px',
                                                textAlign: 'center',
                                            },
                                        }}
                                    />
                                )}
                            </InputMask>
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