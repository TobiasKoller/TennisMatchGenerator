import { Box, Button, Stack, Tab, Tabs, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { use, useEffect, useState } from "react";
import { CustomPaper } from "../components/CustomPaper";
import AddIcon from '@mui/icons-material/Add';
import { MatchDayService } from "../services/MatchDayService";
import { useNotification } from "../provider/NotificationProvider";
import { useSeason } from "../context/SeasonContext";
import { MatchDayRound } from "../model/MatchDayRound";
import { useParams } from "react-router-dom";
import { MatchDayRoundPage } from "./MatchDayRoundPage";
import LockOutlineIcon from '@mui/icons-material/LockOutline';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import { Setting } from "../model/Setting";
import { SeasonService } from "../services/SeasonService";

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
    const [settings, setSettings] = useState<Setting>(new Setting());
    const [selectedCourts, setSelectedCourts] = useState<number[]>([]);

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

    const isRoundEnabled = (roundId: string) => {
        return enabledRoundIds.includes(roundId) || roundId === activeRoundId;
    };

    const changeTabState = (enableTab: boolean) => {
        if (enableTab) setEnabledRoundIds((prev) => [...prev, selectedRoundId]);
        else setEnabledRoundIds((prev) => prev.filter((id) => id !== selectedRoundId));

    }

    const fetchSettings = async () => {
        const seasonService = new SeasonService();
        const settings = await seasonService.getSettings(season.id);
        setSettings(settings);
    }

    const init = async () => {
        await fetchRounds();
        await fetchSettings();
    }


    useEffect(() => {
        console.log(JSON.stringify(enabledRoundIds));
    }, [enabledRoundIds]);



    useEffect(() => {
        init();
    }, []);


    return (
        <CustomPaper sx={{ height: "100%" }}>
            <Stack direction="column" spacing={2} sx={{ height: "100%" }}>
                {/* Obere Buttons und Tabs */}
                <Box sx={{ flexShrink: 0 }}>

                    <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ backgroundColor: "yellow" }}>
                        <Box display="flex" alignItems="center">
                            <Typography variant="subtitle1" gutterBottom>
                                Verfügbare Plätze auswählen:
                            </Typography>
                            <ToggleButtonGroup
                                value={selectedCourts}
                                onChange={(_e, newSelection) => setSelectedCourts(newSelection)}
                            >
                                {settings?.availableCourts?.map((court) => (
                                    <ToggleButton key={court} value={court} sx={{
                                        '&.Mui-selected': {
                                            backgroundColor: 'green',
                                            color: 'white',
                                            '&:hover': {
                                                backgroundColor: 'darkgreen',
                                            },
                                        },
                                    }}>
                                        {court}
                                    </ToggleButton>
                                ))}
                            </ToggleButtonGroup>
                        </Box>
                        <Box flexGrow={1} />
                        <Button
                            color="primary"
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={addNewRound}
                        >
                            Neue Runde
                        </Button>
                        {/*button nur anzeigen wenn aktuell enabled*/}
                        {isRoundEnabled(selectedRoundId) && (
                            <Button
                                color="error"
                                variant="outlined"
                                startIcon={<LockOutlineIcon />}
                                onClick={() => changeTabState(false)}
                            >
                                Abschließen
                            </Button>
                        )}

                        {/*button nur anzeigen wenn aktuell disabled*/}
                        {!isRoundEnabled(selectedRoundId) && (
                            <Button
                                color="success"
                                variant="outlined"
                                startIcon={<LockOpenIcon />}
                                onClick={() => changeTabState(true)}
                            >
                                Entsperren
                            </Button>
                        )}

                    </Stack>

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
                </Box>

                {/* Inhalt Bereich */}
                <Box sx={{ flexGrow: 1, overflow: "hidden", minHeight: 0 }}>
                    {rounds.map((round) => (
                        round.id === selectedRoundId && (
                            <MatchDayRoundPage
                                key={round.id}
                                matchDayId={matchDayId}
                                round={round}
                                isActive={isRoundEnabled(round.id)}
                            />
                        )
                    ))}
                </Box>
            </Stack>
        </CustomPaper>


    );
}
