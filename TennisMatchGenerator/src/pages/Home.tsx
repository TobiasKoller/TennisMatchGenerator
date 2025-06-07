import React from "react";
import {
    Grid
} from "@mui/material";

import { RankingTile } from "../components/tiles/RankingTile";
import { MatchDaysTile } from "../components/tiles/MatchDaysTile";
import { PlayersTile } from "../components/tiles/PlayersTile";
import { CustomPaper } from "../components/CustomPaper";



export const Home: React.FC = () => {



    return (
        <CustomPaper>
            <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <RankingTile />
                </Grid>
                {/* Kachel 1: Spieltage */}
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <MatchDaysTile />
                </Grid>

                {/* Kachel 2: Anzahl Spieler */}
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <PlayersTile />
                </Grid>


            </Grid>
        </CustomPaper>

    );
}
