import { Box, Button, Stack, Tab, Tabs } from "@mui/material";
import { useEffect, useState } from "react";
import { CustomPaper } from "../components/CustomPaper";
import AddIcon from '@mui/icons-material/Add';
import { MatchDayService } from "../services/MatchDayService";
import { useNotification } from "../provider/NotificationProvider";
import { useSeason } from "../context/SeasonContext";
import { MatchDayRound } from "../model/MatchDayRound";
import { useParams } from "react-router-dom";
import { MatchDayRoundPage } from "./MatchDayRoundPage";

interface MatchDayDetailProps {
}

export const MatchDayDetail: React.FC<MatchDayDetailProps> = ({ }) => {

    const { id } = useParams<{ id: string }>();
    const [activeRoundId, setActiveRound] = useState("");
    const { season } = useSeason();
    const notification = useNotification();
    const [rounds, setRounds] = useState<MatchDayRound[]>([]); // Zustand für die Runden

    const matchDayId = id;
    if (!matchDayId) return null; // Sicherstellen, dass die ID vorhanden ist    

    if (season === null) return null; // Sicherstellen, dass die Saison vorhanden ist    

    var matchDayService = new MatchDayService(season.id, notification);

    const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
        setActiveRound(newValue);
    };

    const addNewRound = async () => {
        await matchDayService.createMatchDayRound(matchDayId);
        fetchRounds();
    };

    async function fetchRounds() {
        const dbRounds = await matchDayService.getAllMatchDayRounds(matchDayId!);
        setRounds(dbRounds);
        setActiveRound(dbRounds[dbRounds.length - 1].id); // Setze die aktive Runde auf die letzte Runde
    }

    useEffect(() => {
        fetchRounds();
    }, []);


    return (
        <CustomPaper sx={{ height: "100%" }}>
            <Stack direction="column" spacing={2} sx={{ height: "100%" }}>
                {/* Obere Buttons und Tabs */}
                <Box sx={{ flexShrink: 0 }}>
                    <Stack direction="row" spacing={2} justifyContent="flex-end">
                        <Button
                            color="primary"
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={addNewRound}
                        >
                            Neue Runde
                        </Button>
                    </Stack>

                    <Tabs
                        value={activeRoundId}
                        onChange={handleTabChange}
                        variant="scrollable"
                        scrollButtons="auto"
                    >
                        {rounds.map((round) => (
                            <Tab key={round.id} label={`Runde ${round.number}`} value={round.id} />
                        ))}
                    </Tabs>
                </Box>

                {/* Inhalt Bereich */}
                <Box sx={{ flexGrow: 1, overflow: "hidden", minHeight: 0 }}>
                    {rounds.map((round) => (
                        round.id === activeRoundId && (
                            <MatchDayRoundPage
                                key={round.id}
                                matchDayId={matchDayId}
                                round={round}
                            />
                        )
                    ))}
                </Box>
            </Stack>
        </CustomPaper>


    );
}
