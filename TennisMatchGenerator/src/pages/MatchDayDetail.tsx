import { Box, Button, Stack, Tab, Tabs, } from "@mui/material";
import { useEffect, useState } from "react";
import { CustomPaper } from "../components/CustomPaper";
import { MatchDayService } from "../services/MatchDayService";
import { useNotification } from "../provider/NotificationProvider";
import { useSeason } from "../context/SeasonContext";
import { MatchDayRound } from "../model/MatchDayRound";
import { useParams } from "react-router-dom";
import { MatchDayRoundPage } from "./MatchDayRoundPage";
import AddIcon from '@mui/icons-material/Add';

interface MatchDayDetailProps {
}

export const MatchDayDetail: React.FC<MatchDayDetailProps> = ({ }) => {

    const { id } = useParams<{ id: string }>();
    const { season } = useSeason();
    const notification = useNotification();

    const [activeRoundId, setActiveRound] = useState("");
    const [selectedRoundId, setSelectedRoundId] = useState("");
    const [enabledRoundIds, setEnabledRoundIds] = useState<string[]>([]); // Zustand für die aktiven Runden
    const [rounds, setRounds] = useState<MatchDayRound[]>([]);


    const matchDayId = id;
    if (!matchDayId) return null; // Sicherstellen, dass die ID vorhanden ist    
    if (season === null) return null; // Sicherstellen, dass die Saison vorhanden ist    

    var matchDayService = new MatchDayService(season.id, notification);

    const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
        setSelectedRoundId(newValue);
    };

    const addNewRound = async () => {
        await matchDayService.createMatchDayRound(matchDayId);
        fetchRounds();
    };

    async function fetchRounds() {
        const dbRounds = await matchDayService.getAllMatchDayRounds(matchDayId!);
        setRounds(dbRounds);
        const activeRoundId = dbRounds[dbRounds.length - 1].id; // Setze die aktive Runde auf die letzte Runde
        setActiveRound(activeRoundId); // Setze die aktive Runde auf die letzte Runde
        setSelectedRoundId(activeRoundId); // Setze die ausgewählte Runde auf die letzte Runde
    }


    const changeTabState = (enableTab: boolean) => {
        if (enableTab) setEnabledRoundIds((prev) => [...prev, selectedRoundId]);
        else setEnabledRoundIds((prev) => prev.filter((id) => id !== selectedRoundId));
    }

    const init = async () => {
        await fetchRounds();
    }


    useEffect(() => {
    }, [enabledRoundIds]);



    useEffect(() => {
        init();
    }, []);


    return (
        <CustomPaper sx={{ height: "100%" }}>
            <Stack direction="column" spacing={2} sx={{ height: "100%" }}>
                {/* Obere Buttons und Tabs */}
                <Box display="flex" alignItems="center">
                    <Tabs
                        value={selectedRoundId}
                        onChange={handleTabChange}
                        variant="scrollable"
                        scrollButtons="auto"
                    >
                        {rounds.map((round) => (
                            <Tab key={round.id} label={`Runde ${round.number}`} value={round.id} />
                        ))}
                    </Tabs>
                    <Button
                        color="primary"
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={addNewRound}
                        sx={{ marginLeft: 2 }}
                    >
                        Neue Runde
                    </Button>
                </Box>

                {/* Inhalt Bereich */}
                <Box sx={{ flexGrow: 1, overflow: "hidden", minHeight: 0 }}>
                    {rounds.map((round) => (
                        round.id === selectedRoundId && (
                            <MatchDayRoundPage
                                key={round.id}
                                matchDayId={matchDayId}
                                round={round}
                                changeTabState={changeTabState}
                                addNewRound={addNewRound}
                                isActive={activeRoundId === round.id}
                                isEnabled={enabledRoundIds.includes(round.id) || round.id === activeRoundId}
                            />
                        )
                    ))}
                </Box>
            </Stack>
        </CustomPaper>


    );
}
