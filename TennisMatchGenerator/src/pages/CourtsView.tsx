import { Box } from "@mui/material";
import { MatchDayRound } from "../model/MatchDayRound";
// import { useState } from "react";
import { Match } from "../model/Match";
import { CourtView } from "./CourtView";

interface CourtsViewProps {
    round: MatchDayRound;
    courts: number[];
    matches: Match[];

}

export const CourtsView: React.FC<CourtsViewProps> = (props) => {
    const courts = props.courts;

    const getMatchByCourt = (court: number) => {
        let match = props.matches.find((match) => match.court === court) ?? null;
        return match;
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
                {courts.map((courtNumber, _index) => (
                    <CourtView key={_index}
                        roundId={props.round.id}
                        court={courtNumber}
                        availableCourts={courts}
                        match={getMatchByCourt(courtNumber)} />
                ))}
            </Box>
        </Box>
    );
}