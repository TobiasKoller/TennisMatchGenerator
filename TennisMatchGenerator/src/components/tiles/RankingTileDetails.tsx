

import { Box } from "@mui/material";

interface RankingTileDetailsProps {
    playerId?: string;
}

export const RankingTileDetails: React.FC<RankingTileDetailsProps> = (props) => {

    return (
        <Box>
            Details Player {props.playerId || "unbekannt"}
        </Box>
    );
}