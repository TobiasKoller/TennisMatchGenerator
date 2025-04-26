import { Box, Button, Stack, Tab, Tabs } from "@mui/material";
import { use, useEffect, useState } from "react";
import { CustomPaper } from "../components/CustomPaper";
import AddIcon from '@mui/icons-material/Add';
import { MatchDayService } from "../services/MatchDayService";
import { useNotification } from "../provider/NotificationProvider";
import { useSeason } from "../context/SeasonContext";
import { MatchDayRound } from "../model/MatchDayRound";
import { useParams } from "react-router-dom";

interface MatchDayDetailProps {
}

export const MatchDayDetail: React.FC<MatchDayDetailProps> = ({ }) => {

    const { id } = useParams<{ id: string }>();
    const [activeRound, setActiveRound] = useState(0);
    const { season } = useSeason();
    const notification = useNotification();
    const [rounds, setRounds] = useState<MatchDayRound[]>([]); // Zustand für die Runden

    const matchDayId = id;
    if (!matchDayId) return null; // Sicherstellen, dass die ID vorhanden ist    

    if (season === null) return null; // Sicherstellen, dass die Saison vorhanden ist    

    var matchDayService = new MatchDayService(season.id, notification);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setActiveRound(newValue);
    };

    const addNewRound = async () => {
        await matchDayService.createMatchDayRound(matchDayId);
        fetchRounds();
    };

    async function fetchRounds() {
        const dbRounds = await matchDayService.getAllMatchDayRounds(matchDayId!);
        setRounds(dbRounds);
    }

    useEffect(() => {
        fetchRounds();
    }, []);

    return (
        <CustomPaper>
            <Stack direction="column" spacing={2} style={{ marginBottom: "16px" }}>

                <Box sx={{ width: '100%', marginTop: 2 }}>
                    <Stack direction="row" spacing={2} justifyContent={'flex-end'}>
                        <Button color='primary' variant="contained" startIcon={<AddIcon />} onClick={addNewRound} >Neue Runde</Button>
                    </Stack >
                    <Tabs
                        value={activeRound}
                        onChange={handleTabChange}
                        variant="scrollable"
                        scrollButtons="auto"
                        aria-label="Runden Tabs"
                    >
                        {rounds.map((round, index) => (
                            <Tab key={round.id} label={`Runde ${round.number}`} />
                        ))}
                    </Tabs>
                </Box >
            </Stack >
        </CustomPaper >
    );
}
