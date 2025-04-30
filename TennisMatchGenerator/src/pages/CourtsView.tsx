import { Box } from "@mui/material";
import { MatchDayRound } from "../model/MatchDayRound";
import { useState } from "react";
import { Match } from "../model/Match";
import { CourtView } from "./CourtView";

interface CourtsViewProps {
    round: MatchDayRound;
    courts: number[];
    matches: Match[];

}

export const CourtsView: React.FC<CourtsViewProps> = (props) => {

    // const [match, setCourts] = useState<string[]>(["1", "2", "3", "4", "5", "6"]);
    const [matches, setMatches] = useState<Match[]>(props.matches);
    const courts = props.courts;

    const getMatchByCourt = (court: number) => {
        return matches.find((match) => match.court === court) ?? null;
    }

    return (
        <Box
            sx={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-start",
                alignItems: "flex-start",
                padding: 2,
            }}
        >
            <Box style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '16px', // Abstand zwischen den SVGs (optional)
            }}>
                {courts.map((courtNumber, index) => (
                    <CourtView roundId={props.round.id} court={courtNumber} match={getMatchByCourt(courtNumber)} />
                ))}
            </Box>
        </Box>
    );
}